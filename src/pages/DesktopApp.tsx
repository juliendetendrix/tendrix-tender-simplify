import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useCredits } from "@/hooks/useCredits";
import { useBoampTenders, type BoampTender } from "@/hooks/useBoampTenders";
import { useDossiers } from "@/hooks/useDossiers";
import { useCAProfile } from "@/hooks/useCAProfile";
import { CompanyProfile } from "@/components/mobile/CompanyProfile";
import { Tarification } from "@/components/mobile/Tarification";
import { AddTenderDialog } from "@/components/mobile/AddTenderDialog";
import { PurchaseSuccessDialog } from "@/components/mobile/PurchaseSuccessDialog";
import { DemoChat } from "@/components/mobile/DemoChat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";
import {
  Home, Briefcase, FileSearch, Sparkles, Building2, Coins, Plus, Search, Loader2,
  MapPin, Calendar, Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, ChevronRight, MessageSquare, History,
} from "lucide-react";

type Page = "accueil" | "marches" | "analyses" | "reponses" | "entreprise";
const BLUE = "#0c1c98";
const YELLOW = "#f9bd43";
const ANALYSIS_COST = 1; // crédit déduit par la RPC (à aligner sur la grille plus tard)

const VERDICT: Record<string, { label: string; bg: string; color: string; Icon: typeof CheckCircle2 }> = {
  go: { label: "GO", bg: "#dcfce7", color: "#16a34a", Icon: CheckCircle2 },
  go_with_reserve: { label: "GO AVEC RÉSERVE", bg: "#fef3c7", color: "#b45309", Icon: AlertTriangle },
  no_go: { label: "NO GO", bg: "#fee2e2", color: "#dc2626", Icon: XCircle },
};
const IN_PROGRESS = ["pending", "scraping", "analyzing", "manual_intervention_required"];

