import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Message {
  id: string;
  body: string;
  sender_user_id: string;
  attachments: any[];
  created_at: string;
}

interface DossierData {
  id: string;
  status: string;
  charge_affaires_id: string | null;
  tender: { title: string; deadline: string | null; organisme: string | null } | null;
}

interface Props {
  requestId: string;
  onBack: () => void;
}

export function DossierDetail({ requestId, onBack }: Props) {
  const { user } = useAuth();
  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const [d, m] = await Promise.all([
        supabase
          .from("tender_requests")
          .select("id, status, charge_affaires_id, tender:tenders(title,deadline,organisme)")
          .eq("id", requestId)
          .maybeSingle(),
        supabase
          .from("messages")
          .select("*")
          .eq("request_id", requestId)
          .order("created_at", { ascending: true }),
      ]);
      setDossier(d.data as any);
      setMessages((m.data ?? []) as any);
      setLoading(false);
    };
    load();

    // Realtime
    const channel = supabase
      .channel(`messages:${requestId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `request_id=eq.${requestId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed || !user) return;
    if (trimmed.length > 2000) {
      toast({ title: "Message trop long", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      request_id: requestId,
      sender_user_id: user.id,
      body: trimmed,
    });
    setSending(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setBody("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center gap-2 p-3 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">
            {dossier?.tender?.title ?? "Dossier"}
          </div>
          {dossier?.tender?.deadline && (
            <div className="text-xs text-muted-foreground">
              Date limite : {dossier.tender.deadline}
            </div>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : messages.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-8">
            Démarrez la discussion avec votre chargé d'affaires.
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_user_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {format(new Date(m.created_at), "d MMM HH:mm", { locale: fr })}
                  </div>
                </div>
              </div>
            );
          })
        )}
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
          <Button onClick={handleSend} disabled={sending || !body.trim()} size="sm">
            <Send className="w-4 h-4 mr-1" />
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
}
