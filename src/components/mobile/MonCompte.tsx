import { useState } from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  Bell,
  Upload,
  Pencil,
  MapPin,
  GraduationCap,
  Play,
  Loader2,
} from "lucide-react";
import formationThumbnail from "@/assets/formation-thumbnail.jpg";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useCAProfile } from "@/hooks/useCAProfile";

interface Props {
  onOpenCAChat?: () => void;
}

export function MonCompte({ onOpenCAChat }: Props) {
  const { user } = useAuth();
  const { company, loading, refetch } = useCurrentCompany();
  const { ca, initials: caInitials } = useCAProfile();
  const [notifyNewAO, setNotifyNewAO] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(true);

  // Édition du profil entreprise
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact_name: "",
    contact_phone: "",
    zone: "",
    sector: "",
    siren: "",
  });

  const openEdit = () => {
    setForm({
      name: company?.name ?? "",
      contact_name: company?.contact_name ?? "",
      contact_phone: company?.contact_phone ?? "",
      zone: company?.zone ?? "",
      sector: company?.sector ?? "",
      siren: company?.siren ?? "",
    });
    setEditOpen(true);
  };

  const saveProfile = async () => {
    if (!company?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("companies")
      .update({
        name: form.name.trim() || null,
        contact_name: form.contact_name.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        zone: form.zone.trim() || null,
        sector: form.sector.trim() || null,
        siren: form.siren.trim() || null,
      })
      .eq("id", company.id);
    setSaving(false);
    if (error) {
      toast({ title: "Échec de l'enregistrement", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Profil mis à jour ✅" });
    setEditOpen(false);
    refetch();
  };

  const NOT_SET = "Non renseigné";
  const profile = {
    companyName: company?.name || NOT_SET,
    contactName: company?.contact_name || NOT_SET,
    email: user?.email || NOT_SET,
    phone: company?.contact_phone || NOT_SET,
    address: company?.zone || NOT_SET,
    sector: company?.sector || NOT_SET,
    siren: company?.siren || NOT_SET,
  };

  const documents = [
    { id: "1", name: "K-bis", hasFile: true },
    { id: "2", name: "Attestation fiscale", hasFile: true },
    { id: "3", name: "Attestation sociale (URSSAF)", hasFile: true },
    { id: "4", name: "Assurance RC Pro", hasFile: true },
    { id: "5", name: "Attestation de vigilance", hasFile: false },
    { id: "6", name: "Références clients", hasFile: false },
  ];

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-6 pb-8">
        <div>
          <h1 className="text-xl font-bold mb-1 text-primary">Mon compte</h1>
          <p className="text-sm text-muted-foreground">
            Gérez votre profil et vos documents
          </p>
        </div>

        <section className="bg-white border border-border rounded-lg p-4 space-y-3 relative">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Mon profil</h2>
            <button
              onClick={openEdit}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:bg-muted px-2 py-1 rounded-md transition-colors"
              aria-label="Modifier le profil"
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Entreprise</div>
                <div className="text-sm font-medium">{profile.companyName}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Référent contact</div>
                <div className="text-sm font-medium">
                  {profile.contactName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Téléphone</div>
                <div className="text-sm font-medium">{profile.phone}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="text-sm font-medium break-all">{profile.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Adresse</div>
                <div className="text-sm font-medium">{profile.address}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Secteur</div>
                <div className="text-sm font-medium">{profile.sector}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">SIREN</div>
                <div className="text-sm font-medium">{profile.siren}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg p-4 space-y-3 bg-primary text-primary-foreground shadow-sm">
          <h2 className="font-semibold text-sm mb-1 text-primary-foreground/90">Mon chargé d'affaires</h2>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white/30">
              <img
                src={ca.photo_url}
                alt={ca.display_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div className="w-full h-full bg-white/20 items-center justify-center font-semibold" style={{ display: "none" }}>
                {caInitials}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-base">{ca.display_name}</div>
              <div className="text-xs text-primary-foreground/80">Chargé d'affaires référent</div>
              {ca.phone && (
                <div className="flex items-center gap-1.5 mt-1.5 text-sm">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{ca.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Button
            className="w-full h-10 text-sm bg-white text-primary hover:bg-white/90"
            onClick={onOpenCAChat}
          >
            <Mail className="w-4 h-4 mr-2" />
            Envoyer un message
          </Button>
        </section>

        <section className="bg-white border border-border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-sm mb-3">Mes documents</h2>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2.5 flex-1">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{doc.name}</span>
                </div>
                {doc.hasFile ? (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                ) : (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-secondary transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg p-4 space-y-3 bg-secondary text-secondary-foreground shadow-sm">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            <h2 className="font-semibold text-sm">Formation Tendrix</h2>
          </div>
          <h3 className="font-bold text-base leading-tight">
            Comment augmenter vos chances de remporter des appels d'offres ?
          </h3>

          <button className="relative block w-full rounded-lg overflow-hidden group">
            <img
              src={formationThumbnail}
              alt="Comment gagner des appels d'offres"
              width={768}
              height={512}
              loading="lazy"
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/40 transition-colors flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-xs font-medium text-left">
              Comment gagner des appels d'offres ?
            </div>
          </button>

          <Button className="w-full h-10 text-sm bg-white text-primary hover:bg-white/90">
            Voir les conseils et formations
          </Button>
        </section>

        <section className="bg-white border border-border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-sm mb-3">Paramètres & notifications</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5 flex-1">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Nouveaux AO</div>
                  <div className="text-xs text-muted-foreground">
                    Recevoir les derniers appels d'offres
                  </div>
                </div>
              </div>
              <Switch checked={notifyNewAO} onCheckedChange={setNotifyNewAO} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5 flex-1">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Évolutions des dossiers</div>
                  <div className="text-xs text-muted-foreground">
                    Être notifié des changements de statut
                  </div>
                </div>
              </div>
              <Switch checked={notifyUpdates} onCheckedChange={setNotifyUpdates} />
            </div>
          </div>
        </section>
      </div>

      {/* Édition du profil entreprise */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Modifier mon profil</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Entreprise</Label>
              <Input
                id="c-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-contact">Référent contact</Label>
              <Input
                id="c-contact"
                value={form.contact_name}
                onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">Téléphone</Label>
              <Input
                id="c-phone"
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-zone">Adresse / zone</Label>
              <Input
                id="c-zone"
                value={form.zone}
                onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-sector">Secteur</Label>
              <Input
                id="c-sector"
                value={form.sector}
                onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-siren">SIREN</Label>
              <Input
                id="c-siren"
                value={form.siren}
                onChange={(e) => setForm((f) => ({ ...f, siren: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button className="flex-1" onClick={saveProfile} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
