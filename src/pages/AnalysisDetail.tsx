import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, FileText, Download, Loader2, CheckCircle2, AlertTriangle, XCircle,
  Sparkles, Building2, MapPin, Calendar, ExternalLink, Link2,
  ListChecks, ShieldCheck, Star, AlertCircle, MapPinned, Timer, MessageSquare, Coins,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";
import { classifyDce, DOC_TYPE_LABEL, type DocType } from "@/lib/dce-classify";
import { MatchRing } from "@/components/desktop/DesignKit";

interface Qualif { label: string; obligatoire?: boolean; detail?: string }
interface KV { label: string; valeur?: string; detail?: string }
interface LotReport { numero: string; intitule?: string; ouvert?: boolean; resume?: string | null }

interface AnalysisReport {
  compatibilite?: number | null;
  budget_estime?: string | null;
  avis?: string;
  attention?: string | null;
  description?: string | null;
  lots?: LotReport[];
  lots_ouverts?: string[];
  calendrier?: KV[];
  jugement?: KV[];
  lieu?: string | null;
  duree?: string | null;
  visites?: string | null;
  qualifications?: Qualif[];
  documents_non_lus?: string[];
  // Rétro-compatibilité (anciennes analyses)
  synthese?: string;
  prerequis?: Qualif[];
  dates_cles?: KV[];
  criteres_attribution?: { label: string; ponderation?: string }[];
}

interface TenderDoc {
  id: string;
  file_name: string;
  doc_type: string | null;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  source: string;
}

interface AnalysisRow {
  id: string;
  status: string;
  verdict: string | null;
  report: AnalysisReport | null;
  selected_lots: string[] | null;
  lots: LotReport[] | null;
  request_id: string | null;
  company_id: string | null;
  tender_id: string | null;
  buyer_profile_url: string | null;
  platform: string | null;
  consultation_ref: string | null;
  tenders: { title: string; organisme: string | null; location: string | null; deadline: string | null } | null;
  tender_documents: TenderDoc[] | null;
}

const VERDICT_UI: Record<string, { label: string; phrase: string; bg: string; color: string; tone: "go" | "warn" | "no"; Icon: typeof CheckCircle2 }> = {
  go:              { label: "GO",              phrase: "Foncez, ce marché est fait pour vous !",          bg: "#dcfce7", color: "#16a34a", tone: "go",   Icon: CheckCircle2 },
  go_with_reserve: { label: "GO AVEC RÉSERVE", phrase: "Profil compatible, mais quelques points à lever.", bg: "#fef3c7", color: "#b45309", tone: "warn", Icon: AlertTriangle },
  no_go:           { label: "NO GO",           phrase: "Ce marché ne semble pas adapté à votre profil.",   bg: "#fee2e2", color: "#dc2626", tone: "no",   Icon: XCircle },
};

const IN_PROGRESS = ["pending", "scraping", "analyzing", "manual_intervention_required"];
const RESPONSE_CREDIT_COST = 5;

interface DocInfo { type: DocType; label: string; key: boolean }

