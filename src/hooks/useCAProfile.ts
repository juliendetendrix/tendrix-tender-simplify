/**
 * useCAProfile
 * Fournit le profil du chargé d'affaires assigné à la société connectée.
 * Si aucun CA n'est assigné en base, on retourne le CA par défaut (Julien Malherbe).
 */
import { useState, useEffect } from "react";
import { useCurrentCompany } from "./useCurrentCompany";
import { supabase } from "@/integrations/supabase/client";

export interface CAProfile {
  display_name: string;
  email: string | null;
  phone: string | null;
  photo_url: string;
}

/** CA par défaut utilisé en l'absence de données Supabase */
export const DEFAULT_CA: CAProfile = {
  display_name: "Julien Malherbe",
  email: "julien.malherbe@tendrix.fr",
  phone: "+33 7 71 81 97 29",
  photo_url: "/julien-malherbe.jpg",
};

export function useCAProfile() {
  const { company, loading: companyLoading } = useCurrentCompany();
  const [ca, setCA] = useState<CAProfile>(DEFAULT_CA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!company?.assigned_charge_affaires) {
      setCA(DEFAULT_CA);
      return;
    }

    setLoading(true);
    supabase
      .from("charge_affaires_profiles")
      .select("display_name, email, phone, photo_url")
      .eq("user_id", company.assigned_charge_affaires)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCA({
            display_name: data.display_name,
            email: data.email ?? null,
            phone: data.phone ?? null,
            // Utilise la photo stockée en DB si dispo, sinon fallback local
            photo_url: (data as any).photo_url ?? DEFAULT_CA.photo_url,
          });
        } else {
          setCA(DEFAULT_CA);
        }
        setLoading(false);
      });
  }, [company?.assigned_charge_affaires]);

  /** Initiales du CA (ex: "JM" pour Julien Malherbe) */
  const initials = ca.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return { ca, initials, loading: companyLoading || loading };
}
