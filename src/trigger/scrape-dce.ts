import { task, logger } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";
import { resolveDce } from "./lib/dce-resolver";
import { scrapePlace } from "./adapters/place";
import type { DceFile } from "./adapters/types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function guessDocType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("cctp")) return "CCTP";
  if (n.includes("ccap")) return "CCAP";
  if (n.includes("dpgf") || n.includes("bpu")) return "DPGF";
  if (n.includes("dume")) return "DUME";
  if (/acte.?d.?engagement|\bae\b/.test(n)) return "AE";
  if (/reglement|règlement|\brc\b/.test(n)) return "RC";
  return "autre";
}

async function markManual(analysisId: string, detail: string) {
  await supabase
    .from("tender_analyses")
    .update({ status: "manual_intervention_required", status_detail: detail })
    .eq("id", analysisId);
}

/**
 * Tâche de fond : récupère automatiquement le DCE d'une analyse et le ramène
 * dans l'app, puis déclenche l'analyse IA. Tombe proprement en "intervention
 * manuelle" (fallback humain) si le scraping n'est pas possible.
 */
export const scrapeDce = task({
  id: "scrape-dce",
  maxDuration: 600,
  run: async (payload: { analysisId: string }) => {
    const { analysisId } = payload;
    logger.info("scrape-dce start", { analysisId });

    await supabase.from("tender_analyses").update({ status: "scraping", status_detail: null }).eq("id", analysisId);

    // 1) Charger l'avis brut + résoudre la plateforme/référence
    const { data: analysis } = await supabase
      .from("tender_analyses")
      .select("id, tender_id, tenders ( raw, title )")
      .eq("id", analysisId)
      .single();

    const tender = (analysis as { tenders?: { raw?: unknown; title?: string } } | null)?.tenders;
    const raw = tender?.raw;
    const dce = resolveDce(raw);

    await supabase.from("tender_analyses").update({
      buyer_profile_url: dce.platformUrl,
      platform: dce.platform,
      consultation_ref: dce.reference,
    }).eq("id", analysisId);

    if (!dce.resolvable || !dce.platformUrl) {
      await markManual(analysisId, "Aucun lien plateforme dans l'avis BOAMP");
      return { status: "manual" as const };
    }

    // 2) Choisir l'adaptateur selon le moteur.
    //    PLACE (marches-publics.gouv.fr) : retrait anonyme SANS captcha → automatisable (validé).
    //    e-marchespublics & co. : retrait protégé par captcha → fallback humain.
    let files: DceFile[] = [];
    try {
      if (dce.platform === "place") {
        files = await scrapePlace({
          platformUrl: dce.platformUrl,
          reference: dce.reference,
          buyer: dce.buyer,
          title: tender?.title ?? null,
        });
      } else {
        await markManual(analysisId, `Plateforme non automatisée (captcha ou non supportée) : ${dce.platform}`);
        return { status: "manual" as const };
      }
    } catch (e) {
      logger.error("scrape failed", { error: String(e) });
      await markManual(analysisId, "Téléchargement automatique échoué — reprise manuelle");
      return { status: "manual" as const };
    }

    if (files.length === 0) {
      await markManual(analysisId, "Aucun document récupéré");
      return { status: "manual" as const };
    }

    // 3) Uploader les fichiers dans le Storage + enregistrer en base
    for (const f of files) {
      const path = `${analysisId}/${Date.now()}-${f.name}`;
      const { error: upErr } = await supabase.storage
        .from("tender-documents")
        .upload(path, f.buffer, { contentType: f.contentType, upsert: false });
      if (upErr) {
        logger.warn("upload failed", { name: f.name, error: upErr.message });
        continue;
      }
      await supabase.from("tender_documents").insert({
        analysis_id: analysisId,
        file_name: f.name,
        doc_type: guessDocType(f.name),
        storage_path: path,
        mime_type: f.contentType,
        size_bytes: f.buffer.length,
        source: "scraper",
      });
    }

    // 4) Déclencher l'analyse IA (Edge Function), authentifiée en service_role
    await fetch(`${process.env.SUPABASE_URL}/functions/v1/analyze-tender`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ analysis_id: analysisId }),
    }).catch((e) => logger.warn("analyze trigger failed", { error: String(e) }));

    logger.info("scrape-dce done", { analysisId, files: files.length });
    return { status: "done" as const, files: files.length };
  },
});
