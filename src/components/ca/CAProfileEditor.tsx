import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Profile {
  display_name: string;
  email: string;
  phone: string;
  specialties: string[];
  photo_url: string | null;
}

interface Props {
  userId: string;
  onSaved: () => void;
}

export function CAProfileEditor({ userId, onSaved }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile>({
    display_name: "", email: "", phone: "", specialties: [], photo_url: null,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specialtiesInput, setSpecialtiesInput] = useState("");

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("charge_affaires_profiles")
      .select("display_name, email, phone, specialties, photo_url")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            display_name: data.display_name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            specialties: data.specialties ?? [],
            photo_url: (data as any).photo_url ?? null,
          });
          setSpecialtiesInput((data.specialties ?? []).join(", "));
        }
        setLoading(false);
      });
  }, [userId]);

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

  const handleSave = async () => {
    if (!profile.display_name.trim()) {
      toast({ title: "Le nom est requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let photo_url = profile.photo_url;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const path = `${userId}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("profile-photos")
          .upload(path, photoFile, { upsert: true, contentType: photoFile.type });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);
          photo_url = urlData.publicUrl;
        }
      }

      const specs = specialtiesInput.split(",").map(s => s.trim()).filter(Boolean);

      const { error } = await supabase
        .from("charge_affaires_profiles")
        .upsert({
          user_id: userId,
          display_name: profile.display_name.trim(),
          email: profile.email.trim() || null,
          phone: profile.phone.trim() || null,
          specialties: specs,
          photo_url,
        }, { onConflict: "user_id" });

      if (error) throw error;

      setProfile(prev => ({ ...prev, photo_url, specialties: specs }));
      setPhotoFile(null);
      toast({ title: "Profil mis à jour ✓" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-xl">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-muted/50 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const currentPhoto = photoPreview ?? profile.photo_url;
  const initials = profile.display_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-6 lg:p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Mon profil</h1>
        <p className="text-muted-foreground mt-1">Vos informations visibles par les clients</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">

        {/* Photo */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full border-2 border-dashed border-border hover:border-primary transition-colors overflow-hidden group"
          >
            {currentPhoto ? (
              <img src={currentPhoto} alt="Photo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex flex-col items-center justify-center text-primary">
                <Camera className="w-7 h-7 mb-1" />
                <span className="text-[10px] font-medium">Photo</span>
              </div>
            )}
            {!currentPhoto && (
              <div className="absolute inset-0 bg-white/30 flex items-center justify-center" />
            )}
            {currentPhoto && (
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
            )}
            {/* Fallback initials if no photo */}
            {!currentPhoto && !photoPreview && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-full">
                <span className="text-primary text-xl font-bold">{initials}</span>
              </div>
            )}
          </button>
          <p className="text-xs text-muted-foreground">
            {currentPhoto ? "Cliquer pour changer" : "Ajouter une photo"} (5 Mo max)
          </p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        {/* Nom */}
        <div className="space-y-1.5">
          <Label>Nom complet *</Label>
          <Input
            value={profile.display_name}
            onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
            placeholder="Julien Malherbe"
            className="h-11 rounded-xl"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label>Email professionnel</Label>
          <Input
            type="email"
            value={profile.email}
            onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
            placeholder="julien.malherbe@tendrix.fr"
            className="h-11 rounded-xl"
          />
        </div>

        {/* Téléphone */}
        <div className="space-y-1.5">
          <Label>Téléphone</Label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 h-11 rounded-xl border border-input bg-background text-sm flex-shrink-0">
              🇫🇷 +33
            </div>
            <Input
              type="tel"
              value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              placeholder="7 71 81 97 29"
              className="h-11 rounded-xl"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Ce numéro sera affiché aux clients dans leur espace
          </p>
        </div>

        {/* Spécialités */}
        <div className="space-y-1.5">
          <Label>Spécialités</Label>
          <Input
            value={specialtiesInput}
            onChange={e => setSpecialtiesInput(e.target.value)}
            placeholder="Gros œuvre, Plomberie, Électricité…"
            className="h-11 rounded-xl"
          />
          <p className="text-xs text-muted-foreground">Séparez les spécialités par des virgules</p>
        </div>

        {/* Note info client */}
        <div className="bg-primary/5 rounded-xl px-4 py-3">
          <p className="text-xs text-primary/80 leading-relaxed">
            <strong>Visible par vos clients :</strong> votre photo, nom et numéro de téléphone apparaissent
            dans leur application sur le bouton de contact et dans la popup d'accueil.
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-xl font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#0c1c98", color: "white" }}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
