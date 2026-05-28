import { useEffect, useState } from "react";
import { Building2, FolderOpen, Trophy, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  companies: number;
  dossiers_total: number;
  dossiers_en_cours: number;
  dossiers_gagnes: number;
}

interface RecentRequest {
  id: string;
  status: string;
  created_at: string;
  tender: { title: string } | null;
  company: { name: string } | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  demande:  { label: "Demandé",  color: "#0c1c98", bg: "#e0e4ff" },
  en_cours: { label: "En cours", color: "#d97706", bg: "#fef3c7" },
  soumis:   { label: "Soumis",   color: "#0891b2", bg: "#e0f2fe" },
  gagne:    { label: "Gagné",    color: "#059669", bg: "#d1fae5" },
  perdu:    { label: "Perdu",    color: "#dc2626", bg: "#fee2e2" },
};

interface Props {
  userId: string;
  onNavigate: (s: string) => void;
}

export function CAOverview({ userId, onNavigate }: Props) {
  const [stats, setStats] = useState<Stats>({ companies: 0, dossiers_total: 0, dossiers_en_cours: 0, dossiers_gagnes: 0 });
  const [recent, setRecent] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [companiesRes, requestsRes] = await Promise.all([
        supabase.from("companies").select("id", { count: "exact", head: true }).eq("assigned_charge_affaires", userId),
        supabase.from("tender_requests").select("id, status, created_at, tender:tenders(title), company:companies(name)")
          .eq("charge_affaires_id", userId).order("created_at", { ascending: false }).limit(20),
      ]);

      const requests = (requestsRes.data ?? []) as RecentRequest[];
      setStats({
        companies: companiesRes.count ?? 0,
        dossiers_total: requests.length,
        dossiers_en_cours: requests.filter(r => r.status === "en_cours").length,
        dossiers_gagnes: requests.filter(r => r.status === "gagne").length,
      });
      setRecent(requests.slice(0, 6));
      setLoading(false);
    };
    load();
  }, [userId]);

  const statCards = [
    { icon: Building2, label: "Entreprises assignées", value: stats.companies,       color: "#0c1c98", bg: "#e0e4ff", section: "companies" },
    { icon: FolderOpen, label: "Dossiers actifs",      value: stats.dossiers_en_cours, color: "#d97706", bg: "#fef3c7", section: "dossiers" },
    { icon: Trophy,     label: "Marchés gagnés",       value: stats.dossiers_gagnes,   color: "#059669", bg: "#d1fae5", section: "dossiers" },
    { icon: TrendingUp, label: "Dossiers total",        value: stats.dossiers_total,    color: "#6366f1", bg: "#ede9fe", section: "dossiers" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color, bg, section }) => (
          <button
            key={label}
            onClick={() => onNavigate(section)}
            className="bg-white rounded-2xl p-5 text-left shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : value}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
          </button>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Activité récente</h2>
          <button
            onClick={() => onNavigate("dossiers")}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun dossier pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map(r => {
              const s = STATUS_LABEL[r.status] ?? { label: r.status, color: "#6b7280", bg: "#f3f4f6" };
              return (
                <div key={r.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {r.tender?.title ?? "Dossier"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.company?.name ?? "Entreprise"} · {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                        style={{ backgroundColor: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
