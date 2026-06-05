import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Coins, Loader2, Check, Star } from "lucide-react";
import { CREDIT_PACKS, formatEur, pricePerCredit, type CreditPack } from "@/lib/credit-packs";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

/** Achat de packs de crédits → redirige vers le paiement Stripe. */
export function BuyCreditsDialog({ open, onOpenChange }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const buy = async (pack: CreditPack) => {
    setLoadingId(pack.id);
    const { data, error } = await supabase.functions.invoke("stripe-checkout", {
      body: { pack_id: pack.id },
    });
    setLoadingId(null);
    if (error || !data?.url) {
      toast({
        title: "Paiement indisponible",
        description: "Le paiement n'est pas encore configuré. Réessayez plus tard.",
        variant: "destructive",
      });
      return;
    }
    // Redirection vers la page de paiement sécurisée Stripe.
    window.location.href = data.url as string;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" style={{ color: "#f9bd43" }} />
            Acheter des crédits
          </DialogTitle>
          <DialogDescription>
            Chaque crédit sert à lancer une analyse d'appel d'offres. Paiement sécurisé par Stripe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-1">
          {CREDIT_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => buy(pack)}
              disabled={loadingId !== null}
              className="w-full flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-60"
              style={pack.popular ? { borderColor: "#0c1c98" } : undefined}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{pack.credits} crédits</span>
                  {pack.popular && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#0c1c98" }}>
                      <Star className="w-3 h-3" /> POPULAIRE
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pricePerCredit(pack)} / crédit
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg font-extrabold" style={{ color: "#0c1c98" }}>
                  {formatEur(pack.amountCents)}
                </span>
                {loadingId === pack.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <Check className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-1">
          Tu seras redirigé vers la page de paiement sécurisée Stripe.
        </p>
      </DialogContent>
    </Dialog>
  );
}
