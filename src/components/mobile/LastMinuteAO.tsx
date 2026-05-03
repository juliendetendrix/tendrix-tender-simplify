import { useState } from "react";
import { MapPin, Calendar, Euro, Zap, RefreshCw, FileText, HelpCircle } from "lucide-react";
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
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { AddTenderDialog } from "./AddTenderDialog";

interface LastMinuteAOProps {
  onRequestCreated: () => void;
  addOpen: boolean;
  onAddOpenChange: (open: boolean) => void;
}

export function LastMinuteAO({ onRequestCreated, addOpen, onAddOpenChange }: LastMinuteAOProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { company } = useCurrentCompany();
  const { tenders, loading, lastUpdate, refetch } = useBoampTenders();
  const [selectedTender, setSelectedTender] = useState<BoampTender | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedTender) return;
    if (!company || !user) {
      toast({
        title: "Demande envoyée",
        description: "Votre chargé d'affaires reviendra vers vous sous 4 heures.",
      });
      setSelectedTender(null);
      onRequestCreated();
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("tender_requests").insert({
      tender_id: selectedTender.id,
      company_id: company.id,
      charge_affaires_id: company.assigned_charge_affaires,
      status: "demande",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Demande envoyée",
        description: "Votre chargé d'affaires reviendra vers vous sous 4 heures.",
      });
      setSelectedTender(null);
      onRequestCreated();
    }
  };

  const isNew = (h: number) => h < 48;

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1 text-primary">Opportunités</h1>
            <p className="text-sm text-muted-foreground">
              Données BOAMP en temps réel
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={loading}
            className="shrink-0"
            aria-label="Rafraîchir"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {lastUpdate && (
          <div className="text-xs text-muted-foreground">
            Mis à jour {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true, locale: fr })}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : tenders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Aucune opportunité pour le moment
          </div>
        ) : (
          <div className="space-y-4">
            {tenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <h3 className="font-semibold text-sm flex-1 leading-tight text-foreground">
                    {tender.title}
                  </h3>
                  {isNew(tender.hoursAgo) && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary shrink-0">
                      <Zap className="w-3 h-3" />
                      il y a {tender.hoursAgo}h
                    </span>
                  )}
                </div>

                {tender.summary && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tender.summary.length > 100 ? `${tender.summary.slice(0, 100)}…` : tender.summary}
                  </p>
                )}

                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-primary hover:text-primary/80 font-normal"
                  onClick={() => navigate(`/tender-details?id=${tender.id}`)}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Lire le résumé de l'appel d'offres
                </Button>

                {tender.organisme && (
                  <div className="text-xs">
                    <span className="font-medium text-foreground">{tender.organisme}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {tender.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{tender.location}</span>
                    </div>
                  )}
                  {tender.budget && (
                    <div className="flex items-center gap-1.5">
                      <Euro className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{tender.budget}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {tender.deadline ? (
                      <span className="text-muted-foreground">Date limite : {tender.deadline}</span>
                    ) : (
                      <button
                        onClick={() => navigate(`/tender-details?id=${tender.id}`)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        Date limite
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Compatibilité</span>
                    <span className="font-semibold text-primary">
                      {tender.compatibility != null ? `${tender.compatibility}%` : "N/A"}
                    </span>
                  </div>
                  <Progress value={tender.compatibility ?? 0} className="h-1.5" />
                </div>

                <Button
                  className="w-full h-11 text-sm font-semibold"
                  onClick={() => setSelectedTender(tender)}
                >
                  Demander une réponse
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

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
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button onClick={handleConfirm} className="flex-1" disabled={submitting}>
              {submitting ? "..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddTenderDialog open={addOpen} onOpenChange={setAddOpen} onCreated={refetch} />
    </>
  );
}
