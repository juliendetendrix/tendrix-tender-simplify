// ─── Réponse IA + Shell applicatif + routing ───

// ============ RÉPONSE IA (2 colonnes) ============
function MemoireBlock({ s, onGenerate }) {
  const todo = s.status === "todo";
  return (
    <div className="card" style={{ marginBottom: 12, borderColor: todo ? "color-mix(in oklab, var(--warn-dot) 35%, white)" : "var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: todo ? "none" : "1px solid var(--line-2)" }}>
        <span style={{ fontSize: 14, fontWeight: 800, flex: 1 }}>{s.titre}</span>
        {todo ? <span className="v-chip v-warn" style={{ fontSize: 9.5 }}>À RÉDIGER</span>
              : <span className="tnum" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)" }}>{s.words} mots</span>}
        {!todo && <button className="icon-btn" style={{ width: 30, height: 30 }} title="Copier"><Ico name="copy" className="ico-sm" /></button>}
      </div>
      {todo ? (
        <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, background: "var(--warn-bg)" }}>
          <p style={{ flex: 1, fontSize: 12.5, color: "var(--warn-fg)", lineHeight: 1.5 }}>{s.hint}</p>
          <button onClick={onGenerate} className="btn btn-accent btn-sm" style={{ flexShrink: 0 }}><Ico name="sparkles" className="ico-sm" /> Générer</button>
        </div>
      ) : (
        <p style={{ padding: "14px 16px", fontSize: 13.5, lineHeight: 1.65, color: "var(--ink-2)", whiteSpace: "pre-line" }}>{s.contenu}</p>
      )}
    </div>
  );
}

function Reponse({ r, onBack }) {
  useLucide();
  const [sections, setSections] = useState(r.memoire);
  const done = sections.filter((s) => s.status === "ok").length;
  const completion = Math.round((done / sections.length) * 100);
  const generate = (idx) => setSections((prev) => prev.map((s, i) => i === idx ? { ...s, status: "ok", words: 134, contenu: "Engagée dans une démarche RSE certifiée, l'entreprise met en œuvre le tri sélectif des déchets de chantier en filières agréées, privilégie les matériaux à faible impact carbone et limite les nuisances sonores aux abords de l'établissement scolaire…" } : s));

  return (
    <div className="page page-anim" style={{ maxWidth: 1240 }}>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><Ico name="arrow-left" className="ico-sm" /> Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 7 }}>
        <Ico name="sparkles" className="ico-sm" /> DOSSIER DE RÉPONSE · {r.version}
      </div>
      <h2 style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.2, maxWidth: 820 }}>{r.title}</h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>{r.organisme}</p>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 22, marginTop: 24, alignItems: "start" }}>
        {/* gauche : progression + nav */}
        <div style={{ position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>Avancement du dossier</span>
              <span className="tnum" style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)" }}>{completion}%</span>
            </div>
            <div style={{ height: 9, borderRadius: 9, background: "var(--line)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${completion}%`, background: "linear-gradient(90deg, var(--navy), var(--navy-600))", borderRadius: 9, transition: "width .5s" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 14, gap: 2 }}>
              {sections.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", fontSize: 12.5 }}>
                  <span style={{ color: s.status === "ok" ? "var(--go-dot)" : "var(--warn-dot)" }}><Ico name={s.status === "ok" ? "check-circle-2" : "circle-dashed"} className="ico-sm" /></span>
                  <span className="clip1" style={{ flex: 1, fontWeight: 600, color: s.status === "ok" ? "var(--ink-2)" : "var(--warn-fg)" }}>{s.titre}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" style={{ height: 46 }}><Ico name="file-down" className="ico-sm" /> Exporter le dossier (.docx)</button>
          <button className="btn btn-ghost"><Ico name="message-circle" className="ico-sm" /> Faire relire par mon CA</button>
        </div>

        {/* droite : contenu */}
        <div>
          <div style={{ display: "flex", gap: 12, padding: 16, borderRadius: 13, background: "var(--go-bg)", border: "1px solid color-mix(in oklab, var(--go-dot) 30%, white)", marginBottom: 18 }}>
            <span style={{ color: "var(--go-fg)", marginTop: 1 }}><Ico name="sparkles" className="ico-md" /></span>
            <p style={{ fontSize: 13.5, color: "var(--go-fg)", lineHeight: 1.55 }}>{r.synthese}</p>
          </div>

          <p style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}><Ico name="file-text" className="ico-md" /> Mémoire technique (brouillon IA)</p>
          {sections.map((s, i) => <MemoireBlock key={i} s={s} onGenerate={() => generate(i)} />)}

          <p style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", margin: "22px 0 12px", display: "flex", alignItems: "center", gap: 8 }}><Ico name="clipboard-list" className="ico-md" /> Pièces administratives</p>
          <div className="card" style={{ overflow: "hidden" }}>
            {r.pieces.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 16px", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
                <span style={{ color: p.ok ? "var(--go-dot)" : "var(--warn-dot)" }}><Ico name={p.ok ? "check-circle-2" : "circle-alert"} className="ico-md" /></span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{p.label}</span>
                <span className="v-chip" style={{ fontSize: 10, ...(p.ok ? { background: "var(--go-bg)", color: "var(--go-fg)" } : { background: "var(--warn-bg)", color: "var(--warn-fg)" }) }}>{p.statut}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, padding: 18, borderRadius: 13, background: "#fff7ed", border: "1px solid #fed7aa" }}>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: "#c2410c", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><Ico name="list-todo" className="ico-md" /> À compléter avant dépôt</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {r.aCompleter.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 9, fontSize: 13, color: "#9a3412", lineHeight: 1.5 }}>
                  <span className="tnum" style={{ fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span><span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>Brouillon généré par l'IA — à relire et affiner avec votre chargé d'affaires avant dépôt.</p>
        </div>
      </div>
    </div>
  );
}

// ============ Listes simples (Analyses / Réponses / Entreprise / Messages) ============
function ListPage({ title, subtitle, children }) {
  useLucide();
  return (
    <div className="page page-anim">
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>{title}</h2>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: "4px 0 20px" }}>{subtitle}</p>
      {children}
    </div>
  );
}

