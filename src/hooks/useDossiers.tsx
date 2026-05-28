import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DossierRow {
  id: string;            // id du tender_request
  tender_id: string;
  title: string;
  location: string | null;
  budget: string | null;
  deadline: string | null;
  status: string;        // statut du dossier (demande | en_cours | soumis | gagne | perdu)
  analysisId: string | null;
  analysisStatus: string | null;
  analysisVerdict: string | null;
}

/**
 * Charge les dossiers réels (tender_requests) de l'entreprise, avec l'AO lié
 * et l'éventuelle analyse (statut + verdict). Se rafraîchit en direct.
 */
export function useDossiers(companyId: string | null | undefined) {
  const [dossiers, setDossiers] = useState<DossierRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!companyId) {
      setDossiers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("tender_requests")
      .select(`
        id, tender_id, status, created_at,
        tenders ( title, location, budget, deadline ),
        tender_analyses ( id, status, verdict )
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    const rows: DossierRow[] = (data ?? []).map((r: any) => {
      const t = r.tenders ?? {};
      const a = Array.isArray(r.tender_analyses) ? r.tender_analyses[0] : r.tender_analyses;
      return {
        id: r.id,
        tender_id: r.tender_id,
        title: t.title ?? "Appel d'offres",
        location: t.location ?? null,
        budget: t.budget ?? null,
        deadline: t.deadline ?? null,
        status: r.status,
        analysisId: a?.id ?? null,
        analysisStatus: a?.status ?? null,
        analysisVerdict: a?.verdict ?? null,
      };
    });
    setDossiers(rows);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel(`dossiers-${companyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tender_requests", filter: `company_id=eq.${companyId}` },
        () => refetch(),
      )
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

  return { dossiers, loading, refetch };
}
