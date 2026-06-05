// Tarification Tendrix (modèle façon Iziao). Miroir de
// supabase/functions/_shared/credit-packs.ts. PRIX/CRÉDITS = placeholders.

export const CREDIT_UNIT_CENTS = 10;   // 0,10 € HT / crédit
export const CUSTOM_UNIT_CENTS = 7.7;  // 0,077 € HT / crédit (sur-mesure, ~23% remise)

// ── Coût en crédits par service + descriptif (table "Utilisation des crédits") ──
export interface ServiceCost {
  id: keyof CustomQty;
  label: string;
  credits: number;
  description: string[];
}
export const SERVICE_COSTS: ServiceCost[] = [
  {
    id: "analyse", label: "Analyse", credits: 50,
    description: [
      "Vérification rapide de la pertinence du marché (Go / No-Go)",
      "Compatibilité entre les exigences de l'AO et votre entreprise",
      "Identification des points de vigilance avant le lancement",
    ],
  },
  {
    id: "reponse", label: "Réponse", credits: 3500,
    description: [
      "Génération du dossier administratif (DC1, DC2, AE, pièces) prêt à déposer",
      "Intégration des éléments techniques et structuration de la réponse",
      "Validation de la conformité + accompagnement avec un expert",
    ],
  },
  {
    id: "memoire", label: "Mémoire technique", credits: 2500,
    description: [
      "Prise en compte des exigences du cahier des charges",
      "Rédaction d'un mémoire technique structuré et différenciant",
      "Valorisation des atouts de votre entreprise selon les critères",
    ],
  },
  {
    id: "depot", label: "Dépôt et Suivi", credits: 2000,
    description: [
      "Dépôt sécurisé sur les plateformes (PLACE, AWS, Maximilien, Megalis…)",
      "Suivi post-dépôt (questions acheteurs, relances)",
      "Gestion des compléments et échanges jusqu'à attribution",
    ],
  },
  {
    id: "lot", label: "Lot supplémentaire", credits: 1000,
    description: [
      "Ajout d'un lot supplémentaire sur un marché déjà traité",
      "Mutualisation du dossier administratif pour réduire les coûts",
    ],
  },
];
export const serviceCredits = (id: keyof CustomQty): number =>
  SERVICE_COSTS.find((s) => s.id === id)?.credits ?? 0;

// ── Offres préconfigurées ──
export interface Feature { label: string; sub?: string }
export interface Offer {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  features: Feature[];
  popular?: boolean;
}
export const OFFERS: Offer[] = [
  {
    id: "essentiel", name: "Offre Essentiel", credits: 3650, priceCents: 36500,
    features: [{ label: "3 analyses" }, { label: "1 réponse", sub: "1 lot par réponse" }],
  },
  {
    id: "expertise", name: "Offre Expertise", credits: 6150, priceCents: 61500, popular: true,
    features: [{ label: "3 analyses" }, { label: "1 réponse", sub: "1 lot par réponse" }, { label: "1 mémoire technique" }],
  },
  {
    id: "serenite", name: "Offre Sérénité", credits: 8150, priceCents: 81500,
    features: [{ label: "3 analyses" }, { label: "1 réponse", sub: "1 lot par réponse" }, { label: "1 mémoire technique" }, { label: "1 dépôt" }],
  },
];

// ── Offre sur-mesure ──
export interface CustomQty {
  analyse: number;
  reponse: number;
  memoire: number;
  depot: number;
  lot: number;
}
export function computeCustom(q: CustomQty): { credits: number; priceCents: number; fullCents: number; savePct: number } {
  const credits = SERVICE_COSTS.reduce((sum, s) => sum + (q[s.id] ?? 0) * s.credits, 0);
  const priceCents = Math.round(credits * CUSTOM_UNIT_CENTS);
  const fullCents = Math.round(credits * CREDIT_UNIT_CENTS);
  const savePct = fullCents > 0 ? Math.round((1 - priceCents / fullCents) * 100) : 0;
  return { credits, priceCents, fullCents, savePct };
}

// ── Formatage ──
export const formatEur = (cents: number): string =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const unitEur = (cents: number): string =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 3, maximumFractionDigits: 3 });