function AnalysesList({ data, onOpen }) {
  return (
    <ListPage title="Analyses" subtitle={`${data.analyses.length} analyses réalisées`}>
      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {data.analyses.map((a) => (
          <button key={a.id} onClick={() => onOpen(a)} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, textAlign: "left", transition: "box-shadow .15s" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-md)"} onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800 }} className="clip1">{a.title}</h3>
              <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12.5, color: "var(--muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ico name="building-2" className="ico-sm" />{a.organisme}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ico name="map-pin" className="ico-sm" />{a.location}</span>
                <span>{a.date}</span>
              </div>
            </div>
            <div style={{ width: 120 }}><MatchBar value={a.match} /></div>
            <VChip verdict={a.verdict} />
            <Ico name="chevron-right" className="ico-sm" />
          </button>
        ))}
      </div>
    </ListPage>
  );
}

function ReponsesList({ data, onOpen }) {
  const rows = [
    { id: "r1", title: data.responseDetail.title, org: data.responseDetail.organisme, status: "draft", date: "il y a 1 h" },
    { id: "r2", title: "Rénovation thermique — 2 écoles élémentaires", org: "Ville de Saint-Priest", status: "ready", date: "hier" },
    { id: "r3", title: "Mise aux normes électriques — médiathèque", org: "Commune d'Oullins", status: "ready", date: "il y a 4 j" },
  ];
  const stMap = { ready: { t: "Prête", c: "v-go" }, draft: { t: "Brouillon", c: "v-warn" } };
  return (
    <ListPage title="Réponses" subtitle={`${rows.length} dossiers de réponse`}>
      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {rows.map((r) => (
          <button key={r.id} onClick={() => onOpen(r.id)} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, textAlign: "left", transition: "box-shadow .15s" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-md)"} onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: "color-mix(in oklab, var(--navy) 8%, white)", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name="file-text" className="ico-md" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800 }} className="clip1">{r.title}</h3>
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>{r.org} · {r.date}</p>
            </div>
            <span className={`v-chip ${stMap[r.status].c}`}>{stMap[r.status].t}</span>
            <Ico name="chevron-right" className="ico-sm" />
          </button>
        ))}
      </div>
    </ListPage>
  );
}

