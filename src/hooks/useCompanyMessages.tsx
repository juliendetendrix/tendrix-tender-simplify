// Conversation directe entreprise ↔ chargé d'affaires (table company_messages).
// Temps réel + envoi. Utilisé côté entreprise (role 'company') et côté CA (role 'ca').
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyMessage {
  id: string;
  company_id: string;
  sender_role: "company" | "ca";
  sender_id: string;
  body: string;
  created_at: string;
  read_by_company: boolean;
  read_by_ca: boolean;
}

export function useCompanyMessages(companyId?: string | null) {
  const [messages, setMessages] = useState<CompanyMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMsgs = useCallback(async () => {
    if (!companyId) { setMessages([]); setLoading(false); return; }
    const { data } = await supabase
      .from("company_messages")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as CompanyMessage[]);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetchMsgs(); }, [fetchMsgs]);

  useEffect(() => {
    if (!companyId) return;
    const ch = supabase
      .channel(`company_messages-${companyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "company_messages", filter: `company_id=eq.${companyId}` },
        () => fetchMsgs())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [companyId, fetchMsgs]);

  const send = useCallback(async (body: string, role: "company" | "ca") => {
    const text = body.trim();
    if (!companyId || !text) return false;
    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("company_messages")
      .insert({ company_id: companyId, sender_role: role, sender_id: auth.user?.id, body: text } as never)
      .select()
      .single();
    if (!error && data) {
      setMessages((prev) => (prev.some((m) => m.id === (data as CompanyMessage).id) ? prev : [...prev, data as CompanyMessage]));
    }
    return !error;
  }, [companyId]);

  // Marque comme lus les messages venant de l'autre partie.
  const markRead = useCallback(async (viewerRole: "company" | "ca") => {
    if (!companyId) return;
    const col = viewerRole === "company" ? "read_by_company" : "read_by_ca";
    const fromOther = viewerRole === "company" ? "ca" : "company";
    const unread = messages.filter((m) => m.sender_role === fromOther && !(m as any)[col]);
    if (unread.length === 0) return;
    await supabase.from("company_messages").update({ [col]: true } as never)
      .eq("company_id", companyId).eq("sender_role", fromOther).eq(col, false);
  }, [companyId, messages]);

  const unreadFor = (viewerRole: "company" | "ca") => {
    const col = viewerRole === "company" ? "read_by_company" : "read_by_ca";
    const fromOther = viewerRole === "company" ? "ca" : "company";
    return messages.filter((m) => m.sender_role === fromOther && !(m as any)[col]).length;
  };

  const lastMessage = messages.length ? messages[messages.length - 1] : null;

  return { messages, loading, send, markRead, unreadFor, lastMessage, refetch: fetchMsgs };
}
