import { useEffect, useState } from "react";
import { MapPin, Calendar, Euro, ChevronRight, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { Skeleton } from "@/components/ui/skeleton";

interface RequestRow {
  id: string;
  status: "demande" | "en_cours" | "soumis" | "gagne" | "perdu" | string;
  created_at: string;
  charge_affaires_id: string | null;
  tender: {
    id: string;
    title: string;
    location: string | null;
    budget: string | null;
    deadline: string | null;
  } | null;
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

interface Props {
  onOpenDossier: (id: string) => void;
}

export function MesDossiers({ onOpenDossier }: Props) {
  const { user } = useAuth();
  const { company } = useCurrentCompany();
  const [filter, setFilter] = useState<string>("all");
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      // For entreprise: filter by company; for charge_affaires: by charge_affaires_id
      let query = supabase
        .from("tender_requests")
        .select("id, status, created_at, charge_affaires_id, tender:tenders(id,title,location,budget,deadline)")
        .order("created_at", { ascending: false });

      if (company) {
        query = query.eq("company_id", company.id);
      } else {
        query = query.eq("charge_affaires_id", user.id);
      }
      const { data } = await query;
      setRows((data ?? []) as any);
      setLoading(false);
    };
    load();
  }, [user?.id, company?.id]);

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold mb-1 text-primary">Mes dossiers</h1>
        <p className="text-sm text-muted-foreground">Suivez vos demandes de réponse</p>
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

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Aucun dossier pour le moment
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => onOpenDossier(r.id)}
              className="w-full bg-card border border-border rounded-lg p-4 space-y-2 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm flex-1 leading-tight">
                  {r.tender?.title ?? "Appel d'offres"}
                </h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white shrink-0"
                  style={{ backgroundColor: STATUS_COLOR[r.status] ?? "#0c1c98" }}
                >
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                {r.tender?.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{r.tender.location}</span>
                  </div>
                )}
                {r.tender?.budget && (
                  <div className="flex items-center gap-1.5">
                    <Euro className="w-3.5 h-3.5" />
                    <span>{r.tender.budget}</span>
                  </div>
                )}
                {r.tender?.deadline && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date limite : {r.tender.deadline}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-xs text-primary">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ouvrir le dossier
                </div>
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
