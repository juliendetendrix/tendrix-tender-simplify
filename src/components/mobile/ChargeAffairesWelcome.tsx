import { Phone } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { CAProfile } from "@/hooks/useCAProfile";

interface ChargeAffairesWelcomeProps {
  isOpen: boolean;
  onClose: () => void;
  ca: CAProfile;
  caInitials: string;
}

export function ChargeAffairesWelcome({
  isOpen,
  onClose,
  ca,
  caInitials,
}: ChargeAffairesWelcomeProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[340px] rounded-2xl p-0 overflow-hidden border-0 shadow-strong">

        {/* Header bleu */}
        <div className="bg-primary px-6 pt-8 pb-6 text-center">
          <p className="text-white/60 text-[11px] uppercase tracking-widest font-semibold mb-5">
            Nous vous avons assigné un chargé d'affaires
          </p>

          {/* Photo / initiales */}
          <div className="relative inline-block mb-4">
            <img
              src={ca.photo_url}
              alt={ca.display_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-medium"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div
              className="w-24 h-24 rounded-full bg-white/20 border-4 border-white shadow-medium items-center justify-center"
              style={{ display: "none" }}
            >
              <span className="text-white text-2xl font-bold">{caInitials}</span>
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-primary" />
          </div>

          <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">
            Votre chargé d'affaires référent
          </p>
          <h2 className="text-white text-xl font-bold">{ca.display_name}</h2>

          {/* Téléphone */}
          {ca.phone && (
            <a
              href={`tel:${ca.phone}`}
              className="inline-flex items-center gap-1.5 mt-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {ca.phone}
            </a>
          )}
        </div>

        {/* Corps */}
        <div className="px-6 py-5 bg-white space-y-4">
          <p className="text-foreground text-sm leading-relaxed text-center">
            <strong>{ca.display_name}</strong> sera votre interlocuteur privilégié sur Tendrix.
            Il est la personne avec qui vous communiquerez pour vos réponses et celui qui
            se chargera de peaufiner vos dossiers pour maximiser vos chances de succès.
          </p>

          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "#f9bd43", color: "#0c1c98" }}
          >
            OK ! J'explore l'application
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
