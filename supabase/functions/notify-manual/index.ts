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
 * Notifie Julien par EMAIL dès qu'une analyse bascule en "intervention manuelle"
 * (DCE non récupérable automatiquement : captcha, plateforme non supportée,
 * aucun lien, PDF illisibles…). Le mail contient le lien plateforme + le lien
 * BOAMP + la raison, pour récupérer les documents à la main et les déposer
 * dans l'espace chargé d'affaires.
 *
 * Appelé en SERVEUR-À-SERVEUR avec la clé service_role (depuis le robot
 * Trigger.dev `scrape-dce` et depuis l'edge function `analyze-tender`).
 * Best-effort : ne bloque jamais le pipeline.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const FROM_EMAIL = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "Tendrix <notifications@tendrix.fr>";
  const TO_EMAIL = Deno.env.get("MANUAL_NOTIFY_EMAIL") ?? "julien@tendrix.fr";
  const APP_URL = Deno.env.get("APP_URL") ?? "https://tendrix.fr";

  const svc = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { analysis_id } = await req.json();
    if (!analysis_id) return json({ error: "analysis_id manquant" }, 400);

    // Charger l'analyse → entreprise → AO (données déjà résolues par le robot)
    const { data: analysis } = await svc
      .from("tender_analyses")
      .select(`
        id,
        platform,
        buyer_profile_url,
        consultation_ref,
        status_detail,
        companies ( name ),
        tenders ( title, organisme, source_url )
      `)
      .eq("id", analysis_id)
      .single();

    if (!analysis) return json({ error: "Analyse introuvable" }, 404);

    const company: any = analysis.companies ?? {};
    const tender: any = analysis.tenders ?? {};

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY absente — email manuel non envoyé.");
      return json({ ok: true, skipped: "RESEND_API_KEY non configurée" });
    }

    const platformUrl: string | null = analysis.buyer_profile_url ?? null;
    const boampUrl: string | null = tender.source_url ?? null;
    const reason: string = analysis.status_detail ?? "Récupération automatique impossible";

    const row = (label: string, value: string) => `
      <tr>
        <td style="padding:4px 12px 4px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${label}</td>
        <td style="padding:4px 0;color:#1f2937">${value}</td>
      </tr>`;

    const linkBtn = (href: string, label: string, bg: string) =>
      `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;
         padding:10px 18px;border-radius:8px;font-weight:bold;margin:4px 8px 4px 0">${label}</a>`;

    const subject = `[Manuel] DCE à récupérer — ${tender.title ?? "Appel d'offres"}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.5;max-width:640px">
        <p>Bonjour Julien,</p>
        <p>Une analyse vient de basculer en <strong>récupération manuelle</strong> :
        le robot n'a pas pu télécharger automatiquement le DCE.</p>
        <table style="border-collapse:collapse;margin:12px 0">
          ${row("Appel d'offres", `<strong>${tender.title ?? "—"}</strong>`)}
          ${row("Acheteur", tender.organisme ?? company.name ?? "—")}
          ${row("Plateforme", analysis.platform ?? "—")}
          ${analysis.consultation_ref ? row("Référence", analysis.consultation_ref) : ""}
          ${row("Raison", `<span style="color:#b45309">${reason}</span>`)}
        </table>
        <p>
          ${platformUrl ? linkBtn(platformUrl, "Ouvrir la plateforme acheteur", "#0c1c98") : ""}
          ${boampUrl ? linkBtn(boampUrl, "Voir l'avis BOAMP", "#6b7280") : ""}
        </p>
        <p>Une fois les documents récupérés, dépose-les dans
          ${linkBtn(`${APP_URL}/charge-affaires`, "ton espace chargé d'affaires", "#f9bd43")}
        </p>
        <p style="color:#6b7280;font-size:13px">— Robot Tendrix</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [TO_EMAIL], subject, html }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Resend erreur:", res.status, body);
      return json({ ok: true, emailed: false });
    }

    return json({ ok: true, emailed: true });
  } catch (err) {
    console.error("notify-manual erreur:", err);
    return json({ ok: true, emailed: false }); // best-effort
  }
});
