import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";

// IMPORTANT : déployer cette fonction avec --no-verify-jwt (Stripe appelle sans JWT).
//   supabase functions deploy stripe-webhook --no-verify-jwt --project-ref <ref>

serve(async (req) => {
  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe non configuré", { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Signature manquante", { status: 400 });

  // Le corps BRUT est requis pour vérifier la signature (ne pas parser avant).
  const body = await req.text();

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: "2024-06-20",
  });

  let event: Stripe.Event;
  try {
    // En Deno, vérification asynchrone via SubtleCrypto.
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (err) {
    console.error("Signature Stripe invalide:", String(err));
    return new Response("Signature invalide", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.payment_status === "paid") {
        const companyId = s.metadata?.company_id;
        const credits = parseInt(s.metadata?.credits ?? "0", 10);
        const packId = s.metadata?.pack_id ?? null;
        if (companyId && credits > 0) {
          const svc = createClient(SUPABASE_URL, SERVICE_KEY);
          // Octroi IDEMPOTENT : la RPC ignore une session déjà traitée.
          const { data, error } = await svc.rpc("grant_credits_for_session", {
            _session_id: s.id,
            _company_id: companyId,
            _credits: credits,
            _amount: s.amount_total ?? null,
            _pack_id: packId,
            _currency: s.currency ?? "eur",
          });
          if (error) console.error("grant_credits_for_session erreur:", error.message);
          else console.log("Crédits octroyés:", { companyId, credits, granted: data });
        }
      }
    }
  } catch (err) {
    console.error("Traitement webhook erreur:", String(err));
    // On renvoie 200 quand même : l'event est valide, on ne veut pas de retries
    // infinis Stripe pour une erreur applicative (les logs suffisent à diagnostiquer).
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
