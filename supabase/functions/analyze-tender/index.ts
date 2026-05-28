import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Garde-fous pour rester sous les limites de l'API Claude (PDF natifs)
const MAX_PDFS = 6;            // nombre max de PDF envoyés à Claude
const MAX_PDF_BYTES = 12_000_000; // ~12 Mo par PDF (on saute les plus gros)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

  // Client "service" : peut tout faire (lecture documents, écriture résultat)
  const svc = createClient(SUPABASE_URL, SERVICE_KEY);

  let analysisId: string | null = null;

  try {
    const body = await req.json();
    analysisId = body?.analysis_id ?? null;
    if (!analysisId) return json({ error: "analysis_id manquant" }, 400);

    // ── 1. SÉCURITÉ : le caller a-t-il le droit de voir cette analyse ? ──
    // On utilise SON jeton (Authorization) : la RLS filtre pour nous.
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: allowed } = await userClient
      .from("tender_analyses")
      .select("id")
      .eq("id", analysisId)
      .maybeSingle();
    if (!allowed) return json({ error: "Accès refusé" }, 403);

    if (!ANTHROPIC_API_KEY) return json({ error: "Service IA indisponible" }, 503);

    // ── 2. Charger l'analyse + l'AO + le profil entreprise (contexte RAG) ──
    const { data: analysis, error: aErr } = await svc
      .from("tender_analyses")
      .select(`
        id, company_id, tender_id, selected_lots, lots,
        tenders ( title, organisme, location, budget, deadline, famille, procedure, cpv_codes, summary ),
        companies ( name, sector, zone, certifications )
      `)
      .eq("id", analysisId)
      .single();
    if (aErr || !analysis) return json({ error: "Analyse introuvable" }, 404);

    const tender: any = analysis.tenders ?? {};
    const company: any = analysis.companies ?? {};

    // ── 3. Récupérer les documents PDF du DCE ──
    const { data: docs } = await svc
      .from("tender_documents")
      .select("file_name, doc_type, storage_path, mime_type, size_bytes, extracted_text")
      .eq("analysis_id", analysisId);

    const pdfDocs = (docs ?? []).filter(
      (d) => d.mime_type === "application/pdf" || d.file_name.toLowerCase().endsWith(".pdf"),
    );
    const otherDocs = (docs ?? []).filter((d) => !pdfDocs.includes(d));

    if (pdfDocs.length === 0) {
      // Pas de PDF lisible : on ne dépense pas l'IA pour rien.
      await svc.from("tender_analyses")
        .update({ status: "manual_intervention_required", status_detail: "Aucun PDF à analyser" })
        .eq("id", analysisId);
      return json({ error: "Aucun document PDF à analyser" }, 400);
    }

    // ── 4. Passer en statut "analyzing" (le badge bouge en direct) ──
    await svc.from("tender_analyses")
      .update({ status: "analyzing", status_detail: null })
      .eq("id", analysisId);

    // ── 5. Télécharger les PDF et les préparer pour Claude ──
    const documentBlocks: any[] = [];
    let usedPdfs = 0;
    const skipped: string[] = [];
    for (const d of pdfDocs) {
      if (usedPdfs >= MAX_PDFS) { skipped.push(d.file_name); continue; }
      const { data: blob, error: dlErr } = await svc.storage
        .from("tender-documents")
        .download(d.storage_path);
      if (dlErr || !blob) { skipped.push(d.file_name); continue; }
      const buf = new Uint8Array(await blob.arrayBuffer());
      if (buf.byteLength > MAX_PDF_BYTES) { skipped.push(d.file_name); continue; }
      documentBlocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: encodeBase64(buf) },
        title: d.file_name,
        citations: { enabled: true },
      });
      usedPdfs++;
    }

    if (documentBlocks.length === 0) {
      await svc.from("tender_analyses")
        .update({ status: "manual_intervention_required", status_detail: "PDF illisibles ou trop volumineux" })
        .eq("id", analysisId);
      return json({ error: "Documents illisibles" }, 400);
    }

    // ── 6. Construire le contexte texte (entreprise + AO + lots) ──
    const lotsTxt = (analysis.selected_lots ?? []).length
      ? `Lots qui intéressent l'entreprise : ${(analysis.selected_lots as string[]).join(", ")}`
      : "L'entreprise n'a pas précisé de lots ; évalue le marché dans son ensemble.";

    const otherTxt = otherDocs.length
      ? `\n\nDocuments NON lus directement (formats non pris en charge, à signaler comme à vérifier manuellement) : ${otherDocs.map((d) => d.file_name).join(", ")}.`
      : "";

    const contextText = `## PROFIL DE L'ENTREPRISE QUI POSTULE
Nom : ${company.name ?? "—"}
Métier / secteur : ${company.sector ?? "—"}
Zone d'intervention : ${company.zone ?? "—"}
Qualifications / certifications : ${(company.certifications ?? []).join(", ") || "aucune renseignée"}

## L'APPEL D'OFFRES
Titre : ${tender.title ?? "—"}
Acheteur : ${tender.organisme ?? "—"}
Lieu : ${tender.location ?? "—"}
Date limite : ${tender.deadline ?? "—"}
Procédure : ${tender.procedure ?? "—"}
${lotsTxt}${otherTxt}

## TA MISSION
Tu disposes ci-dessus du profil de l'entreprise et, en pièces jointes, des documents du marché (règlement de consultation, CCTP, CCAP...). Analyse si CETTE entreprise devrait répondre à CE marché.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, au format exact :
{
  "verdict": "go" | "no_go" | "go_with_reserve",
  "synthese": "une phrase qui résume la décision pour un artisan, langage simple",
  "points_forts": ["raison concrète pour laquelle l'entreprise est bien placée", "..."],
  "points_vigilance": ["risque ou exigence difficile à satisfaire", "..."],
  "infos_manquantes": ["information dont l'entreprise a besoin avant de s'engager", "..."]
}
Règles : "go" si clairement adapté ; "no_go" si clairement hors de portée (métier, zone, capacité) ; "go_with_reserve" si adapté mais avec des conditions à lever. Reste factuel, base-toi sur les documents, ne devine pas de chiffres absents.`;

    // ── 7. Appeler Claude (PDF + contexte). Prefill "{" pour forcer le JSON. ──
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        system:
          "Tu es un expert en marchés publics français qui conseille les artisans et TPE du BTP. Tu rends des verdicts Go / No-Go honnêtes, prudents et factuels, fondés uniquement sur les documents fournis.",
        messages: [
          { role: "user", content: [...documentBlocks, { type: "text", text: contextText }] },
          { role: "assistant", content: "{" },
        ],
      }),
    });

    if (!claudeRes.ok) {
      const errBody = await claudeRes.text().catch(() => "");
      console.error("Claude erreur:", claudeRes.status, errBody);
      await failAndRefund(svc, analysisId, analysis.company_id, "Erreur du moteur d'analyse");
      return json({ error: "Erreur du moteur d'analyse" }, 502);
    }

    const data = await claudeRes.json();
    const raw = "{" + (data.content?.find((c: any) => c.type === "text")?.text ?? "");

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Tentative de récupération : isoler le premier bloc { ... }
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    }

    const validVerdicts = ["go", "no_go", "go_with_reserve"];
    if (!parsed || !validVerdicts.includes(parsed.verdict)) {
      console.error("Réponse IA non exploitable:", raw.slice(0, 500));
      await failAndRefund(svc, analysisId, analysis.company_id, "Réponse IA non exploitable");
      return json({ error: "Réponse IA non exploitable" }, 502);
    }

    const report = {
      synthese: parsed.synthese ?? "",
      points_forts: Array.isArray(parsed.points_forts) ? parsed.points_forts : [],
      points_vigilance: Array.isArray(parsed.points_vigilance) ? parsed.points_vigilance : [],
      infos_manquantes: Array.isArray(parsed.infos_manquantes) ? parsed.infos_manquantes : [],
      documents_non_lus: otherDocs.map((d) => d.file_name),
      documents_ignores: skipped,
    };

    // ── 8. Écrire le résultat ──
    await svc.from("tender_analyses").update({
      status: "completed",
      verdict: parsed.verdict,
      report,
      completed_at: new Date().toISOString(),
      status_detail: null,
    }).eq("id", analysisId);

    return json({ ok: true, verdict: parsed.verdict, report });

  } catch (err) {
    console.error("Erreur inattendue analyze-tender:", err);
    if (analysisId) {
      await svc.from("tender_analyses")
        .update({ status: "failed", status_detail: "Erreur interne" })
        .eq("id", analysisId);
    }
    return json({ error: "Erreur interne" }, 500);
  }
});

// Marque l'analyse en échec et rembourse le crédit dépensé.
async function failAndRefund(svc: any, analysisId: string, companyId: string, detail: string) {
  await svc.from("tender_analyses")
    .update({ status: "failed", status_detail: detail })
    .eq("id", analysisId);
  try {
    await svc.rpc("refund_credit", { _company_id: companyId, _analysis_id: analysisId });
  } catch (e) {
    console.warn("Remboursement crédit impossible:", e);
  }
}
