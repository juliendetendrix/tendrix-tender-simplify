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
import { ChargeAffairesWelcome } from "@/components/mobile/ChargeAffairesWelcome";
import TenderPreviewDesktop from "@/components/desktop/TenderPreviewDesktop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";
import { MatchBar, VChip, Deadline, Avatar, useCountUp } from "@/components/desktop/DesignKit";
import { useCompanyMessages } from "@/hooks/useCompanyMessages";
import {
  LayoutDashboard, Briefcase, FileSearch, Sparkles, Building2, Coins, Plus, Search, Loader2,
  MapPin, Calendar, CheckCircle2, ChevronRight, MessageSquare, Phone, Mail, Star,
  Bell, RefreshCw, Upload, EyeOff, ArrowRight, Kanban, UserRoundCheck,
} from "lucide-react";

type Page = "accueil" | "marches" | "analyses" | "reponses" | "entreprise";
const ANALYSIS_COST = 50; // crédits déduits par la RPC (grille : 50 = 5 € HT)
const IN_PROGRESS = ["pending", "scraping", "analyzing", "manual_intervention_required"];

const STATUS_COLS = [
  { id: "demande", label: "Demande émise", pct: 25, tone: "var(--muted-2)" },
  { id: "en_cours", label: "En cours", pct: 50, tone: "var(--navy)" },
  { id: "soumis", label: "Soumis", pct: 75, tone: "var(--warn-dot)" },
  { id: "gagne", label: "Remporté", pct: 100, tone: "var(--go-dot)" },
] as const;

