import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Loader2, FileText, ClipboardList, HelpCircle, Sparkles, CheckCircle2, XCircle, Copy,
  FileDown, MessageCircle, CircleDashed, CircleAlert,
} from "lucide-react";
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

interface ResponseDetailProps { responseId?: string; onBack?: () => void }

const ResponseDetail = ({ responseId, onBack }: ResponseDetailProps = {}) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = responseId ?? params.get("id");
  const embedded = !!onBack;
  const goBack = onBack ?? (() => navigate(-1));
  const wrapMax = embedded ? "max-w-3xl" : "max-w-lg";
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
  const exportDocx = () => toast({ title: "Export .docx", description: "Bientôt disponible — votre chargé d'affaires peut finaliser le dépôt avec vous." });

  const Header = embedded ? (
    <header className="bg-card px-6 py-3 border-b sticky top-0 z-20">
      <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Retour</button>
    </header>
  ) : (
    <header className="bg-card pt-4 pb-4 px-4 border-b sticky top-0 z-20">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <button onClick={goBack} className="h-10 w-10 flex items-center justify-center"><ArrowLeft className="h-6 w-6" /></button>
        <img src={tendrixLogo} alt="Tendrix" className="h-7" />
        <div className="w-10" />
      </div>
    </header>
  );

  if (loading) {
    if (embedded) return <div className="page" style={{ padding: 60, textAlign: "center" }}><Loader2 className="w-6 h-6 animate-spin" style={{ margin: "0 auto", color: "var(--navy)" }} /></div>;
    return <div className="min-h-screen bg-background">{Header}<div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div></div>;
  }
  if (!resp) {
    if (embedded) return <div className="page" style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}>Réponse introuvable.</div>;
    return <div className="min-h-screen bg-background">{Header}<p className="text-center text-muted-foreground py-10">Réponse introuvable.</p></div>;
  }

  const generating = resp.status === "generating";
  const failed = resp.status === "failed";
  const content = resp.content ?? {};
  const sections = content.memoire ?? [];
  const done = sections.filter((s) => s.contenu && s.contenu.trim()).length;
  const completion = sections.length ? Math.round((done / sections.length) * 100) : 0;

  // ════════════════ DESKTOP (2 colonnes, handoff écran 6) ════════════════
  if (embedded) {
    return (
      <div className="page page-anim" style={{ maxWidth: 1240 }}>
        <button onClick={goBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><ArrowLeft className="ico-sm" /> Retour</button>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 7 }}>
          <Sparkles className="ico-sm" /> DOSSIER DE RÉPONSE · 1ʳᵉ version
        </div>
        <h2 style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.2, maxWidth: 820 }}>{resp.tenders?.title ?? "Marché"}</h2>

        {generating ? (
          <div className="card card-pad" style={{ marginTop: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Loader2 className="ico-md animate-spin" style={{ color: "var(--navy)" }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: 14, color: "var(--navy)" }}>L'IA prépare votre réponse…</p>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Elle s'appuie sur votre profil, votre librairie et l'analyse du marché. Quelques instants.</p>
            </div>
          </div>
        ) : failed ? (
          <div className="card card-pad" style={{ marginTop: 22, borderColor: "#fecaca", background: "#fef2f2" }}>
            <p style={{ fontWeight: 800, fontSize: 14, color: "#dc2626" }}>La génération a échoué</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{resp.status_detail ?? "Vos crédits ont été remboursés."} Vous pouvez relancer depuis la fiche analyse.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0,1fr)", gap: 22, marginTop: 24, alignItems: "start" }}>
            {/* Gauche sticky : avancement + actions */}
            <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card card-pad">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>Avancement du dossier</span>
                  <span className="tnum" style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)" }}>{completion}%</span>
                </div>
                <div style={{ height: 9, borderRadius: 9, background: "var(--line)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${completion}%`, background: "linear-gradient(90deg, var(--navy), var(--navy-600))", borderRadius: 9, transition: "width .5s" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: 14, gap: 2 }}>
                  {sections.map((s, i) => {
                    const ok = !!(s.contenu && s.contenu.trim());
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", fontSize: 12.5 }}>
                        <span style={{ color: ok ? "var(--go-dot)" : "var(--warn-dot)", display: "flex" }}>{ok ? <CheckCircle2 className="ico-sm" /> : <CircleDashed className="ico-sm" />}</span>
                        <span className="clip1" style={{ flex: 1, fontWeight: 600, color: ok ? "var(--ink-2)" : "var(--warn-fg)" }}>{s.titre}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button className="btn btn-primary" style={{ height: 46 }} onClick={exportDocx}><FileDown className="ico-sm" /> Exporter le dossier (.docx)</button>
              <button className="btn btn-ghost" onClick={() => navigate("/app?chat=ca")}><MessageCircle className="ico-sm" /> Faire relire par mon CA</button>
            </div>

            {/* Droite : contenu */}
            <div>
              {content.synthese && (
                <div style={{ display: "flex", gap: 12, padding: 16, borderRadius: 13, background: "var(--go-bg)", border: "1px solid color-mix(in oklab, var(--go-dot) 30%, white)", marginBottom: 18 }}>
                  <span style={{ color: "var(--go-fg)", marginTop: 1, display: "flex" }}><Sparkles className="ico-md" /></span>
                  <p style={{ fontSize: 13.5, color: "var(--go-fg)", lineHeight: 1.55 }}>{content.synthese}</p>
                </div>
              )}

              {sections.length > 0 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}><FileText className="ico-md" /> Mémoire technique (brouillon IA)</p>
                  {sections.map((s, i) => (
                    <div key={i} className="card" style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: "1px solid var(--line-2)" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, flex: 1 }}>{s.titre}</span>
                        <button className="icon-btn" style={{ width: 30, height: 30 }} title="Copier" onClick={() => copy(s.contenu)}><Copy className="ico-sm" /></button>
                      </div>
                      <p style={{ padding: "14px 16px", fontSize: 13.5, lineHeight: 1.65, color: "var(--ink-2)", whiteSpace: "pre-line" }}>{s.contenu || "—"}</p>
                    </div>
                  ))}
                </>
              )}

              {content.pieces_administratives && content.pieces_administratives.length > 0 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", margin: "22px 0 12px", display: "flex", alignItems: "center", gap: 8 }}><ClipboardList className="ico-md" /> Pièces administratives</p>
                  <div className="card" style={{ overflow: "hidden" }}>
                    {content.pieces_administratives.map((p, i) => {
                      const ok = /disponible/i.test(p.statut);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 16px", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
                          <span style={{ color: ok ? "var(--go-dot)" : "var(--warn-dot)", display: "flex" }}>{ok ? <CheckCircle2 className="ico-md" /> : <CircleAlert className="ico-md" />}</span>
                          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{p.label}</span>
                          <span className="v-chip" style={ok ? { background: "var(--go-bg)", color: "var(--go-fg)" } : { background: "var(--warn-bg)", color: "var(--warn-fg)" }}>{p.statut}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {content.points_a_completer && content.points_a_completer.length > 0 && (
                <div style={{ marginTop: 18, padding: 18, borderRadius: 13, background: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 800, color: "#c2410c", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><HelpCircle className="ico-md" /> À compléter avant dépôt</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {content.points_a_completer.map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, fontSize: 13, color: "#9a3412", lineHeight: 1.5 }}>
                        <span className="tnum" style={{ fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span><span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>Brouillon généré par l'IA — à relire et affiner avec votre chargé d'affaires avant dépôt.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════ MOBILE (inchangé) ════════════════
  return (
    <div className="min-h-screen bg-background">
      {Header}
      <main className={`${wrapMax} mx-auto px-4 py-6 pb-16 space-y-5`}>
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
