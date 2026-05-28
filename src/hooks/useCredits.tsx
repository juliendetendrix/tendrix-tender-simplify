import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Récupère le solde de crédits de l'entreprise de l'utilisateur courant
 * et le tient à jour EN DIRECT (Realtime) : dès qu'une analyse déduit un
 * crédit (ou qu'un remboursement le rend), le header se met à jour seul.
 */
export function useCredits() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    if (!user) {
      setCompanyId(null);
      setCredits(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("companies")
      .select("id, credits")
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (data) {
      setCompanyId(data.id);
      setCredits((data as { credits: number }).credits ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel(`company-credits-${companyId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "companies", filter: `id=eq.${companyId}` },
        (payload) => {
          const next = (payload.new as { credits?: number })?.credits;
          if (typeof next === "number") setCredits(next);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId]);

  return { companyId, credits, loading, refetch };
}
