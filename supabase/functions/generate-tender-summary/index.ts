import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tender } = await req.json();
    
    if (!tender || typeof tender !== 'object') {
      return new Response(
        JSON.stringify({ error: "Invalid request", summary: null }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service unavailable", summary: null }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a detailed prompt for the AI
    const prompt = `Tu es un expert en marchés publics français. Génère un résumé clair et accessible d'un appel d'offres pour une PME.

Données de l'appel d'offres :
- Titre : ${tender.title}
- Organisme : ${tender.organisme}
- Lieu d'exécution : ${tender.location}
- Budget : ${tender.budget}
- Date limite : ${tender.deadline}
${tender.summary ? `- Description : ${tender.summary}` : ""}
${tender.famille ? `- Famille : ${tender.famille}` : ""}
${tender.procedure ? `- Procédure : ${tender.procedure}` : ""}

Consignes :
- Rédige un résumé de 3 à 5 phrases maximum
- Utilise un langage simple, sans jargon juridique
- Explique clairement :
  • Ce qui est attendu (type de travaux/services/fournitures)
  • Où cela se déroule
  • L'échelle ou le volume principal (si mentionné)
  • Les contraintes importantes (durée, maintenance, etc.)
- Pas de références d'articles, pas de formules administratives
- Format : texte simple, pas de puces

Résumé :`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en marchés publics qui rédige des résumés clairs et accessibles pour les PME.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later.", summary: null }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable.", summary: null }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(
        JSON.stringify({ error: "An error occurred processing your request", summary: null }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      console.error("No summary generated from AI response");
      return new Response(
        JSON.stringify({ error: "Failed to generate summary", summary: null }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-tender-summary function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request", summary: null }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
