import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, defaultRouteForRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";

const emailSchema = z.string().trim().email("Email invalide").max(255);

export default function Login() {
  const navigate = useNavigate();
  const { session, roles, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && roles.length > 0) {
      navigate(defaultRouteForRole(roles[0]), { replace: true });
    }
  }, [session, roles, loading, navigate]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const parse = emailSchema.safeParse(email);
    if (!parse.success) {
      toast({ title: "Email invalide", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: parse.data,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Lien envoyé",
        description: "Consultez votre boîte mail pour vous connecter.",
      });
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const parse = emailSchema.safeParse(email);
    if (!parse.success) {
      toast({ title: "Email invalide", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parse.data,
      password,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Connexion impossible", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <img src={tendrixLogo} alt="Tendrix" className="h-10 mx-auto" />
          <h1 className="text-xl font-bold text-primary">Connexion</h1>
          <p className="text-sm text-muted-foreground">
            Accédez à votre espace Tendrix
          </p>
        </div>

        <form
          onSubmit={mode === "magic" ? handleMagicLink : handlePassword}
          className="space-y-4 bg-white border border-border rounded-lg p-5"
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
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? "..."
              : mode === "magic"
              ? "Recevoir un lien magique"
              : "Se connecter"}
          </Button>

          <button
            type="button"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "magic" ? "password" : "magic")}
          >
            {mode === "magic"
              ? "Utiliser un mot de passe à la place"
              : "Recevoir un lien magique à la place"}
          </button>
        </form>
      </div>
    </div>
  );
}
