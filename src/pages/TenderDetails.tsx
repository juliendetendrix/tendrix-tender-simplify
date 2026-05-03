import { ArrowLeft, MapPin, Calendar, Euro, TrendingUp, ExternalLink, Building2, FileText, Package, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  
  const tender = tenders.find(t => t.id === tenderId);
  const { summary, loading: summaryLoading, error: summaryError } = useTenderSummary(tender || null);

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
          {summaryLoading ? (
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

      {/* Sticky CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 shadow-lg z-10">
        <div className="max-w-lg mx-auto">
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
            onClick={() => {
              // Navigate back and trigger the request flow
              navigate(-1);
            }}
          >
            Demander une réponse
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TenderDetails;
