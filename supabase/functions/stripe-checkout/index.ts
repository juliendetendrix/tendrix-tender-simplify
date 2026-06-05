import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { getPack } from "../_shared/credit-packs.ts";

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
 * Crée une session de paiement Stripe (Checkout) pour un pack de crédits.
 * Authentifié : le propriétaire de l'entreprise. Renvoie l'URL de paiement.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

  try {
    if (!STRIPE_SECRET_KEY) return json({ error: "Paiement non configuré (clé Stripe absente)" }, 503);

    const { pack_id } = await req.json();
    const pack = getPack(String(pack_id ?? ""));
    if (!pack) return json({ error: "Pack inconnu" }, 400);

    // Identifier l'entreprise du caller (via son jeton + RLS).
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Non authentifié" }, 401);

    const { data: company } = await userClient
      .from("companies")
      .select("id, name, stripe_customer_id")
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (!company) return json({ error: "Entreprise introuvable" }, 403);

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: "2024-06-20",
    });

    // Base de l'app (pour les redirections) : l'origine de l'appelant.
    const origin = req.headers.get("origin") || "https://tendrix.fr";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: company.id,
      customer: company.stripe_customer_id || undefined,
      customer_email: company.stripe_customer_id ? undefined : (user.email ?? undefined),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: pack.amountCents,
            product_data: {
              name: `Tendrix — Pack ${pack.label}`,
              description: `${pack.credits} crédits d'analyse`,
            },
          },
        },
      ],
      success_url: `${origin}/app?tab=compte&purchase=success`,
      cancel_url: `${origin}/app?tab=compte&purchase=cancel`,
      metadata: {
        company_id: company.id,
        credits: String(pack.credits),
        pack_id: pack.id,
      },
    });

    // Trace l'achat en attente (idempotence côté webhook par session.id).
    const svc = createClient(SUPABASE_URL, SERVICE_KEY);
    await svc.from("credit_purchases").insert({
      company_id: company.id,
      stripe_session_id: session.id,
      pack_id: pack.id,
      credits: pack.credits,
      amount_cents: pack.amountCents,
      status: "pending",
    }).then(() => {}, () => {});

    return json({ url: session.url });
  } catch (err) {
    console.error("stripe-checkout erreur:", err);
    return json({ error: "Création du paiement impossible" }, 500);
  }
});