const TITLES: Record<Page, string> = {
  accueil: "Accueil", marches: "Marchés", analyses: "Analyses", reponses: "Réponses", entreprise: "Mon entreprise",
};

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
  // Aperçu d'un marché recommandé (avant analyse)
  const [previewTender, setPreviewTender] = useState<BoampTender | null>(null);
  // Pop-up de bienvenue "chargé d'affaires assigné" (à la 1re arrivée)
  const [caWelcomeOpen, setCaWelcomeOpen] = useState(false);

  // Retour de paiement Stripe
  const purchaseHandled = useRef(false);
  useEffect(() => {
    if (purchaseHandled.current) return;
    const p = searchParams.get("purchase");
    if (!p) return;
    purchaseHandled.current = true;
    if (p === "success") { setPage("entreprise"); setPurchaseOpen(true); }
  }, [searchParams]);

  // Pop-up chargé d'affaires à la première arrivée sur l'app desktop.
  // Le flag est posé à la FERMETURE (pas à l'ouverture) pour survivre au
  // double-montage de React StrictMode en dev.
  useEffect(() => {
    if (!localStorage.getItem("tendrix_ca_welcome_seen")) setCaWelcomeOpen(true);
  }, []);
  const dismissCaWelcome = () => {
    setCaWelcomeOpen(false);
    localStorage.setItem("tendrix_ca_welcome_seen", "1");
  };

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
      setPreviewTender(null);
      setView({ kind: "analysis", id: analysisId as string });
    }
  };

  const goPage = (p: Page) => { setOpenedChat(null); setView(null); setPage(p); };

  const NAV: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "accueil", label: "Accueil", icon: LayoutDashboard },
    { id: "marches", label: "Marchés", icon: Briefcase },
    { id: "analyses", label: "Analyses", icon: FileSearch },
    { id: "reponses", label: "Réponses", icon: Sparkles },
  ];

  const visibleTenders = tenders.filter((t) =>
    !hidden.has(t.id) && (!query || `${t.title} ${t.organisme ?? ""} ${t.location ?? ""}`.toLowerCase().includes(query.toLowerCase())));

  const analyses = dossiers.filter((d) => d.analysisId);

  // Messagerie directe entreprise ↔ CA (badge + aperçu sur la carte CA)
  const { unreadFor, lastMessage: lastCAMessage } = useCompanyMessages(company?.id);
  const unreadMessages = unreadFor("company");
  // Compteurs pour les badges de la sidebar
  const analysesInProgress = dossiers.filter((d) => d.analysisStatus && IN_PROGRESS.includes(d.analysisStatus)).length;
  const [generatingResp, setGeneratingResp] = useState(0);
  useEffect(() => {
    if (!company?.id) { setGeneratingResp(0); return; }
    supabase.from("tender_responses").select("id", { count: "exact", head: true })
      .eq("company_id", company.id).eq("status", "generating")
      .then(({ count }) => setGeneratingResp(count ?? 0));
  }, [company?.id, dossiers.length]);

  const isMainPage = !view && !openedChat && !previewTender;
  const showTopbar = isMainPage && page !== "entreprise";

  return (
    <div className="tdx-app">
      <div className="app">
        <PurchaseSuccessDialog open={purchaseOpen} onOpenChange={setPurchaseOpen} onCompleteProfile={() => { setPurchaseOpen(false); setPage("entreprise"); setEntTab("profil"); }} />
        <AddTenderDialog open={addOpen} onOpenChange={setAddOpen} onCreated={() => { setAddOpen(false); setPage("analyses"); }} />
        <ChargeAffairesWelcome
          isOpen={caWelcomeOpen}
          onClose={dismissCaWelcome}
          onContactCA={() => { dismissCaWelcome(); setView(null); setPreviewTender(null); setOpenedChat({ id: "ca", title: ca.display_name, isCADirect: true }); }}
          ca={ca}
          caInitials={caInitials}
        />

        {/* Confirmation lancement analyse */}
        <Dialog open={!!confirmT} onOpenChange={(o) => !o && setConfirmT(null)}>
          <DialogContent className="max-w-[440px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" style={{ color: "var(--navy)" }} /> Lancer l'analyse IA</DialogTitle>
              <DialogDescription className="line-clamp-2">{confirmT?.title}</DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border p-3.5 text-sm flex items-center justify-between" style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}>
              <span style={{ color: "var(--muted)" }}>Coût de l'analyse</span>
              <span className="font-bold flex items-center gap-1.5" style={{ color: "var(--navy)" }}>{ANALYSIS_COST} crédit <Coins className="w-3.5 h-3.5" style={{ color: "var(--yellow)" }} /></span>
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Solde actuel : <strong className="tnum">{credits} crédits</strong></p>
            <button onClick={launch} disabled={launching} className="btn btn-primary w-full" style={{ height: 46 }}>
              {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="ico-sm" />}
              Confirmer et lancer
            </button>
          </DialogContent>
        </Dialog>

        {/* ─── Sidebar ─── */}
        <aside className="side">
          <div className="side-logo"><img src={tendrixLogo} alt="Tendrix" /></div>
          <button className="side-cta" onClick={() => setAddOpen(true)}><Plus className="ico-sm" /> <span className="lbl">Analyser un AO</span></button>
          <nav className="side-nav scrollbar">
            <div className="side-sec lbl">Pilotage</div>
            {NAV.map(({ id, label, icon: Icon }) => {
              const badge = id === "marches" ? tenders.length : id === "analyses" ? analysesInProgress : id === "reponses" ? generatingResp : 0;
              return (
                <button key={id} onClick={() => goPage(id)} className={`nav-item ${isMainPage && page === id ? "active" : ""}`}>
                  <Icon className="ico-md" /><span className="lbl">{label}</span>
                  {badge ? <span className="badge lbl">{badge}</span> : null}
                </button>
              );
            })}
            <div className="side-sec lbl">Compte</div>
            <button onClick={() => { setView(null); setPreviewTender(null); setOpenedChat({ id: "ca", title: ca.display_name, isCADirect: true }); }}
              className={`nav-item ${openedChat ? "active" : ""}`}>
              <MessageSquare className="ico-md" /><span className="lbl">Messages</span>
              {unreadMessages ? <span className="badge lbl">{unreadMessages}</span> : null}
            </button>
            <button onClick={() => goPage("entreprise")} className={`nav-item ${isMainPage && page === "entreprise" ? "active" : ""}`}>
              <Building2 className="ico-md" /><span className="lbl">Mon entreprise</span>
            </button>
          </nav>
          <div className="side-foot">
            <button className="credit-pill" onClick={() => { setView(null); setOpenedChat(null); setPage("entreprise"); setEntTab("plans"); }}>
              <span className="c-left"><Coins className="ico-sm" style={{ color: "var(--yellow)" }} /><span className="c-num tnum">{credits}</span><span className="c-txt lbl" style={{ fontSize: 11.5, color: "rgba(255,255,255,.6)" }}>crédits</span></span>
              <span className="lbl" style={{ color: "var(--yellow)", fontWeight: 800 }}>+</span>
            </button>
            <div className="side-user">
              <div className="av">{(company?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <p className="nm clip1">{company?.name ?? "Mon entreprise"}</p>
                <p className="em clip1">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Contenu ─── */}
        <div className="main">
          {showTopbar && (
            <header className="topbar">
              <h1>{TITLES[page]}</h1>
              <div className="search">
                <Search className="ico-sm" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un marché, une analyse…" />
              </div>
              <button className="icon-btn" title="Notifications"><Bell className="ico-md" /></button>
              <button className="icon-btn" style={{ borderColor: "transparent", background: "var(--navy)", color: "#fff", fontWeight: 800 }}>
                {(company?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}
              </button>
            </header>
          )}

          {view ? (
            view.kind === "analysis" ? (
              <AnalysisDetail analysisId={view.id} onBack={() => setView(null)} onOpenResponse={(rid) => setView({ kind: "response", id: rid })} />
            ) : (
              <ResponseDetail responseId={view.id} onBack={() => setView(null)} />
            )
          ) : previewTender ? (
            <TenderPreviewDesktop tender={previewTender} onBack={() => setPreviewTender(null)} onAnalyse={(t) => setConfirmT(t)} analysisCost={ANALYSIS_COST} />
          ) : openedChat ? (
            <DemoChat desktop dossierTitle={openedChat.title} onBack={() => setOpenedChat(null)} isCADirect={openedChat.isCADirect} ca={ca} caInitials={caInitials} companyId={company?.id} />
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
                  lastCAMessage={lastCAMessage}
                />
              )}
              {page === "marches" && (
                <Marches
                  tenders={visibleTenders} loading={tendersLoading} query={query} setQuery={setQuery}
                  onRefresh={refetch} onHide={(id) => setHidden((s) => new Set(s).add(id))}
                  onAnalyse={(t) => setConfirmT(t)} onImport={() => setAddOpen(true)}
                  onPreview={(t) => setPreviewTender(t)}
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

// ─────────────────── Accueil (dashboard) ───────────────────
function KpiCard({ label, value, suffix, Icon }: { label: string; value: number; suffix?: string; Icon: typeof LayoutDashboard }) {
  const v = useCountUp(value);
  return (
    <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>{label}</span>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: "color-mix(in oklab, var(--navy) 7%, white)", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon className="ico-sm" /></span>
      </div>
      <span className="tnum" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 }}>{Math.round(v)}{suffix}</span>
    </div>
  );
}

function Accueil({ name, tenders, ca, caInitials, dossiers, onAnalyse, onOpen, onChatCA, goMarches, lastCAMessage }:
  { name?: string | null; tenders: BoampTender[]; ca: any; caInitials: string; dossiers: any[]; onAnalyse: (t: BoampTender) => void; onOpen: (d: any) => void; onChatCA: () => void; goMarches: () => void; lastCAMessage?: { body: string; sender_role: "company" | "ca" } | null }) {
  const lastMinute = tenders.slice(0, 4);
  const analysesDone = dossiers.filter((d) => d.analysisId);
  const recent = analysesDone.slice(0, 4);
  const firstName = (ca?.display_name ?? "").split(" ")[0] || "votre CA";

  const analyzed = dossiers.filter((d) => d.analysisVerdict);
  const goCount = analyzed.filter((d) => d.analysisVerdict === "go" || d.analysisVerdict === "go_with_reserve").length;
  const tauxGo = analyzed.length ? Math.round((goCount / analyzed.length) * 100) : 0;
  const enCours = dossiers.filter((d) => (d.status ?? "demande") !== "gagne").length;

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
        <KpiCard label="Recommandations" value={tenders.length} Icon={Sparkles} />
        <KpiCard label="AO en cours" value={enCours} Icon={Briefcase} />
        <KpiCard label="Analyses réalisées" value={analysesDone.length} Icon={FileSearch} />
        <KpiCard label="Taux GO" value={tauxGo} suffix="%" Icon={CheckCircle2} />
      </div>

      {/* Pipeline kanban */}
      <div className="card card-pad">
        <div className="card-h"><span className="ico"><Kanban className="ico-md" /></span><span className="t">Mes appels d'offres en cours</span></div>
        {dossiers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "18px 0 8px" }}>
            <Empty text="Aucun dossier en cours pour le moment." />
            <button className="btn btn-primary" style={{ marginTop: 4 }} onClick={goMarches}>
              <Sparkles className="ico-sm" /> Lancez votre première analyse
            </button>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14 }}>
            {STATUS_COLS.map((col) => {
              const items = dossiers.filter((d) => (d.status ?? "demande") === col.id);
              return (
                <div key={col.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11, paddingBottom: 9, borderBottom: "1px solid var(--line)" }}>
                    <span className="dot" style={{ background: col.tone }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-2)" }}>{col.label}</span>
                    <span className="tnum" style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 800, color: "var(--muted-2)" }}>{items.length}</span>
                  </div>
                  <div className="scrollbar" style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 60, maxHeight: 384, overflowY: "auto", paddingRight: items.length > 3 ? 4 : 0 }}>
                    {items.length === 0 ? (
                      <div style={{ border: "1.5px dashed var(--line)", borderRadius: 11, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, color: "var(--muted-2)" }}>—</div>
                    ) : items.map((d) => (
                      <button key={d.id} onClick={() => onOpen(d)} className="card" style={{ textAlign: "left", padding: 13, display: "block", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8, alignItems: "center" }}>
                          {d.analysisVerdict ? <VChip verdict={d.analysisVerdict} sm /> : <span style={{ fontSize: 10.5, color: "var(--muted-2)", fontWeight: 700 }}>—</span>}
                          {d.budget && <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--navy)" }}>{d.budget}</span>}
                        </div>
                        <p className="clip2" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.35, color: "var(--ink)" }}>{d.title}</p>
                        <div style={{ marginTop: 10, height: 5, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${col.pct}%`, background: col.id === "gagne" ? "var(--go-dot)" : "var(--navy)", borderRadius: 5 }} />
                        </div>
                        {d.deadline && <div style={{ marginTop: 8 }}><Deadline date={d.deadline} /></div>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reco + CA */}
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.35fr) minmax(0,1fr)" }}>
        <div className="card card-pad">
          <div className="card-h"><span className="ico"><Sparkles className="ico-md" /></span><span className="t">Appels d'offres recommandés</span><button className="more" onClick={goMarches}>Marchés <ArrowRight className="ico-sm" /></button></div>
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
              <div style={{ width: 110, flexShrink: 0 }}><MatchBar value={t.compatibility} /></div>
              <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} onClick={() => onAnalyse(t)}><Sparkles className="ico-sm" /> Analyser</button>
            </div>
          ))}
        </div>

        <div className="card card-pad" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-h"><span className="ico" style={{ color: "var(--warn-fg)" }}><UserRoundCheck className="ico-md" /></span><span className="t">Mon chargé d'affaires</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            {ca?.photo_url ? <img src={ca.photo_url} alt="" style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover" }} /> : <Avatar initials={caInitials} size={52} accent />}
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
          {lastCAMessage && (
            <button onClick={onChatCA} style={{ marginTop: 12, textAlign: "left", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 11, padding: "10px 12px", width: "100%", cursor: "pointer" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
                <MessageSquare className="ico-sm" /> {lastCAMessage.sender_role === "ca" ? firstName : "Vous"}
              </div>
              <div className="clip2" style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.45 }}>{lastCAMessage.body}</div>
            </button>
          )}
        </div>
      </div>

      {/* Dernières analyses */}
      <div className="card card-pad">
        <div className="card-h"><span className="ico"><FileSearch className="ico-md" /></span><span className="t">Mes dernières analyses</span></div>
        {recent.length === 0 ? <Empty text="Aucune analyse pour l'instant." /> : recent.map((d, i) => (
          <button key={d.id} onClick={() => onOpen(d)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 6px", borderTop: i ? "1px solid var(--line-2)" : "none", textAlign: "left", width: "100%", background: "none", border: "none" }}>
            <span className="clip1" style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700 }}>{d.title}</span>
            {d.analysisVerdict ? <VChip verdict={d.analysisVerdict} sm /> : <span style={{ fontSize: 11.5, color: "var(--muted)" }}>En cours…</span>}
            <ChevronRight className="ico-sm" style={{ color: "var(--muted-2)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────── Marchés ───────────────────
function Marches({ tenders, loading, query, setQuery, onRefresh, onHide, onAnalyse, onImport, onPreview }:
  { tenders: BoampTender[]; loading: boolean; query: string; setQuery: (s: string) => void; onRefresh: () => void; onHide: (id: string) => void; onAnalyse: (t: BoampTender) => void; onImport: () => void; onPreview: (t: BoampTender) => void }) {
  const [filter, setFilter] = useState("Tous");
  const FILTERS = ["Tous", "Compatibilité > 80%", "Échéance proche"];
  let list = tenders;
  if (filter === "Compatibilité > 80%") list = list.filter((t) => (t.compatibility ?? 0) > 80);
  else if (filter === "Échéance proche") list = list.filter((t) => !!t.deadline);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>Marchés</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}><strong className="tnum" style={{ color: "var(--ink-2)" }}>{list.length}</strong> opportunités correspondant à votre profil</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={onImport}><Upload className="ico-sm" /> Importer un marché</button>
          <button className="btn btn-ghost icon-btn" style={{ width: 40 }} onClick={onRefresh}><RefreshCw className="ico-sm" /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div className="search" style={{ margin: 0, width: 320 }}>
          <Search className="ico-sm" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un marché, un organisme…" />
        </div>
        <div className="scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="chip" style={{ whiteSpace: "nowrap", cursor: "pointer", ...(filter === f ? { background: "var(--navy)", color: "#fff", borderColor: "var(--navy)" } : {}) }}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 80, textAlign: "center" }}><Loader2 className="w-6 h-6 animate-spin" style={{ margin: "0 auto", color: "var(--navy)" }} /></div>
      ) : list.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: "center", padding: 50, color: "var(--muted)" }}>Aucune opportunité correspondant à ce filtre.</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          {list.map((t) => (
            <div key={t.id} className="card card-pad">
              <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                <button onClick={() => onPreview(t)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" }} title="Voir l'aperçu du marché">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
                    {t.procedure && <span className="chip" style={{ color: "var(--navy)", background: "color-mix(in oklab, var(--navy) 7%, white)", borderColor: "transparent" }}>{t.procedure.split(" (")[0]}</span>}
                    {t.famille && <span className="chip">{t.famille}</span>}
                  </div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 800, lineHeight: 1.3, letterSpacing: "-.01em" }}>{t.title}</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 10, fontSize: 12.5, color: "var(--muted)" }}>
                    {t.organisme && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Building2 className="ico-sm" />{t.organisme}</span>}
                    {t.location && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin className="ico-sm" />{t.location}</span>}
                    {t.budget && <span style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 700, color: "var(--ink-2)" }}><Coins className="ico-sm" />{t.budget}</span>}
                    {t.deadline && <Deadline date={t.deadline} />}
                  </div>
                </button>
                <div style={{ width: 178, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
                  {t.compatibility != null && (
                    <div style={{ width: "100%" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5, textAlign: "right" }}>Compatibilité profil</div>
                      <MatchBar value={t.compatibility} />
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "flex-end" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onHide(t.id)} title="Ne plus afficher"><EyeOff className="ico-sm" /></button>
                    <button className="btn btn-primary btn-sm" onClick={() => onAnalyse(t)}><Sparkles className="ico-sm" /> Lancer l'analyse</button>
                  </div>
                </div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>Analyses</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}><strong className="tnum" style={{ color: "var(--ink-2)" }}>{analyses.length}</strong> analyses réalisées</p>
      </div>
      {analyses.length === 0 ? <Empty text="Aucune analyse. Lancez-en une depuis l'onglet Marchés." /> : (
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          {analyses.map((d) => {
            const inProgress = d.analysisStatus && IN_PROGRESS.includes(d.analysisStatus);
            return (
              <button key={d.id} onClick={() => onOpen(d)} className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "left", width: "100%" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="clip1" style={{ fontSize: 14.5, fontWeight: 800 }}>{d.title}</h3>
                  <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12.5, color: "var(--muted)", flexWrap: "wrap" }}>
                    {d.location && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin className="ico-sm" />{d.location}</span>}
                    {d.deadline && <Deadline date={d.deadline} />}
                  </div>
                </div>
                {d.analysisVerdict ? <VChip verdict={d.analysisVerdict} />
                  : inProgress ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--muted)" }}><Loader2 className="w-3.5 h-3.5 animate-spin" /> En cours…</span>
                  : <span style={{ fontSize: 12.5, color: "var(--muted)" }}>—</span>}
                <ChevronRight className="ico-sm" style={{ color: "var(--muted-2)" }} />
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
  if (loading) return <div style={{ padding: 80, textAlign: "center" }}><Loader2 className="w-6 h-6 animate-spin" style={{ margin: "0 auto", color: "var(--navy)" }} /></div>;
  const stChip = (s: string) => s === "ready" ? { t: "Prête", c: "v-go" } : s === "failed" ? { t: "Échec", c: "v-no" } : { t: "En cours…", c: "v-warn" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>Réponses</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}><strong className="tnum" style={{ color: "var(--ink-2)" }}>{rows.length}</strong> dossiers de réponse</p>
      </div>
      {rows.length === 0 ? <Empty text='Aucune réponse générée. Cliquez "Répondre à ce marché" sur une fiche analyse.' /> : (
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          {rows.map((r) => {
            const st = stChip(r.status);
            return (
              <button key={r.id} onClick={() => onOpen(r.id)} className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "left", width: "100%" }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "color-mix(in oklab, var(--navy) 8%, white)", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Sparkles className="ico-md" /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="clip1" style={{ fontSize: 14.5, fontWeight: 800 }}>{r.content?.synthese ? r.content.synthese : "Dossier de réponse"}</h3>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
                <span className={`v-chip ${st.c}`}>{st.t}</span>
                <ChevronRight className="ico-sm" style={{ color: "var(--muted-2)" }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────── Entreprise ───────────────────
function EntrepriseSection({ tab, setTab }: { tab: "profil" | "plans" | "historique"; setTab: (t: "profil" | "plans" | "historique") => void }) {
  return (
    <div>
      <div style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)", padding: "18px 32px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 24 }}>
          {([["profil", "Profil & Librairie"], ["plans", "Plans & Factures"], ["historique", "Historique"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ paddingBottom: 12, fontSize: 13.5, fontWeight: 700, border: "none", background: "none", borderBottom: "2px solid", marginBottom: -1,
                borderColor: tab === id ? "var(--navy)" : "transparent", color: tab === id ? "var(--navy)" : "var(--muted)" }}>{label}</button>
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
    <div className="page" style={{ maxWidth: 1100 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "var(--navy)" }}>Consommation des crédits</h2>
      {rows.length === 0 ? <Empty text="Aucune transaction." /> : (
        <div className="card" style={{ overflow: "hidden" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", fontSize: 13.5, borderTop: i ? "1px solid var(--line-2)" : "none" }}>
              <div><span style={{ fontWeight: 600 }}>{labelOf(r.reason)}</span><span style={{ fontSize: 11.5, color: "var(--muted)", marginLeft: 8 }}>{new Date(r.created_at).toLocaleString("fr-FR")}</span></div>
              <span className="tnum" style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 5, color: r.amount >= 0 ? "var(--go-fg)" : "var(--no-fg)" }}>{r.amount >= 0 ? "+" : ""}{r.amount} <Coins className="ico-sm" style={{ color: "var(--yellow)" }} /></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ fontSize: 13.5, color: "var(--muted)", textAlign: "center", padding: "24px 0" }}>{text}</p>;
}
