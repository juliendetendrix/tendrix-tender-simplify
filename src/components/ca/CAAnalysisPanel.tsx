import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Sparkles, Upload, FileText, Loader2, CheckCircle2, AlertTriangle, XCircle, Trash2, ExternalLink, Copy,
} from "lucide-react";

interface DocRow {
  id: string;
  file_name: string;
  doc_type: string | null;
  storage_path: string;
}

interface AnalysisRow {
  id: string;
  status: string;
  verdict: string | null;
  buyer_profile_url: string | null;
  platform: string | null;
  consultation_ref: string | null;
  tender_documents: DocRow[] | null;
}

const VERDICT_UI: Record<string, { label: string; bg: string; color: string; Icon: typeof CheckCircle2 }> = {
  go:              { label: "GO",               bg: "#dcfce7", color: "#16a34a", Icon: CheckCircle2 },
  go_with_reserve: { label: "GO AVEC RÉSERVE",  bg: "#fef3c7", color: "#b45309", Icon: AlertTriangle },
  no_go:           { label: "NO GO",            bg: "#fee2e2", color: "#dc2626", Icon: XCircle },
};

const STATUS_TEXT: Record<string, string> = {
  pending: "En attente",
  scraping: "Récupération du DCE…",
  analyzing: "Analyse IA en cours…",
  completed: "Analyse terminée",
  manual_intervention_required: "DCE à déposer",
  failed: "Échec — à relancer",
};

function guessDocType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("cctp")) return "CCTP";
  if (n.includes("ccap")) return "CCAP";
  if (n.includes("dpgf") || n.includes("bpu")) return "DPGF";
  if (n.includes("dume")) return "DUME";
  if (/acte.?d.?engagement|\bae\b/.test(n)) return "AE";
  if (/reglement|règlement|\brc\b/.test(n)) return "RC";
  return "autre";
}

interface Props {
  requestId: string;
}

/** Panneau côté chargé d'affaires : déposer le DCE et lancer l'analyse IA. */
export function CAAnalysisPanel({ requestId }: Props) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("tender_analyses")
      .select("id, status, verdict, buyer_profile_url, platform, consultation_ref, tender_documents ( id, file_name, doc_type, storage_path )")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setAnalysis(data as AnalysisRow | null);
    setLoading(false);
  }, [requestId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!analysis?.id) return;
    const channel = supabase
      .channel(`ca-analysis-${analysis.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "tender_analyses", filter: `id=eq.${analysis.id}` },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [analysis?.id, load]);

  if (loading) return null;
  if (!analysis) return null; // ce dossier n'a pas d'analyse associée

  const docs = analysis.tender_documents ?? [];
  const v = analysis.verdict ? VERDICT_UI[analysis.verdict] : null;
  const busy = analysis.status === "scraping" || analysis.status === "analyzing";

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !analysis) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      const path = `${analysis.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("tender-documents")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        toast({ title: "Upload échoué", description: `${file.name} : ${upErr.message}`, variant: "destructive" });
        continue;
      }
      const { error: dbErr } = await supabase.from("tender_documents").insert({
        analysis_id: analysis.id,
        file_name: file.name,
        doc_type: guessDocType(file.name),
        storage_path: path,
        mime_type: file.type || null,
        size_bytes: file.size,
        source: "manual",
        uploaded_by: user?.id ?? null,
      });
      if (dbErr) {
        toast({ title: "Enregistrement échoué", description: `${file.name} : ${dbErr.message}`, variant: "destructive" });
        continue;
      }
      ok++;
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (ok > 0) {
      toast({ title: `${ok} document(s) ajouté(s)` });
      load();
    }
  };

  const removeDoc = async (doc: DocRow) => {
    await supabase.storage.from("tender-documents").remove([doc.storage_path]);
    await supabase.from("tender_documents").delete().eq("id", doc.id);
    load();
  };

  const launchAnalysis = async () => {
    if (docs.length === 0) {
      toast({ title: "Aucun document", description: "Déposez au moins un PDF du DCE avant de lancer l'IA.", variant: "destructive" });
      return;
    }
    setLaunching(true);
    const { error } = await supabase.functions.invoke("analyze-tender", { body: { analysis_id: analysis.id } });
    setLaunching(false);
    if (error) {
      toast({
        title: "Analyse impossible",
        description: "La fonction analyze-tender n'est peut-être pas déployée. Vérifiez le déploiement.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Analyse IA lancée 🚀", description: "Le verdict sera disponible dans quelques instants." });
    load();
  };

  return (
    <div className="border-b bg-secondary/5 px-3 py-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: "#0c1c98" }} />
          <span className="text-sm font-bold text-primary">Analyse IA</span>
        </div>
        {v && analysis.status === "completed" ? (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                style={{ backgroundColor: v.bg, color: v.color }}>
            <v.Icon className="w-3.5 h-3.5" />
            {v.label}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {STATUS_TEXT[analysis.status] ?? analysis.status}
          </span>
        )}
      </div>

      {/* Profil acheteur résolu depuis le BOAMP (où récupérer le DCE) */}
      {analysis.buyer_profile_url ? (
        <div className="rounded-md border bg-card px-2.5 py-2 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Profil acheteur {analysis.platform ? `· ${analysis.platform}` : ""}
            </span>
            <a
              href={analysis.buyer_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ouvrir
            </a>
          </div>
          {analysis.consultation_ref && (
            <button
              onClick={() => {
                navigator.clipboard?.writeText(analysis.consultation_ref ?? "");
                toast({ title: "Référence copiée" });
              }}
              className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary"
            >
              <Copy className="w-3 h-3" />
              Réf. : <span className="font-mono">{analysis.consultation_ref}</span>
            </button>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground italic">
          Aucun lien plateforme dans l'avis BOAMP — DCE à récupérer manuellement.
        </p>
      )}

      {/* Documents déposés */}
      {docs.length > 0 && (
        <div className="space-y-1.5">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-2 text-xs bg-card border rounded-md px-2.5 py-1.5">
              <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="flex-1 truncate">{d.file_name}</span>
              {d.doc_type && <span className="text-[10px] uppercase text-muted-foreground">{d.doc_type}</span>}
              <button onClick={() => removeDoc(d)} className="text-muted-foreground hover:text-destructive" aria-label="Supprimer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />}
          Déposer le DCE
        </Button>
        <Button
          size="sm"
          className="flex-1 text-white border-0"
          style={{ backgroundColor: "#0c1c98" }}
          onClick={launchAnalysis}
          disabled={launching || busy || docs.length === 0}
        >
          {launching ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
          {analysis.status === "completed" ? "Relancer l'IA" : "Lancer l'IA"}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        L'IA lit les PDF (RC, CCTP, CCAP…). Les fichiers Excel (DPGF) ne sont pas encore lus automatiquement.
      </p>
    </div>
  );
}
