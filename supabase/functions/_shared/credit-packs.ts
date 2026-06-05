// Packs de crédits Tendrix (achat one-shot via Stripe).
// PRIX = PLACEHOLDERS — ajuste librement `amountCents` (montant en centimes d'euro).
// Source de vérité unique : le front lit ces mêmes packs (src/lib/credit-packs.ts).
export interface CreditPack {
  id: string;
  label: string;
  credits: number;
  amountCents: number; // ex. 1900 = 19,00 €
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", label: "Starter", credits: 10,  amountCents: 1900 },
  { id: "pro",     label: "Pro",     credits: 50,  amountCents: 7900 },
  { id: "max",     label: "Max",     credits: 100, amountCents: 13900 },
];

export const getPack = (id: string): CreditPack | null =>
  CREDIT_PACKS.find((p) => p.id === id) ?? null;
