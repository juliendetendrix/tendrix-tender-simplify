import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, FileText, Download, Loader2, CheckCircle2, AlertTriangle, XCircle,
  Sparkles, ThumbsUp, HelpCircle, Building2, MapPin, Calendar, ExternalLink, Link2,
  ListChecks, ShieldCheck, Package, Clock, Scale, Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";
import { classifyDce, DOC_TYPE_LABEL, type DocType } from "@/lib/dce-classify";

interface Prerequis { label: string; obligatoire?: boolean; detail?: string }
interface DateCle { label: string; valeur: string }
interface CritereAttribution { label: string; ponderation?: string }
interface LotReport { numero: string; intitule?: string; ouvert?: boolean; resume?: string | null }

interface AnalysisReport {
  synthese?: string;
  points_forts?: string[];
  points_vigilance?: string[];
  infos_manquantes?: string[];
  prerequis?: Prerequis[];
  dates_cles?: DateCle[];
  criteres_attribution?: CritereAttribution[];
  lots?: LotReport[];
  lots_ouverts?: string[];
  documents_non_lus?: string[];
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
  buyer_profile_url: string | null;
  platform: string | null;
  consultation_ref: string | null;
  tenders: { title: string; organisme: string | null; location: string | null; deadline: string | null } | null;
  tender_documents: TenderDoc[] | null;
}

const VERDICT_UI: Record<string, { label: string; phrase: string; bg: string; color: string; Icon: typeof CheckCircle2 }> = {
  go:              { label: "GO",              phrase: "Foncez, ce marché est fait pour vous !",          bg: "#dcfce7", color: "#16a34a", Icon: CheckCircle2 },
  go_with_reserve: { label: "GO AVEC RÉSERVE", phrase: "Profil compatible, mais quelques points à lever.", bg: "#fef3c7", color: "#b45309", Icon: AlertTriangle },
  no_go:           { label: "NO GO",           phrase: "Ce marché ne semble pas adapté à votre profil.",   bg: "#fee2e2", color: "#dc2626", Icon: XCircle },
};

const IN_PROGRESS = ["pending", "scraping", "analyzing", "manual_intervention_required"];

function Section({ title, items, Icon, color }: { title: string; items: string[]; Icon: typeof ThumbsUp; color: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color }}>
        <Icon className="w-4 h-4" />
        {title}
      </h3>
      <ul className="space-y-1.5 pl-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="leading-snug">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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

function DocGroup({
  title, docs, docByName, labelFor, openDoc, muted,
}: {
  title: string;
  docs: string[];
  docByName: Map<string, TenderDoc>;
  labelFor: (name: string) => DocInfo;
  openDoc: (d: TenderDoc) => void;
  muted?: boolean;
}) {
  const rows = docs.map((name) => docByName.get(name)).filter(Boolean) as TenderDoc[];
  if (rows.length === 0) return null;
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className={`px-3 py-2 border-b text-sm font-bold ${muted ? "bg-muted/40 text-muted-foreground" : "bg-secondary/10 text-foreground"}`}>
        {title}
      </div>
      <div className="divide-y">
        {rows.map((doc) => (
          <DocRow key={doc.id} doc={doc} info={labelFor(doc.file_name)} openDoc={openDoc} />
        ))}
      </div>
    </div>
  );
}

const AnalysisDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalysis = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("tender_analyses")
      .select(`
        id, status, verdict, report, selected_lots, lots,
        buyer_profile_url, platform, consultation_ref,
        tenders ( title, organisme, location, deadline ),
        tender_documents ( id, file_name, doc_type, storage_path, mime_type, size_bytes, source )
      `)
      .eq("id", id)
      .maybeSingle();
    setAnalysis(data as AnalysisRow | null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  // Mise à jour en direct quand le verdict arrive
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`analysis-detail-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tender_analyses", filter: `id=eq.${id}` },
        () => fetchAnalysis(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchAnalysis]);

  const openDoc = async (doc: TenderDoc) => {
    const { data, error } = await supabase.storage
      .from("tender-documents")
      .createSignedUrl(doc.storage_path, 120);
    if (error || !data?.signedUrl) {
      toast({ title: "Document indisponible", description: "Impossible d'ouvrir ce fichier.", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const Header = (
    <header className="bg-card relative pt-4 pb-4 px-4 border-b sticky top-0 z-20">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <img src={tendrixLogo} alt="Tendrix" className="h-7" />
        <div className="w-10" />
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {Header}
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
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
        <main className="max-w-lg mx-auto px-4 py-10 text-center text-muted-foreground">
          Analyse introuvable.
        </main>
      </div>
    );
  }

  const tender = analysis.tenders;
  const docs = analysis.tender_documents ?? [];
  const report = analysis.report ?? {};
  const inProgress = IN_PROGRESS.includes(analysis.status);
  const v = analysis.verdict ? VERDICT_UI[analysis.verdict] : null;

  // Tri par lot des documents déposés (déterministe, dès l'upload — pas besoin
  // d'attendre l'IA). Permet l'onglet "Documents" structuré comme le concurrent.
  const cls = classifyDce(docs.map((d) => d.file_name));
  const docByName = new Map(docs.map((d) => [d.file_name, d]));
  const prerequis = report.prerequis ?? [];
  const datesCles = (report.dates_cles ?? []).filter((d) => d.valeur && d.valeur !== "non précisé");
  const criteres = report.criteres_attribution ?? [];
  const lots = (analysis.lots ?? report.lots ?? []) as LotReport[];
  const lotsOuverts = report.lots_ouverts ?? cls.lotsOuverts;
  const hasPrerequis = prerequis.length > 0 || datesCles.length > 0 || criteres.length > 0;

  // Onglet Documents : libellé court par fichier + mise en avant des pièces clés.
  const KEY_TYPES: DocType[] = ["RC", "CCAP", "CCTP", "DPGF", "AE"];
  const labelFor = (name: string): { type: DocType; label: string; key: boolean } => {
    const c = cls.docs.find((d) => d.fileName === name);
    const type = c?.docType ?? "AUTRE";
    return { type, label: DOC_TYPE_LABEL[type], key: KEY_TYPES.includes(type) };
  };

  return (
    <div className="min-h-screen bg-background">
      {Header}
      <main className="max-w-lg mx-auto px-4 py-6 pb-16 space-y-5">
        {/* Titre */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#0c1c98" }} />
            Fiche analyse
          </div>
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {tender?.title ?? "Appel d'offres"}
          </h1>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {tender?.organisme && (
              <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{tender.organisme}</div>
            )}
            {tender?.location && (
              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{tender.location}</div>
            )}
            {tender?.deadline && (
              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date limite : {tender.deadline}</div>
            )}
          </div>
        </div>

        {/* Bannière verdict / en cours */}
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
            <p className="text-xs text-muted-foreground mt-1">
              Votre crédit a été remboursé. Vous pouvez relancer l'analyse depuis l'appel d'offres.
            </p>
          </div>
        ) : v ? (
          <div className="rounded-xl p-5" style={{ backgroundColor: v.bg }}>
            <div className="flex items-center gap-2">
              <v.Icon className="w-6 h-6" style={{ color: v.color }} />
              <span className="text-lg font-extrabold tracking-wide" style={{ color: v.color }}>{v.label}</span>
            </div>
            <p className="text-sm font-medium mt-1.5" style={{ color: v.color }}>{v.phrase}</p>
            {report.synthese && (
              <p className="text-sm text-foreground mt-3 leading-relaxed">{report.synthese}</p>
            )}
          </div>
        ) : null}

        {/* Onglets */}
        <Tabs defaultValue="analyse" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="analyse">L'analyse</TabsTrigger>
            <TabsTrigger value="prerequis">Prérequis</TabsTrigger>
            <TabsTrigger value="documents">
              Documents{docs.length > 0 ? ` (${docs.length})` : ""}
            </TabsTrigger>
          </TabsList>

          {/* — L'analyse — */}
          <TabsContent value="analyse" className="space-y-5 pt-4">
            {inProgress && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Le verdict détaillé apparaîtra ici une fois l'analyse terminée.
              </p>
            )}
            {!inProgress && (
              <>
                <Section title="Points forts" items={report.points_forts ?? []} Icon={ThumbsUp} color="#16a34a" />
                <Section title="Points de vigilance" items={report.points_vigilance ?? []} Icon={AlertTriangle} color="#b45309" />
                <Section title="Informations manquantes" items={report.infos_manquantes ?? []} Icon={HelpCircle} color="#0c1c98" />

                {/* Lots du marché (tri + lots ouverts) */}
                {lots.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "#0c1c98" }}>
                      <Package className="w-4 h-4" />
                      Lots du marché
                    </h3>
                    <div className="space-y-2">
                      {lots.map((lot) => (
                        <div key={lot.numero} className="rounded-lg border p-3 bg-card">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">
                              Lot {lot.numero}{lot.intitule ? ` — ${lot.intitule}` : ""}
                            </span>
                            {lot.ouvert ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                                OUVERT
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                autre lot
                              </span>
                            )}
                          </div>
                          {lot.resume && <p className="text-xs text-muted-foreground mt-1 leading-snug">{lot.resume}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.documents_non_lus && report.documents_non_lus.length > 0 && (
                  <p className="text-xs text-muted-foreground border-t pt-3">
                    À vérifier manuellement (formats non lus par l'IA) : {report.documents_non_lus.join(", ")}
                  </p>
                )}
                {!report.points_forts?.length && !report.points_vigilance?.length && !report.infos_manquantes?.length && !lots.length && (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun détail disponible.</p>
                )}
              </>
            )}
          </TabsContent>

          {/* — Prérequis — */}
          <TabsContent value="prerequis" className="space-y-5 pt-4">
            {inProgress ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Les prérequis (assurances, qualifications, dates, critères) apparaîtront ici une fois l'analyse terminée.
              </p>
            ) : !hasPrerequis ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aucun prérequis n'a pu être extrait des documents fournis.
              </p>
            ) : (
              <>
                {/* Dates clés */}
                {datesCles.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "#0c1c98" }}>
                      <Clock className="w-4 h-4" /> Dates clés
                    </h3>
                    <div className="divide-y border rounded-lg overflow-hidden">
                      {datesCles.map((d, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 bg-card text-sm">
                          <span className="text-muted-foreground">{d.label}</span>
                          <span className="font-semibold text-foreground text-right">{d.valeur}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Critères d'attribution */}
                {criteres.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "#0c1c98" }}>
                      <Scale className="w-4 h-4" /> Critères d'attribution
                    </h3>
                    <div className="divide-y border rounded-lg overflow-hidden">
                      {criteres.map((c, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 bg-card text-sm">
                          <span className="text-foreground">{c.label}</span>
                          {c.ponderation && <span className="font-semibold text-primary">{c.ponderation}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pièces & qualifications exigées */}
                {prerequis.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "#0c1c98" }}>
                      <ShieldCheck className="w-4 h-4" /> Pièces & qualifications exigées
                    </h3>
                    <ul className="space-y-2">
                      {prerequis.map((p, i) => (
                        <li key={i} className="rounded-lg border p-3 bg-card">
                          <div className="flex items-center gap-2 flex-wrap">
                            <ListChecks className="w-4 h-4 shrink-0" style={{ color: p.obligatoire ? "#dc2626" : "#16a34a" }} />
                            <span className="text-sm font-semibold text-foreground">{p.label}</span>
                            {p.obligatoire && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                                OBLIGATOIRE
                              </span>
                            )}
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

          {/* — Documents (triés par lot) — */}
          <TabsContent value="documents" className="pt-4 space-y-4">
            {/* Profil acheteur détecté par le robot */}
            {analysis.buyer_profile_url && (
              <div className="rounded-lg border p-3 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  Profil acheteur détecté
                </div>
                {analysis.platform && (
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Plateforme : <span className="font-medium">{analysis.platform}</span>
                    {analysis.consultation_ref ? ` · réf. ${analysis.consultation_ref}` : ""}
                  </p>
                )}
                <a
                  href={analysis.buyer_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline break-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  {analysis.buyer_profile_url}
                </a>
              </div>
            )}

            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Les documents seront disponibles une fois récupérés par votre chargé d'affaires.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Pièces communes (administratif transverse) */}
                {cls.commun.length > 0 && (
                  <DocGroup title="Pièces administratives communes" docs={cls.commun.map((c) => c.fileName)}
                    docByName={docByName} labelFor={labelFor} openDoc={openDoc} />
                )}

                {/* Un bloc par lot — lots ouverts en premier, badge OUVERT */}
                {cls.groupes.map((g) => (
                  <div key={g.lot} className="rounded-lg border overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 border-b flex-wrap">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">
                        Lot {g.lot}{g.intitule ? ` — ${g.intitule}` : ""}
                      </span>
                      {g.ouvert ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                          OUVERT
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          autre lot
                        </span>
                      )}
                    </div>
                    <div className="divide-y">
                      {g.docs.map((c) => {
                        const doc = docByName.get(c.fileName);
                        if (!doc) return null;
                        const info = labelFor(c.fileName);
                        return <DocRow key={doc.id} doc={doc} info={info} openDoc={openDoc} />;
                      })}
                    </div>
                  </div>
                ))}

                {/* Études & contexte */}
                {cls.etudes.length > 0 && (
                  <DocGroup title="Études & contexte technique" docs={cls.etudes.map((c) => c.fileName)}
                    docByName={docByName} labelFor={labelFor} openDoc={openDoc} muted />
                )}

                {/* Guides plateforme */}
                {cls.guides.length > 0 && (
                  <DocGroup title="Guides plateforme" docs={cls.guides.map((c) => c.fileName)}
                    docByName={docByName} labelFor={labelFor} openDoc={openDoc} muted />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AnalysisDetail;
