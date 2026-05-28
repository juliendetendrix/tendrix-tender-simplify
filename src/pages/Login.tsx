import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, defaultRouteForRole } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";

const emailSchema = z.string().trim().email("Email invalide").max(255);

export default function Login() {
  const navigate = useNavigate();
  const { session, roles, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session && roles.length > 0) {
      navigate(defaultRouteForRole(roles[0]), { replace: true });
    }
  }, [session, roles, loading, navigate]);

  const friendly = (msg: string) => {
    if (/email logins are disabled/i.test(msg))
      return "La connexion par email est désactivée côté Supabase. Réactivez le fournisseur « Email » dans Authentication → Providers.";
    if (/invalid login credentials/i.test(msg)) return "Email ou mot de passe incorrect.";
    return msg;
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const parse = emailSchema.safeParse(email);
    if (!parse.success) {
      setError("Email invalide");
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: parse.data,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setSubmitting(false);
    if (err) {
      setError(friendly(err.message));
    } else {
      setInfo("Lien envoyé ✉️ — consultez votre boîte mail pour vous connecter.");
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const parse = emailSchema.safeParse(email);
    if (!parse.success) {
      setError("Email invalide");
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: parse.data,
      password,
    });
    setSubmitting(false);
    if (err) {
      setError(friendly(err.message));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0c1c98 0%, #0a1880 40%, #060e4f 100%)",
      }}
    >
      {/* Blobs décoratifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: "#f9bd43" }}
        />
        <div
          className="absolute -bottom-40 -left-24 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: "#4060e0" }}
        />
      </div>

      {/* Bouton retour */}
      <div className="relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors py-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>
      </div>

      {/* Contenu centré */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">

        {/* Logo blanc */}
        <img
          src="/logo-tendrix-white.svg"
          alt="Tendrix"
          className="h-9 mb-8"
        />

        {/* Carte */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Bande jaune en haut */}
          <div className="h-1.5 w-full" style={{ backgroundColor: "#f9bd43" }} />

          <div className="p-7 space-y-6">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground">Connexion</h1>
              <p className="text-sm text-muted-foreground">
                Accédez à votre espace Tendrix
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
                {info}
              </div>
            )}

            <form
              onSubmit={mode === "magic" ? handleMagicLink : handlePassword}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.fr"
                  className="h-11 rounded-xl"
                />
              </div>

              {mode === "password" && (
                <div className="space-y-1.5">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl font-bold text-sm transition-all disabled:opacity-60 hover:opacity-90"
                style={{ backgroundColor: "#0c1c98", color: "white" }}
              >
                {submitting
                  ? "…"
                  : mode === "magic"
                  ? "Recevoir un lien de connexion"
                  : "Se connecter"}
              </button>

              <button
                type="button"
                className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={() => {
                  setError(null);
                  setInfo(null);
                  setMode(mode === "magic" ? "password" : "magic");
                }}
              >
                {mode === "magic"
                  ? "Utiliser un mot de passe à la place"
                  : "Recevoir un lien magique à la place"}
              </button>
            </form>
          </div>
        </div>

        {/* Lien inscription */}
        <p className="mt-6 text-sm text-white/60">
          Pas encore de compte ?{" "}
          <button
            onClick={() => navigate("/questionnaire-pme")}
            className="text-white font-semibold hover:underline"
          >
            Commencer gratuitement
          </button>
        </p>
      </div>
    </div>
  );
}