export default function DesktopApp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { company } = useCurrentCompany();
  const { credits } = useCredits();
  const { ca, initials: caInitials } = useCAProfile();
  const { tenders, loading: tendersLoading, refetch } = useBoampTenders();
  const { dossiers } = useDossiers(company?.id);

  const [page, setPage] = useState<Page>("accueil");
  const [entTab, setEntTab] = useState<"profil" | "plans" | "historique">("profil");
  const [addOpen, setAddOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [openedChat, setOpenedChat] = useState<{ id: string; title: string; isCADirect?: boolean } | null>(null);
  const [query, setQuery] = useState("");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [confirmT, setConfirmT] = useState<BoampTender | null>(null);
  const [launching, setLaunching] = useState(false);

  // Retour de paiement Stripe
  const purchaseHandled = useRef(false);
  useEffect(() => {
    if (purchaseHandled.current) return;
    const p = searchParams.get("purchase");
    if (!p) return;
    purchaseHandled.current = true;
    if (p === "success") { setPage("entreprise"); setPurchaseOpen(true); }
  }, [searchParams]);

  const launch = async () => {
    const t = confirmT;
    if (!t) return;
    if (!company) { toast({ title: "Profil incomplet", description: "Terminez la création de votre entreprise.", variant: "destructive" }); return; }
    setLaunching(true);
    const { data: analysisId, error } = await supabase.rpc("spend_credit_and_start_analysis", {
      _company_id: company.id, _tender_id: t.id, _title: t.title, _organisme: t.organisme,
      _location: t.location, _budget: t.budget, _deadline: t.deadline || null,
      _date_publication: t.datePublication, _famille: t.famille, _procedure: t.procedure,
      _cpv_codes: t.cpvCodes, _source_url: t.url, _buyer_profile_url: t.url, _raw: t.raw ?? {}, _selected_lots: [],
    });
    setLaunching(false); setConfirmT(null);
    if (error) {
      toast(error.message?.includes("insufficient_credits")
        ? { title: "Crédits insuffisants", description: "Rechargez pour lancer une analyse.", variant: "destructive" }
        : { title: "Analyse non lancée", description: "Réessayez.", variant: "destructive" });
      return;
    }
    if (analysisId) {
      supabase.functions.invoke("resolve-dce", { body: { analysis_id: analysisId } }).catch(() => {});
      supabase.functions.invoke("start-scrape", { body: { analysis_id: analysisId } }).catch(() => {});
      supabase.functions.invoke("notify-ca", { body: { analysis_id: analysisId } }).catch(() => {});
      navigate(`/analysis?id=${analysisId}`);
    }
  };

  const NAV: { id: Page; label: string; icon: typeof Home }[] = [
    { id: "accueil", label: "Accueil", icon: Home },
    { id: "marches", label: "Marchés", icon: Briefcase },
    { id: "analyses", label: "Analyses", icon: FileSearch },
    { id: "reponses", label: "Réponses", icon: Sparkles },
    { id: "entreprise", label: "Mon entreprise", icon: Building2 },
  ];

  const visibleTenders = tenders.filter((t) =>
    !hidden.has(t.id) && (!query || `${t.title} ${t.organisme ?? ""} ${t.location ?? ""}`.toLowerCase().includes(query.toLowerCase())));

  const analyses = dossiers.filter((d) => d.analysisId);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <PurchaseSuccessDialog open={purchaseOpen} onOpenChange={setPurchaseOpen} onCompleteProfile={() => { setPurchaseOpen(false); setPage("entreprise"); setEntTab("profil"); }} />
      <AddTenderDialog open={addOpen} onOpenChange={setAddOpen} onCreated={() => { setAddOpen(false); setPage("analyses"); }} />

      {/* Confirmation lancement analyse */}
      <Dialog open={!!confirmT} onOpenChange={(o) => !o && setConfirmT(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Lancer l'analyse IA</DialogTitle>
            <DialogDescription>{confirmT?.title}</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border p-3 text-sm flex items-center justify-between" style={{ backgroundColor: "#eef0ff", borderColor: "#c7ccff" }}>
            <span className="text-muted-foreground">Coût de l'analyse</span>
            <span className="font-bold flex items-center gap-1" style={{ color: BLUE }}>{ANALYSIS_COST} crédit <Coins className="w-3.5 h-3.5" style={{ color: YELLOW }} /></span>
          </div>
          <p className="text-xs text-muted-foreground">Solde actuel : {credits} crédits</p>
          <Button onClick={launch} disabled={launching} className="w-full text-white" style={{ backgroundColor: BLUE }}>
            {launching ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
            Confirmer et lancer
          </Button>
        </DialogContent>
      </Dialog>

      {/* ─── Sidebar ─── */}
      <aside className="w-64 shrink-0 flex flex-col fixed inset-y-0 left-0" style={{ backgroundColor: BLUE }}>
        <div className="px-5 py-5 border-b border-white/10">
          <img src={tendrixLogo} alt="Tendrix" className="h-7 brightness-0 invert" />
        </div>
        <div className="px-3 pt-4">
          <button onClick={() => setAddOpen(true)} className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-bold mb-3" style={{ backgroundColor: YELLOW, color: BLUE }}>
            <Plus className="w-4 h-4" /> Ajouter un AO
          </button>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id;
            return (
              <button key={id} onClick={() => { setOpenedChat(null); setPage(id); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${active ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
                <Icon className="w-4.5 h-4.5 shrink-0" />{label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: YELLOW }} />}
              </button>
            );
          })}
          <button onClick={() => { setOpenedChat({ id: "ca", title: ca.display_name, isCADirect: true }); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white text-left">
            <MessageSquare className="w-4.5 h-4.5 shrink-0" /> Messages
          </button>
        </nav>
        <div className="p-3 border-t border-white/10 space-y-3">
          <button onClick={() => { setPage("entreprise"); setEntTab("plans"); }} className="w-full flex items-center justify-between gap-2 bg-white/10 hover:bg-white/15 px-3.5 py-2.5 rounded-xl transition-colors">
            <span className="flex items-center gap-2"><Coins className="w-4 h-4" style={{ color: YELLOW }} /><span className="text-sm font-bold text-white">{credits}</span><span className="text-xs text-white/70">crédits</span></span>
            <span className="text-sm font-bold" style={{ color: YELLOW }}>+</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0">{(company?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}</div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{company?.name ?? "Mon entreprise"}</p>
              <p className="text-white/50 text-[11px] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Contenu ─── */}
      <main className="flex-1 min-w-0 ml-64 overflow-y-auto">
        {openedChat ? (
          <div className="max-w-3xl mx-auto"><DemoChat dossierTitle={openedChat.title} onBack={() => setOpenedChat(null)} isCADirect={openedChat.isCADirect} ca={ca} caInitials={caInitials} /></div>
        ) : page === "entreprise" ? (
          <EntrepriseSection tab={entTab} setTab={setEntTab} />
        ) : (
          <div className="max-w-6xl mx-auto px-8 py-8">
            {page === "accueil" && <Accueil name={company?.contact_name} dossiers={dossiers} onOpen={(d) => d.analysisId && navigate(`/analysis?id=${d.analysisId}`)} goMarches={() => setPage("marches")} />}
            {page === "marches" && (
              <Marches
                tenders={visibleTenders} loading={tendersLoading} query={query} setQuery={setQuery}
                onRefresh={refetch} onHide={(id) => setHidden((s) => new Set(s).add(id))}
                onAnalyse={(t) => setConfirmT(t)} onImport={() => setAddOpen(true)}
              />
            )}
            {page === "analyses" && <Analyses analyses={analyses} onOpen={(d) => d.analysisId && navigate(`/analysis?id=${d.analysisId}`)} />}
            {page === "reponses" && <Reponses companyId={company?.id} onOpen={(id) => navigate(`/response?id=${id}`)} />}
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────── Accueil ───────────────────
function Accueil({ name, dossiers, onOpen, goMarches }: { name?: string | null; dossiers: any[]; onOpen: (d: any) => void; goMarches: () => void }) {
  const withDeadline = [...dossiers].filter((d) => d.deadline).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 6);
  const recent = dossiers.filter((d) => d.analysisId).slice(0, 6);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: BLUE }}>Bonjour {name?.split(" ")[0] ?? ""} 👋</h1>
        <p className="text-sm text-muted-foreground">Voici un aperçu de votre activité.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Échéances à venir" icon={Calendar}>
          {withDeadline.length === 0 ? <Empty text="Aucune échéance pour le moment." /> : (
            <div className="divide-y">
              {withDeadline.map((d) => (
                <button key={d.id} onClick={() => onOpen(d)} className="w-full flex items-center gap-3 py-2.5 text-left hover:opacity-80">
                  <Clock className="w-4 h-4 shrink-0" style={{ color: BLUE }} />
                  <span className="flex-1 text-sm text-foreground line-clamp-1">{d.title}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{d.deadline}</span>
                </button>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Analyses récentes" icon={FileSearch}>
          {recent.length === 0 ? (
            <div className="text-center py-6">
              <Empty text="Aucune analyse pour l'instant." />
              <Button onClick={goMarches} className="mt-3 text-white" style={{ backgroundColor: BLUE }}>Voir les marchés</Button>
            </div>
          ) : (
            <div className="divide-y">
              {recent.map((d) => {
                const v = d.analysisVerdict ? VERDICT[d.analysisVerdict] : null;
                return (
                  <button key={d.id} onClick={() => onOpen(d)} className="w-full flex items-center gap-3 py-2.5 text-left hover:opacity-80">
                    <span className="flex-1 text-sm text-foreground line-clamp-1">{d.title}</span>
                    {v ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: v.bg, color: v.color }}>{v.label}</span>
                       : <span className="text-[10px] text-muted-foreground">En cours…</span>}
                  </button>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

// ─────────────────── Marchés ───────────────────
function Marches({ tenders, loading, query, setQuery, onRefresh, onHide, onAnalyse, onImport }:
  { tenders: BoampTender[]; loading: boolean; query: string; setQuery: (s: string) => void; onRefresh: () => void; onHide: (id: string) => void; onAnalyse: (t: BoampTender) => void; onImport: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: BLUE }}>Marchés</h1>
        <button onClick={onRefresh} className="text-muted-foreground hover:text-primary"><RefreshCw className="w-5 h-5" /></button>
      </div>

      {/* Import + recherche */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un marché…" className="pl-9 h-11" />
        </div>
        <Button onClick={onImport} variant="outline" className="h-11"><Plus className="w-4 h-4 mr-1.5" /> Importer une URL / un PDF</Button>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
      ) : tenders.length === 0 ? (
        <Empty text="Aucune opportunité correspondant à votre profil pour le moment." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {tenders.map((t) => (
            <div key={t.id} className="rounded-xl border bg-white p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 flex-1">{t.title}</h3>
                {t.compatibility != null && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#eef0ff", color: BLUE }}>{t.compatibility}%</span>
                )}
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {t.organisme && <div className="line-clamp-1">{t.organisme}</div>}
                <div className="flex items-center gap-3 flex-wrap">
                  {t.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{t.location}</span>}
                  {t.deadline && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{t.deadline}</span>}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onHide(t.id)}>Ne plus afficher</Button>
                <Button size="sm" className="flex-1 text-white" style={{ backgroundColor: BLUE }} onClick={() => onAnalyse(t)}>
                  <Sparkles className="w-4 h-4 mr-1.5" /> Lancer l'analyse
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────── Analyses ───────────────────
function Analyses({ analyses, onOpen }: { analyses: any[]; onOpen: (d: any) => void }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold" style={{ color: BLUE }}>Analyses</h1>
      {analyses.length === 0 ? <Empty text="Aucune analyse. Lancez-en une depuis l'onglet Marchés." /> : (
        <div className="space-y-3">
          {analyses.map((d) => {
            const v = d.analysisVerdict ? VERDICT[d.analysisVerdict] : null;
            const inProgress = d.analysisStatus && IN_PROGRESS.includes(d.analysisStatus);
            return (
              <button key={d.id} onClick={() => onOpen(d)} className="w-full rounded-xl border bg-white p-4 flex items-center gap-4 text-left hover:shadow-sm transition-shadow">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1">{d.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {d.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{d.location}</span>}
                    {d.deadline && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{d.deadline}</span>}
                  </div>
                </div>
                {v ? <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: v.bg, color: v.color }}><v.Icon className="w-3.5 h-3.5" />{v.label}</span>
                  : inProgress ? <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" />En cours…</span>
                  : <span className="text-xs text-muted-foreground">—</span>}
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────── Réponses ───────────────────
function Reponses({ companyId, onOpen }: { companyId?: string; onOpen: (id: string) => void }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from("tender_responses").select("id, status, created_at, content").eq("company_id", companyId).order("created_at", { ascending: false });
    setRows(data ?? []); setLoading(false);
  }, [companyId]);
  useEffect(() => { load(); }, [load]);
  if (loading) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold" style={{ color: BLUE }}>Réponses</h1>
      {rows.length === 0 ? <Empty text='Aucune réponse générée. Cliquez "Répondre à ce marché" sur une fiche analyse.' /> : (
        <div className="space-y-3">
          {rows.map((r) => (
            <button key={r.id} onClick={() => onOpen(r.id)} className="w-full rounded-xl border bg-white p-4 flex items-center gap-4 text-left hover:shadow-sm transition-shadow">
              <Sparkles className="w-5 h-5 shrink-0" style={{ color: BLUE }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground line-clamp-1">{r.content?.synthese ? r.content.synthese : "Dossier de réponse"}</h3>
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <span className="text-xs font-medium" style={{ color: r.status === "ready" ? "#16a34a" : r.status === "failed" ? "#dc2626" : "#b45309" }}>
                {r.status === "ready" ? "Prête" : r.status === "failed" ? "Échec" : "En cours…"}
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────── Entreprise ───────────────────
function EntrepriseSection({ tab, setTab }: { tab: "profil" | "plans" | "historique"; setTab: (t: "profil" | "plans" | "historique") => void }) {
  return (
    <div>
      <div className="border-b bg-white px-8 pt-5">
        <div className="max-w-5xl mx-auto flex gap-6">
          {([["profil", "Profil & Librairie"], ["plans", "Plans & Factures"], ["historique", "Historique"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`pb-3 text-sm font-semibold border-b-2 -mb-px ${tab === id ? "border-current" : "border-transparent text-muted-foreground"}`} style={tab === id ? { color: BLUE } : undefined}>{label}</button>
          ))}
        </div>
      </div>
      {tab === "profil" && <CompanyProfile onBack={() => setTab("plans")} />}
      {tab === "plans" && <Tarification onBack={() => setTab("profil")} />}
      {tab === "historique" && <Historique />}
    </div>
  );
}

function Historique() {
  const { company } = useCurrentCompany();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!company?.id) return;
    supabase.from("credit_transactions").select("amount, reason, created_at").eq("company_id", company.id).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setRows(data ?? []));
  }, [company?.id]);
  const labelOf = (r: string) => ({ analysis: "Analyse", response: "Réponse", purchase: "Achat de crédits", refund: "Remboursement" } as Record<string, string>)[r] ?? r;
  return (
    <div className="max-w-5xl mx-auto px-8 py-6">
      <h2 className="text-lg font-bold mb-4" style={{ color: BLUE }}>Consommation des crédits</h2>
      {rows.length === 0 ? <Empty text="Aucune transaction." /> : (
        <div className="rounded-xl border bg-white divide-y">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
              <div><span className="font-medium text-foreground">{labelOf(r.reason)}</span><span className="text-xs text-muted-foreground ml-2">{new Date(r.created_at).toLocaleString("fr-FR")}</span></div>
              <span className="font-bold flex items-center gap-1" style={{ color: r.amount >= 0 ? "#16a34a" : "#dc2626" }}>{r.amount >= 0 ? "+" : ""}{r.amount} <Coins className="w-3.5 h-3.5" style={{ color: YELLOW }} /></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────── helpers ───────────────────
function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Home; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: BLUE }}><Icon className="w-4 h-4" />{title}</h2>
      {children}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground text-center py-6">{text}</p>;
}
