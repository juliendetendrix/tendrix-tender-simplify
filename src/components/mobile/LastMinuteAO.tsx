import { useState } from "react";
import { MapPin, Calendar, Euro, Zap } from "lucide-react";
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

interface Tender {
  id: string;
  title: string;
  summary: string;
  location: string;
  budget: string;
  deadline: string;
  compatibility: number;
  isNew: boolean;
  hoursAgo?: number;
}

const mockTenders: Tender[] = [
  {
    id: "1",
    title: "Construction de 4 maisons individuelles",
    summary:
      "Projet de construction de 4 maisons individuelles avec garage intégré et aménagement paysager.",
    location: "Dordogne",
    budget: "320 000 € HT",
    deadline: "15 octobre 2025",
    compatibility: 82,
    isNew: true,
    hoursAgo: 12,
  },
  {
    id: "2",
    title: "Rénovation énergétique d'un groupe scolaire",
    summary:
      "Travaux d'isolation thermique, remplacement des menuiseries et installation de VMC double flux.",
    location: "Gironde",
    budget: "450 000 € HT",
    deadline: "22 octobre 2025",
    compatibility: 75,
    isNew: false,
  },
  {
    id: "3",
    title: "Construction d'une crèche municipale",
    summary:
      "Construction d'une crèche de 60 berceaux avec espaces de jeux extérieurs et parking.",
    location: "Lot-et-Garonne",
    budget: "1 200 000 € HT",
    deadline: "30 octobre 2025",
    compatibility: 91,
    isNew: true,
    hoursAgo: 3,
  },
  {
    id: "4",
    title: "Aménagement d'une zone d'activités",
    summary:
      "VRD, réseaux et aménagements paysagers pour une zone d'activités de 5 hectares.",
    location: "Charente",
    budget: "680 000 € HT",
    deadline: "8 novembre 2025",
    compatibility: 68,
    isNew: false,
  },
];

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
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

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

  return (
    <>
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "#0c1c98" }}>
            Dernières opportunités
          </h1>
          <p className="text-sm text-muted-foreground">
            Appels d'offres publiés récemment
          </p>
        </div>

        <div className="space-y-4">
          {mockTenders.map((tender) => (
            <div
              key={tender.id}
              className="bg-white border border-border rounded-lg p-4 space-y-3 shadow-sm"
            >
              {/* Title and New Badge */}
              <div className="flex items-start gap-2">
                <h3 className="font-semibold text-sm flex-1 leading-tight">
                  {tender.title}
                </h3>
                {tender.isNew && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#f9bd43]/20 text-[#f9bd43] shrink-0">
                    <Zap className="w-3 h-3" />
                    {tender.hoursAgo ? `${tender.hoursAgo}h` : "Nouveau"}
                  </span>
                )}
              </div>

              {/* Summary */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tender.summary}
              </p>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{tender.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Euro className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{tender.budget}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Date limite : {tender.deadline}
                  </span>
                </div>
              </div>

              {/* Compatibility */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Compatibilité</span>
                  <span className="font-semibold" style={{ color: "#0c1c98" }}>
                    {tender.compatibility}%
                  </span>
                </div>
                <Progress value={tender.compatibility} className="h-1.5" />
              </div>

              {/* CTA Button */}
              <Button
                className="w-full h-11 text-sm font-semibold"
                style={{ backgroundColor: "#0c1c98" }}
                onClick={() => setSelectedTender(tender)}
              >
                Demander une réponse
              </Button>
            </div>
          ))}
        </div>
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
              className="flex-1"
              style={{ backgroundColor: "#0c1c98" }}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
