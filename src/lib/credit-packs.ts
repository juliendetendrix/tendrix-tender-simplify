// Packs de crédits (miroir de supabase/functions/_shared/credit-packs.ts).
// Garder les deux synchronisés. PRIX = placeholders, à ajuster.
export interface CreditPack {
  id: string;
  label: string;
  credits: number;
  amountCents: number;
  popular?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", label: "Starter", credits: 10,  amountCents: 1900 },
  { id: "pro",     label: "Pro",     credits: 50,  amountCents: 7900, popular: true },
  { id: "max",     label: "Max",     credits: 100, amountCents: 13900 },
];

export const formatEur = (cents: number): string =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export const pricePerCredit = (p: CreditPack): string =>
  formatEur(Math.round(p.amountCents / p.credits));
