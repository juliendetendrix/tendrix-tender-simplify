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
} from "lucide-react";
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

        <section className="bg-white border border-border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-sm mb-3">Mon profil</h2>

          <div className="space-y-2.5">
            {company?.name && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Entreprise</div>
                  <div className="text-sm font-medium">{company.name}</div>
                </div>
              </div>
            )}

            {company?.contact_name && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Nom</div>
                  <div className="text-sm font-medium">{company.contact_name}</div>
                </div>
              </div>
            )}

            {user?.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="text-sm font-medium">{user.email}</div>
                </div>
              </div>
            )}

            {company?.sector && (
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Secteur</div>
                  <div className="text-sm font-medium">{company.sector}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {ca && (
          <section className="bg-white border border-border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold text-sm mb-3">Mon chargé d'affaires référent</h2>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-primary">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{ca.display_name}</div>
                <div className="text-xs text-muted-foreground">Chargé d'affaires</div>
                {ca.phone && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{ca.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              className="w-full h-10 text-sm"
              onClick={() => setContactDialogOpen(true)}
            >
              Contacter mon chargé d'affaires
            </Button>
          </section>
        )}

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
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-muted transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                    Voir
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
            <DialogTitle>Contacter {ca?.display_name}</DialogTitle>
            <DialogDescription>
              Choisissez votre moyen de contact préféré
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {ca?.phone && (
              <Button
                className="w-full justify-start gap-3"
                variant="outline"
                onClick={() => (window.location.href = `tel:${ca.phone}`)}
              >
                <Phone className="w-4 h-4" />
                Appeler : {ca.phone}
              </Button>
            )}
            {ca?.email && (
              <Button
                className="w-full justify-start gap-3"
                variant="outline"
                onClick={() => (window.location.href = `mailto:${ca.email}`)}
              >
                <Mail className="w-4 h-4" />
                Email : {ca.email}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
