/**
 * useCAProfile
 * Fournit le profil du chargé d'affaires assigné à la société connectée.
 * Si aucun CA n'est assigné en base, on retourne le CA par défaut (Julien Malherbe).
 * À terme : ajouter un champ `photo_url` dans charge_affaires_profiles.
 */
import { useState, useEffect } from "react";
import { useCurrentCompany } from "./useCurrentCompany";
import { supabase } from "@/integrations/supabase/client";

export interface CAProfile {
  display_name: string;
  email: string | null;
  phone: string | null;
  /** URL de la photo (dossier public/ de Vite) */
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
      // Pas de CA assigné → on garde le défaut
      setCA(DEFAULT_CA);
      return;
    }

    setLoading(true);
    supabase
      .from("charge_affaires_profiles")
      .select("display_name, email, phone")
      .eq("user_id", company.assigned_charge_affaires)
      .maybeSingle()
      .then(({ data }) => {
        setCA(
          data
            ? {
                display_name: data.display_name,
                email: data.email,
                phone: data.phone,
                // TODO: utiliser data.photo_url quand le champ sera ajouté en DB
                photo_url: "/julien-malherbe.jpg",
              }
            : DEFAULT_CA
        );
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
