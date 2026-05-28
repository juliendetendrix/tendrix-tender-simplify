import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { resolveDce } from "../_shared/dce-resolver.ts";

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
 * Résout les infos DCE d'une analyse (URL plateforme + moteur + référence)
 * depuis l'avis BOAMP brut, et les enregistre sur tender_analyses.
 * Best-effort : ne bloque jamais l'utilisateur.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const svc = createClient(SUPABASE_URL, SERVICE_KEY);

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

    // Charger l'avis brut lié
    const { data: analysis } = await svc
      .from("tender_analyses")
      .select("id, tender_id, tenders ( raw )")
      .eq("id", analysis_id)
      .single();

    const raw = (analysis as any)?.tenders?.raw;
    const res = resolveDce(raw);

    await svc.from("tender_analyses").update({
      buyer_profile_url: res.platformUrl,
      platform: res.platform,
      consultation_ref: res.reference,
    }).eq("id", analysis_id);

    return json({ ok: true, ...res });
  } catch (err) {
    console.error("resolve-dce erreur:", err);
    return json({ ok: false }); // best-effort
  }
});
