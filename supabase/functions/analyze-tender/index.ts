import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { classifyDce, classifyDocType, TYPE_PRIORITY } from "../_shared/dce-classify.ts";

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

  // Prévenir Julien par email qu'un DCE est à récupérer manuellement (best-effort).
  const notifyManual = (id: string) =>
    fetch(`${SUPABASE_URL}/functions/v1/notify-manual`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ analysis_id: id }),
    }).catch((e) => console.warn("notify-manual failed:", String(e)));

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

    // ── 3. Récupérer les documents du DCE + les CLASSER (type, lot, lots ouverts) ──
    const { data: docs } = await svc
      .from("tender_documents")
      .select("id, file_name, doc_type, storage_path, mime_type, size_bytes, extracted_text")
      .eq("analysis_id", analysisId);

    // Classification déterministe (sans IA) : type de chaque document + tri par
    // lot + détection des lots ouverts (présence d'une DPGF/CDPGF à remplir).
    const classification = classifyDce((docs ?? []).map((d) => d.file_name));
    const typeByName = new Map(classification.docs.map((c) => [c.fileName, c.docType]));

    // On rafraîchit le doc_type en base (le filename est plus fiable que la 1re
    // estimation faite à l'upload) — best-effort, n'arrête pas l'analyse.
    for (const d of docs ?? []) {
      const t = typeByName.get(d.file_name);
      if (t && t !== d.doc_type) {
        await svc.from("tender_documents").update({ doc_type: t }).eq("id", d.id).then(
          () => {}, () => {},
        );
      }
    }

    const pdfDocs = (docs ?? []).filter(
      (d) => d.mime_type === "application/pdf" || d.file_name.toLowerCase().endsWith(".pdf"),
    );
    const otherDocs = (docs ?? []).filter((d) => !pdfDocs.includes(d));

    // Priorité d'envoi à Claude : RC > CCAP > CCTP > DPGF > AE… (on garde les
    // pièces les plus structurantes quand on dépasse MAX_PDFS).
    pdfDocs.sort(
      (a, b) =>
        (TYPE_PRIORITY[classifyDocType(b.file_name)] ?? 0) -
        (TYPE_PRIORITY[classifyDocType(a.file_name)] ?? 0),
    );

    if (pdfDocs.length === 0) {
      // Pas de PDF lisible : on ne dépense pas l'IA pour rien.
      await svc.from("tender_analyses")
        .update({ status: "manual_intervention_required", status_detail: "Aucun PDF à analyser" })
        .eq("id", analysisId);
      await notifyManual(analysisId);
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
      await notifyManual(analysisId);
      return json({ error: "Documents illisibles" }, 400);
    }

    // ── 6. Construire le contexte texte (entreprise + AO + lots) ──
    const lotsTxt = (analysis.selected_lots ?? []).length
      ? `Lots qui intéressent l'entreprise : ${(analysis.selected_lots as string[]).join(", ")}`
      : "L'entreprise n'a pas précisé de lots ; évalue le marché dans son ensemble.";

    const otherTxt = otherDocs.length
      ? `\n\nDocuments NON lus directement (formats non pris en charge, à signaler comme à vérifier manuellement) : ${otherDocs.map((d) => d.file_name).join(", ")}.`
      : "";

    // Structure des lots détectée par la classification déterministe. On la donne
    // à l'IA comme point de départ FIABLE (un lot avec DPGF = ouvert à la candidature).
    const lotsStruct = classification.groupes.map((g) => ({
      numero: g.lot,
      intitule_estime: g.intitule,
      ouvert: g.ouvert,
      documents: g.docs.map((d) => d.fileName),
    }));
    const lotsDetectTxt = lotsStruct.length
      ? `\n\n## LOTS DÉTECTÉS DANS LE DCE (classification automatique)
Un lot n'est OUVERT à la candidature que s'il possède une DPGF/CDPGF (cadre de prix à remplir). Les autres CCTP présents concernent des lots d'autres entreprises.
${JSON.stringify(lotsStruct, null, 2)}
Lots ouverts : ${classification.lotsOuverts.length ? classification.lotsOuverts.join(", ") : "aucun détecté automatiquement (vérifie dans les documents)"}.`
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
${lotsTxt}${otherTxt}${lotsDetectTxt}

