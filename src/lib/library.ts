// Catégories de la librairie de documents d'entreprise (le "carburant" des réponses).
// `slots` = emplacements prédéfinis (1 fichier attendu chacun) ; sinon ajout libre.
export interface DocCategory {
  id: string;
  label: string;
  hint?: string;
  slots?: string[];
}

export const DOC_CATEGORIES: DocCategory[] = [
  {
    id: "admin",
    label: "Documents administratifs",
    slots: ["Présentation", "Organigramme", "KBIS", "Attestation fiscale", "Attestation sociale (URSSAF, MSA…)", "RIB"],
  },
  { id: "assurance",        label: "Assurance", hint: "RC Pro, décennale…" },
  { id: "certificats",      label: "Certificats et qualifications", hint: "Qualibat, RGE…" },
  { id: "identite",         label: "Identité visuelle", slots: ["Logo"] },
  { id: "presentation",     label: "Présentation de l'entreprise" },
  { id: "methodologies",    label: "Méthodologies et procédures" },
  { id: "moyens_humains",   label: "Moyens humains", hint: "CV, organigramme détaillé…" },
  { id: "moyens_materiels", label: "Moyens matériels", hint: "Parc, équipements…" },
  { id: "references",       label: "Références", hint: "Chantiers/marchés réalisés" },
  { id: "memoires",         label: "Exemples de mémoires techniques" },
];

export const MAX_DOC_BYTES = 20 * 1024 * 1024; // 20 Mo / fichier
