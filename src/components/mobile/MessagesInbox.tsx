/**
 * MessagesInbox
 * Liste des conversations de l'utilisateur.
 * — Pour un nouvel utilisateur : une seule conversation, celle avec le CA assigné.
 * — À terme : chaque dossier créé génèrera un fil de conversation dédié qui s'ajoutera ici.
 * — Architecture : le CA_THREAD_ID ("ca-direct") est une convention partagée avec DemoChat.
 */
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CAProfile } from "@/hooks/useCAProfile";

export const CA_THREAD_ID = "ca-direct";

interface Props {
  onBack: () => void;
  onOpenChat: (id: string, title: string, isCADirect?: boolean) => void;
  ca: CAProfile;
  caInitials: string;
}

export function MessagesInbox({ onBack, onOpenChat, ca, caInitials }: Props) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b bg-white sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="font-semibold text-sm">Messages</div>
          <div className="text-xs text-muted-foreground">Vos conversations</div>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {/*
          Conversation CA — toujours présente, quelle que soit l'ancienneté du compte.
          Les conversations de dossiers s'ajouteront ici dynamiquement.
        */}
        <button
          onClick={() => onOpenChat(CA_THREAD_ID, ca.display_name, true)}
          className="w-full text-left bg-white border border-primary/20 rounded-lg p-3 flex items-start gap-3 hover:bg-primary/5 transition-colors"
        >
          {/* Avatar CA */}
          <div className="relative shrink-0">
            <img
              src={ca.photo_url}
              alt={ca.display_name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fb = e.currentTarget.nextElementSibling as HTMLElement;
                if (fb) fb.style.display = "flex";
              }}
            />
            <div
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground items-center justify-center font-semibold text-sm"
              style={{ display: "none" }}
            >
              {caInitials}
            </div>
            {/* Badge "en ligne" */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>

          {/* Contenu du fil */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold text-sm text-foreground truncate">
                {ca.display_name}
              </div>
              <div className="text-[11px] text-muted-foreground shrink-0">Maintenant</div>
            </div>
            <div className="text-xs text-primary font-medium mt-0.5 truncate">
              Chargé d'affaires référent
            </div>
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              Bonjour ! Je suis disponible pour vos questions.
            </div>
          </div>

          {/* Point non-lu */}
          <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0 mt-1.5" />
        </button>

        {/*
          Espace réservé pour les conversations de dossiers.
          Elles seront générées dynamiquement quand l'utilisateur crée des dossiers.
        */}
      </div>
    </div>
  );
}
