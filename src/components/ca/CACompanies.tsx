import { useEffect, useState } from "react";
import { Building2, MapPin, Phone, Mail, FolderOpen, ChevronRight, UserPlus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  sector: string | null;
  zone: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  assigned_charge_affaires: string | null;
  owner_user_id: string;
  created_at: string;
  _request_count?: number;
}

interface Props {
  userId: string;
}

export function CACompanies({ userId }: Props) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [companyRequests, setCompanyRequests] = useState<Record<string, any[]>>({});

  const loadCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name, sector, zone, contact_name, contact_phone, assigned_charge_affaires, owner_user_id, created_at")
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    // Count requests per company
    const ids = data.map(c => c.id);
    const { data: reqData } = await supabase
      .from("tender_requests")
      .select("company_id, status")
      .in("company_id", ids);

    const countMap: Record<string, number> = {};
    (reqData ?? []).forEach(r => {
      countMap[r.company_id] = (countMap[r.company_id] ?? 0) + 1;
    });

    setCompanies(data.map(c => ({ ...c, _request_count: countMap[c.id] ?? 0 })));
    setLoading(false);
  };

  useEffect(() => {
    if (userId) loadCompanies();
  }, [userId]);

  const assignSelf = async (companyId: string) => {
    setAssigning(companyId);
    const { error } = await supabase
      .from("companies")
      .update({ assigned_charge_affaires: userId })
      .eq("id", companyId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assigné ✓", description: "Vous êtes maintenant le CA référent de cette entreprise." });
      loadCompanies();
      // Also assign on existing requests
      await supabase.from("tender_requests")
        .update({ charge_affaires_id: userId })
        .eq("company_id", companyId)
        .is("charge_affaires_id", null);
    }
    setAssigning(null);
  };

  const loadCompanyRequests = async (companyId: string) => {
    if (companyRequests[companyId]) return; // already loaded
    const { data } = await supabase
      .from("tender_requests")
      .select("id, status, created_at, tender:tenders(title, deadline, organisme)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setCompanyRequests(prev => ({ ...prev, [companyId]: data ?? [] }));
  };

  const handleExpand = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
      loadCompanyRequests(id);
    }
  };

  const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
    demande:  { label: "Demandé",  color: "#0c1c98", bg: "#e0e4ff" },
    en_cours: { label: "En cours", color: "#d97706", bg: "#fef3c7" },
    soumis:   { label: "Soumis",   color: "#0891b2", bg: "#e0f2fe" },
    gagne:    { label: "Gagné",    color: "#059669", bg: "#d1fae5" },
    perdu:    { label: "Perdu",    color: "#dc2626", bg: "#fee2e2" },
  };

  const myCompanies = companies.filter(c => c.assigned_charge_affaires === userId);
  const otherCompanies = companies.filter(c => c.assigned_charge_affaires !== userId);

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Entreprises</h1>
        <p className="text-muted-foreground mt-1">
          {myCompanies.length} entreprise{myCompanies.length > 1 ? "s" : ""} assignée{myCompanies.length > 1 ? "s" : ""}
          {otherCompanies.length > 0 && ` · ${otherCompanies.length} non assignée${otherCompanies.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-white border rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">

          {/* Mes entreprises */}
          {myCompanies.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Mes entreprises ({myCompanies.length})
              </h2>
              <div className="space-y-3">
                {myCompanies.map(c => (
                  <CompanyCard
                    key={c.id}
                    company={c}
                    isAssigned
                    expanded={expanded === c.id}
                    onExpand={() => handleExpand(c.id)}
                    requests={companyRequests[c.id]}
                    statusLabels={STATUS_LABEL}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Entreprises non assignées */}
          {otherCompanies.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Autres entreprises ({otherCompanies.length})
              </h2>
              <div className="space-y-3">
                {otherCompanies.map(c => (
                  <CompanyCard
                    key={c.id}
                    company={c}
                    isAssigned={false}
                    expanded={expanded === c.id}
                    onExpand={() => handleExpand(c.id)}
                    requests={companyRequests[c.id]}
                    statusLabels={STATUS_LABEL}
                    onAssign={() => assignSelf(c.id)}
                    assigning={assigning === c.id}
                  />
                ))}
              </div>
            </div>
          )}

          {companies.length === 0 && (
            <div className="bg-white rounded-2xl border p-12 text-center">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">Aucune entreprise enregistrée</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompanyCard({
  company, isAssigned, expanded, onExpand, requests, statusLabels, onAssign, assigning
}: {
  company: Company;
  isAssigned: boolean;
  expanded: boolean;
  onExpand: () => void;
  requests?: any[];
  statusLabels: Record<string, { label: string; color: string; bg: string }>;
  onAssign?: () => void;
  assigning?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
      isAssigned ? "border-primary/20" : "border-border"
    }`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isAssigned ? "bg-primary/10" : "bg-muted"
          }`}>
            <Building2 className={`w-6 h-6 ${isAssigned ? "text-primary" : "text-muted-foreground"}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-foreground">{company.name}</h3>
              {isAssigned && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Assigné
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {company.sector && (
                <span className="text-xs text-muted-foreground">{company.sector}</span>
              )}
              {company.zone && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />{company.zone}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              {company.contact_name && (
                <span className="text-xs text-foreground font-medium">{company.contact_name}</span>
              )}
              {company.contact_phone && (
                <a href={`tel:${company.contact_phone}`}
                   className="flex items-center gap-1 text-xs text-primary hover:underline"
                   onClick={e => e.stopPropagation()}>
                  <Phone className="w-3 h-3" />{company.contact_phone}
                </a>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FolderOpen className="w-3.5 h-3.5" />
              {company._request_count ?? 0} dossier{(company._request_count ?? 0) > 1 ? "s" : ""}
            </div>
            {!isAssigned && onAssign && (
              <button
                onClick={e => { e.stopPropagation(); onAssign(); }}
                disabled={assigning}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {assigning ? "…" : "Prendre en charge"}
              </button>
            )}
            <button
              onClick={onExpand}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Dossiers
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded requests */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 px-5 py-3">
          {!requests ? (
            <div className="py-2 text-xs text-muted-foreground animate-pulse">Chargement…</div>
          ) : requests.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Aucun dossier pour cette entreprise</p>
          ) : (
            <div className="space-y-2">
              {requests.map((r: any) => {
                const s = statusLabels[r.status] ?? { label: r.status, color: "#6b7280", bg: "#f3f4f6" };
                return (
                  <div key={r.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {r.tender?.title ?? "Dossier"}
                      </p>
                      {r.tender?.organisme && (
                        <p className="text-[11px] text-muted-foreground">{r.tender.organisme}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
