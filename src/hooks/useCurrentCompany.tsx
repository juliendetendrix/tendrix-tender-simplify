import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Company {
  id: string;
  owner_user_id: string;
  name: string;
  siren: string | null;
  sector: string | null;
  zone: string | null;
  certifications: string[] | null;
  contact_name: string | null;
  contact_phone: string | null;
  assigned_charge_affaires: string | null;
  onboarding_completed: boolean;
}

export function useCurrentCompany() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    if (!user) {
      setCompany(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("owner_user_id", user.id)
      .maybeSingle();
    setCompany(data as Company | null);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, [user?.id]);

  return { company, loading, refetch };
}
