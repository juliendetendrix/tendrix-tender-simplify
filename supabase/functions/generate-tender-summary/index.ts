import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tender } = await req.json();

    if (!tender || typeof tender !== "object") {
      return new Response(
        JSON.stringify({ error: "Requête invalide", summary: null }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY manquante");
      return new Response(
        JSON.stringify({ error: "Service indisponible", summary: null }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construire le prompt à partir des données BOAMP disponibles
    const lines = [
      `Titre : ${tender.title}`,
      tender.organisme ? `Organisme : ${tender.organisme}` : null,
      tender.location  ? `Lieu : ${tender.location}`       : null,
      tender.famille   ? `Famille : ${tender.famille}`     : null,
      tender.procedure ? `Procédure : ${tender.procedure}` : null,
      tender.deadline  ? `Date limite : ${tender.deadline}` : null,
      tender.summary   ? `Descripteurs : ${tender.summary}` : null,
      tender.cpvCodes?.length ? `Codes CPV : ${tender.cpvCodes.join(", ")}` : null,
    ].filter(Boolean).join("\n");

    const userMessage = `Voici les informations d'un appel d'offres public :\n\n${lines}\n\nRédige un résumé clair en 3 à 4 phrases pour un artisan du BTP. Explique ce qui est attendu, où, et pourquoi c'est pertinent. Langage simple, pas de jargon juridique, pas de puces, pas de titre.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 350,
        system:
          "Tu es un expert en marchés publics français qui aide les artisans et TPE du BTP à comprendre rapidement les appels d'offres. Tu rédiges des résumés courts, concrets et accessibles.",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("Anthropic API erreur :", response.status, body);

      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Clé API invalide", summary: null }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 529 || response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques secondes.", summary: null }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Erreur lors de la génération du résumé", summary: null }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text?.trim();

    if (!summary) {
      console.error("Anthropic n'a retourné aucun texte :", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Résumé vide", summary: null }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Persister le résumé dans la table tenders si on a un id valide
    // (best-effort — n'échoue pas si ça plante)
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase
        .from("tenders")
        .update({ summary })
        .eq("id", tender.id);
    } catch (e) {
      console.warn("Impossible de persister le résumé :", e);
    }

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erreur inattendue :", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne", summary: null }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
