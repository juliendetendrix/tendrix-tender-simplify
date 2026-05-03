import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  Bell,
  Upload,
  Eye,
  Pencil,
  MapPin,
  GraduationCap,
  Play,
} from "lucide-react";
import formationThumbnail from "@/assets/formation-thumbnail.jpg";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { supabase } from "@/integrations/supabase/client";

interface CAProfile {
  display_name: string;
  email: string | null;
  phone: string | null;
}

export function MonCompte() {
  const { user } = useAuth();
  const { company, loading } = useCurrentCompany();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [notifyNewAO, setNotifyNewAO] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(true);
  const [ca, setCA] = useState<CAProfile | null>(null);

  useEffect(() => {
    const loadCA = async () => {
      if (!company?.assigned_charge_affaires) return;
      const { data } = await supabase
        .from("charge_affaires_profiles")
        .select("display_name, email, phone")
        .eq("user_id", company.assigned_charge_affaires)
        .maybeSingle();
      setCA(data as any);
    };
    loadCA();
  }, [company?.assigned_charge_affaires]);

  const demoProfile = {
    companyName: "Maçonnerie Dubois & Fils",
    contactName: "Jean Dubois",
    role: "Gérant",
    email: "jean.dubois@maconnerie-dubois.fr",
    phone: "06 24 58 91 37",
    address: "12 rue des Artisans, 78000 Versailles",
    sector: "BTP – Maçonnerie générale",
    siren: "812 345 678",
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
                <div className="text-sm font-medium">{demoProfile.companyName}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Référent contact</div>
                <div className="text-sm font-medium">
                  {demoProfile.contactName} — {demoProfile.role}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Téléphone</div>
                <div className="text-sm font-medium">{demoProfile.phone}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="text-sm font-medium break-all">{demoProfile.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Adresse</div>
                <div className="text-sm font-medium">{demoProfile.address}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Secteur</div>
                <div className="text-sm font-medium">{demoProfile.sector}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">SIREN</div>
                <div className="text-sm font-medium">{demoProfile.siren}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg p-4 space-y-3 bg-primary text-primary-foreground shadow-sm">
          <h2 className="font-semibold text-sm mb-1 text-primary-foreground/90">Mon chargé d'affaires</h2>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white/20 backdrop-blur-sm font-semibold">
              ML
            </div>
            <div className="flex-1">
              <div className="font-semibold text-base">Marc Lefèvre</div>
              <div className="text-xs text-primary-foreground/80">Chargé d'affaires référent</div>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm">
                <Phone className="w-3.5 h-3.5" />
                <span>06 78 45 12 90</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full h-10 text-sm bg-white text-primary hover:bg-white/90"
            onClick={() => setContactDialogOpen(true)}
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

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-[340px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Contacter Marc Lefèvre</DialogTitle>
            <DialogDescription>
              Choisissez votre moyen de contact préféré
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              className="w-full justify-start gap-3"
              variant="outline"
              onClick={() => (window.location.href = "tel:0678451290")}
            >
              <Phone className="w-4 h-4" />
              Appeler : 06 78 45 12 90
            </Button>
            <Button
              className="w-full justify-start gap-3"
              variant="outline"
              onClick={() => (window.location.href = "mailto:marc.lefevre@tendrix.fr")}
            >
              <Mail className="w-4 h-4" />
              Email : marc.lefevre@tendrix.fr
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
