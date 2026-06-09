import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyMessages } from "@/hooks/useCompanyMessages";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CompanyThread {
  id: string;
  name: string;
  last?: { body: string; at: string };
  unread: number;
}

interface Props { userId: string }

// ─── Conversation directe avec une entreprise (côté CA) ─────────────────────
function CADirectChat({ company, onBack }: { company: CompanyThread; onBack: () => void }) {
  const { messages, send, markRead } = useCompanyMessages(company.id);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { markRead("ca"); }, [markRead, messages.length]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMsg = async () => {
    const b = draft.trim();
    if (!b) return;
    setSending(true);
    setDraft("");
    await send(b, "ca");
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-56px)] lg:max-h-screen">
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-border shrink-0">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-sm">{company.name?.[0]?.toUpperCase() ?? "?"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{company.name}</p>
          <p className="text-xs text-primary font-medium">Conversation directe</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Aucun message. Envoyez le premier !
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_role === "ca";
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-primary text-white rounded-br-md" : "bg-white border border-border text-foreground rounded-bl-md shadow-sm"}`}>
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>{format(new Date(m.created_at), "HH:mm", { locale: fr })}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 bg-white border-t border-border shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
            placeholder="Votre message à l'entreprise…"
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm resize-none focus:outline-none focus:border-primary transition-colors max-h-32"
            style={{ minHeight: "42px" }}
          />
          <button onClick={sendMsg} disabled={sending || !draft.trim()} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40" style={{ backgroundColor: "#0c1c98" }}>
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CAMessages({ userId }: Props) {
  const [threads, setThreads] = useState<CompanyThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<CompanyThread | null>(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const { data: comps } = await supabase
      .from("companies")
      .select("id, name")
      .eq("assigned_charge_affaires", userId)
      .order("name", { ascending: true });
    if (!comps) { setThreads([]); setLoading(false); return; }
    const ids = comps.map((c) => c.id);
    const { data: msgs } = await supabase
      .from("company_messages")
      .select("company_id, body, created_at, sender_role, read_by_ca")
      .in("company_id", ids)
      .order("created_at", { ascending: false });
    const lastMap: Record<string, { body: string; at: string }> = {};
    const unreadMap: Record<string, number> = {};
    (msgs ?? []).forEach((m: any) => {
      if (!lastMap[m.company_id]) lastMap[m.company_id] = { body: m.body, at: m.created_at };
      if (m.sender_role === "company" && !m.read_by_ca) unreadMap[m.company_id] = (unreadMap[m.company_id] ?? 0) + 1;
    });
    setThreads(comps.map((c) => ({ id: c.id, name: c.name, last: lastMap[c.id], unread: unreadMap[c.id] ?? 0 })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [userId]);

  if (open) return <CADirectChat company={open} onBack={() => { setOpen(null); load(); }} />;

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">Conversations directes avec vos entreprises</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white border rounded-2xl animate-pulse" />)}</div>
      ) : threads.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">Aucune entreprise assignée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <button key={t.id} onClick={() => setOpen(t)} className="w-full bg-white border border-border rounded-2xl p-4 text-left hover:shadow-md hover:border-primary/30 transition-all flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-sm">{t.name?.[0]?.toUpperCase() ?? "?"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 justify-between">
                  <p className="font-semibold text-sm text-foreground truncate">{t.name}</p>
                  {t.last?.at && <span className="text-[11px] text-muted-foreground shrink-0">{format(new Date(t.last.at), "d MMM", { locale: fr })}</span>}
                </div>
                {t.last ? (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.last.body}</p>
                ) : (
                  <p className="text-xs text-primary/60 mt-0.5">Démarrer la conversation</p>
                )}
              </div>
              {t.unread > 0 && (
                <span className="shrink-0 mt-0.5 text-[11px] font-bold rounded-full px-2 py-0.5" style={{ backgroundColor: "#f9bd43", color: "#0c1c98" }}>{t.unread}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
