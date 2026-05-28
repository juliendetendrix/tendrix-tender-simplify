import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Déclenche la tâche de scraping Trigger.dev (scrape-dce) pour une analyse.
 * Best-effort : si Trigger.dev n'est pas configuré, on ne casse rien
 * (l'analyse reste en intervention manuelle, le CA prend le relais).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const TRIGGER_SECRET_KEY = Deno.env.get("TRIGGER_SECRET_KEY");
  // Identifiant de la tâche (id défini dans src/trigger/scrape-dce.ts)
  const TASK_ID = "scrape-dce";

  try {
    const { analysis_id } = await req.json();
    if (!analysis_id) return json({ error: "analysis_id manquant" }, 400);

    // Contrôle d'accès via le jeton de l'appelant (RLS)
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: allowed } = await userClient
      .from("tender_analyses").select("id").eq("id", analysis_id).maybeSingle();
    if (!allowed) return json({ error: "Accès refusé" }, 403);

    if (!TRIGGER_SECRET_KEY) {
      console.warn("TRIGGER_SECRET_KEY absente — scraping non déclenché (fallback manuel).");
      return json({ ok: true, skipped: "scraping non configuré" });
    }

    const res = await fetch(`https://api.trigger.dev/api/v1/tasks/${TASK_ID}/trigger`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TRIGGER_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: { analysisId: analysis_id } }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Trigger.dev erreur:", res.status, body);
      return json({ ok: false, error: "déclenchement échoué" }, 502);
    }

    const data = await res.json().catch(() => ({}));
    return json({ ok: true, runId: (data as { id?: string }).id ?? null });
  } catch (err) {
    console.error("start-scrape erreur:", err);
    return json({ ok: false }); // best-effort
  }
});
