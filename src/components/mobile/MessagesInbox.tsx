import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageThread {
  id: string;
  title: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

const THREADS: MessageThread[] = [
  {
    id: "demo-1",
    title: "Rénovation façade école primaire Jean Moulin",
    lastMessage: "Marc Lefèvre : Je vais m'appuyer sur l'IA de Tendrix…",
    time: "09:14",
    unread: true,
  },
  {
    id: "demo-2",
    title: "Construction mur de soutènement parking municipal",
    lastMessage: "Marc Lefèvre : Dossier soumis, en attente de retour.",
    time: "Hier",
    unread: false,
  },
  {
    id: "demo-3",
    title: "Réfection maçonnerie gymnase communal",
    lastMessage: "Marc Lefèvre : Félicitations, dossier remporté ! 🎉",
    time: "Lun.",
    unread: false,
  },
];

interface Props {
  onBack: () => void;
  onOpenChat: (id: string, title: string) => void;
}

export function MessagesInbox({ onBack, onOpenChat }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b bg-white sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="font-semibold text-sm">Messages</div>
          <div className="text-xs text-muted-foreground">
            Conversations liées à vos dossiers
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {THREADS.map((t) => (
          <button
            key={t.id}
            onClick={() => onOpenChat(t.id, t.title)}
            className="w-full text-left bg-white border border-border rounded-lg p-3 flex items-start gap-3 hover:bg-muted/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
              ML
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-sm text-foreground truncate">
                  {t.title}
                </div>
                <div className="text-[11px] text-muted-foreground shrink-0">
                  {t.time}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <MessageSquare className="w-3 h-3 text-muted-foreground shrink-0" />
                <div className="text-xs text-muted-foreground truncate flex-1">
                  {t.lastMessage}
                </div>
                {t.unread && (
                  <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
