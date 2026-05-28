import { useEffect, useState } from "react";
import { Calendar, ChevronRight, FolderOpen, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DossierDetail } from "@/components/mobile/DossierDetail";

interface Request {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  tender: { title: string; deadline: string | null; organisme: string | null; location: string | null } | null;
  company: { name: string } | null;
}

const STATUSES = [
  { key: "all",      label: "Tous" },
  { key: "demande",  label: "Demandés" },
  { key: "en_cours", label: "En cours" },
  { key: "soumis",   label: "Soumis" },
  { key: "gagne",    label: "Gagnés" },
  { key: "perdu",    label: "Perdus" },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  demande:  { label: "Demandé",  color: "#0c1c98", bg: "#e0e4ff" },
  en_cours: { label: "En cours", color: "#d97706", bg: "#fef3c7" },
  soumis:   { label: "Soumis",   color: "#0891b2", bg: "#e0f2fe" },
  gagne:    { label: "Gagné",    color: "#059669", bg: "#d1fae5" },
  perdu:    { label: "Perdu",    color: "#dc2626", bg: "#fee2e2" },
};

interface Props {
  userId: string;
}

export function CADossiers({ userId }: Props) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tender_requests")
      .select("id, status, created_at, updated_at, tender:tenders(title,deadline,organisme,location), company:companies(name)")
      .eq("charge_affaires_id", userId)
      .order("updated_at", { ascending: false });
    setRequests((data ?? []) as any);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) load();
  }, [userId]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    const { error } = await supabase
      .from("tender_requests")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast({ title: "Statut mis à jour ✓" });
    }
    setUpdatingStatus(null);
  };

  const filtered = requests.filter(r => {
    const matchStatus = filter === "all" || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.tender?.title?.toLowerCase().includes(q)
      || r.company?.name?.toLowerCase().includes(q)
      || r.tender?.organisme?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (opened) {
    return (
      <div className="p-4">
        <div className="bg-white border rounded-2xl overflow-hidden">
          <DossierDetail requestId={opened} canManageAnalysis onBack={() => { setOpened(null); load(); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dossiers</h1>
        <p className="text-muted-foreground mt-1">{requests.length} dossier{requests.length > 1 ? "s" : ""} au total</p>
      </div>

      {/* Search + filters */}
      <div className="bg-white border border-border rounded-2xl p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un appel d'offres, une entreprise…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === s.key
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s.label}
              {s.key !== "all" && (
                <span className={`ml-1.5 ${filter === s.key ? "text-white/70" : "text-muted-foreground"}`}>
                  ({requests.filter(r => r.status === s.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white border rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <FolderOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">Aucun dossier trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const sm = STATUS_META[r.status] ?? { label: r.status, color: "#6b7280", bg: "#f3f4f6" };
            const deadlineDate = r.tender?.deadline ? new Date(r.tender.deadline) : null;
            const isUrgent = deadlineDate && (deadlineDate.getTime() - Date.now()) / 86400000 < 7;
            return (
              <div key={r.id} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                      {r.tender?.title ?? "Dossier"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-xs font-medium text-primary">{r.company?.name ?? "Entreprise"}</span>
                      {r.tender?.organisme && (
                        <span className="text-xs text-muted-foreground">{r.tender.organisme}</span>
                      )}
                      {deadlineDate && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? "text-red-600" : "text-muted-foreground"}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {isUrgent ? "⚡ " : ""}
                          {deadlineDate.toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Status dropdown */}
                    <div className="relative">
                      <select
                        value={r.status}
                        disabled={updatingStatus === r.id}
                        onChange={e => updateStatus(r.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="appearance-none cursor-pointer text-xs font-semibold px-3 py-1 rounded-full border-0 pr-6 focus:outline-none focus:ring-1 focus:ring-primary"
                        style={{ backgroundColor: sm.bg, color: sm.color }}
                      >
                        {Object.entries(STATUS_META).map(([key, s]) => (
                          <option key={key} value={key}>{s.label}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 pointer-events-none"
                                    style={{ color: sm.color }} />
                    </div>

                    <button
                      onClick={() => setOpened(r.id)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Ouvrir <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
