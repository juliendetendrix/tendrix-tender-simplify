import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Coins, Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().trim().min(3).max(255),
});

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}

export function AddTenderDialog({ open, onOpenChange, onCreated }: Props) {
  const { user } = useAuth();
  const { company, refetch: refetchCompany } = useCurrentCompany();
  const [tab, setTab] = useState<"url" | "pdf">("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const credits = company?.credits ?? 0;
  const noCredits = credits <= 0;

  const reset = () => {
    setUrl("");
    setFile(null);
    setTitle("");
  };

  const handleSubmit = async () => {
    if (!schema.safeParse({ title }).success) {
      toast({ title: "Objet du marché requis", description: "Indiquez l'objet du marché (au moins 3 caractères).", variant: "destructive" });
      return;
    }
    if (!user) return;
    if (!company) {
      toast({
        title: "Profil incomplet",
        description: "Terminez la création de votre entreprise pour lancer une analyse.",
        variant: "destructive",
      });
      return;
    }
    if (noCredits) {
      toast({
        title: "Plus de crédits",
        description: "Vous n'avez plus de crédits disponibles pour lancer une analyse.",
        variant: "destructive",
      });
      return;
    }
    if (tab === "pdf" && !file) {
      toast({ title: "PDF manquant", description: "Sélectionnez le PDF de l'avis ou du DCE.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const sourceUrl = tab === "url" ? (url.trim() || null) : null;
    const tenderId = `manual-${crypto.randomUUID()}`;

    // 1. Déduit 1 crédit + crée l'AO, l'analyse ET le dossier (atomique côté DB).
    const { data: analysisId, error } = await supabase.rpc("spend_credit_and_start_analysis", {
      _company_id: company.id,
      _tender_id: tenderId,
      _title: title.trim(),
      _date_publication: new Date().toISOString(),
      _source_url: sourceUrl,
      _buyer_profile_url: sourceUrl,
      _raw: { source: tab === "pdf" ? "manual_pdf" : "manual_url" },
    });

    if (error) {
      setSubmitting(false);
      const msg = error.message?.includes("insufficient_credits")
        ? "Vous n'avez plus de crédits disponibles."
        : error.message?.includes("forbidden")
        ? "Action non autorisée pour ce compte."
        : "Impossible de lancer l'analyse pour le moment. Réessayez.";
      toast({ title: "Analyse non lancée", description: msg, variant: "destructive" });
      return;
    }

    // 2. Selon la source, on enclenche la suite.
    try {
      if (tab === "pdf" && file && analysisId) {
        // PDF fourni : on l'attache à l'analyse et on lance l'IA directement.
        const path = `${analysisId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("tender-documents")
          .upload(path, file, { contentType: file.type || "application/pdf" });
        if (!upErr) {
          await supabase.from("tender_documents").insert({
            analysis_id: analysisId,
            file_name: file.name,
            doc_type: "autre",
            storage_path: path,
            mime_type: file.type || "application/pdf",
            size_bytes: file.size,
            source: "manual",
            uploaded_by: user.id,
          });
          supabase.functions.invoke("analyze-tender", { body: { analysis_id: analysisId } }).catch(() => {});
        }
      } else if (analysisId) {
        // URL fournie : on tente la résolution du profil acheteur + scraping auto
        // du DCE (Trigger.dev) et on prévient le chargé d'affaires (best-effort).
        supabase.functions.invoke("resolve-dce", { body: { analysis_id: analysisId } }).catch(() => {});
        supabase.functions.invoke("start-scrape", { body: { analysis_id: analysisId } }).catch(() => {});
        supabase.functions.invoke("notify-ca", { body: { analysis_id: analysisId } }).catch(() => {});
      }
    } catch {
      // best-effort : l'analyse est déjà créée, la suite ne doit pas bloquer l'UX.
    }

    setSubmitting(false);
    toast({ title: "Analyse lancée 🚀", description: "Suivez son avancement dans « Mes dossiers »." });
    reset();
    refetchCompany();
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-lg">
        <DialogHeader>
          <DialogTitle>Vous avez trouvé un appel d'offres hors de l'application ?</DialogTitle>
          <DialogDescription>
            Intégrez les informations de celui-ci pour que nous entamions la réponse pour vous.
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
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || noCredits}
            className="w-full text-white border-0"
            style={{ backgroundColor: "#0c1c98" }}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1.5" />
            )}
            {submitting ? "Lancement…" : "Lancer l'analyse"}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Coins className="w-3.5 h-3.5" style={{ color: "#f9bd43" }} />
            {noCredits
              ? "Vous n'avez plus de crédits disponibles."
              : `Cette analyse utilise 500 crédits · il vous en reste ${credits}.`}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
