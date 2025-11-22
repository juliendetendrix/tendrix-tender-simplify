import { useState } from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  Bell,
  Upload,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MonCompte() {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [notifyNewAO, setNotifyNewAO] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(true);

  const documents = [
    { id: "1", name: "K-bis", hasFile: true },
    { id: "2", name: "Attestation fiscale", hasFile: true },
    { id: "3", name: "Attestation sociale (URSSAF)", hasFile: false },
    { id: "4", name: "Assurance RC Pro", hasFile: true },
    { id: "5", name: "Attestation de vigilance", hasFile: false },
    { id: "6", name: "Références clients", hasFile: true },
  ];

  return (
    <>
      <div className="p-4 space-y-6 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "#0c1c98" }}>
            Mon compte
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez votre profil et vos documents
          </p>
        </div>

        {/* Mon Profil */}
        <section className="bg-white border border-border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-sm mb-3">Mon profil</h2>
          
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Entreprise</div>
                <div className="text-sm font-medium">Entreprise Dupont SARL</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Nom</div>
                <div className="text-sm font-medium">Pierre Dupont</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="text-sm font-medium">p.dupont@exemple.fr</div>
              </div>
            </div>
          </div>
        </section>

        {/* Chargé d'affaires */}
        <section className="bg-white border border-border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-sm mb-3">Mon chargé d'affaires référent</h2>
          
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#0c1c98" }}
            >
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Marie Lambert</div>
              <div className="text-xs text-muted-foreground">Chargée d'affaires</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span>06 12 34 56 78</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full h-10 text-sm"
            style={{ backgroundColor: "#0c1c98" }}
            onClick={() => setContactDialogOpen(true)}
          >
            Contacter mon chargé d'affaires
          </Button>
        </section>

        {/* Mes Documents */}
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
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors"
                    style={{ backgroundColor: "#f9bd43" }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Paramètres & Notifications */}
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
                  <div className="text-sm font-medium">Évolutions des demandes</div>
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

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-[340px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Contacter Marie Lambert</DialogTitle>
            <DialogDescription>
              Choisissez votre moyen de contact préféré
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              className="w-full justify-start gap-3"
              variant="outline"
              onClick={() => window.location.href = "tel:0612345678"}
            >
              <Phone className="w-4 h-4" />
              Appeler : 06 12 34 56 78
            </Button>
            <Button
              className="w-full justify-start gap-3"
              variant="outline"
              onClick={() => window.location.href = "mailto:m.lambert@tendrix.fr"}
            >
              <Mail className="w-4 h-4" />
              Email : m.lambert@tendrix.fr
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
