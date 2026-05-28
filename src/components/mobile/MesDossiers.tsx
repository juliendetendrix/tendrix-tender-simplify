/**
 * MesDossiers
 * Affiche les dossiers réels de l'entreprise (table tender_requests),
 * avec l'appel d'offres lié et l'état de l'analyse IA (en cours / verdict).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Euro, MessageSquare, FolderOpen, Loader2, Sparkles } from "lucide-react";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useDossiers } from "@/hooks/useDossiers";
import { Skeleton } from "@/components/ui/skeleton";

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

const VERDICT_UI: Record<string, { label: string; bg: string; color: string }> = {
  go:              { label: "GO",              bg: "#dcfce7", color: "#16a34a" },
  go_with_reserve: { label: "GO AVEC RÉSERVE", bg: "#fef3c7", color: "#b45309" },
  no_go:           { label: "NO GO",           bg: "#fee2e2", color: "#dc2626" },
};

const IN_PROGRESS = ["pending", "scraping", "analyzing", "manual_intervention_required"];

interface Props {
  onOpenChat: (id: string, title: string) => void;
}

export function MesDossiers({ onOpenChat }: Props) {
  const navigate = useNavigate();
  const { company } = useCurrentCompany();
  const { dossiers, loading } = useDossiers(company?.id);
  const [filter, setFilter] = useState<string>("all");

  const stats = {
    total: dossiers.length,
    gagnes: dossiers.filter((d) => d.status === "gagne").length,
    perdus: dossiers.filter((d) => d.status === "perdu").length,
  };
  const tauxReussite =
    stats.total > 0 ? Math.round((stats.gagnes / stats.total) * 100) : 0;

  const filtered =
    filter === "all"
      ? dossiers
      : filter === "analyse"
      ? dossiers.filter((d) => d.analysisStatus && IN_PROGRESS.includes(d.analysisStatus))
      : dossiers.filter((d) => d.status === filter);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold mb-1 text-primary">Mes dossiers</h1>
        <p className="text-sm text-muted-foreground">Suivez vos demandes et analyses</p>
      </div>

      {/* Bloc statistiques */}
      <div className="bg-white border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-semibold text-sm">Statistiques</h2>
          {company?.name && (
            <span className="text-xs text-muted-foreground truncate">{company.name}</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-md bg-primary/5">
            <div className="text-2xl font-bold text-primary leading-none">{stats.total}</div>
            <div className="text-[11px] text-muted-foreground mt-1 leading-tight">Dossiers</div>
          </div>
          <div className="text-center p-2 rounded-md bg-emerald-50">
            <div className="text-2xl font-bold text-emerald-600 leading-none">{stats.gagnes}</div>
            <div className="text-[11px] text-muted-foreground mt-1 leading-tight">Remportés</div>
          </div>
          <div className="text-center p-2 rounded-md bg-slate-100">
            <div className="text-2xl font-bold text-slate-500 leading-none">{stats.perdus}</div>
            <div className="text-[11px] text-muted-foreground mt-1 leading-tight">Refusés</div>
          </div>
        </div>

        <div className="rounded-md bg-secondary/15 p-3">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-medium text-foreground">Taux de réussite</span>
            <span className="text-lg font-bold text-secondary-foreground">{tauxReussite}%</span>
          </div>
          <div className="h-2 rounded-full bg-white overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${tauxReussite}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { v: "all", label: "Tous" },
          { v: "analyse", label: "En cours d'analyse" },
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
              filter === f.v
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste / chargement / vide */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Aucun dossier pour l'instant</p>
            <p className="text-xs text-muted-foreground mt-1">
              Lancez une analyse ou demandez une réponse pour commencer.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const verdict = r.analysisVerdict ? VERDICT_UI[r.analysisVerdict] : null;
            const analysisInProgress = r.analysisStatus && IN_PROGRESS.includes(r.analysisStatus);
            const verdictReady = r.analysisStatus === "completed" && r.analysisId;
            // Verdict prêt → fiche analyse. Analyse en cours → page résumé de l'AO
            // (qui affiche "Analyse en cours…"). Sinon → ouverture du chat.
            const openDossier = () => {
              if (verdictReady) navigate(`/analysis?id=${r.analysisId}`);
              else if (analysisInProgress) navigate(`/tender-details?id=${r.tender_id}`);
              else onOpenChat(r.id, r.title);
            };
            return (
              <div
                key={r.id}
                className="w-full bg-card border border-border rounded-lg p-4 space-y-2"
              >
                <button
                  type="button"
                  onClick={openDossier}
                  className="w-full text-left space-y-2 hover:opacity-90 transition-opacity"
                >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm flex-1 leading-tight">{r.title}</h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white shrink-0"
                    style={{ backgroundColor: STATUS_COLOR[r.status] ?? "#94a3b8" }}
                  >
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  {r.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{r.location}</span>
                    </div>
                  )}
                  {r.budget && (
                    <div className="flex items-center gap-1.5">
                      <Euro className="w-3.5 h-3.5" />
                      <span>{r.budget}</span>
                    </div>
                  )}
                  {r.deadline && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Date limite : {r.deadline}</span>
                    </div>
                  )}
                </div>
                </button>

                {/* État de l'analyse IA */}
                {analysisInProgress && (
                  <button
                    type="button"
                    onClick={openDossier}
                    className="w-full flex items-center gap-1.5 text-xs font-semibold rounded-md px-2.5 py-1.5"
                    style={{ backgroundColor: "#eef0ff", color: "#0c1c98" }}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyse en cours…
                  </button>
                )}
                {verdict && r.analysisStatus === "completed" && r.analysisId && (
                  <button
                    onClick={() => navigate(`/analysis?id=${r.analysisId}`)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold rounded-md px-2.5 py-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: verdict.bg, color: verdict.color }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {verdict.label} · Voir la fiche analyse
                  </button>
                )}

                <button
                  onClick={() => onOpenChat(r.id, r.title)}
                  className="w-full mt-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium rounded-md py-2 hover:bg-primary/90 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ouvrir le chat
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
