import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCompleteProfile: () => void;
}

/** Affichée après un achat de crédits réussi. */
export function PurchaseSuccessDialog({ open, onOpenChange, onCompleteProfile }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-2xl text-center p-7">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "#dcfce7" }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: "#16a34a" }} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Paiement confirmé 🎉</h2>
          <p className="text-sm text-foreground mt-3 leading-relaxed">
            Vos crédits sont ajoutés à votre compte.<br />
            <span className="font-semibold">Votre chargé d'affaires va vous contacter sous peu.</span>
          </p>
          <div className="rounded-xl border p-3 mt-4 text-left" style={{ backgroundColor: "#eef0ff", borderColor: "#c7ccff" }}>
            <p className="text-sm" style={{ color: "#0c1c98" }}>
              En attendant, <strong>complétez au maximum votre librairie et les informations de votre entreprise</strong> :
              c'est ce qui permet à nos outils de commencer à préparer vos réponses.
            </p>
          </div>
          <Button
            onClick={onCompleteProfile}
            className="w-full h-12 rounded-xl font-bold text-white mt-5 hover:opacity-90"
            style={{ backgroundColor: "#0c1c98" }}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Compléter mon entreprise
          </Button>
          <button onClick={() => onOpenChange(false)} className="text-xs text-muted-foreground mt-3 hover:text-foreground">
            Plus tard
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
