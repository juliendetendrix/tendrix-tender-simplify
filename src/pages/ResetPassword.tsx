import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, defaultRouteForRole } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, KeyRound } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { session, roles, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Le client Supabase consomme automatiquement le token de récupération présent
  // dans l'URL et ouvre une session temporaire. Si après chargement il n'y a
  // toujours pas de session, c'est que le lien est invalide ou expiré.
  const [noSession, setNoSession] = useState(false);
  useEffect(() => {
    if (loading) return;
    if (!session) {
      // Laisse une petite marge au cas où le hash n'est pas encore traité.
      const t = setTimeout(() => setNoSession(true), 1500);
      return () => clearTimeout(t);
    }
    setNoSession(false);
  }, [session, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
  };

  const goToSpace = () => {
    navigate(defaultRouteForRole(roles[0]), { replace: true });
  };

  return (
    <div
      className="min-h-screen flex flex-col p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0c1c98 0%, #0a1880 40%, #060e4f 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: "#f9bd43" }} />
        <div className="absolute -bottom-40 -left-24 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: "#4060e0" }} />
      </div>

      <div className="relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors py-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Accueil
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <img src="/logo-tendrix-white.svg" alt="Tendrix" className="h-9 mb-3" />

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-7"
             style={{ backgroundColor: "rgba(249,189,67,0.2)", color: "#f9bd43" }}>
          <KeyRound className="w-3.5 h-3.5" />
          Nouveau mot de passe
        </div>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full" style={{ backgroundColor: "#f9bd43" }} />

          <div className="p-7 space-y-6">
            {done ? (
              <div className="space-y-5 text-center">
                <h1 className="text-xl font-bold text-foreground">Mot de passe modifié ✅</h1>
                <p className="text-sm text-muted-foreground">
                  Votre nouveau mot de passe est enregistré. Vous êtes connecté.
                </p>
                <button
                  onClick={goToSpace}
                  className="w-full h-12 rounded-xl font-bold text-sm text-white hover:opacity-90"
                  style={{ backgroundColor: "#0c1c98" }}
                >
                  Accéder à mon espace
                </button>
              </div>
            ) : noSession ? (
              <div className="space-y-5 text-center">
                <h1 className="text-xl font-bold text-foreground">Lien invalide ou expiré</h1>
                <p className="text-sm text-muted-foreground">
                  Ce lien de réinitialisation n'est plus valable. Demandez-en un nouveau depuis la page de connexion.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full h-12 rounded-xl font-bold text-sm text-white hover:opacity-90"
                  style={{ backgroundColor: "#0c1c98" }}
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-foreground">Choisir un mot de passe</h1>
                  <p className="text-sm text-muted-foreground">
                    Saisissez votre nouveau mot de passe pour Tendrix.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="pwd">Nouveau mot de passe</Label>
                    <Input
                      id="pwd"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8 caractères minimum"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pwd2">Confirmer le mot de passe</Label>
                    <Input
                      id="pwd2"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 hover:opacity-90"
                    style={{ backgroundColor: "#0c1c98" }}
                  >
                    {submitting ? "…" : "Enregistrer le mot de passe"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