function Placeholder({ title, subtitle, icon }) {
  useLucide();
  return (
    <ListPage title={title} subtitle={subtitle}>
      <div className="card card-pad" style={{ padding: 70, textAlign: "center" }}>
        <span style={{ width: 56, height: 56, borderRadius: 16, background: "var(--surface-2)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><Ico name={icon} /></span>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)" }}>Section incluse dans le périmètre de redesign</p>
        <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 6, maxWidth: 420, marginInline: "auto", lineHeight: 1.5 }}>Je peux détailler cet écran ensuite — dis-moi s'il fait partie de tes priorités.</p>
      </div>
    </ListPage>
  );
}

// ============ Modal confirmation analyse ============
function ConfirmModal({ tender, credits, onClose, onConfirm }) {
  useLucide();
  if (!tender) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(12,18,40,.45)", backdropFilter: "blur(3px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", animation: "pageIn .2s" }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 440, padding: 24, boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: "color-mix(in oklab, var(--navy) 9%, white)", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="sparkles" className="ico-md" /></span>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800 }}>Lancer l'analyse IA</h3>
            <p style={{ fontSize: 12.5, color: "var(--muted)" }}>Verdict GO / NO-GO en quelques instants</p>
          </div>
        </div>
        <p className="clip2" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-2)", marginBottom: 16, lineHeight: 1.45 }}>{tender.title}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Coût de l'analyse</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--navy)", display: "flex", alignItems: "center", gap: 6 }}>1 crédit <Ico name="coins" className="ico-sm" style={{ color: "var(--yellow)" }} /></span>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>Solde actuel : <strong className="tnum" style={{ color: "var(--ink-2)" }}>{credits} crédits</strong></p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Annuler</button>
          <button onClick={onConfirm} className="btn btn-primary" style={{ flex: 2 }}><Ico name="sparkles" className="ico-sm" /> Confirmer et lancer</button>
        </div>
      </div>
    </div>
  );
}

// ============ SHELL ============
const NAV = [
  { id: "accueil", label: "Accueil", icon: "layout-dashboard" },
  { id: "marches", label: "Marchés", icon: "briefcase", badge: "5" },
  { id: "analyses", label: "Analyses", icon: "file-search" },
  { id: "reponses", label: "Réponses", icon: "sparkles" },
];
const TITLES = { accueil: "Accueil", marches: "Marchés", analyses: "Analyses", reponses: "Réponses", entreprise: "Mon entreprise", messages: "Messages" };

function Sidebar({ page, go, credits, company, email }) {
  useLucide();
  return (
    <aside className="side">
      <div className="side-logo"><img src="tendrix-logo-blue.png" alt="Tendrix" /></div>
      <button className="side-cta" onClick={() => go("marches")}><Ico name="plus" className="ico-sm" /> <span className="lbl">Analyser un AO</span></button>
      <nav className="side-nav scrollbar">
        <div className="side-sec lbl">Pilotage</div>
        {NAV.map((n) => (
          <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => go(n.id)}>
            <Ico name={n.icon} className="ico-md" /><span className="lbl">{n.label}</span>
            {n.badge && <span className="badge lbl">{n.badge}</span>}
          </button>
        ))}
        <div className="side-sec lbl">Compte</div>
        <button className={`nav-item ${page === "messages" ? "active" : ""}`} onClick={() => go("messages")}><Ico name="message-circle" className="ico-md" /><span className="lbl">Messages</span></button>
        <button className={`nav-item ${page === "entreprise" ? "active" : ""}`} onClick={() => go("entreprise")}><Ico name="building-2" className="ico-md" /><span className="lbl">Mon entreprise</span></button>
      </nav>
      <div className="side-foot">
        <button className="credit-pill" onClick={() => go("entreprise")}>
          <span className="c-left"><Ico name="coins" className="ico-sm" style={{ color: "var(--yellow)" }} /><span className="c-num tnum">{credits}</span><span className="c-txt" style={{ fontSize: 11.5, color: "rgba(255,255,255,.6)" }}>crédits</span></span>
          <span className="lbl" style={{ color: "var(--yellow)", fontWeight: 800 }}>+</span>
        </button>
        <div className="side-user">
          <div className="av">{company.charAt(0)}</div>
          <div style={{ minWidth: 0 }}><p className="nm clip1">{company}</p><p className="em clip1">{email}</p></div>
        </div>
      </div>
    </aside>
  );
}

