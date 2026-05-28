import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Briefcase, Camera, Upload } from "lucide-react";

const schema = z.object({
  first_name: z.string().trim().min(1, "Prénom requis"),
  last_name: z.string().trim().min(1, "Nom requis"),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().optional(),
  password: z.string().min(8, "8 caractères minimum"),
});

export default function InscriptionCA() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const update = (patch: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const parse = schema.safeParse(form);
  const fieldError = (field: keyof typeof form) => {
    if (!attempted) return null;
    const err = parse.error?.flatten().fieldErrors[field];
    return err?.[0] ?? null;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Photo trop lourde", description: "5 Mo maximum.", variant: "destructive" });
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!parse.success) return;

    setSubmitting(true);
    try {
      // 0. Repartir d'une session propre (éviter qu'une session entreprise
      //    déjà ouverte ne nous redirige vers l'app client).
      await supabase.auth.signOut();

      // 1. Créer le compte Supabase Auth
      let userId: string | undefined;
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: parse.data.email,
        password: parse.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/charge-affaires`,
        },
      });

      if (signUpError) {
        // Compte déjà existant : on le récupère (connexion + attribution du rôle CA)
        if (/registered|exists|déjà/i.test(signUpError.message)) {
          const { data: si, error: siErr } = await supabase.auth.signInWithPassword({
            email: parse.data.email,
            password: parse.data.password,
          });
          if (siErr) {
            toast({
              title: "Compte déjà existant",
              description: "Ce compte existe déjà. Connecte-toi via « Se connecter » ou utilise un autre email.",
              variant: "destructive",
            });
            navigate("/login-ca");
            return;
          }
          userId = si.user?.id;
        } else {
          throw signUpError;
        }
      } else {
        userId = authData.user?.id;
        // Pas de session (confirmation email requise) → on tente la connexion directe
        if (!authData.session) {
          const { data: si, error: signInError } = await supabase.auth.signInWithPassword({
            email: parse.data.email,
            password: parse.data.password,
          });
          if (signInError) {
            toast({
              title: "Compte créé ✅",
              description: "Confirmez votre email, puis connectez-vous à l'espace chargé d'affaires.",
            });
            navigate("/login-ca");
            return;
          }
          userId = si.user?.id ?? userId;
        }
      }

      if (!userId) throw new Error("Identifiant utilisateur manquant");

      // 3. Upload de la photo si fournie
      let photo_url: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const path = `${userId}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(path, photoFile, { upsert: true, contentType: photoFile.type });

        if (uploadError) {
          console.warn("Upload photo échoué :", uploadError.message);
          // Non bloquant — on continue sans photo
        } else {
          const { data: urlData } = supabase.storage
            .from("profile-photos")
            .getPublicUrl(path);
          photo_url = urlData.publicUrl;
        }
      }

      // 4. Créer le rôle + profil CA via une fonction sécurisée (contourne la RLS)
      const { error: regError } = await supabase.rpc("register_charge_affaires", {
        _display_name: `${parse.data.first_name} ${parse.data.last_name}`.trim(),
        _email: parse.data.email,
        _phone: parse.data.phone || null,
        _photo_url: photo_url,
      });
      if (regError) throw regError;

      toast({
        title: "Bienvenue dans votre espace 🎉",
        description: "Votre compte chargé d'affaires est prêt.",
      });

      // Rechargement complet → les rôles sont rechargés et on arrive sur l'espace CA
      window.location.href = "/charge-affaires";

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
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
          onClick={() => navigate("/login-ca")}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors py-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>
      </div>

      {/* Contenu centré */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-8">

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
              <h1 className="text-xl font-bold text-foreground">Créer un compte</h1>
              <p className="text-sm text-muted-foreground">
                Rejoignez le réseau Tendrix
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Photo de profil */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-primary transition-colors overflow-hidden group bg-muted/40"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-medium">Photo</span>
                    </div>
                  )}
                  {photoPreview && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
                <span className="text-xs text-muted-foreground">
                  {photoPreview ? "Changer la photo" : "Ajouter une photo (optionnel)"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={form.first_name}
                    onChange={(e) => update({ first_name: e.target.value })}
                    placeholder="Jean"
                    className={`h-11 rounded-xl ${attempted && fieldError("first_name") ? "border-red-400" : ""}`}
                  />
                  {fieldError("first_name") && (
                    <p className="text-xs text-red-500">{fieldError("first_name")}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={form.last_name}
                    onChange={(e) => update({ last_name: e.target.value })}
                    placeholder="Martin"
                    className={`h-11 rounded-xl ${attempted && fieldError("last_name") ? "border-red-400" : ""}`}
                  />
                  {fieldError("last_name") && (
                    <p className="text-xs text-red-500">{fieldError("last_name")}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  placeholder="jean.martin@email.fr"
                  className={`h-11 rounded-xl ${attempted && fieldError("email") ? "border-red-400" : ""}`}
                />
                {fieldError("email") && (
                  <p className="text-xs text-red-500">{fieldError("email")}</p>
                )}
              </div>

              {/* Téléphone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 h-11 rounded-xl border border-input bg-background text-sm text-foreground flex-shrink-0">
                    🇫🇷 +33
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    placeholder="6 12 34 56 78"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={(e) => update({ password: e.target.value })}
                  placeholder="8 caractères minimum"
                  className={`h-11 rounded-xl ${attempted && fieldError("password") ? "border-red-400" : ""}`}
                />
                {fieldError("password") && (
                  <p className="text-xs text-red-500">{fieldError("password")}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl font-bold text-sm transition-all disabled:opacity-60 hover:opacity-90"
                style={{ backgroundColor: "#0c1c98", color: "white" }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création en cours…
                  </span>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Lien connexion */}
        <p className="mt-6 text-sm text-white/60">
          Déjà un compte ?{" "}
          <button
            onClick={() => navigate("/login-ca")}
            className="text-white font-semibold hover:underline"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
