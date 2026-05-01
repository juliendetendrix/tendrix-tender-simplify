import { useEffect, useState } from "react";
import { LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";

interface Company {
  id: string;
  name: string;
  siren: string | null;
  sector: string | null;
  zone: string | null;
  assigned_charge_affaires: string | null;
  created_at: string;
}

interface CAProfile {
  user_id: string;
  display_name: string;
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [cas, setCAs] = useState<CAProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCompany, setOpenCompany] = useState(false);
  const [openCA, setOpenCA] = useState(false);

  const load = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([
      supabase.from("companies").select("*").order("created_at", { ascending: false }),
      supabase.from("charge_affaires_profiles").select("user_id, display_name"),
    ]);
    setCompanies((c.data ?? []) as any);
    setCAs((p.data ?? []) as any);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={tendrixLogo} alt="Tendrix" className="h-7" />
          <span className="text-sm font-semibold text-primary">Backoffice</span>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <section className="bg-white border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Entreprises</h2>
            <Button size="sm" onClick={() => setOpenCompany(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Créer un compte entreprise
            </Button>
          </div>

          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune entreprise pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                  <tr>
                    <th className="py-2">Nom</th>
                    <th>SIREN</th>
                    <th>Secteur</th>
                    <th>Zone</th>
                    <th>Chargé d'affaires</th>
                    <th>Créé</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 font-medium">{c.name}</td>
                      <td>{c.siren ?? "—"}</td>
                      <td>{c.sector ?? "—"}</td>
                      <td>{c.zone ?? "—"}</td>
                      <td>
                        {cas.find((x) => x.user_id === c.assigned_charge_affaires)?.display_name ?? "—"}
                      </td>
                      <td className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Chargés d'affaires</h2>
            <Button size="sm" onClick={() => setOpenCA(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Inviter un chargé d'affaires
            </Button>
          </div>
          {cas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun chargé d'affaires pour le moment.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {cas.map((c) => (
                <li key={c.user_id}>{c.display_name}</li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <CreateCompanyDialog
        open={openCompany}
        onOpenChange={setOpenCompany}
        onCreated={load}
        cas={cas}
      />
      <InviteCADialog open={openCA} onOpenChange={setOpenCA} onCreated={load} />
    </div>
  );
}

function CreateCompanyDialog({
  open,
  onOpenChange,
  onCreated,
  cas,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
  cas: CAProfile[];
}) {
  const [form, setForm] = useState({
    email: "",
    name: "",
    siren: "",
    sector: "",
    zone: "",
    charge: "",
    contact_name: "",
    contact_phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handle = async () => {
    if (!form.email || !form.name) {
      toast({ title: "Email et nom requis", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.functions.invoke("admin-create-company", {
      body: { ...form, charge_affaires_id: form.charge || null },
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Compte créé", description: "Un magic link a été envoyé." });
    onOpenChange(false);
    setForm({ email: "", name: "", siren: "", sector: "", zone: "", charge: "", contact_name: "", contact_phone: "" });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un compte entreprise</DialogTitle>
          <DialogDescription>
            L'entreprise recevra un lien magique par email pour se connecter.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Email *</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
          </div>
          <div>
            <Label>Nom de l'entreprise *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>SIREN</Label>
              <Input value={form.siren} onChange={(e) => setForm({ ...form, siren: e.target.value })} />
            </div>
            <div>
              <Label>Secteur</Label>
              <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Zone d'intervention</Label>
            <Input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="ex: Gironde, Dordogne" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact nom</Label>
              <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            </div>
            <div>
              <Label>Contact téléphone</Label>
              <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Chargé d'affaires assigné</Label>
            <Select value={form.charge} onValueChange={(v) => setForm({ ...form, charge: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {cas.map((c) => (
                  <SelectItem key={c.user_id} value={c.user_id}>
                    {c.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handle} disabled={submitting} className="w-full">
            {submitting ? "..." : "Créer et envoyer le lien"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InviteCADialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ email: "", display_name: "", phone: "", specialties: "" });
  const [submitting, setSubmitting] = useState(false);

  const handle = async () => {
    if (!form.email || !form.display_name) {
      toast({ title: "Email et nom requis", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.functions.invoke("admin-invite-charge-affaires", {
      body: {
        email: form.email,
        display_name: form.display_name,
        phone: form.phone || null,
        specialties: form.specialties.split(",").map((s) => s.trim()).filter(Boolean),
      },
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Invitation envoyée" });
    onOpenChange(false);
    setForm({ email: "", display_name: "", phone: "", specialties: "" });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inviter un chargé d'affaires</DialogTitle>
          <DialogDescription>
            Le chargé d'affaires recevra un lien magique pour activer son compte.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Nom complet *</Label>
            <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>Spécialités (séparées par virgule)</Label>
            <Textarea
              rows={2}
              value={form.specialties}
              onChange={(e) => setForm({ ...form, specialties: e.target.value })}
              placeholder="BTP, Services, Fournitures"
            />
          </div>
          <Button onClick={handle} disabled={submitting} className="w-full">
            {submitting ? "..." : "Envoyer l'invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