function DocRow({ doc, info, openDoc }: { doc: TenderDoc; info: DocInfo; openDoc: (d: TenderDoc) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card">
      {info.key ? (
        <Star className="w-4 h-4 shrink-0" style={{ color: "#f9bd43", fill: "#f9bd43" }} />
      ) : (
        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
        <p className="text-[11px] text-muted-foreground">{info.label}</p>
      </div>
      <button
        onClick={() => openDoc(doc)}
        className="text-muted-foreground hover:text-primary transition-colors shrink-0"
        aria-label={`Télécharger ${doc.file_name}`}
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
}

interface AnalysisDetailProps {
  analysisId?: string;
  onBack?: () => void;
  onOpenResponse?: (id: string) => void;
}

const AnalysisDetail = ({ analysisId, onBack, onOpenResponse }: AnalysisDetailProps = {}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = analysisId ?? searchParams.get("id");
  const embedded = !!onBack;
  const goBack = onBack ?? (() => navigate(-1));
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  const respondToMarket = async () => {
    if (!analysis?.company_id) return;
    if (!window.confirm(`Générer une première version de la réponse à ce marché ?\nCela utilise ${RESPONSE_CREDIT_COST} crédits.`)) return;
    setResponding(true);
    const { error: spendErr } = await supabase.rpc("spend_credits", {
      _company_id: analysis.company_id, _amount: RESPONSE_CREDIT_COST, _reason: "response",
    });
    if (spendErr) {
      setResponding(false);
      toast(spendErr.message?.includes("insufficient_credits")
        ? { title: "Crédits insuffisants", description: "Rechargez pour générer une réponse.", variant: "destructive" }
        : { title: "Action impossible", description: "Réessayez.", variant: "destructive" });
      return;
    }
    const { data: created, error: insErr } = await supabase.from("tender_responses").insert({
      company_id: analysis.company_id, analysis_id: analysis.id, request_id: analysis.request_id,
      tender_id: analysis.tender_id, selected_lots: analysis.selected_lots ?? [],
      status: "generating", credits_spent: RESPONSE_CREDIT_COST,
    } as never).select("id").single();
    setResponding(false);
    if (insErr || !created) {
      toast({ title: "Génération impossible", description: "Réessayez.", variant: "destructive" });
      return;
    }
    const respId = (created as { id: string }).id;
    supabase.functions.invoke("generate-response", { body: { response_id: respId } }).catch(() => {});
    if (onOpenResponse) onOpenResponse(respId);
    else navigate(`/response?id=${respId}`);
  };

  const fetchAnalysis = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    const { data } = await supabase
      .from("tender_analyses")
      .select(`
        id, status, verdict, report, selected_lots, lots, request_id, company_id, tender_id,
        buyer_profile_url, platform, consultation_ref,
        tenders ( title, organisme, location, deadline ),
        tender_documents ( id, file_name, doc_type, storage_path, mime_type, size_bytes, source )
      `)
      .eq("id", id)
      .maybeSingle();
    setAnalysis(data as AnalysisRow | null);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`analysis-detail-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tender_analyses", filter: `id=eq.${id}` }, () => fetchAnalysis())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, fetchAnalysis]);

  const openDoc = async (doc: TenderDoc) => {
    const { data, error } = await supabase.storage.from("tender-documents").createSignedUrl(doc.storage_path, 120);
    if (error || !data?.signedUrl) {
      toast({ title: "Document indisponible", description: "Impossible d'ouvrir ce fichier.", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const Header = embedded ? (
    <header className="bg-card px-6 py-3 border-b sticky top-0 z-20">
      <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
    </header>
  ) : (
    <header className="bg-card relative pt-4 pb-4 px-4 border-b sticky top-0 z-20">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <img src={tendrixLogo} alt="Tendrix" className="h-7" />
        <div className="w-10" />
      </div>
    </header>
  );
  const wrapMax = embedded ? "max-w-3xl" : "max-w-lg";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {Header}
        <main className={`${wrapMax} mx-auto px-4 py-6 space-y-4`}>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </main>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background">
        {Header}
        <main className={`${wrapMax} mx-auto px-4 py-10 text-center text-muted-foreground`}>Analyse introuvable.</main>
      </div>
    );
  }

  const tender = analysis.tenders;
  const docs = analysis.tender_documents ?? [];
  const report = analysis.report ?? {};
  const inProgress = IN_PROGRESS.includes(analysis.status);
  const v = analysis.verdict ? VERDICT_UI[analysis.verdict] : null;

  const cls = classifyDce(docs.map((d) => d.file_name));

  const avis = report.avis ?? report.synthese ?? "";
  const attention = report.attention ?? null;
  const description = report.description ?? null;
  const lots = (analysis.lots ?? report.lots ?? []) as LotReport[];
  const okVal = (s?: string | null) => !!s && s.trim() !== "" && s.trim().toLowerCase() !== "non précisé";
  const calendrier = (report.calendrier ?? report.dates_cles ?? []).filter((d) => okVal(d.valeur));
  const jugement = (report.jugement ?? (report.criteres_attribution ?? []).map((c) => ({ label: c.label, detail: c.ponderation }))).filter((j) => j.label);
  const lieu = report.lieu ?? tender?.location ?? null;
  const duree = report.duree ?? null;
  const visites = report.visites ?? null;
  const qualifications = report.qualifications ?? report.prerequis ?? [];
  const hasPrerequis = okVal(visites) || qualifications.length > 0;

  const KEY_TYPES: DocType[] = ["RC", "CCAP", "CCTP", "DPGF", "AE"];
  const labelFor = (name: string): DocInfo => {
    const c = cls.docs.find((d) => d.fileName === name);
    const type = c?.docType ?? "AUTRE";
    return { type, label: DOC_TYPE_LABEL[type], key: KEY_TYPES.includes(type) };
  };

  // ── Bloc d'onglets (contenu partagé mobile + desktop) ──
  const tabsBlock = (
    <Tabs defaultValue="analyse" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="analyse">L'analyse</TabsTrigger>
        <TabsTrigger value="prerequis">Prérequis</TabsTrigger>
        <TabsTrigger value="documents">Documents{docs.length > 0 ? ` (${docs.length})` : ""}</TabsTrigger>
      </TabsList>

      <TabsContent value="analyse" className="pt-4">
        {inProgress ? (
          <p className="text-sm text-muted-foreground text-center py-6">Le détail apparaîtra ici une fois l'analyse terminée.</p>
        ) : (
          <>
            <button
              onClick={() => navigate("/app?chat=ca")}
              className="w-full mb-4 h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold border hover:bg-primary/5 transition-colors"
              style={{ borderColor: "#c7ccff", color: "#0c1c98" }}
            >
              <MessageSquare className="w-4 h-4" /> Discuter avec mon chargé d'affaires
            </button>

            {attention && (
              <div className="rounded-xl border p-4 mb-4 flex items-start gap-3" style={{ backgroundColor: "#fff7ed", borderColor: "#fed7aa" }}>
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#ea580c" }} />
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: "#ea580c" }}>Point de vigilance</p>
                  <p className="text-sm leading-snug" style={{ color: "#9a3412" }}>{attention}</p>
                </div>
              </div>
            )}

            <Accordion type="multiple" defaultValue={["avis"]} className="w-full">
              <AccordionItem value="avis">
                <AccordionTrigger className="text-sm font-semibold">Avis</AccordionTrigger>
                <AccordionContent className="text-sm text-foreground leading-relaxed">
                  {v && <span className="font-bold" style={{ color: v.color }}>{v.label} · </span>}
                  {avis || "—"}
                </AccordionContent>
              </AccordionItem>

              {okVal(description) && (
                <AccordionItem value="description">
                  <AccordionTrigger className="text-sm font-semibold">Description du marché</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{description}</AccordionContent>
                </AccordionItem>
              )}

              {lots.length > 0 && (
                <AccordionItem value="lots">
                  <AccordionTrigger className="text-sm font-semibold">Lots ({lots.length})</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {lots.map((lot) => (
                        <div key={lot.numero} className="rounded-lg border p-3 bg-card">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">Lot {lot.numero}{lot.intitule ? ` — ${lot.intitule}` : ""}</span>
                            {lot.ouvert && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>PERTINENT</span>
                            )}
                          </div>
                          {lot.resume && <p className="text-xs text-muted-foreground mt-1 leading-snug">{lot.resume}</p>}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {calendrier.length > 0 && (
                <AccordionItem value="calendrier">
                  <AccordionTrigger className="text-sm font-semibold">Calendrier de réponse</AccordionTrigger>
                  <AccordionContent>
                    <div className="relative pl-6">
                      <div className="absolute left-[5px] top-1.5 bottom-1.5 w-0.5 bg-border" />
                      {calendrier.map((d, i) => {
                        const urgent = /limite|obligatoire/i.test(d.label);
                        return (
                          <div key={i} className="relative" style={{ paddingBottom: i === calendrier.length - 1 ? 0 : 14 }}>
                            <span className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-card" style={{ background: urgent ? "#db4a4a" : "#0c1c98", boxShadow: "0 0 0 1.5px var(--line, #e7e9f3)" }} />
                            <div className="text-[12.5px] font-semibold" style={{ color: urgent ? "#c43838" : undefined }}>{d.label}</div>
                            <div className="text-[12.5px] text-muted-foreground">{d.valeur}</div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {jugement.length > 0 && (
                <AccordionItem value="jugement">
                  <AccordionTrigger className="text-sm font-semibold">Critères de jugement</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2.5">
                      {jugement.map((j, i) => {
                        const pct = parseInt(j.detail ?? "", 10);
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between gap-3 text-sm mb-1">
                              <span>{j.label}</span>
                              {j.detail && <span className="font-bold tabular-nums" style={{ color: "#0c1c98" }}>{j.detail}</span>}
                            </div>
                            {!Number.isNaN(pct) && (
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e7e9f3" }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#0c1c98" }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {okVal(lieu) && (
                <AccordionItem value="lieu">
                  <AccordionTrigger className="text-sm font-semibold">Lieu d'exécution</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground flex items-start gap-2"><MapPinned className="w-4 h-4 shrink-0 mt-0.5" />{lieu}</AccordionContent>
                </AccordionItem>
              )}

              {okVal(duree) && (
                <AccordionItem value="duree">
                  <AccordionTrigger className="text-sm font-semibold">Durée du marché</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground flex items-start gap-2"><Timer className="w-4 h-4 shrink-0 mt-0.5" />{duree}</AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {report.documents_non_lus && report.documents_non_lus.length > 0 && (
              <p className="text-xs text-muted-foreground border-t pt-3 mt-4">À vérifier manuellement (formats non lus par l'IA) : {report.documents_non_lus.join(", ")}</p>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="prerequis" className="space-y-6 pt-4">
        {inProgress ? (
          <p className="text-sm text-muted-foreground text-center py-6">Les prérequis apparaîtront ici une fois l'analyse terminée.</p>
        ) : !hasPrerequis ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun prérequis particulier n'a pu être extrait des documents fournis.</p>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground"><MapPinned className="w-5 h-5" style={{ color: "#0c1c98" }} /> Visites</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{okVal(visites) ? visites : "Aucune visite obligatoire ou échantillon à fournir n'est mentionnée dans les documents."}</p>
            </div>
            {qualifications.length > 0 && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground"><ShieldCheck className="w-5 h-5" style={{ color: "#0c1c98" }} /> Qualifications requises</h3>
                <ul className="space-y-2">
                  {qualifications.map((p, i) => (
                    <li key={i} className="rounded-lg border p-3 bg-card">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ListChecks className="w-4 h-4 shrink-0" style={{ color: p.obligatoire ? "#dc2626" : "#16a34a" }} />
                        <span className="text-sm font-semibold text-foreground">{p.label}</span>
                        {p.obligatoire && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>OBLIGATOIRE</span>}
                      </div>
                      {p.detail && <p className="text-xs text-muted-foreground mt-1 leading-snug pl-6">{p.detail}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="documents" className="pt-4 space-y-4">
        {analysis.buyer_profile_url && (
          <div className="rounded-lg border p-3 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1.5"><Link2 className="w-3.5 h-3.5" /> Profil acheteur détecté</div>
            {analysis.platform && (
              <p className="text-[11px] text-muted-foreground mb-1">Plateforme : <span className="font-medium">{analysis.platform}</span>{analysis.consultation_ref ? ` · réf. ${analysis.consultation_ref}` : ""}</p>
            )}
            <a href={analysis.buyer_profile_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline break-all">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{analysis.buyer_profile_url}
            </a>
          </div>
        )}
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Les documents seront disponibles une fois récupérés par votre chargé d'affaires.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden divide-y">
            {[...docs].sort((a, b) => Number(labelFor(b.file_name).key) - Number(labelFor(a.file_name).key)).map((doc) => (
              <DocRow key={doc.id} doc={doc} info={labelFor(doc.file_name)} openDoc={openDoc} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );

  // ════════════════ DESKTOP (2 colonnes, handoff écran 5) ════════════════
  if (embedded) {
    const tone = v?.tone ?? "warn";
    const compat = typeof report.compatibilite === "number" ? report.compatibilite : null;
    const budget = report.budget_estime ?? null;
    const hasFacts = okVal(budget) || okVal(tender?.deadline) || okVal(duree) || okVal(lieu);
    return (
      <div className="page page-anim" style={{ maxWidth: 1240 }}>
        <button onClick={goBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><ArrowLeft className="ico-sm" /> Retour</button>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 7 }}>
          <Sparkles className="ico-sm" /> FICHE ANALYSE IA
        </div>
        <h2 style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.2, maxWidth: 820 }}>{tender?.title ?? "Appel d'offres"}</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 11, fontSize: 13, color: "var(--muted)" }}>
          {tender?.organisme && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Building2 className="ico-sm" />{tender.organisme}</span>}
          {tender?.location && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin className="ico-sm" />{tender.location}</span>}
          {tender?.deadline && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Calendar className="ico-sm" />Date limite : {tender.deadline}</span>}
        </div>

        {inProgress ? (
          <div className="card card-pad" style={{ marginTop: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Loader2 className="ico-md animate-spin" style={{ color: "var(--navy)" }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: 14, color: "var(--navy)" }}>Analyse en cours…</p>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
                {analysis.status === "manual_intervention_required"
                  ? "Votre chargé d'affaires récupère le dossier de consultation (DCE). Vous serez notifié dès que le verdict est prêt."
                  : "L'IA lit les documents du marché et prépare votre verdict. Cela prend généralement quelques instants."}
              </p>
            </div>
          </div>
        ) : analysis.status === "failed" ? (
          <div className="card card-pad" style={{ marginTop: 22, borderColor: "#fecaca", background: "#fef2f2" }}>
            <p style={{ fontWeight: 800, fontSize: 14, color: "#dc2626" }}>L'analyse a échoué</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Votre crédit a été remboursé. Vous pouvez relancer l'analyse depuis l'appel d'offres.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "344px minmax(0,1fr)", gap: 22, marginTop: 24, alignItems: "start" }}>
            <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {(v || compat != null) && (
                <div className="card card-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 24, paddingBottom: 22 }}>
                  {compat != null && <MatchRing value={compat} />}
                  {v && (
                    <>
                      <div className={`v-chip v-${tone}`} style={{ fontSize: 14, padding: "6px 14px", marginTop: compat != null ? 16 : 0 }}><v.Icon className="ico-sm" /> {v.label}</div>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: `var(--${tone}-fg)`, marginTop: 10, lineHeight: 1.4 }}>{v.phrase}</p>
                    </>
                  )}
                </div>
              )}
              {hasFacts && (
                <div className="card card-pad" style={{ paddingTop: 6 }}>
                  {okVal(budget) && <FactRow icon={<Coins className="ico-sm" />} label="Budget estimé" value={budget as string} strong />}
                  {tender?.deadline && <FactRow icon={<Calendar className="ico-sm" />} label="Remise des offres" value={tender.deadline} strong />}
                  {okVal(duree) && <FactRow icon={<Timer className="ico-sm" />} label="Durée du marché" value={duree as string} />}
                  {okVal(lieu) && <FactRow icon={<MapPinned className="ico-sm" />} label="Lieu d'exécution" value={lieu as string} />}
                </div>
              )}
              <button onClick={respondToMarket} disabled={responding} className="btn btn-primary" style={{ height: 48, fontSize: 14.5 }}>
                {responding && <Loader2 className="ico-sm animate-spin" />}
                Répondre à ce marché
                <span className="v-chip" style={{ background: "rgba(249,189,67,.22)", color: "var(--yellow)" }}><Coins className="ico-sm" /> {RESPONSE_CREDIT_COST}</span>
              </button>
              <button onClick={() => navigate("/app?chat=ca")} className="btn btn-ghost" style={{ marginTop: -6 }}><MessageSquare className="ico-sm" /> Discuter avec mon chargé d'affaires</button>
            </div>
            <div>{tabsBlock}</div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════ MOBILE (inchangé) ════════════════
  return (
    <div className="min-h-screen bg-background">
      {Header}
      <main className={`${wrapMax} mx-auto px-4 py-6 pb-28 space-y-5`}>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#0c1c98" }} /> Fiche analyse
          </div>
          <h1 className="text-xl font-bold text-foreground leading-tight">{tender?.title ?? "Appel d'offres"}</h1>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {tender?.organisme && <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{tender.organisme}</div>}
            {tender?.location && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{tender.location}</div>}
            {tender?.deadline && <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date limite : {tender.deadline}</div>}
          </div>
        </div>

        {inProgress ? (
          <div className="rounded-xl border p-5 flex items-start gap-3" style={{ backgroundColor: "#eef0ff", borderColor: "#c7ccff" }}>
            <Loader2 className="w-5 h-5 animate-spin mt-0.5" style={{ color: "#0c1c98" }} />
            <div>
              <p className="font-bold text-sm" style={{ color: "#0c1c98" }}>Analyse en cours…</p>
              <p className="text-xs text-muted-foreground mt-1">
                {analysis.status === "manual_intervention_required"
                  ? "Votre chargé d'affaires récupère le dossier de consultation (DCE). Vous serez notifié dès que le verdict est prêt."
                  : "L'IA lit les documents du marché et prépare votre verdict. Cela prend généralement quelques instants."}
              </p>
            </div>
          </div>
        ) : analysis.status === "failed" ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
            <p className="font-bold text-sm text-destructive">L'analyse a échoué</p>
            <p className="text-xs text-muted-foreground mt-1">Votre crédit a été remboursé. Vous pouvez relancer l'analyse depuis l'appel d'offres.</p>
          </div>
        ) : v ? (
          <div className="rounded-xl p-5" style={{ backgroundColor: v.bg }}>
            <div className="flex items-center gap-2">
              <v.Icon className="w-6 h-6" style={{ color: v.color }} />
              <span className="text-lg font-extrabold tracking-wide" style={{ color: v.color }}>{v.label}</span>
            </div>
            <p className="text-sm font-medium mt-1.5" style={{ color: v.color }}>{v.phrase}</p>
            {avis && <p className="text-sm text-foreground mt-3 leading-relaxed">{avis}</p>}
          </div>
        ) : null}

        {tabsBlock}
      </main>

      {!inProgress && analysis.status !== "failed" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className={`${wrapMax} mx-auto px-4 py-3`}>
            <button
              onClick={respondToMarket}
              disabled={responding}
              className="w-full h-12 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: "#0c1c98" }}
            >
              {responding && <Loader2 className="w-4 h-4 animate-spin" />}
              Répondre à ce marché
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: "rgba(249,189,67,0.25)", color: "#f9bd43" }}>
                <Coins className="w-3.5 h-3.5" /> {RESPONSE_CREDIT_COST} crédits
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function FactRow({ icon, label, value, strong }: { icon: React.ReactNode; label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 11, padding: "11px 0", borderTop: "1px solid var(--line-2)" }}>
      <span style={{ color: "var(--navy)", marginTop: 1, display: "flex" }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: strong ? 800 : 600, color: "var(--ink)", lineHeight: 1.4 }}>{value}</div>
      </div>
    </div>
  );
}

export default AnalysisDetail;
