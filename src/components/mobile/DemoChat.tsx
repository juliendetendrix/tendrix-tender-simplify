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
      body: `Bonjour, je prends en charge votre dossier "${dossierTitle}". Je reviens vers vous rapidement avec une première analyse.`,
      mine: false,
      time: "09:14",
    },
    {
      id: "2",
      body: "Parfait, merci ! Tenez-moi au courant.",
      mine: true,
      time: "09:22",
    },
    {
      id: "3",
      body: "Le dossier est éligible. Je prépare la réponse technique et je vous transmets le devis dans la journée.",
      mine: false,
      time: "10:05",
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