const LOGO_FILTER = {
  blanc: "brightness(0) invert(1)",
  bleu: "none",
  noir: "brightness(0)",
  jaune: "brightness(0) saturate(100%) invert(82%) sepia(48%) saturate(720%) hue-rotate(337deg) brightness(101%) contrast(95%)",
};
function effectiveLogoFilter(sidebar, logo) {
  if (logo && logo !== "auto") return LOGO_FILTER[logo];
  return sidebar === "navy" ? LOGO_FILTER.blanc : LOGO_FILTER.bleu; // auto
}

function App() {
  const data = window.TENDRIX;
  const [t, setTweak] = useTweaks({ sidebar: "navy", logo: "auto" });
  const [page, setPage] = useState("accueil");
  const [view, setView] = useState(null); // {kind:'analysis'|'response'}
  const [confirmT, setConfirmT] = useState(null);

  useEffect(() => {
    document.body.dataset.sidebar = t.sidebar;
    document.body.style.setProperty("--logo-filter", effectiveLogoFilter(t.sidebar, t.logo));
  }, [t.sidebar, t.logo]);

  const go = (p) => { setView(null); setPage(p); };
  const openAnalysis = () => setView({ kind: "analysis" });
  const openResponse = () => setView({ kind: "response" });

  let title = TITLES[page];
  if (view?.kind === "analysis") title = "Fiche analyse";
  if (view?.kind === "response") title = "Dossier de réponse";

  return (
    <div className="app">
      <Sidebar page={page} go={go} credits={data.company.credits} company={data.company.name} email={data.company.email} />
      <div className="main">
        <header className="topbar">
          <h1>{title}</h1>
          <div className="search">
            <Ico name="search" className="ico-sm" />
            <input placeholder="Rechercher un marché, une analyse…" />
          </div>
          <button className="icon-btn"><Ico name="bell" className="ico-md" /><span className="dot"></span></button>
          <button className="icon-btn" style={{ borderColor: "transparent", background: "var(--navy)", color: "#fff", fontWeight: 800 }}>{data.company.contact.charAt(0)}</button>
        </header>

        {view?.kind === "analysis" ? (
          <Analyse a={data.analysisDetail} onBack={() => setView(null)} onRespond={openResponse} onChat={() => { setView(null); setPage("messages"); }} />
        ) : view?.kind === "response" ? (
          <Reponse r={data.responseDetail} onBack={() => setView({ kind: "analysis" })} />
        ) : page === "accueil" ? (
          <Dashboard data={data} onAnalyse={setConfirmT} onOpenAnalysis={openAnalysis} onChat={() => setPage("messages")} goMarches={() => go("marches")} />
        ) : page === "marches" ? (
          <Marches data={data} onAnalyse={setConfirmT} />
        ) : page === "analyses" ? (
          <AnalysesList data={data} onOpen={openAnalysis} />
        ) : page === "reponses" ? (
          <ReponsesList data={data} onOpen={openResponse} />
        ) : page === "messages" ? (
          <Placeholder title="Messages" subtitle="Échangez avec votre chargé d'affaires" icon="message-circle" />
        ) : (
          <Placeholder title="Mon entreprise" subtitle="Profil, librairie, plans & factures" icon="building-2" />
        )}
      </div>

      <ConfirmModal tender={confirmT} credits={data.company.credits} onClose={() => setConfirmT(null)} onConfirm={() => { setConfirmT(null); openAnalysis(); }} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Barre latérale" />
        <TweakRadio label="Style" value={t.sidebar}
          options={[{ value: "navy", label: "Navy" }, { value: "clair", label: "Clair" }, { value: "contour", label: "Minimal" }]}
          onChange={(v) => setTweak("sidebar", v)} />
        <TweakSection label="Logo Tendrix" />
        <TweakSelect label="Couleur" value={t.logo}
          options={[{ value: "auto", label: "Auto (selon la sidebar)" }, { value: "bleu", label: "Bleu d'origine" }, { value: "blanc", label: "Blanc" }, { value: "noir", label: "Noir" }, { value: "jaune", label: "Jaune Tendrix" }]}
          onChange={(v) => setTweak("logo", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
