// Tarification Tendrix (modèle façon Iziao). PRIX/CRÉDITS = PLACEHOLDERS.
// Source de vérité partagée front (src/lib/credit-packs.ts) + back (ici).
// Le crédit est la monnaie fine ; chaque service coûte N crédits ; les offres
// sont des bundles ; l'offre sur-mesure applique une remise.

export const CREDIT_UNIT_CENTS = 10;        // 0,10 € HT / crédit (plein tarif)
export const CUSTOM_UNIT_CENTS = 10;        // 0,10 € HT / crédit — tarif unique (réponse = 350 € partout)

// Coût en crédits par service.
export const SERVICE_COSTS: Record<string, number> = {
  analyse: 500,
  reponse: 3500,
  memoire: 2500,
  depot: 2000,
  lot: 1000,
};

// Offres préconfigurées (bundles).
export interface Offer {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
}
export const OFFERS: Offer[] = [
  { id: "essentiel", name: "Offre Essentiel", credits: 5000, priceCents: 50000 },
  { id: "expertise", name: "Offre Expertise", credits: 7500, priceCents: 75000 },
  { id: "serenite",  name: "Offre Sérénité",  credits: 9500, priceCents: 95000 },
];
export const getOffer = (id: string): Offer | null =>
  OFFERS.find((o) => o.id === id) ?? null;

// Calcul d'une offre SUR-MESURE à partir des quantités par service.
// Renvoie le total de crédits + le prix (remisé), recalculé côté serveur
// (on ne fait jamais confiance au montant envoyé par le client).
export interface CustomQty {
  analyse?: number;
  reponse?: number;
  memoire?: number;
  depot?: number;
  lot?: number;
}
export function computeCustom(q: CustomQty): { credits: number; priceCents: number } {
  const credits =
    (q.analyse ?? 0) * SERVICE_COSTS.analyse +
    (q.reponse ?? 0) * SERVICE_COSTS.reponse +
    (q.memoire ?? 0) * SERVICE_COSTS.memoire +
    (q.depot ?? 0) * SERVICE_COSTS.depot +
    (q.lot ?? 0) * SERVICE_COSTS.lot;
  const priceCents = Math.round(credits * CUSTOM_UNIT_CENTS);
  return { credits, priceCents };
}
