import { useState } from "react";
import { z } from "zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().trim().min(3).max(255),
  organisme: z.string().trim().max(255).optional().or(z.literal("")),
  location: z.string().trim().max(255).optional().or(z.literal("")),
  budget: z.string().trim().max(50).optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  summary: z.string().trim().max(2000).optional().or(z.literal("")),
});

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}

export function AddTenderDialog({ open, onOpenChange, onCreated }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"url" | "pdf">("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    organisme: "",
    location: "",
    budget: "",
    deadline: "",
    summary: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setUrl("");
    setFile(null);
    setForm({ title: "", organisme: "", location: "", budget: "", deadline: "", summary: "" });
  };

  const handleSubmit = async () => {
    const parse = schema.safeParse(form);
    if (!parse.success) {
      toast({ title: "Champs invalides", description: "Le titre est requis.", variant: "destructive" });
      return;
    }
    if (!user) return;
    setSubmitting(true);

    let pdfPath: string | null = null;
    let sourceUrl: string | null = null;

    if (tab === "pdf" && file) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("tender-uploads").upload(path, file);
      if (upErr) {
        setSubmitting(false);
        toast({ title: "Upload impossible", description: upErr.message, variant: "destructive" });
        return;
      }
      pdfPath = path;
    } else if (tab === "url") {
      sourceUrl = url.trim() || null;
    }

    const id = `manual-${crypto.randomUUID()}`;
    const { error } = await supabase.from("tenders").insert({
      id,
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      organisme: form.organisme.trim() || null,
      location: form.location.trim() || null,
      budget: form.budget.trim() || null,
      deadline: form.deadline || null,
      date_publication: new Date().toISOString(),
      source: tab === "pdf" ? "manual_pdf" : "manual_url",
      source_url: sourceUrl,
      pdf_path: pdfPath,
      created_by: user.id,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Appel d'offres ajouté" });
    reset();
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un appel d'offres</DialogTitle>
          <DialogDescription>
            Coller une URL ou téléverser un PDF, puis compléter les informations clés.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "url" | "pdf")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="pdf">PDF</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-2 pt-3">
            <Label htmlFor="url">URL de la consultation</Label>
            <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </TabsContent>

          <TabsContent value="pdf" className="space-y-2 pt-3">
            <Label htmlFor="pdf">Fichier PDF</Label>
            <Input
              id="pdf"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </TabsContent>
        </Tabs>

        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Objet du marché *</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget</Label>
              <Input id="budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="120 k€" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Lieu</Label>
            <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organisme">Organisme</Label>
            <Input id="organisme" value={form.organisme} onChange={(e) => setForm({ ...form, organisme: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="summary">Documents requis / résumé</Label>
            <Textarea id="summary" rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
