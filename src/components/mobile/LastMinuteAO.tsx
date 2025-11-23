import { useState } from "react";
import { MapPin, Calendar, Euro, Zap, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useBoampTenders, type BoampTender } from "@/hooks/useBoampTenders";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface LastMinuteAOProps {
  onRequestResponse: (tender: {
    id: string;
    title: string;
    location: string;
    budget: string;
    deadline: string;
  }) => void;
}

export function LastMinuteAO({ onRequestResponse }: LastMinuteAOProps) {
  const navigate = useNavigate();
  const { tenders, loading, error, usingFallback, lastUpdate, refetch } = useBoampTenders();
  const [selectedTender, setSelectedTender] = useState<BoampTender | null>(null);

  const handleConfirmRequest = () => {
    if (selectedTender) {
      onRequestResponse({
        id: selectedTender.id,
        title: selectedTender.title,
        location: selectedTender.location,
        budget: selectedTender.budget,
        deadline: selectedTender.deadline,
      });
      setSelectedTender(null);
    }
  };

  const isNew = (hoursAgo: number) => hoursAgo < 48;

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1 text-primary">
              Dernières opportunités
            </h1>
            <p className="text-sm text-muted-foreground">
              {usingFallback ? "Données de démonstration" : "Données BOAMP en temps réel"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {!usingFallback && lastUpdate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Mis à jour {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true, locale: fr })}</span>
          </div>
        )}

        {usingFallback && (
          <Alert variant="default" className="bg-secondary/10 border-secondary">
            <AlertCircle className="h-4 w-4 text-secondary" />
            <AlertDescription className="text-sm">
              Données de démonstration - L'API BOAMP est temporairement indisponible
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {tenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-sm"
              >
                {/* Title and New Badge */}
                <div className="flex items-start gap-2">
                  <h3 className="font-semibold text-sm flex-1 leading-tight text-foreground">
                    {tender.title}
                  </h3>
                  {isNew(tender.hoursAgo) && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary shrink-0">
                      <Zap className="w-3 h-3" />
                      {tender.hoursAgo}h
                    </span>
                  )}
                </div>

               {/* Summary */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tender.summary || "Information à venir"}
              </p>

              {/* Read summary link */}
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-primary hover:text-primary/80 font-normal"
                onClick={() => navigate(`/tender-details?id=${tender.id}`)}
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                Lire le résumé de l'appel d'offres
              </Button>

              {/* Organisme */}
              <div className="text-xs">
                <span className="font-medium text-foreground">{tender.organisme}</span>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{tender.location || "Non spécifié"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Euro className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{tender.budget || "Montant non spécifié"}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {tender.deadline ? `Date limite : ${tender.deadline}` : "Date limite : Non spécifiée"}
                  </span>
                </div>
              </div>

                {/* Compatibility */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Compatibilité</span>
                    <span className="font-semibold text-primary">
                      {tender.compatibility}%
                    </span>
                  </div>
                  <Progress value={tender.compatibility} className="h-1.5" />
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-foreground"
                  onClick={() => setSelectedTender(tender)}
                >
                  Demander une réponse
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedTender} onOpenChange={() => setSelectedTender(null)}>
        <DialogContent className="max-w-[340px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirmer votre demande de réponse ?</DialogTitle>
            <DialogDescription>
              Votre chargé d'affaires sera informé et commencera à travailler sur votre
              réponse pour cet appel d'offres.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedTender(null)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmRequest}
              className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