## TA MISSION
Tu disposes ci-dessus du profil de l'entreprise et, en pièces jointes, des documents du marché (règlement de consultation, CCTP, CCAP, DPGF...). Tu dois produire une FICHE D'ANALYSE claire et limpide pour un artisan, comme le ferait un conseiller en marchés publics.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, au format exact :
{
  "verdict": "go" | "no_go" | "go_with_reserve",
  "synthese": "une phrase qui résume la décision pour un artisan, langage simple",
  "points_forts": ["raison concrète pour laquelle l'entreprise est bien placée", "..."],
  "points_vigilance": ["risque ou exigence difficile à satisfaire", "..."],
  "infos_manquantes": ["information absente des documents dont l'entreprise a besoin avant de s'engager", "..."],
  "prerequis": [
    { "label": "Assurance décennale", "obligatoire": true, "detail": "Condition de conclusion du marché (cf. CCAP)" },
    { "label": "Qualification Qualibat XXXX", "obligatoire": false, "detail": "Souhaitée mais non éliminatoire" }
  ],
  "dates_cles": [
    { "label": "Date limite de remise des offres", "valeur": "JJ/MM/AAAA si présent, sinon 'non précisé'" },
    { "label": "Délai d'exécution", "valeur": "ex. 13 mois" }
  ],
  "criteres_attribution": [
    { "label": "Prix", "ponderation": "60%" },
    { "label": "Valeur technique", "ponderation": "40%" }
  ],
  "lots": [
    { "numero": "6", "intitule": "Serrurerie", "ouvert": true, "resume": "une phrase sur le contenu du lot et son adéquation au profil" }
  ]
}

Règles IMPORTANTES :
- "verdict" : "go" si clairement adapté ; "no_go" si hors de portée (métier, zone, capacité) ; "go_with_reserve" si adapté mais avec conditions à lever.
- "prerequis" : liste les pièces/qualifications/assurances exigées par le DCE (décennale, RC Pro, attestations fiscale/sociale, qualifications Qualibat/RGE, références, capacité financière…). "obligatoire": true si éliminatoire/condition de conclusion.
- "dates_cles" et "criteres_attribution" : reprends UNIQUEMENT ce qui figure dans les documents (souvent dans le RC). Si l'information est absente, ne l'invente pas — mets "non précisé" ou laisse la liste vide.
- "lots" : reprends les lots détectés ci-dessus. "ouvert": true seulement si le lot a une DPGF/CDPGF. Donne un intitulé propre et un résumé court par lot ouvert.
- Reste factuel, base-toi sur les documents fournis, ne devine JAMAIS de chiffres absents (montants, surfaces, dates).`;

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
        max_tokens: 3000,
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

    const arr = (v: unknown) => (Array.isArray(v) ? v : []);

    // Fusion lots : on part de la détection déterministe (fiable pour "ouvert")
    // et on enrichit avec l'intitulé + le résumé produits par l'IA.
    const aiLots = new Map(
      arr(parsed.lots).map((l: any) => [String(l?.numero ?? "").trim(), l]),
    );
    const mergedLots = classification.groupes.map((g) => {
      const ai: any = aiLots.get(g.lot) ?? {};
      return {
        numero: g.lot,
        intitule: ai.intitule || g.intitule || `Lot ${g.lot}`,
        ouvert: g.ouvert, // signal déterministe prioritaire (présence DPGF)
        resume: ai.resume ?? null,
        documents: g.docs.map((d) => d.fileName),
      };
    });

    const report = {
      synthese: parsed.synthese ?? "",
      points_forts: arr(parsed.points_forts),
      points_vigilance: arr(parsed.points_vigilance),
      infos_manquantes: arr(parsed.infos_manquantes),
      prerequis: arr(parsed.prerequis),
      dates_cles: arr(parsed.dates_cles),
      criteres_attribution: arr(parsed.criteres_attribution),
      lots: mergedLots,
      lots_ouverts: classification.lotsOuverts,
      documents_non_lus: otherDocs.map((d) => d.file_name),
      documents_ignores: skipped,
    };

    // ── 8. Écrire le résultat (+ lots sur la ligne pour le sélecteur "Répondre") ──
    await svc.from("tender_analyses").update({
      status: "completed",
      verdict: parsed.verdict,
      report,
      lots: mergedLots,
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
