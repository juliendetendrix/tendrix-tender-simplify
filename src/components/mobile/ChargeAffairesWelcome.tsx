import { MessageSquare } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CAProfile } from "@/hooks/useCAProfile";

interface ChargeAffairesWelcomeProps {
  isOpen: boolean;
  /** Ferme le popup sans action supplémentaire */
  onClose: () => void;
  /** Ferme le popup ET ouvre la conversation CA */
  onContact: () => void;
  ca: CAProfile;
  caInitials: string;
}

export function ChargeAffairesWelcome({
  isOpen,
  onClose,
  onContact,
  ca,
  caInitials,
}: ChargeAffairesWelcomeProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[340px] rounded-2xl p-0 overflow-hidden border-0 shadow-strong">

        {/* Header bleu */}
        <div className="bg-primary px-6 pt-8 pb-6 text-center">
          {/* Mention d'assignation */}
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
                // Si la photo est absente → afficher les initiales
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
            {/* Badge "en ligne" */}
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-primary" />
          </div>

          <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">
            Votre chargé d'affaires référent
          </p>
          <h2 className="text-white text-xl font-bold">{ca.display_name}</h2>
        </div>

        {/* Corps */}
        <div className="px-6 py-5 bg-white space-y-3">
          <p className="text-foreground text-sm leading-relaxed text-center">
            <strong>{ca.display_name}</strong> sera votre interlocuteur privilégié sur Tendrix.
            Il est la personne avec qui vous communiquerez pour vos réponses et celui qui
            se chargera de peaufiner vos dossiers pour maximiser vos chances de succès.
          </p>

          {/* CTA principal → ouvre la messagerie */}
          <Button
            className="w-full h-11 font-semibold text-sm"
            onClick={onContact}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Envoyer un message
          </Button>

          {/* Lien discret pour fermer sans ouvrir la messagerie */}
          <button
            onClick={onClose}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Pas maintenant — explorer l'application
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
