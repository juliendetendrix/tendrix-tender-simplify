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

// Chip verdict au style du design system (.v-chip v-go/v-warn/v-no)
const VCHIP_CLS: Record<string, string> = { go: "v-go", go_with_reserve: "v-warn", no_go: "v-no" };
function VChip({ verdict }: { verdict?: string | null }) {
  if (!verdict || !VERDICT[verdict]) return null;
  return <span className={`v-chip ${VCHIP_CLS[verdict] ?? ""}`}>{VERDICT[verdict].label}</span>;
}

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
    <div className="tdx-app">
      <div className="app">
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

      {/* ─── Sidebar (design system) ─── */}
      <aside className="side">
        <div className="side-logo"><img src={tendrixLogo} alt="Tendrix" /></div>
        <button className="side-cta" onClick={() => setAddOpen(true)}><Plus className="ico-sm" /> <span className="lbl">Ajouter un AO</span></button>
        <nav className="side-nav scrollbar">
          <div className="side-sec lbl">Pilotage</div>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setOpenedChat(null); setView(null); setPage(id); }}
              className={`nav-item ${page === id ? "active" : ""}`}>
              <Icon className="ico-md" /><span className="lbl">{label}</span>
            </button>
          ))}
          <div className="side-sec lbl">Compte</div>
          <button onClick={() => { setView(null); setOpenedChat({ id: "ca", title: ca.display_name, isCADirect: true }); }} className="nav-item">
            <MessageSquare className="ico-md" /><span className="lbl">Messages</span>
          </button>
        </nav>
        <div className="side-foot">
          <button className="credit-pill" onClick={() => { setView(null); setPage("entreprise"); setEntTab("plans"); }}>
            <span className="c-left"><Coins className="ico-sm" style={{ color: YELLOW }} /><span style={{ fontWeight: 800 }}>{credits}</span><span style={{ fontSize: 11, opacity: 0.7 }}>crédits</span></span>
            <span style={{ fontWeight: 800, color: YELLOW }}>+</span>
          </button>
          <div className="side-user">
            <div className="av">{(company?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <p className="nm" style={{ color: "#fff", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{company?.name ?? "Mon entreprise"}</p>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Contenu ─── */}
      <div className="main">
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
          <div className="page page-anim">
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
      </div>
      </div>
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

// Mini-barre de compatibilité (style maquette)
function MiniMatch({ value }: { value: number | null }) {
  const v = value ?? 0;
  const tone = v >= 75 ? "var(--go-dot)" : v >= 55 ? "var(--warn-dot)" : "var(--no-dot)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 104 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 6, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${v}%`, background: tone, borderRadius: 6 }} />
      </div>
      <span className="tnum" style={{ fontSize: 12.5, fontWeight: 800, color: tone, width: 34, textAlign: "right" }}>{value == null ? "—" : `${v}%`}</span>
    </div>
  );
}

const PIPE_COLS = [
  { id: "demande", label: "Demande émise", tone: "var(--muted-2)" },
  { id: "en_cours", label: "En cours", tone: "var(--navy)" },
  { id: "soumis", label: "Soumis", tone: "var(--warn-dot)" },
  { id: "gagne", label: "Remporté", tone: "var(--go-dot)" },
];

function Accueil({ name, tenders, ca, caInitials, dossiers, onAnalyse, onOpen, onChatCA, goMarches }:
  { name?: string | null; tenders: BoampTender[]; ca: any; caInitials: string; dossiers: any[]; onAnalyse: (t: BoampTender) => void; onOpen: (d: any) => void; onChatCA: () => void; goMarches: () => void }) {
  const lastMinute = tenders.slice(0, 4);
  const analysesDone = dossiers.filter((d) => d.analysisId);
  const recent = analysesDone.slice(0, 4);
  const firstName = (ca?.display_name ?? "").split(" ")[0] || "votre chargé d'affaires";

  // KPIs dérivés des vraies données (aucune valeur inventée)
  const analyzed = dossiers.filter((d) => d.analysisVerdict);
  const goCount = analyzed.filter((d) => d.analysisVerdict === "go" || d.analysisVerdict === "go_with_reserve").length;
  const tauxGo = analyzed.length ? `${Math.round((goCount / analyzed.length) * 100)}%` : "—";
  const enCours = dossiers.filter((d) => (d.status ?? "demande") !== "gagne").length;
  const kpis = [
    { label: "Recommandations", value: tenders.length, Icon: Sparkles },
    { label: "AO en cours", value: enCours, Icon: Briefcase },
    { label: "Analyses réalisées", value: analysesDone.length, Icon: FileSearch },
    { label: "Taux GO", value: tauxGo, Icon: CheckCircle2 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>Bonjour {name?.split(" ")[0] ?? "Entreprise"} 👋</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Voici l'activité de <strong style={{ color: "var(--ink-2)" }}>{name ?? "votre entreprise"}</strong> aujourd'hui.</p>
        </div>
        <button className="btn btn-primary" onClick={goMarches}><Plus className="ico-sm" /> Analyser un nouvel AO</button>
      </div>

      {/* KPIs */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        {kpis.map((k) => (
          <div key={k.label} className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>{k.label}</span>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: "color-mix(in oklab, var(--navy) 7%, white)", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}><k.Icon className="ico-sm" /></span>
            </div>
            <span className="tnum" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 }}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* Pipeline kanban */}
      <div className="card card-pad">
        <div className="card-h"><span className="ico"><Briefcase className="ico-md" /></span><span className="t">Mes appels d'offres en cours</span></div>
        {dossiers.length === 0 ? <Empty text="Aucun dossier en cours." /> : (
          <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14 }}>
            {PIPE_COLS.map((col) => {
              const items = dossiers.filter((d) => (d.status ?? "demande") === col.id);
              const pct = STATUS_TABS.find((s) => s.id === col.id)?.pct ?? 25;
              return (
                <div key={col.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11, paddingBottom: 9, borderBottom: "1px solid var(--line)" }}>
                    <span className="dot" style={{ background: col.tone }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-2)" }}>{col.label}</span>
                    <span className="tnum" style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 800, color: "var(--muted-2)" }}>{items.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 60 }}>
                    {items.length === 0 ? (
                      <div style={{ border: "1.5px dashed var(--line)", borderRadius: 11, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, color: "var(--muted-2)" }}>—</div>
                    ) : items.map((d) => (
                      <button key={d.id} onClick={() => onOpen(d)} className="card" style={{ textAlign: "left", padding: 13, display: "block", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8, alignItems: "center" }}>
                          {d.analysisVerdict ? <VChip verdict={d.analysisVerdict} /> : <span style={{ fontSize: 10.5, color: "var(--muted-2)", fontWeight: 700 }}>—</span>}
                          {d.budget && <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--navy)" }}>{d.budget}</span>}
                        </div>
                        <p className="clip2" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.35, color: "var(--ink)" }}>{d.title}</p>
                        <div style={{ marginTop: 10, height: 5, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: col.id === "gagne" ? "var(--go-dot)" : "var(--navy)", borderRadius: 5 }} />
                        </div>
                        {d.deadline && <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}><Clock className="ico-sm" />{d.deadline}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommandations + Chargé d'affaires */}
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.35fr) minmax(0,1fr)" }}>
        <div className="card card-pad">
          <div className="card-h"><span className="ico"><Sparkles className="ico-md" /></span><span className="t">Appels d'offres recommandés</span><button className="more" onClick={goMarches}>Marchés <ChevronRight className="ico-sm" /></button></div>
          {lastMinute.length === 0 ? (
            <div style={{ textAlign: "center", padding: 12 }}>
              <Empty text="Aucune recommandation pour le moment." />
              <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={goMarches}>Voir les marchés</button>
            </div>
          ) : lastMinute.map((t, i) => (
            <div key={t.id} style={{ padding: "13px 4px", borderTop: i ? "1px solid var(--line-2)" : "none", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="clip1" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{t.title}</p>
                <p className="clip1" style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>{t.organisme ?? t.location ?? ""}</p>
              </div>
              <div style={{ width: 104, flexShrink: 0 }}><MiniMatch value={t.compatibility} /></div>
              <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} onClick={() => onAnalyse(t)}><Sparkles className="ico-sm" /> Analyser</button>
            </div>
          ))}
        </div>

        <div className="card card-pad" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-h"><span className="ico" style={{ color: "var(--warn-fg)" }}><Star className="ico-md" /></span><span className="t">Mon chargé d'affaires</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            {ca?.photo_url ? <img src={ca.photo_url} alt="" style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover" }} />
              : <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--yellow-soft)", color: "var(--warn-fg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 19 }}>{caInitials}</div>}
            <div>
              <p style={{ fontSize: 15, fontWeight: 800 }}>{ca?.display_name ?? "—"}</p>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>Chargé d'affaires</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 15 }}>
            {ca?.phone && <a href={`tel:${ca.phone}`} className="btn btn-ghost btn-sm"><Phone className="ico-sm" /> Appeler</a>}
            {ca?.email && <a href={`mailto:${ca.email}`} className="btn btn-ghost btn-sm"><Mail className="ico-sm" /> Email</a>}
          </div>
          <button onClick={onChatCA} className="btn btn-accent" style={{ marginTop: 9 }}><MessageSquare className="ico-sm" /> Écrire à {firstName}</button>
        </div>
      </div>

      {/* Dernières analyses */}
      <div className="card card-pad">
        <div className="card-h"><span className="ico"><FileSearch className="ico-md" /></span><span className="t">Mes dernières analyses</span></div>
        {recent.length === 0 ? <Empty text="Aucune analyse pour l'instant." /> : recent.map((d, i) => (
          <button key={d.id} onClick={() => onOpen(d)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 6px", borderTop: i ? "1px solid var(--line-2)" : "none", textAlign: "left", width: "100%" }}>
            <span className="clip1" style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700 }}>{d.title}</span>
            {d.analysisVerdict ? <VChip verdict={d.analysisVerdict} /> : <span style={{ fontSize: 11.5, color: "var(--muted)" }}>En cours…</span>}
            <ChevronRight className="ico-sm" style={{ color: "var(--muted-2)" }} />
          </button>
        ))}
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
        <div className="space-y-3">
          {tenders.map((t) => (
            <div key={t.id} className="card p-4">
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
              <button key={d.id} onClick={() => onOpen(d)} className="card w-full p-4 flex items-center gap-4 text-left">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1">{d.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {d.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{d.location}</span>}
                    {d.deadline && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{d.deadline}</span>}
                  </div>
                </div>
                {v ? <VChip verdict={d.analysisVerdict} />
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
            <button key={r.id} onClick={() => onOpen(r.id)} className="card w-full p-4 flex items-center gap-4 text-left">
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
    <div className="card card-pad" style={accent ? { borderLeftWidth: 4, borderLeftColor: accentColor ?? BLUE } : undefined}>
      <div className="card-h">
        <span className="ico"><Icon className="ico-md" /></span>
        <span className="t">{title}</span>
      </div>
      {children}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground text-center py-6">{text}</p>;
}
