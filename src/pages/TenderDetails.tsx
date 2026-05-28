import { ArrowLeft, MapPin, Calendar, Euro, TrendingUp, ExternalLink, Building2, FileText, Package, Check, Sparkles, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useTenderAnalyses } from "@/hooks/useTenderAnalyses";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useBoampTenders } from "@/hooks/useBoampTenders";
import { useTenderSummary } from "@/hooks/useTenderSummary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const TenderDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenderId = searchParams.get("id");
  const { ref: contentRef, isVisible } = useScrollAnimation();
  const { tenders, loading: tendersLoading } = useBoampTenders();
  const { company, refetch: refetchCompany } = useCurrentCompany();
  const { analysesByTender, refetch: refetchAnalyses } = useTenderAnalyses(company?.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const demoTender = tenderId === "reco-demo" ? {
    id: "reco-demo",
    title: "Rénovation énergétique du groupe scolaire Jean Jaurès",
    summary: "La Mairie de Lyon lance un appel d'offres pour la rénovation énergétique complète du groupe scolaire Jean Jaurès. Les travaux comprennent l'isolation thermique par l'extérieur, le remplacement des menuiseries, la mise en place d'une ventilation double flux et l'installation de panneaux photovoltaïques. L'objectif est d'atteindre le niveau BBC rénovation. Le marché est alloti pour permettre aux PME locales de candidater.",
    organisme: "Mairie de Lyon",
    location: "Lyon (69)",
    budget: "320 000 €",
    datePublication: new Date(Date.now() - 2 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    famille: "Travaux",
    procedure: "Procédure adaptée",
    cpvCodes: ["45214210", "45321000"],
    url: null,
    hoursAgo: 48,
    compatibility: 92,
    raw: null,
  } : null;

  const tender = demoTender ?? tenders.find(t => t.id === tenderId);
  const { summary, loading: summaryLoading, error: summaryError } = useTenderSummary(demoTender ? null : (tender || null));
  const [lotsOpen, setLotsOpen] = useState(false);
  const [selectedLots, setSelectedLots] = useState<number[]>([]);

  if (tendersLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card relative pb-8 pt-4 px-4 border-b">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <img src={tendrixLogo} alt="Tendrix" className="h-7" />
            <div className="w-10" />
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </main>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card relative pb-8 pt-4 px-4 border-b">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <img src={tendrixLogo} alt="Tendrix" className="h-7" />
            <div className="w-10" />
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertDescription>
              Appel d'offres introuvable
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const formatDeadline = (deadline: string) => {
    try {
      const date = new Date(deadline);
      return format(date, "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
    } catch {
      return deadline;
    }
  };

  const analysis = analysesByTender[tender.id];
  const inProgress = analysis && ["pending", "scraping", "analyzing", "manual_intervention_required"].includes(analysis.status);

  // Lance l'analyse complète : déduit 1 crédit, crée l'analyse + le dossier,
  // notifie le chargé d'affaires (message en base via la RPC, email via la fonction).
  const handleLaunchAnalysis = async () => {
    if (!company) {
      setConfirmOpen(false);
      toast({
        title: "Profil incomplet",
        description: "Terminez la création de votre entreprise pour lancer une analyse.",
        variant: "destructive",
      });
      return;
    }
    setLaunching(true);
    const { data: analysisId, error } = await supabase.rpc("spend_credit_and_start_analysis", {
      _company_id: company.id,
      _tender_id: tender.id,
      _title: tender.title,
      _organisme: tender.organisme,
      _location: tender.location,
      _budget: tender.budget,
      _deadline: tender.deadline || null,
      _date_publication: tender.datePublication,
      _famille: tender.famille,
      _procedure: tender.procedure,
      _cpv_codes: tender.cpvCodes,
      _source_url: tender.url,
      _buyer_profile_url: tender.url,
      _raw: tender.raw ?? {},
      _selected_lots: selectedLots.map((n) => `Lot ${n}`),
    });
    setLaunching(false);
    setConfirmOpen(false);

    if (error) {
      const msg = error.message?.includes("insufficient_credits")
        ? "Vous n'avez plus de crédits disponibles. Rechargez pour lancer une analyse."
        : error.message?.includes("forbidden")
        ? "Action non autorisée pour ce compte."
        : "Impossible de lancer l'analyse pour le moment. Réessayez.";
      toast({ title: "Analyse non lancée", description: msg, variant: "destructive" });
      return;
    }

    // En arrière-plan (best-effort, ne bloque jamais l'UX) :
    //  - resolve-dce : lien plateforme + référence (instantané, utile au CA)
    //  - start-scrape : tente le téléchargement automatique du DCE (Trigger.dev)
    //  - notify-ca : email au chargé d'affaires
    if (analysisId) {
      supabase.functions.invoke("resolve-dce", { body: { analysis_id: analysisId } }).catch(() => {});
      supabase.functions.invoke("start-scrape", { body: { analysis_id: analysisId } }).catch(() => {});
      supabase.functions.invoke("notify-ca", { body: { analysis_id: analysisId } }).catch(() => {});
    }

    refetchAnalyses();
    refetchCompany();
    setSuccessOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card relative pb-4 pt-4 px-4 border-b sticky top-0 z-20">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <img src={tendrixLogo} alt="Tendrix" className="h-7" />
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-32 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            {tender.title}
          </h1>
        </div>

        {/* AI Summary Section */}
        <div className="bg-card rounded-xl border p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Résumé de l'appel d'offres
            </h2>
          </div>
          {demoTender ? (
            <p className="text-sm text-foreground leading-relaxed">
              {demoTender.summary}
            </p>
          ) : summaryLoading ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground italic">
                Génération du résumé en cours...
              </p>
              <Skeleton className="h-20 w-full" />
            </div>
          ) : summaryError ? (
            <div className="space-y-2">
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  Résumé indisponible pour le moment.
                </AlertDescription>
              </Alert>
              {tender.url && (
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => window.open(tender.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Voir l'annonce complète
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              {summary || tender.summary || "Résumé non disponible."}
            </p>
          )}

          {/* Postuler par lots */}
          <Collapsible open={lotsOpen} onOpenChange={setLotsOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between gap-2 mt-2 p-3 rounded-lg border border-secondary/40 bg-secondary/10 hover:bg-secondary/20 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-secondary-foreground" />
                  <span className="text-sm font-semibold text-foreground">Postuler par lots</span>
                  {selectedLots.length > 0 && (
                    <span className="text-[11px] font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {selectedLots.length}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${lotsOpen ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-3">
              <p className="text-xs text-muted-foreground">
                Sélectionnez les lots auxquels vous souhaitez répondre.
              </p>
              {[
                { n: 1, title: "Gros œuvre — Maçonnerie", budget: "45 000 €" },
                { n: 2, title: "Charpente et couverture", budget: "28 000 €" },
                { n: 3, title: "Menuiseries extérieures", budget: "18 500 €" },
                { n: 4, title: "Revêtements de sols", budget: "12 000 €" },
                { n: 5, title: "Peinture et finitions", budget: "9 800 €" },
              ].map((lot) => {
                const checked = selectedLots.includes(lot.n);
                return (
                  <button
                    key={lot.n}
                    onClick={() =>
                      setSelectedLots((p) =>
                        checked ? p.filter((x) => x !== lot.n) : [...p, lot.n]
                      )
                    }
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      checked
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                        checked
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-primary">Lot {lot.n}</div>
                      <div className="text-sm font-medium text-foreground truncate">{lot.title}</div>
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground shrink-0">
                      {lot.budget}
                    </div>
                  </button>
                );
              })}
              <Button
                className="w-full mt-2"
                disabled={selectedLots.length === 0}
                onClick={() =>
                  toast({
                    title: `Postulation à ${selectedLots.length} lot(s)`,
                    description: "Votre chargé d'affaires reviendra vers vous rapidement.",
                  })
                }
              >
                Postuler aux lots sélectionnés
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Main Details Section */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            Détails principaux
          </h2>

          <div className="space-y-3">
            {tender.organisme && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Organisme</p>
                  <p className="text-sm font-semibold text-foreground">{tender.organisme}</p>
                </div>
              </div>
            )}

            {tender.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Lieu d'exécution</p>
                  <p className="text-sm font-semibold text-foreground">{tender.location}</p>
                </div>
              </div>
            )}

            {tender.datePublication && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Date de publication</p>
                  <p className="text-sm font-semibold text-foreground">
                    {format(new Date(tender.datePublication), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
            )}

            {tender.deadline && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Date limite de réponse</p>
                  <p className="text-sm font-semibold text-destructive">
                    {formatDeadline(tender.deadline)}
                  </p>
                </div>
              </div>
            )}

            {(tender.famille || (tender.cpvCodes && tender.cpvCodes.length > 0)) && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground font-medium mb-1">Type de marché</p>
                <div className="flex flex-wrap gap-2">
                  {tender.famille && (
                    <Badge variant="secondary" className="text-xs">
                      {tender.famille}
                    </Badge>
                  )}
                  {tender.cpvCodes?.slice(0, 2).map((cpv, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      CPV: {cpv}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {tender.url && (
              <div className="pt-2">
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => window.open(tender.url!, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Voir l'annonce officielle BOAMP
                </Button>
              </div>
            )}
          </div>
        </div>

        {tender.budget && (
          <div className="bg-card rounded-xl border p-5 space-y-3">
            <div className="flex items-start gap-3">
              <Euro className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">Budget</p>
                <p className="text-lg font-bold text-foreground">{tender.budget}</p>
              </div>
            </div>
          </div>
        )}

        {(() => {
          const compat =
            tender.compatibility != null
              ? tender.compatibility
              : 60 + (Math.abs(tender.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 35);
          return (
            <div className="bg-card rounded-xl border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  Compatibilité avec votre entreprise
                </h3>
                <span className="text-2xl font-bold text-primary">{compat}%</span>
              </div>
              <Progress value={compat} className="h-2.5" />

              <div className="flex items-center gap-2 pt-2">
                <Badge
                  variant={compat >= 70 ? "default" : "secondary"}
                  className="text-xs px-3 py-1.5"
                >
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  Chances : {compat >= 70 ? "élevées" : "moyennes"}
                </Badge>
              </div>
            </div>
          );
        })()}
      </main>

      {/* Sticky CTA Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 shadow-lg z-10">
        <div className="max-w-lg mx-auto space-y-2.5">
          {/* Analyse complète : bouton / en cours / verdict */}
          {!analysis && (
            <Button
              size="lg"
              className="w-full text-white font-bold text-base py-6 rounded-xl shadow-md hover:opacity-90 transition-all border-0"
              style={{ backgroundColor: "#0c1c98" }}
              onClick={() => setConfirmOpen(true)}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Lancer l'analyse complète
              <span className="ml-2 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                💡 1 crédit
              </span>
            </Button>
          )}

          {inProgress && (
            <div
              className="w-full flex items-center justify-center gap-2 rounded-xl py-5 text-base font-bold border"
              style={{ backgroundColor: "#eef0ff", color: "#0c1c98", borderColor: "#c7ccff" }}
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyse en cours…
            </div>
          )}

          {analysis && analysis.status === "completed" && (() => {
            const V: Record<string, { label: string; bg: string; color: string; Icon: typeof CheckCircle2 }> = {
              go:              { label: "GO",               bg: "#dcfce7", color: "#16a34a", Icon: CheckCircle2 },
              go_with_reserve: { label: "GO AVEC RÉSERVE",  bg: "#fef3c7", color: "#b45309", Icon: AlertTriangle },
              no_go:           { label: "NO GO",            bg: "#fee2e2", color: "#dc2626", Icon: XCircle },
            };
            const v = V[analysis.verdict ?? "go_with_reserve"];
            const Icon = v.Icon;
            return (
              <button
                onClick={() => navigate(`/analysis?id=${analysis.id}`)}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-5 text-base font-bold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: v.bg, color: v.color }}
              >
                <Icon className="w-5 h-5" />
                {v.label} · Voir la fiche analyse
              </button>
            );
          })()}

          {analysis && analysis.status === "failed" && (
            <Button
              size="lg"
              variant="outline"
              className="w-full font-bold text-base py-6 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/5"
              onClick={() => setConfirmOpen(true)}
            >
              Analyse échouée — relancer (1 crédit)
            </Button>
          )}

          <Button
            size="lg"
            variant="outline"
            className="w-full font-bold text-base py-6 rounded-xl border-secondary/50 text-foreground hover:bg-secondary/10"
            onClick={() => navigate(-1)}
          >
            Demander une réponse
          </Button>
        </div>
      </div>

      {/* Confirmation de l'analyse complète (action payante = 1 crédit) */}
      <Dialog open={confirmOpen} onOpenChange={() => !launching && setConfirmOpen(false)}>
        <DialogContent className="max-w-[340px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: "#0c1c98" }} />
              Lancer l'analyse complète ?
            </DialogTitle>
            <DialogDescription>
              Nous récupérons le dossier de consultation (DCE) et l'analysons avec l'IA pour
              vous donner un verdict <strong>GO / NO GO</strong>, vos points forts et les
              informations manquantes. Votre chargé d'affaires est prévenu.
              <span className="block mt-2 font-medium text-foreground">
                Cette analyse utilise <strong>1 crédit</strong>
                {typeof company?.credits === "number" ? ` (solde : ${company.credits})` : ""}.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="flex-1"
              disabled={launching}
            >
              Annuler
            </Button>
            <Button
              onClick={handleLaunchAnalysis}
              className="flex-1 text-white border-0"
              style={{ backgroundColor: "#0c1c98" }}
              disabled={launching}
            >
              {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lancer (1 crédit)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup de succès : analyse lancée → on dirige vers Mes dossiers */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-[340px] rounded-lg text-center">
          <DialogHeader>
            <div className="mx-auto mb-2 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#dcfce7" }}>
              <CheckCircle2 className="w-7 h-7" style={{ color: "#16a34a" }} />
            </div>
            <DialogTitle className="text-center">Analyse lancée 🚀</DialogTitle>
            <DialogDescription className="text-center">
              Nous récupérons et analysons le dossier. <strong>Vous serez notifié dès que l'analyse
              sera terminée.</strong> Vous pouvez continuer à naviguer pendant ce temps.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full text-white border-0"
              style={{ backgroundColor: "#0c1c98" }}
              onClick={() => navigate("/app?tab=dossiers")}
            >
              Voir mes dossiers
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setSuccessOpen(false)}>
              Continuer à explorer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenderDetails;
