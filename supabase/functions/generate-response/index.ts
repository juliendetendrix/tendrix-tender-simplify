import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  const svc = createClient(SUPABASE_URL, SERVICE_KEY);

  let responseId: string | null = null;
  try {
    const body = await req.json();
    responseId = body?.response_id ?? null;
    if (!responseId) return json({ error: "response_id manquant" }, 400);
    if (!ANTHROPIC_API_KEY) return json({ error: "Service IA indisponible" }, 503);

    // 1. Charger la réponse + l'analyse + l'AO + l'entreprise
    const { data: resp } = await svc
      .from("tender_responses")
      .select("id, company_id, analysis_id, tender_id, selected_lots, credits_spent")
      .eq("id", responseId)
      .single();
    if (!resp) return json({ error: "Réponse introuvable" }, 404);

    const { data: analysis } = await svc
      .from("tender_analyses")
      .select("report, lots, tenders ( title, organisme, location, deadline, procedure )")
      .eq("id", resp.analysis_id)
      .maybeSingle();
    const tender: any = analysis?.tenders ?? {};
    const report: any = analysis?.report ?? {};

    const { data: company } = await svc
      .from("companies")
      .select("*")
      .eq("id", resp.company_id)
      .single();

    const { data: libDocs } = await svc
      .from("library_documents")
      .select("category, label, file_name")
      .eq("company_id", resp.company_id);

    // 2. Construire le contexte
    const c: any = company ?? {};
    const profil = `## ENTREPRISE QUI RÉPOND
Nom : ${c.name ?? "—"}
Forme juridique : ${c.forme_juridique ?? "—"} · SIRET : ${c.siret ?? "—"} · Code APE : ${c.code_ape ?? "—"}
Secteur / métiers : ${c.sector ?? "—"}
Zone : ${c.zone ?? "—"}
Descriptif : ${c.descriptif ?? "—"}
Capacités éco : CA N ${c.ca_n ?? "?"}, N-1 ${c.ca_n1 ?? "?"}, N-2 ${c.ca_n2 ?? "?"}
Capacités techniques : effectif N ${c.effectif_n ?? "?"}, dirigeants ${c.nb_dirigeants ?? "?"}, tranche ${c.tranche_effectif ?? "?"}
Représentant (signataire) : ${c.representant ?? "—"}`;

    const inventaire = (libDocs ?? []).length
      ? (libDocs ?? []).map((d) => `- [${d.category}] ${d.label} (${d.file_name})`).join("\n")
      : "Aucun document déposé dans la librairie.";

    const lotsTxt = (resp.selected_lots ?? []).length
      ? `Lots visés : ${(resp.selected_lots as string[]).join(", ")}`
      : "Tous les lots pertinents.";

    const contextText = `${profil}

## DOCUMENTS DISPONIBLES DANS LA LIBRAIRIE
${inventaire}

## L'APPEL D'OFFRES
Titre : ${tender.title ?? "—"} · Acheteur : ${tender.organisme ?? "—"} · Lieu : ${tender.location ?? "—"}
Date limite : ${tender.deadline ?? "—"}
${lotsTxt}

## ANALYSE DÉJÀ RÉALISÉE (synthèse du DCE)
Avis : ${report.avis ?? report.synthese ?? "—"}
Prérequis : ${JSON.stringify(report.qualifications ?? report.prerequis ?? [])}
Critères de jugement : ${JSON.stringify(report.jugement ?? report.criteres_attribution ?? [])}
Lots : ${JSON.stringify(report.lots ?? [])}

## TA MISSION
Tu es un expert en réponse aux marchés publics. Rédige une PREMIÈRE VERSION du dossier de réponse pour cette entreprise, en t'appuyant sur son profil, sa librairie et l'analyse du DCE. Sois concret et personnalisé (utilise les vraies infos de l'entreprise). Quand une info manque, signale-la dans "points_a_completer" plutôt que d'inventer.

Réponds UNIQUEMENT en JSON valide, format exact :
{
  "synthese": "1-2 phrases sur l'angle de la réponse et les atouts à mettre en avant",
  "memoire": [
    { "titre": "Présentation de l'entreprise", "contenu": "paragraphe rédigé, prêt à coller" },
    { "titre": "Moyens humains et matériels", "contenu": "..." },
    { "titre": "Méthodologie et organisation", "contenu": "..." },
    { "titre": "Délais et planning", "contenu": "..." },
    { "titre": "Engagements (sécurité, environnement, qualité)", "contenu": "..." }
  ],
  "pieces_administratives": [
    { "label": "DC1 - Lettre de candidature", "statut": "à générer", "note": "" },
    { "label": "DC2 - Déclaration du candidat", "statut": "à générer", "note": "" },
    { "label": "KBIS", "statut": "disponible | manquant", "note": "selon la librairie" },
    { "label": "Attestations fiscale et sociale", "statut": "disponible | manquant", "note": "" },
    { "label": "Assurance (RC Pro / décennale)", "statut": "disponible | manquant", "note": "" }
  ],
  "points_a_completer": ["info manquante côté entreprise qui renforcerait la réponse", "..."]
}
Règles : "statut" des pièces = "disponible" si présente dans la librairie, sinon "manquant" (ou "à générer" pour DC1/DC2/AE). Mémoire : paragraphes rédigés et personnalisés, pas de listes à puces génériques. Reste factuel.`;

    // 3. Appeler Claude
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 110_000);
    let claudeRes: Response;
    try {
      claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: ac.signal,
        headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4000,
          system: "Tu es un expert en marchés publics qui rédige des dossiers de réponse personnalisés et convaincants pour des TPE/PME du BTP, à partir des informations réelles de l'entreprise.",
          messages: [
            { role: "user", content: contextText },
            { role: "assistant", content: "{" },
          ],
        }),
      });
    } catch (e) {
      clearTimeout(timer);
      await fail(svc, resp, "Génération trop longue, réessayez");
      return json({ error: "timeout" }, 504);
    }
    clearTimeout(timer);

    if (!claudeRes.ok) {
      await fail(svc, resp, `Erreur moteur (${claudeRes.status})`);
      return json({ error: "Erreur du moteur" }, 502);
    }

    const data = await claudeRes.json();
    const raw = "{" + (data.content?.find((x: any) => x.type === "text")?.text ?? "");
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { const m = raw.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null; }
    if (!parsed) { await fail(svc, resp, "Réponse IA non exploitable"); return json({ error: "parse" }, 502); }

    const content = {
      synthese: parsed.synthese ?? "",
      memoire: Array.isArray(parsed.memoire) ? parsed.memoire : [],
      pieces_administratives: Array.isArray(parsed.pieces_administratives) ? parsed.pieces_administratives : [],
      points_a_completer: Array.isArray(parsed.points_a_completer) ? parsed.points_a_completer : [],
    };

    await svc.from("tender_responses").update({
      status: "ready", content, completed_at: new Date().toISOString(), status_detail: null,
    }).eq("id", responseId);

    return json({ ok: true });
  } catch (err) {
    console.error("generate-response erreur:", err);
    if (responseId) await svc.from("tender_responses").update({ status: "failed", status_detail: "Erreur interne" }).eq("id", responseId);
    return json({ error: "Erreur interne" }, 500);
  }
});

// Échec : marque failed (si pas déjà fait) + rembourse les crédits dépensés.
async function fail(svc: any, resp: any, detail: string) {
  // Anti double-remboursement : on ne traite que si la réponse n'est pas déjà 'failed'.
  const { data: updated } = await svc.from("tender_responses")
    .update({ status: "failed", status_detail: detail })
    .eq("id", resp.id).neq("status", "failed").select("id");
  if (!updated || updated.length === 0) return;

  const amount = resp.credits_spent ?? 0;
  if (amount > 0) {
    const { data: c } = await svc.from("companies").select("credits").eq("id", resp.company_id).single();
    if (c) {
      await svc.from("companies").update({ credits: (c.credits ?? 0) + amount }).eq("id", resp.company_id);
      await svc.from("credit_transactions").insert({ company_id: resp.company_id, amount, reason: "refund" });
    }
  }
}
