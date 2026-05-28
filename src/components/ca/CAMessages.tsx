import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Thread {
  id: string;
  status: string;
  tender: { title: string } | null;
  company: { name: string } | null;
  last_message?: string;
  last_message_at?: string;
  unread?: number;
}

interface Message {
  id: string;
  body: string;
  sender_user_id: string;
  created_at: string;
}

interface Props {
  userId: string;
}

export function CAMessages({ userId }: Props) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [openThread, setOpenThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    loadThreads();
  }, [userId]);

  const loadThreads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tender_requests")
      .select("id, status, tender:tenders(title), company:companies(name)")
      .eq("charge_affaires_id", userId)
      .order("updated_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    // Get last message per thread
    const ids = data.map(d => d.id);
    const { data: msgData } = await supabase
      .from("messages")
      .select("request_id, body, created_at")
      .in("request_id", ids)
      .order("created_at", { ascending: false });

    const lastMsgMap: Record<string, { body: string; at: string }> = {};
    (msgData ?? []).forEach(m => {
      if (!lastMsgMap[m.request_id]) {
        lastMsgMap[m.request_id] = { body: m.body, at: m.created_at };
      }
    });

    setThreads((data as any[]).map(d => ({
      ...d,
      last_message: lastMsgMap[d.id]?.body,
      last_message_at: lastMsgMap[d.id]?.at,
    })));
    setLoading(false);
  };

  const openChat = async (thread: Thread) => {
    setOpenThread(thread);
    setMsgLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("id, body, sender_user_id, created_at")
      .eq("request_id", thread.id)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as Message[]);
    setMsgLoading(false);

    // Subscribe to new messages
    supabase.channel(`msgs-ca-${thread.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `request_id=eq.${thread.id}` }, payload => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
  };

  const closeChat = () => {
    supabase.removeAllChannels();
    setOpenThread(null);
    setMessages([]);
    setDraft("");
    loadThreads();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!draft.trim() || !openThread) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");
    const { error } = await supabase.from("messages").insert({
      request_id: openThread.id,
      sender_user_id: userId,
      body,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setDraft(body);
    }
    setSending(false);
  };

  const STATUS_META: Record<string, { label: string; color: string }> = {
    demande:  { label: "Demandé",  color: "#0c1c98" },
    en_cours: { label: "En cours", color: "#d97706" },
    soumis:   { label: "Soumis",   color: "#0891b2" },
    gagne:    { label: "Gagné",    color: "#059669" },
    perdu:    { label: "Perdu",    color: "#dc2626" },
  };

  // ─── Chat view ──────────────────────────────────────────────
  if (openThread) {
    return (
      <div className="flex flex-col h-full max-h-[calc(100vh-56px)] lg:max-h-screen">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-border shrink-0">
          <button onClick={closeChat} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {openThread.tender?.title ?? "Dossier"}
            </p>
            <p className="text-xs text-primary font-medium">{openThread.company?.name}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#e0e4ff", color: STATUS_META[openThread.status]?.color ?? "#6b7280" }}>
            {STATUS_META[openThread.status]?.label ?? openThread.status}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20">
          {msgLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-white rounded-2xl animate-pulse" style={{ width: `${50 + i * 15}%` }} />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Aucun message. Envoyez le premier !
            </div>
          ) : (
            messages.map(m => {
              const isMe = m.sender_user_id === userId;
              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-white border border-border text-foreground rounded-bl-md shadow-sm"
                  }`}>
                    <p>{m.body}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                      {format(new Date(m.created_at), "HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-border shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Votre message…"
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm resize-none focus:outline-none focus:border-primary transition-colors max-h-32"
              style={{ minHeight: "42px" }}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !draft.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
              style={{ backgroundColor: "#0c1c98" }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Thread list ─────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">Conversations par dossier</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-white border rounded-2xl animate-pulse" />)}
        </div>
      ) : threads.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">Aucun dossier assigné</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map(t => {
            const sm = STATUS_META[t.status] ?? { label: t.status, color: "#6b7280" };
            return (
              <button
                key={t.id}
                onClick={() => openChat(t)}
                className="w-full bg-white border border-border rounded-2xl p-4 text-left hover:shadow-md hover:border-primary/30 transition-all flex items-start gap-4"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">
                    {t.company?.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {t.company?.name ?? "Entreprise"}
                    </p>
                    {t.last_message_at && (
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {format(new Date(t.last_message_at), "d MMM", { locale: fr })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {t.tender?.title ?? "Dossier"}
                  </p>
                  {t.last_message ? (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate italic">
                      {t.last_message}
                    </p>
                  ) : (
                    <p className="text-xs text-primary/60 mt-0.5">Démarrer la conversation</p>
                  )}
                </div>

                <span className="text-[11px] font-semibold shrink-0 mt-0.5" style={{ color: sm.color }}>
                  {sm.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
