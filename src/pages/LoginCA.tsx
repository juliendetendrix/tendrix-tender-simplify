import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Briefcase } from "lucide-react";

const emailSchema = z.string().trim().email("Email invalide").max(255);

export default function LoginCA() {
  const navigate = useNavigate();
  const { session, roles, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !session) return;
    // Ne rediriger que les CA / admins. Une session entreprise reste sur la
    // page CA (sinon elle serait renvoyée vers l'app client) — elle pourra se
    // connecter avec des identifiants CA, ce qui basculera la session.
    if (roles.includes("admin")) {
      navigate("/admin", { replace: true });
    } else if (roles.includes("charge_affaires")) {
      navigate("/charge-affaires", { replace: true });
    }
  }, [session, roles, loading, navigate]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parse = emailSchema.safeParse(email);
    if (!parse.success) {
      setError("Email invalide");
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: parse.data,
      options: { emailRedirectTo: `${window.location.origin}/charge-affaires` },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
    } else {
      toast({
        title: "Lien envoyé ✉️",
        description: "Consultez votre boîte mail pour vous connecter.",
      });
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
      setError(
        /invalid login credentials/i.test(err.message)
          ? "Email ou mot de passe incorrect."
          : err.message,
      );
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
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors py-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Accueil
        </button>
      </div>

      {/* Contenu centré */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">

        {/* Logo blanc */}
        <img
          src="/logo-tendrix-white.svg"
          alt="Tendrix"
          className="h-9 mb-3"
        />

        {/* Badge espace pro */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-7"
          style={{ backgroundColor: "rgba(249,189,67,0.2)", color: "#f9bd43" }}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Espace Chargé d'Affaires
        </div>

        {/* Carte */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Bande jaune en haut */}
          <div className="h-1.5 w-full" style={{ backgroundColor: "#f9bd43" }} />

          <div className="p-7 space-y-6">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground">Connexion</h1>
              <p className="text-sm text-muted-foreground">
                Accédez à votre espace professionnel
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                <span>{error}</span>
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
                  placeholder="prenom.nom@tendrix.fr"
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
          Nouveau chargé d'affaires ?{" "}
          <button
            onClick={() => navigate("/inscription-ca")}
            className="text-white font-semibold hover:underline"
          >
            Créer un compte
          </button>
        </p>

        {/* Séparateur */}
        <div className="mt-4 text-xs text-white/30">
          Vous êtes une entreprise ?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-white/50 hover:text-white transition-colors underline"
          >
            Connexion client
          </button>
        </div>
      </div>
    </div>
  );
}
