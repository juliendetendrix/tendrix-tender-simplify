import { MessageSquare } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { CAProfile } from "@/hooks/useCAProfile";

interface ChargeAffairesWelcomeProps {
  isOpen: boolean;
  onClose: () => void;
  onContactCA?: () => void;
  ca: CAProfile;
  caInitials: string;
}

export function ChargeAffairesWelcome({
  isOpen,
  onClose,
  onContactCA,
  ca,
  caInitials,
}: ChargeAffairesWelcomeProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[340px] rounded-2xl p-0 overflow-hidden border-0 shadow-strong">

        {/* Header bleu */}
        <div className="bg-primary px-6 pt-8 pb-6 text-center">
          {/* Message principal — mis en valeur */}
          <h2 className="text-white text-lg font-extrabold leading-snug mb-5">
            Un chargé d'affaires vous est dédié 🎯
          </h2>

          {/* Photo / initiales */}
          <div className="relative inline-block mb-3">
            <img
              src={ca.photo_url}
              alt={ca.display_name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-medium"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div
              className="w-20 h-20 rounded-full bg-white/20 border-4 border-white shadow-medium items-center justify-center"
              style={{ display: "none" }}
            >
              <span className="text-white text-xl font-bold">{caInitials}</span>
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-primary" />
          </div>

          {/* Nom — discret */}
          <p className="text-white/90 text-sm font-medium">{ca.display_name}</p>
          <p className="text-white/50 text-[11px] uppercase tracking-wider">Chargé d'affaires référent</p>
        </div>

        {/* Corps */}
        <div className="px-6 py-5 bg-white space-y-3">
          <p className="text-foreground text-sm leading-relaxed text-center">
            C'est votre interlocuteur dédié : il peaufine vos dossiers de réponse et vous
            accompagne pour maximiser vos chances de remporter vos marchés.
          </p>

          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "#f9bd43", color: "#0c1c98" }}
          >
            OK ! J'explore l'application
          </button>

          {/* Bouton discret : faire comprendre qu'on peut lui parler */}
          {onContactCA && (
            <button
              onClick={onContactCA}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors py-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Envoyer un message à {ca.display_name.split(" ")[0]}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
