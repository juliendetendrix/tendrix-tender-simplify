/**
 * DemoChat
 * Interface de messagerie interne.
 * — Mode "ca-direct" (isCADirect=true) : conversation directe avec le CA (message de bienvenue).
 * — Mode "dossier" (par défaut) : conversation liée à un appel d'offres spécifique.
 */
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Phone, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CAProfile } from "@/hooks/useCAProfile";

interface ChatMessage {
  id: string;
  body: string;
  mine: boolean;
  time: string;
  type?: "text" | "proposal";
}

interface Props {
  dossierTitle: string;
  onBack: () => void;
  /** Conversation directe avec le CA (pas liée à un dossier) */
  isCADirect?: boolean;
  ca: CAProfile;
  caInitials: string;
  /** Rendu desktop (espace messagerie pleine hauteur, design system .tdx-app) */
  desktop?: boolean;
}

function getNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Message de bienvenue affiché dans la conversation CA directe */
const CA_WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: "ca-welcome-1",
    body: "Bonjour et bienvenue sur Tendrix ! 👋\n\nJe suis votre chargé d'affaires référent. Mon rôle est de vous accompagner de A à Z sur vos réponses aux appels d'offres : sélection des opportunités, rédaction des dossiers, dépôt sur les plateformes.\n\nN'hésitez pas à me poser toutes vos questions ici.",
    mine: false,
    time: getNow(),
  },
];

/** Messages initiaux pour un chat lié à un dossier */
const DOSSIER_INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "dossier-proposal-1",
    body: "Proposition de réponse V1 — IA Tendrix",
    mine: false,
    time: "09:10",
    type: "proposal",
  },
  {
    id: "dossier-msg-1",
    body: "Bonjour, je vais m'appuyer sur l'IA de Tendrix qui s'est basée sur toutes les données que nous avons collectées lors de votre onboarding et sur les appels d'offres auxquels nous avons déjà répondu ensemble, pour réaliser une première version de cet appel d'offres. Nous pourrons rediscuter des mentions techniques ensemble rapidement si besoin.",
    mine: false,
    time: "09:14",
  },
];

export function DemoChat({ dossierTitle, onBack, isCADirect = false, ca, caInitials, desktop = false }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    isCADirect ? CA_WELCOME_MESSAGES : DOSSIER_INITIAL_MESSAGES
  );
  const [body, setBody] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const t = body.trim();
    if (!t) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), body: t, mine: true, time: getNow() },
    ]);
    setBody("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
  };

  // ════════════════ ESPACE MESSAGES DESKTOP (design system) ════════════════
  if (desktop) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "24px 32px" }}>
        <div className="card page-anim" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", width: "100%", maxWidth: 940, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
            <button onClick={onBack} className="icon-btn" style={{ width: 34, height: 34 }}><ArrowLeft className="ico-sm" /></button>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img src={ca.photo_url} alt={ca.display_name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }}
                onError={(e) => { e.currentTarget.style.display = "none"; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display = "flex"; }} />
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--navy)", color: "#fff", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, display: "none" }}>{caInitials}</div>
              {isCADirect && <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: "var(--go-dot)", border: "2px solid var(--surface)" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800 }}>{ca.display_name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{isCADirect ? "Chargé d'affaires référent" : dossierTitle}</div>
            </div>
            {ca.phone && (
              <a href={`tel:${ca.phone.replace(/\s/g, "")}`} className="icon-btn" style={{ width: 38, height: 38 }} aria-label={`Appeler ${ca.display_name}`}>
                <Phone className="ico-sm" style={{ color: "var(--navy)" }} />
              </a>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="scrollbar" style={{ flex: 1, overflowY: "auto", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 12, background: "var(--surface-2)" }}>
            {messages.map((m) =>
              m.type === "proposal" ? (
                <button key={m.id} style={{ alignSelf: "flex-start", maxWidth: "78%", textAlign: "left", background: "var(--surface)", border: "1px solid color-mix(in oklab, var(--navy) 25%, white)", borderRadius: 14, boxShadow: "var(--shadow-sm)", padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, background: "color-mix(in oklab, var(--navy) 9%, white)", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles className="ico-sm" /></span>
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", letterSpacing: ".04em" }}>IA Tendrix</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>Proposition de réponse V1</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--navy)", borderTop: "1px solid var(--line-2)", paddingTop: 8 }}>
                    <FileText className="ico-sm" /> Voir la proposition
                  </div>
                  <div style={{ fontSize: 10.5, marginTop: 4, color: "var(--muted)" }}>{m.time}</div>
                </button>
              ) : (
                <div key={m.id} style={{ alignSelf: m.mine ? "flex-end" : "flex-start", maxWidth: "76%" }}>
                  <div style={{
                    borderRadius: 16, padding: "9px 13px", fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word",
                    ...(m.mine
                      ? { background: "var(--navy)", color: "#fff", borderBottomRightRadius: 5 }
                      : { background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", borderBottomLeftRadius: 5 }),
                  }}>
                    {m.body}
                    <div style={{ fontSize: 10, marginTop: 4, color: m.mine ? "rgba(255,255,255,.7)" : "var(--muted)" }}>{m.time}</div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Composer */}
          <div style={{ padding: "14px 18px", borderTop: "1px solid var(--line)", display: "flex", gap: 12, alignItems: "flex-end" }}>
            <textarea
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrire un message… (⌘+Entrée pour envoyer)"
              style={{ flex: 1, resize: "none", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 13px", fontFamily: "inherit", fontSize: 13.5, lineHeight: 1.5, outline: "none", background: "var(--surface-2)", color: "var(--ink)" }}
            />
            <button onClick={handleSend} disabled={!body.trim()} className="btn btn-primary"><Send className="ico-sm" /> Envoyer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b bg-white">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

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
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm"
            style={{ display: "none" }}
          >
            {caInitials}
          </div>
          {isCADirect && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{ca.display_name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {isCADirect ? "Chargé d'affaires référent" : dossierTitle}
          </div>
        </div>

        {/* Bouton appel */}
        {ca.phone && (
          <a
            href={`tel:${ca.phone.replace(/\s/g, "")}`}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label={`Appeler ${ca.display_name}`}
          >
            <Phone className="w-5 h-5 text-primary" />
          </a>
        )}
      </div>

      {/* Zone messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
        {messages.map((m) =>
          m.type === "proposal" ? (
            <div key={m.id} className="flex justify-start">
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
            </div>
          ) : (
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
          )
        )}
      </div>

      {/* Zone saisie */}
      <div className="p-3 border-t bg-background space-y-2">
        <Textarea
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message… (⌘+Entrée pour envoyer)"
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
