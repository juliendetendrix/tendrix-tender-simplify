import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Loader2, Coins, Star } from "lucide-react";
import {
  OFFERS, SERVICE_COSTS, computeCustom, formatEur, unitEur,
  CREDIT_UNIT_CENTS, CUSTOM_UNIT_CENTS, type CustomQty,
} from "@/lib/credit-packs";

interface Props {
  onBack: () => void;
}

const BLUE = "#0c1c98";

export function Tarification({ onBack }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [qty, setQty] = useState<CustomQty>({ analyse: 3, reponse: 1, memoire: 1, depot: 1, lot: 1 });
  const custom = useMemo(() => computeCustom(qty), [qty]);

  const checkout = async (key: string, body: Record<string, unknown>) => {
    setLoading(key);
    const { data, error } = await supabase.functions.invoke("stripe-checkout", { body });
    setLoading(null);
    if (error || !data?.url) {
      toast({ title: "Paiement indisponible", description: "Le paiement n'est pas encore configuré.", variant: "destructive" });
      return;
    }
    window.location.href = data.url as string;
  };

  const BuyBtn = ({ k, onClick }: { k: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={loading !== null}
      className="w-full h-11 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      style={{ backgroundColor: BLUE }}
    >
      {loading === k ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
      Acheter des crédits
    </button>
  );

  return (
    <div className="min-h-full bg-background">
      {/* En-tête */}
      <header className="bg-card border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-foreground"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">Plans &amp; Factures</h1>
          <p className="text-[11px] text-muted-foreground">Estimez vos besoins et achetez vos crédits.</p>
        </div>
      </header>

      <main className="px-4 py-5 space-y-6 max-w-5xl mx-auto">
        {/* Offres préconfigurées — défilement horizontal (cartes lisibles) */}
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory">
          {OFFERS.map((o) => (
            <div key={o.id} className="relative rounded-2xl border bg-card p-5 flex flex-col w-[78%] min-w-[260px] max-w-[320px] shrink-0 snap-center"
                 style={o.popular ? { borderColor: BLUE, borderWidth: 2 } : undefined}>
              {o.popular && (
                <span className="absolute -top-2.5 left-5 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: BLUE }}>
                  <Star className="w-3 h-3" /> POPULAIRE
                </span>
              )}
              <h2 className="text-lg font-bold text-foreground">{o.name}</h2>
              <p className="text-sm font-semibold text-foreground mt-2">
                {o.credits.toLocaleString("fr-FR")} crédits
                <span className="text-xs font-normal text-muted-foreground"> ({unitEur(CREDIT_UNIT_CENTS)} HT/crédit)</span>
              </p>
              <p className="text-xs text-muted-foreground mt-3 mb-2">Avec ces crédits vous pouvez faire :</p>
              <ul className="space-y-1.5 flex-1">
                {o.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#16a34a" }} />
                    <span>{f.label}{f.sub && <span className="text-muted-foreground text-xs"> ({f.sub})</span>}</span>
                  </li>
                ))}
              </ul>
              <div className="text-center my-4 border-t pt-3">
                <span className="text-3xl font-extrabold text-foreground">{formatEur(o.priceCents)}</span>
                <span className="text-xs text-muted-foreground"> HT</span>
              </div>
              <BuyBtn k={o.id} onClick={() => checkout(o.id, { offer_id: o.id })} />
            </div>
          ))}
        </div>

        {/* Offre sur-mesure */}
        <div className="rounded-2xl border-2 bg-card p-5" style={{ borderColor: BLUE }}>
          <h2 className="text-lg font-bold text-foreground mb-4">Offre Personnalisée</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {SERVICE_COSTS.map((s) => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-foreground">Nombre de {s.label.toLowerCase()}</label>
                  <span className="text-sm font-bold w-12 text-center rounded-md border py-0.5" style={{ color: BLUE }}>
                    {qty[s.id]}
                  </span>
                </div>
                <Slider
                  value={[qty[s.id]]}
                  min={0} max={50} step={1}
                  onValueChange={([v]) => setQty((p) => ({ ...p, [s.id]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-5 border-t pt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {custom.credits.toLocaleString("fr-FR")} crédits
                <span className="text-xs font-normal text-muted-foreground"> ({unitEur(CUSTOM_UNIT_CENTS)} HT/crédit)</span>
              </p>
              {custom.savePct > 0 && (
                <p className="text-xs font-semibold mt-1" style={{ color: "#16a34a" }}>Vous économisez {custom.savePct}%</p>
              )}
              <p className="mt-1">
                <span className="text-3xl font-extrabold text-foreground">{formatEur(custom.priceCents)}</span>
                <span className="text-xs text-muted-foreground"> HT</span>
                {custom.savePct > 0 && (
                  <span className="text-sm text-muted-foreground line-through ml-2">{formatEur(custom.fullCents)} HT</span>
                )}
              </p>
            </div>
            <div className="sm:w-56">
              <BuyBtn k="custom" onClick={() => checkout("custom", { custom: qty })} />
            </div>
          </div>
        </div>

        {/* Table : utilisation des crédits */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-3">
            <Coins className="w-5 h-5" style={{ color: "#f9bd43" }} /> Utilisation des crédits
          </h2>
          <div className="rounded-xl border overflow-hidden divide-y">
            {SERVICE_COSTS.map((s) => (
              <div key={s.id} className="flex items-start gap-3 px-4 py-3 bg-card">
                <div className="w-32 shrink-0 font-semibold text-sm text-foreground">{s.label}</div>
                <ul className="flex-1 space-y-1">
                  {s.description.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#16a34a" }} />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="shrink-0 flex items-center gap-1 font-bold text-sm" style={{ color: BLUE }}>
                  {s.credits.toLocaleString("fr-FR")} <Coins className="w-3.5 h-3.5" style={{ color: "#f9bd43" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
