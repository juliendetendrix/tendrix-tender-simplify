/**
 * useTrackInteraction
 * Enregistre chaque interaction utilisateur avec un AO dans rfp_interactions.
 * Les données sont silencieuses (pas de toast) — le tracking ne doit jamais
 * bloquer l'UX. Les erreurs sont loguées en console uniquement.
 *
 * Ces données alimentent l'algorithme de recommandation IA (RAG) :
 *   accept → signal fort d'intérêt
 *   reject → signal fort de désintérêt
 *   read_summary → signal d'intérêt modéré
 *   view → impression (collecte passive)
 */
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCurrentCompany } from "./useCurrentCompany";
import type { BoampTender } from "./useBoampTenders";

export type InteractionType = "view" | "read_summary" | "accept" | "reject";

/** Construit le snapshot metadata de l'AO pour stocker avec l'interaction */
function buildMetadata(tender: BoampTender): Record<string, unknown> {
  return {
    title: tender.title,
    organisme: tender.organisme ?? null,
    location: tender.location ?? null,
    budget: tender.budget ?? null,
    famille: tender.famille ?? null,
    cpv_codes: tender.cpv_codes ?? [],
    deadline: tender.deadline ?? null,
    compatibility_score: tender.compatibility ?? null,
    source: tender.source ?? "boamp",
  };
}

export function useTrackInteraction() {
  const { user } = useAuth();
  const { company } = useCurrentCompany();

  const trackInteraction = useCallback(
    async (tender: BoampTender, action: InteractionType) => {
      // Ne pas tracker si l'utilisateur n'est pas connecté (mode démo)
      if (!user) return;

      try {
        await supabase.from("rfp_interactions").insert({
          user_id: user.id,
          company_id: company?.id ?? null,
          tender_id: tender.id,
          action_type: action,
          tender_metadata: buildMetadata(tender),
        });
      } catch (err) {
        // Erreur silencieuse — le tracking ne doit jamais bloquer l'UX
        console.warn("[tracking] rfp_interactions insert failed:", err);
      }
    },
    [user, company]
  );

  return { trackInteraction };
}
