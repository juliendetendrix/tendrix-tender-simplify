import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useCredits } from "@/hooks/useCredits";
import { useBoampTenders, type BoampTender } from "@/hooks/useBoampTenders";
import { useDossiers } from "@/hooks/useDossiers";
import { useCAProfile } from "@/hooks/useCAProfile";
import AnalysisDetail from "./AnalysisDetail";
import ResponseDetail from "./ResponseDetail";
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
  MapPin, Calendar, Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, ChevronRight, MessageSquare, History, Phone, Mail, Star,
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
  // Fiche analyse / réponse affichée DANS le shell (sidebar persistante)
  const [view, setView] = useState<{ kind: "analysis" | "response"; id: string } | null>(null);

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
      setView({ kind: "analysis", id: analysisId as string });
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
              <button key={id} onClick={() => { setOpenedChat(null); setView(null); setPage(id); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${active ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
                <Icon className="w-4.5 h-4.5 shrink-0" />{label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: YELLOW }} />}
              </button>
            );
          })}
          <button onClick={() => { setView(null); setOpenedChat({ id: "ca", title: ca.display_name, isCADirect: true }); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white text-left">
            <MessageSquare className="w-4.5 h-4.5 shrink-0" /> Messages
          </button>
        </nav>
        <div className="p-3 border-t border-white/10 space-y-3">
          <button onClick={() => { setView(null); setPage("entreprise"); setEntTab("plans"); }} className="w-full flex items-center justify-between gap-2 bg-white/10 hover:bg-white/15 px-3.5 py-2.5 rounded-xl transition-colors">
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
        {view ? (
          view.kind === "analysis" ? (
            <AnalysisDetail analysisId={view.id} onBack={() => setView(null)} onOpenResponse={(rid) => setView({ kind: "response", id: rid })} />
          ) : (
            <ResponseDetail responseId={view.id} onBack={() => setView(null)} />
          )
        ) : openedChat ? (
          <div className="max-w-3xl mx-auto"><DemoChat dossierTitle={openedChat.title} onBack={() => setOpenedChat(null)} isCADirect={openedChat.isCADirect} ca={ca} caInitials={caInitials} /></div>
        ) : page === "entreprise" ? (
          <EntrepriseSection tab={entTab} setTab={setEntTab} />
        ) : (
          <div className="max-w-6xl mx-auto px-8 py-8">
            {page === "accueil" && (
              <Accueil
                name={company?.name ?? company?.contact_name}
                tenders={visibleTenders} ca={ca} caInitials={caInitials} dossiers={dossiers}
                onAnalyse={(t) => setConfirmT(t)}
                onOpen={(d) => d.analysisId && setView({ kind: "analysis", id: d.analysisId })}
                onChatCA={() => { setView(null); setOpenedChat({ id: "ca", title: ca.display_name, isCADirect: true }); }}
                goMarches={() => setPage("marches")}
              />
            )}
            {page === "marches" && (
              <Marches
                tenders={visibleTenders} loading={tendersLoading} query={query} setQuery={setQuery}
                onRefresh={refetch} onHide={(id) => setHidden((s) => new Set(s).add(id))}
                onAnalyse={(t) => setConfirmT(t)} onImport={() => setAddOpen(true)}
              />
            )}
            {page === "analyses" && <Analyses analyses={analyses} onOpen={(d) => d.analysisId && setView({ kind: "analysis", id: d.analysisId })} />}
            {page === "reponses" && <Reponses companyId={company?.id} onOpen={(rid) => setView({ kind: "response", id: rid })} />}
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────── Accueil (dashboard à blocs, branché réel) ───────────────────
const STATUS_TABS = [
  { id: "demande", label: "Demande émise", pct: 25 },
  { id: "en_cours", label: "En cours", pct: 50 },
  { id: "soumis", label: "Soumis", pct: 75 },
  { id: "gagne", label: "Remporté", pct: 100 },
] as const;

function Accueil({ name, tenders, ca, caInitials, dossiers, onAnalyse, onOpen, onChatCA, goMarches }:
  { name?: string | null; tenders: BoampTender[]; ca: any; caInitials: string; dossiers: any[]; onAnalyse: (t: BoampTender) => void; onOpen: (d: any) => void; onChatCA: () => void; goMarches: () => void }) {
  const [statusTab, setStatusTab] = useState<string>("demande");
  const lastMinute = tenders.slice(0, 4);
  const recent = dossiers.filter((d) => d.analysisId).slice(0, 4);
  const inStatus = dossiers.filter((d) => (d.status ?? "demande") === statusTab);
  const firstName = (ca?.display_name ?? "").split(" ")[0] || "votre chargé d'affaires";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Bonjour <span style={{ color: BLUE }}>{name?.split(" ")[0] ?? "Entreprise"}</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appels d'offres last minute */}
        <Panel title="Appels d'offres recommandés" icon={Clock} accent>
          {lastMinute.length === 0 ? (
            <div className="text-center py-4">
              <Empty text="Aucune recommandation pour le moment." />
              <Button onClick={goMarches} size="sm" className="mt-2 text-white" style={{ backgroundColor: BLUE }}>Voir les marchés</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {lastMinute.map((t) => (
                <button key={t.id} onClick={() => onAnalyse(t)} className="w-full text-left rounded-lg border p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{t.title}</p>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span className="line-clamp-1">{t.organisme ?? t.location ?? ""}</span>
                    {t.compatibility != null && <span className="font-bold shrink-0 ml-2" style={{ color: BLUE }}>{t.compatibility}%</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {/* Chargé d'affaires référent */}
        <Panel title="Mon chargé d'affaires référent" icon={Star} accent accentColor={YELLOW}>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            {ca?.photo_url ? <img src={ca.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              : <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold" style={{ color: BLUE }}>{caInitials}</div>}
            <div>
              <p className="font-bold text-foreground">{ca?.display_name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Chargé d'affaires</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {ca?.phone && <a href={`tel:${ca.phone}`} className="flex items-center justify-center gap-1.5 h-9 rounded-lg border text-sm font-medium hover:bg-muted"><Phone className="w-4 h-4" />Appeler</a>}
            {ca?.email && <a href={`mailto:${ca.email}`} className="flex items-center justify-center gap-1.5 h-9 rounded-lg border text-sm font-medium hover:bg-muted"><Mail className="w-4 h-4" />Email</a>}
          </div>
          <button onClick={onChatCA} className="w-full h-10 rounded-lg font-bold text-sm mt-2" style={{ backgroundColor: YELLOW, color: BLUE }}>
            Écrire un message à {firstName}
          </button>
        </Panel>

        {/* Dernières analyses */}
        <Panel title="Mes dernières analyses" icon={FileSearch}>
          {recent.length === 0 ? <Empty text="Aucune analyse pour l'instant." /> : (
            <div className="space-y-2">
              {recent.map((d) => {
                const v = d.analysisVerdict ? VERDICT[d.analysisVerdict] : null;
                return (
                  <button key={d.id} onClick={() => onOpen(d)} className="w-full text-left rounded-lg border p-3 hover:bg-muted/40 transition-colors flex items-center gap-2">
                    <span className="flex-1 text-sm text-foreground line-clamp-1">{d.title}</span>
                    {v ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: v.bg, color: v.color }}>{v.label}</span>
                       : <span className="text-[10px] text-muted-foreground shrink-0">En cours…</span>}
                  </button>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* Mes appels d'offres en cours (par statut) */}
      <Panel title="Mes appels d'offres en cours" icon={Briefcase}>
        <div className="flex gap-1 border-b mb-3 -mt-1">
          {STATUS_TABS.map((s) => (
            <button key={s.id} onClick={() => setStatusTab(s.id)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${statusTab === s.id ? "" : "border-transparent text-muted-foreground"}`}
              style={statusTab === s.id ? { borderColor: BLUE, color: BLUE } : undefined}>{s.label}</button>
          ))}
        </div>
        {inStatus.length === 0 ? <Empty text="Aucun dossier dans ce statut." /> : (
          <div className="space-y-3">
            {inStatus.map((d) => {
              const pct = STATUS_TABS.find((s) => s.id === statusTab)?.pct ?? 25;
              return (
                <button key={d.id} onClick={() => onOpen(d)} className="w-full text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground line-clamp-1">{d.title}</span>
                    {d.budget && <span className="text-sm font-bold shrink-0 ml-2" style={{ color: BLUE }}>{d.budget}</span>}
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: BLUE }} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Panel>
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
        <div className="space-y-3">
          {tenders.map((t) => (
            <div key={t.id} className="rounded-xl border bg-white p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  {t.compatibility != null && (
                    <span className="font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#eef0ff", color: BLUE }}>Matching {t.compatibility}%</span>
                  )}
                  {t.datePublication && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Publié {new Date(t.datePublication).toLocaleDateString("fr-FR")}</span>}
                  {t.deadline && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Limite {t.deadline}</span>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="text-muted-foreground" onClick={() => onHide(t.id)}>Ne plus afficher</Button>
                  <Button size="sm" className="text-white" style={{ backgroundColor: BLUE }} onClick={() => onAnalyse(t)}>
                    <Sparkles className="w-4 h-4 mr-1.5" /> Lancer l'analyse
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-sm text-foreground mt-2">{t.title}</h3>
              <div className="mt-1.5 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                {t.organisme && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{t.organisme}</span>}
                {t.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{t.location}</span>}
                {t.budget && <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5" />{t.budget}</span>}
              </div>
              {t.famille && <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">#{t.famille}</span>}
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
function Panel({ title, icon: Icon, children, accent, accentColor }: { title: string; icon: typeof Home; children: React.ReactNode; accent?: boolean; accentColor?: string }) {
  return (
    <div className="rounded-xl border bg-white p-5" style={accent ? { borderLeftWidth: 4, borderLeftColor: accentColor ?? BLUE } : undefined}>
      <h2 className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: BLUE }}><Icon className="w-4 h-4" />{title}</h2>
      {children}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground text-center py-6">{text}</p>;
}
