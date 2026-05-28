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
 * Notifie par EMAIL le chargé d'affaires référent qu'une analyse a été lancée.
 * (Le message "sur la plateforme" est déjà posté en base par la RPC.)
 * Best-effort : ne bloque jamais l'utilisateur.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const FROM_EMAIL = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "Tendrix <notifications@tendrix.fr>";
  const APP_URL = Deno.env.get("APP_URL") ?? "https://tendrix.fr";

  const svc = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { analysis_id } = await req.json();
    if (!analysis_id) return json({ error: "analysis_id manquant" }, 400);

    // Vérifier que le caller a accès à cette analyse (via son jeton + RLS)
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: allowed } = await userClient
      .from("tender_analyses")
      .select("id")
      .eq("id", analysis_id)
      .maybeSingle();
    if (!allowed) return json({ error: "Accès refusé" }, 403);

    // Charger l'analyse → entreprise → CA assigné → AO
    const { data: analysis } = await svc
      .from("tender_analyses")
      .select(`
        id,
        companies ( name, assigned_charge_affaires ),
        tenders ( title, organisme )
      `)
      .eq("id", analysis_id)
      .single();

    const company: any = analysis?.companies ?? {};
    const tender: any = analysis?.tenders ?? {};
    const caUserId = company.assigned_charge_affaires;

    if (!caUserId) {
      return json({ ok: true, skipped: "aucun chargé d'affaires assigné" });
    }

    const { data: caProfile } = await svc
      .from("charge_affaires_profiles")
      .select("display_name, email")
      .eq("user_id", caUserId)
      .maybeSingle();

    const caEmail = caProfile?.email;
    if (!caEmail) {
      return json({ ok: true, skipped: "email du chargé d'affaires inconnu" });
    }

    if (!RESEND_API_KEY) {
      // Pas de fournisseur d'email configuré : on ne casse rien, on signale.
      console.warn("RESEND_API_KEY absente — email non envoyé (message plateforme déjà posté).");
      return json({ ok: true, skipped: "RESEND_API_KEY non configurée" });
    }

    const subject = `Nouvelle analyse à traiter — ${company.name ?? "Client"}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.5">
        <p>Bonjour ${caProfile?.display_name ?? ""},</p>
        <p><strong>${company.name ?? "Une entreprise"}</strong> vient de lancer une
        <strong>analyse complète</strong> sur l'appel d'offres suivant :</p>
        <p style="background:#eef0ff;border-radius:8px;padding:12px 16px;color:#0c1c98">
          <strong>${tender.title ?? "Appel d'offres"}</strong><br/>
          ${tender.organisme ? `${tender.organisme}` : ""}
        </p>
        <p>Merci de récupérer le dossier de consultation (DCE) et de lancer l'analyse IA
        depuis votre espace chargé d'affaires.</p>
        <p><a href="${APP_URL}/charge-affaires"
              style="display:inline-block;background:#0c1c98;color:#fff;text-decoration:none;
                     padding:10px 18px;border-radius:8px;font-weight:bold">
          Ouvrir mon espace
        </a></p>
        <p style="color:#6b7280;font-size:13px">— L'équipe Tendrix</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [caEmail], subject, html }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Resend erreur:", res.status, body);
      return json({ ok: true, emailed: false });
    }

    return json({ ok: true, emailed: true });
  } catch (err) {
    console.error("notify-ca erreur:", err);
    return json({ ok: true, emailed: false }); // best-effort : ne jamais bloquer
  }
});
