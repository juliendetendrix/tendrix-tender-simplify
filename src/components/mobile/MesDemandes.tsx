import { useState } from "react";
import { MapPin, Calendar, Euro, ChevronRight } from "lucide-react";
import { TenderRequest } from "@/pages/MobileApp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StatusFilter = "all" | "En attente" | "En cours" | "Terminée";

interface MesDemandesProps {
  requests: TenderRequest[];
}

export function MesDemandes({ requests }: MesDemandesProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedRequest, setSelectedRequest] = useState<TenderRequest | null>(null);

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((req) => req.status === filter);

  const getStatusColor = (status: TenderRequest["status"]) => {
    switch (status) {
      case "En attente":
        return "#f9bd43";
      case "En cours":
        return "#0c1c98";
      case "Terminée":
        return "#10b981";
    }
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "#0c1c98" }}>
            Mes demandes
          </h1>
          <p className="text-sm text-muted-foreground">
            Suivez vos demandes de réponse
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(["all", "En attente", "En cours", "Terminée"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? "text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              style={
                filter === f
                  ? { backgroundColor: "#0c1c98" }
                  : undefined
              }
            >
              {f === "all" ? "Toutes" : f}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Aucune demande pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <button
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className="w-full bg-white border border-border rounded-lg p-4 space-y-2 text-left hover:shadow-md transition-shadow"
              >
                {/* Title and Status */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm flex-1 leading-tight">
                    {request.tenderTitle}
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white shrink-0"
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </span>
                </div>

                {/* Meta Info */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{request.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Euro className="w-3.5 h-3.5" />
                    <span>{request.budget}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date limite : {request.deadline}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-end pt-1">
                  <ChevronRight className="w-4 h-4" style={{ color: "#0c1c98" }} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-[360px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base leading-tight">
              {selectedRequest?.tenderTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Status */}
            <div>
              <span className="text-xs text-muted-foreground">Statut</span>
              <div className="mt-1">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{
                    backgroundColor: selectedRequest
                      ? getStatusColor(selectedRequest.status)
                      : "#0c1c98",
                  }}
                >
                  {selectedRequest?.status}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{selectedRequest?.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-muted-foreground" />
                <span>{selectedRequest?.budget}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Date limite : {selectedRequest?.deadline}</span>
              </div>
            </div>

            {/* Message */}
            <div className="bg-[#0c1c98]/5 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                Votre chargé d'affaires travaille sur votre réponse. Vous serez
                notifié dès qu'elle sera prête.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
