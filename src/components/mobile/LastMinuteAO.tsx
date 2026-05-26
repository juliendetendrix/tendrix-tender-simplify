import { useState } from "react";
import { MapPin, Euro, RefreshCw, FileText, Hourglass } from "lucide-react";

type MarketType = "Travaux" | "Services" | "Fournitures" | "Marché public";

function getMarketType(text: string | null | undefined): MarketType {
  const t = (text ?? "").toLowerCase();
  if (/fourniture/.test(t)) return "Fournitures";
  if (/travaux|construction|rénovation|renovation|maçonnerie|maconnerie/.test(t)) return "Travaux";
  if (/service/.test(t)) return "Services";
  return "Marché public";
}

function getDeadlineInfo(deadline: string | null) {
  if (!deadline) {
    return { label: "Date non précisée", message: null as string | null, color: "#9ca3af" };
  }
  const d = new Date(deadline);
  if (isNaN(d.getTime())) {
    return { label: "Date non précisée", message: null, color: "#9ca3af" };
  }
  const diffMs = d.getTime() - Date.now();
  if (diffMs <= 0) {
    return { label: "Clôturé", message: "Cet appel d'offres est terminé.", color: "#9ca3af" };
  }
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) {
    return { label: `Plus que ${hours} h`, message: "Vous pouvez encore tenter, mais dépêchez-vous !", color: "#ea580c" };
  }
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 30) {
    return { label: `Plus que ${days} j`, message: "Vous êtes encore dans les temps.", color: "#16a34a" };
  }
  const months = Math.floor(days / 30);
  return {
    label: months <= 1 ? "Plus qu'un mois" : `Plus que ${months} mois`,
    message: "Vous êtes encore dans les temps.",
    color: "#16a34a",
  };
}
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
  const { tenders, loading, refetch } = useBoampTenders();
  const [selectedTender, setSelectedTender] = useState<BoampTender | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

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

  

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1 text-primary">
              Bonjour{company?.contact_name ? ` ${company.contact_name}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Voici les récentes opportunités recommandées pour votre entreprise
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
            {tenders.slice(0, visibleCount).flatMap((tender, idx) => {
              const items: JSX.Element[] = [];
              if (idx === 3) {
                items.push(
                  <div
                    key="top-ca"
                    className="bg-card border-2 border-secondary rounded-lg p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-foreground">
                        Top chargés d'affaires
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        Taux de réussite
                      </span>
                    </div>

                    <div className="space-y-1">
                      {[
                        { rank: 1, name: "Marc Lefèvre", rate: 78, photo: "https://i.pravatar.cc/64?img=12" },
                        { rank: 2, name: "Sophie Martin", rate: 72, photo: "https://i.pravatar.cc/64?img=47" },
                        { rank: 3, name: "Antoine Garnier", rate: 68, photo: null },
                        { rank: 4, name: "Claire Bernard", rate: 64, photo: "https://i.pravatar.cc/64?img=32" },
                      ].map((ca) => (
                        <div
                          key={ca.rank}
                          className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                        >
                          <div className="w-6 text-center text-sm font-bold text-muted-foreground shrink-0">
                            {ca.rank}
                          </div>
                          {ca.photo ? (
                            <img
                              src={ca.photo}
                              alt={ca.name}
                              loading="lazy"
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                              {ca.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                          )}
                          <div className="flex-1 text-sm font-medium text-foreground truncate">
                            {ca.name}
                          </div>
                          <div className="text-sm font-bold text-secondary-foreground bg-secondary/20 px-2 py-0.5 rounded-md">
                            {ca.rate}%
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm border-primary/30 text-primary hover:bg-primary/5"
                    >
                      Choisir un top chargé d'affaires
                    </Button>
                  </div>
                );
              }
              const marketType = getMarketType(`${tender.title} ${tender.summary ?? ""} ${tender.famille ?? ""}`);
              const deadlineInfo = getDeadlineInfo(tender.deadline);
              const score = tender.compatibility ?? 100;
              items.push(
                <div
                  key={tender.id}
                  className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[11px] font-bold px-3 py-1"
                      style={{ borderRadius: 20, backgroundColor: "#eef0ff", color: "#0c1c98" }}
                    >
                      {marketType}
                    </span>
                    <span
                      className="text-[11px] font-bold px-3 py-1 text-white"
                      style={{ borderRadius: 20, backgroundColor: "#0c1c98" }}
                    >
                      {score}% compatible
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <h3 className="font-semibold text-sm flex-1 leading-tight text-foreground">
                      {tender.title}
                    </h3>
                  </div>


                  {tender.summary && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tender.summary.length > 100 ? `${tender.summary.slice(0, 100)}…` : tender.summary}
                    </p>
                  )}

                  {tender.organisme && (
                    <div className="flex items-start gap-1.5 text-xs">
                      <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#0c1c98" }} />
                      <span className="font-medium text-foreground">{tender.organisme}</span>
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    {tender.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" style={{ color: "#f9bd43" }} />
                        <span className="text-muted-foreground">{tender.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Euro className="w-3.5 h-3.5" style={{ color: "#ea580c" }} />
                      {tender.budget ? (
                        <span className="text-muted-foreground">{tender.budget}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Budget estimé IA :{" "}
                          <span className="font-medium text-foreground">{estimateBudget(tender)}</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold" style={{ color: deadlineInfo.color }}>
                        <Hourglass className="w-3.5 h-3.5" />
                        <span>{deadlineInfo.label}</span>
                      </div>
                      {deadlineInfo.message && (
                        <div className="text-[11px] mt-0.5 ml-5" style={{ color: deadlineInfo.color }}>
                          {deadlineInfo.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Button
                      variant="outline"
                      className="w-full h-11 text-sm font-semibold border-primary/30 text-primary hover:bg-primary/5"
                      onClick={() => navigate(`/tender-details?id=${tender.id}`)}
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      Lire le résumé de l'appel d'offres
                    </Button>
                    <Button
                      className="w-full h-11 text-sm font-semibold text-white border-0 hover:opacity-90"
                      style={{ backgroundColor: "#ea580c" }}
                      onClick={() => setSelectedTender(tender)}
                    >
                      Demander une réponse
                    </Button>
                  </div>
                </div>
              );

              return items;
            })}
            {visibleCount < tenders.length && (
              <Button
                variant="outline"
                className="w-full h-11 text-sm font-semibold border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => setVisibleCount((c) => c + 5)}
              >
                Charger plus d'opportunités
              </Button>
            )}
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

      <AddTenderDialog open={addOpen} onOpenChange={onAddOpenChange} onCreated={refetch} />
    </>
  );
}
