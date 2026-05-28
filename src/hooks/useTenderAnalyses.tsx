import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AnalysisStatus =
  | "pending"
  | "scraping"
  | "analyzing"
  | "completed"
  | "manual_intervention_required"
  | "failed";

export type AnalysisVerdict = "go" | "no_go" | "go_with_reserve" | null;

export interface TenderAnalysisLite {
  id: string;
  tender_id: string;
  status: AnalysisStatus;
  verdict: AnalysisVerdict;
}

/**
 * Donne, pour une entreprise, l'analyse la plus récente par appel d'offres,
 * et se rafraîchit en direct (Realtime) quand un statut/verdict change.
 * Sert à afficher le bon état sur chaque carte AO (bouton, badge, verdict).
 */
export function useTenderAnalyses(companyId: string | null | undefined) {
  const [analysesByTender, setAnalysesByTender] = useState<Record<string, TenderAnalysisLite>>({});

  const refetch = useCallback(async () => {
    if (!companyId) {
      setAnalysesByTender({});
      return;
    }
    const { data } = await supabase
      .from("tender_analyses")
      .select("id, tender_id, status, verdict")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    const map: Record<string, TenderAnalysisLite> = {};
    for (const a of (data ?? []) as TenderAnalysisLite[]) {
      if (!map[a.tender_id]) map[a.tender_id] = a; // la plus récente d'abord
    }
    setAnalysesByTender(map);
  }, [companyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel(`analyses-${companyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tender_analyses", filter: `company_id=eq.${companyId}` },
        () => refetch(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, refetch]);

  return { analysesByTender, refetch };
}
