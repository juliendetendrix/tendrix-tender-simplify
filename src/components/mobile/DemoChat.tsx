import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Phone, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DemoMessage {
  id: string;
  body: string;
  mine: boolean;
  time: string;
  type?: "text" | "proposal";
}

interface Props {
  dossierTitle: string;
  onBack: () => void;
}

const CA_NAME = "Marc Lefèvre";
const CA_PHONE = "06 78 45 12 90";

export function DemoChat({ dossierTitle, onBack }: Props) {
  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      id: "1",
      body: "Proposition de réponse V1 — IA Tendrix",
      mine: false,
      time: "09:10",
      type: "proposal",
    },
    {
      id: "2",
      body: "Bonjour, je vais m'appuyer sur l'IA de Tendrix qui s'est basée sur toutes les données que nous avons collectées lors de votre onboarding et sur les appels d'offres auxquels nous avons déjà répondu ensemble, pour réaliser une première version de cet appel d'offres. Nous pourrons rediscuter des mentions techniques ensemble rapidement si besoin.",
      mine: false,
      time: "09:14",
    },
  ]);
  const [body, setBody] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const t = body.trim();
    if (!t) return;
    const now = new Date();
    setMessages((p) => [
      ...p,
      {
        id: String(Date.now()),
        body: t,
        mine: true,
        time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      },
    ]);
    setBody("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center gap-2 p-3 border-b bg-white">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shrink-0">
          ML
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{CA_NAME}</div>
          <div className="text-xs text-muted-foreground truncate">{dossierTitle}</div>
        </div>
        <a
          href={`tel:${CA_PHONE.replace(/\s/g, "")}`}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Appeler"
        >
          <Phone className="w-5 h-5 text-primary" />
        </a>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            {m.type === "proposal" ? (
              <button className="max-w-[85%] text-left rounded-2xl rounded-bl-sm bg-white border border-primary/30 shadow-sm p-3 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-primary uppercase tracking-wide">IA Tendrix</div>
                    <div className="text-sm font-semibold leading-tight">Proposition de réponse V1</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary border-t border-border pt-2">
                  <FileText className="w-3.5 h-3.5" />
                  Voir la proposition
                </div>
                <div className="text-[10px] mt-1 text-muted-foreground">{m.time}</div>
              </button>
            ) : (
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.mine
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-white border border-border rounded-bl-sm"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{m.body}</div>
              <div
                className={`text-[10px] mt-1 ${
                  m.mine ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {m.time}
              </div>
            </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t bg-background space-y-2">
        <Textarea
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Écrire un message..."
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={!body.trim()} size="sm">
            <Send className="w-4 h-4 mr-1" />
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
}
