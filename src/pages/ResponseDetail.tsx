import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, FileText, ClipboardList, HelpCircle, Sparkles, CheckCircle2, XCircle, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";

interface MemoireSection { titre: string; contenu: string }
interface Piece { label: string; statut: string; note?: string }
interface Content {
  synthese?: string;
  memoire?: MemoireSection[];
  pieces_administratives?: Piece[];
  points_a_completer?: string[];
}
interface ResponseRow {
  id: string; status: string; status_detail: string | null; content: Content | null;
  tenders?: { title: string | null } | null;
}

const ResponseDetail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get("id");
  const [resp, setResp] = useState<ResponseRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResp = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    const { data } = await supabase
      .from("tender_responses")
      .select("id, status, status_detail, content, tender_id, tenders ( title )")
      .eq("id", id).maybeSingle();
    setResp(data as ResponseRow | null);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchResp(); }, [fetchResp]);
  useEffect(() => {
    if (!id) return;
    const ch = supabase.channel(`resp-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tender_responses", filter: `id=eq.${id}` }, () => fetchResp())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, fetchResp]);

  const copy = (txt: string) => { navigator.clipboard?.writeText(txt); toast({ title: "Copié" }); };

  const Header = (
    <header className="bg-card pt-4 pb-4 px-4 border-b sticky top-0 z-20">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="h-10 w-10 flex items-center justify-center"><ArrowLeft className="h-6 w-6" /></button>
        <img src={tendrixLogo} alt="Tendrix" className="h-7" />
        <div className="w-10" />
      </div>
    </header>
  );

  if (loading) return <div className="min-h-screen bg-background">{Header}<div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div></div>;
  if (!resp) return <div className="min-h-screen bg-background">{Header}<p className="text-center text-muted-foreground py-10">Réponse introuvable.</p></div>;

  const generating = resp.status === "generating";
  const failed = resp.status === "failed";
  const content = resp.content ?? {};

  return (
    <div className="min-h-screen bg-background">
      {Header}
      <main className="max-w-lg mx-auto px-4 py-6 pb-16 space-y-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#0c1c98" }} /> Dossier de réponse — 1ʳᵉ version
          </div>
          <h1 className="text-xl font-bold text-foreground leading-tight">{resp.tenders?.title ?? "Marché"}</h1>
        </div>

        {generating && (
          <div className="rounded-xl border p-5 flex items-start gap-3" style={{ backgroundColor: "#eef0ff", borderColor: "#c7ccff" }}>
            <Loader2 className="w-5 h-5 animate-spin mt-0.5" style={{ color: "#0c1c98" }} />
            <div>
              <p className="font-bold text-sm" style={{ color: "#0c1c98" }}>L'IA prépare votre réponse…</p>
              <p className="text-xs text-muted-foreground mt-1">Elle s'appuie sur votre profil, votre librairie et l'analyse du marché. Quelques instants.</p>
            </div>
          </div>
        )}

        {failed && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
            <p className="font-bold text-sm text-destructive">La génération a échoué</p>
            <p className="text-xs text-muted-foreground mt-1">{resp.status_detail ?? "Vos crédits ont été remboursés."} Vous pouvez relancer depuis la fiche analyse.</p>
          </div>
        )}

        {!generating && !failed && (
          <>
            {content.synthese && (
              <div className="rounded-xl p-4" style={{ backgroundColor: "#dcfce7" }}>
                <p className="text-sm text-foreground leading-relaxed">{content.synthese}</p>
              </div>
            )}

            {/* Mémoire technique */}
            {content.memoire && content.memoire.length > 0 && (
              <div className="space-y-3">
                <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: "#0c1c98" }}>
                  <FileText className="w-4 h-4" /> Mémoire technique (brouillon)
                </h2>
                {content.memoire.map((s, i) => (
                  <div key={i} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold text-foreground">{s.titre}</h3>
                      <button onClick={() => copy(s.contenu)} className="text-muted-foreground hover:text-primary"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{s.contenu}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Pièces administratives */}
            {content.pieces_administratives && content.pieces_administratives.length > 0 && (
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: "#0c1c98" }}>
                  <ClipboardList className="w-4 h-4" /> Pièces administratives
                </h2>
                <div className="divide-y border rounded-lg overflow-hidden">
                  {content.pieces_administratives.map((p, i) => {
                    const ok = /disponible/i.test(p.statut);
                    return (
                      <div key={i} className="flex items-center gap-2 px-3 py-2.5 bg-card text-sm">
                        {ok ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#16a34a" }} /> : <XCircle className="w-4 h-4 shrink-0" style={{ color: "#b45309" }} />}
                        <span className="flex-1 text-foreground">{p.label}</span>
                        <span className="text-[11px] font-medium" style={{ color: ok ? "#16a34a" : "#b45309" }}>{p.statut}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Points à compléter */}
            {content.points_a_completer && content.points_a_completer.length > 0 && (
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: "#0c1c98" }}>
                  <HelpCircle className="w-4 h-4" /> À compléter pour renforcer la réponse
                </h2>
                <ul className="space-y-1.5">
                  {content.points_a_completer.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#0c1c98" }} />
                      <span className="leading-snug">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground border-t pt-3">
              Brouillon généré par l'IA — à relire et affiner avec votre chargé d'affaires avant dépôt.
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default ResponseDetail;
