import { useState } from "react";
import { MapPin, Calendar, Euro, MessageSquare } from "lucide-react";

interface DemoDossier {
  id: string;
  title: string;
  location: string;
  budget: string;
  deadline: string;
  status: "en_cours" | "soumis" | "gagne";
}

const STATUS_LABEL: Record<string, string> = {
  demande: "Demandé",
  en_cours: "En cours",
  soumis: "Soumis",
  gagne: "Gagné",
  perdu: "Perdu",
};

const STATUS_COLOR: Record<string, string> = {
  demande: "#f9bd43",
  en_cours: "#0c1c98",
  soumis: "#6366f1",
  gagne: "#10b981",
  perdu: "#94a3b8",
};

const DEMO_DOSSIERS: DemoDossier[] = [
  {
    id: "demo-1",
    title: "Rénovation façade école primaire Jean Moulin",
    location: "Versailles (78)",
    budget: "85 000 €",
    deadline: "15 juin 2026",
    status: "en_cours",
  },
  {
    id: "demo-2",
    title: "Construction mur de soutènement parking municipal",
    location: "Saint-Germain-en-Laye (78)",
    budget: "42 000 €",
    deadline: "28 mai 2026",
    status: "soumis",
  },
  {
    id: "demo-3",
    title: "Réfection maçonnerie gymnase communal",
    location: "Le Chesnay (78)",
    budget: "126 500 €",
    deadline: "10 mai 2026",
    status: "gagne",
  },
];

interface Props {
  onOpenChat: (id: string, title: string) => void;
}

export function MesDossiers({ onOpenChat }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all" ? DEMO_DOSSIERS : DEMO_DOSSIERS.filter((r) => r.status === filter);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold mb-1 text-primary">Mes dossiers</h1>
        <p className="text-sm text-muted-foreground">Suivez vos demandes de réponse</p>
      </div>

      <div className="bg-white border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-semibold text-sm">Statistiques</h2>
          <span className="text-xs text-muted-foreground truncate">Maçonnerie Dubois & Fils</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-md bg-primary/5">
            <div className="text-2xl font-bold text-primary leading-none">15</div>
            <div className="text-[11px] text-muted-foreground mt-1 leading-tight">Dossiers déposés</div>
          </div>
          <div className="text-center p-2 rounded-md bg-emerald-50">
            <div className="text-2xl font-bold text-emerald-600 leading-none">5</div>
            <div className="text-[11px] text-muted-foreground mt-1 leading-tight">Remportés</div>
          </div>
          <div className="text-center p-2 rounded-md bg-slate-100">
            <div className="text-2xl font-bold text-slate-500 leading-none">10</div>
            <div className="text-[11px] text-muted-foreground mt-1 leading-tight">Refusés</div>
          </div>
        </div>

        <div className="rounded-md bg-secondary/15 p-3">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-medium text-foreground">Taux de réussite</span>
            <span className="text-lg font-bold text-secondary-foreground">33%</span>
          </div>
          <div className="h-2 rounded-full bg-white overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: "33%" }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button className="text-xs font-medium px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Voir nos formations
          </button>
          <button className="text-xs font-medium px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors">
            Top chargés d'affaires
          </button>
        </div>
      </div>


      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { v: "all", label: "Tous" },
          { v: "demande", label: "Demandés" },
          { v: "en_cours", label: "En cours" },
          { v: "soumis", label: "Soumis" },
          { v: "gagne", label: "Gagnés" },
          { v: "perdu", label: "Perdus" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Aucun dossier dans cette catégorie
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="w-full bg-card border border-border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm flex-1 leading-tight">{r.title}</h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white shrink-0"
                  style={{ backgroundColor: STATUS_COLOR[r.status] }}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{r.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Euro className="w-3.5 h-3.5" />
                  <span>{r.budget}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date limite : {r.deadline}</span>
                </div>
              </div>

              <button
                onClick={() => onOpenChat(r.id, r.title)}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium rounded-md py-2 hover:bg-primary/90 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Ouvrir le chat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
