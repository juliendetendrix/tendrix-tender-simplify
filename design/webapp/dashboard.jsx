// ─── Écran Accueil (dashboard) ───
function KpiCard({ k }) {
  const v = useCountUp(k.value);
  const trendColor = k.trend === "up" ? "var(--go-fg)" : k.trend === "warn" ? "var(--warn-fg)" : "var(--muted)";
  const trendBg = k.trend === "up" ? "var(--go-bg)" : k.trend === "warn" ? "var(--warn-bg)" : "var(--surface-2)";
  return (
    <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>{k.label}</span>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: "color-mix(in oklab, var(--navy) 7%, white)", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ico name={k.icon} className="ico-sm" />
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="tnum" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 }}>
          {Math.round(v)}{k.suffix}
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: trendColor, background: trendBg, padding: "2px 7px", borderRadius: 6 }}>{k.delta}</span>
      </div>
    </div>
  );
}

const STATUS_COLS = [
  { id: "demande",  label: "Demande émise", tone: "var(--muted-2)" },
  { id: "en_cours", label: "En cours",      tone: "var(--navy)" },
  { id: "soumis",   label: "Soumis",        tone: "var(--warn-dot)" },
  { id: "gagne",    label: "Remporté",      tone: "var(--go-dot)" },
];

function PipelineCard({ d, onOpen }) {
  return (
    <button onClick={onOpen} className="card" style={{ textAlign: "left", padding: 13, display: "block", width: "100%", transition: "transform .14s, box-shadow .14s, border-color .14s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "color-mix(in oklab, var(--navy) 22%, white)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--line)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <VChip verdict={d.verdict} sm />
        <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--navy)" }}>{d.budget}</span>
      </div>
      <p className="clip2" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.35, color: "var(--ink)" }}>{d.title}</p>
      <p className="clip1" style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>{d.organisme}</p>
      <div style={{ marginTop: 10, height: 5, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${d.progress}%`, background: d.status === "gagne" ? "var(--go-dot)" : "var(--navy)", borderRadius: 5 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <Deadline days={d.deadlineDays} date={d.deadline} />
      </div>
    </button>
  );
}

function Pipeline({ dossiers, onOpen }) {
  return (
    <div className="card card-pad">
      <div className="card-h">
        <span className="ico"><Ico name="kanban" className="ico-md" /></span>
        <span className="t">Mes appels d'offres en cours</span>
        <a className="more">Tout voir <Ico name="arrow-right" className="ico-sm" /></a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {STATUS_COLS.map((col) => {
          const items = dossiers.filter((d) => d.status === col.id);
          return (
            <div key={col.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11, paddingBottom: 9, borderBottom: "1px solid var(--line)" }}>
                <span className="dot" style={{ background: col.tone }}></span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-2)" }}>{col.label}</span>
                <span className="tnum" style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 800, color: "var(--muted-2)" }}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 60 }}>
                {items.length === 0 ? (
                  <div style={{ border: "1.5px dashed var(--line)", borderRadius: 11, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, color: "var(--muted-2)" }}>—</div>
                ) : items.map((d) => <PipelineCard key={d.id} d={d} onOpen={() => onOpen(d)} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecoCard({ t, onAnalyse }) {
  return (
    <div style={{ padding: "13px 4px", borderBottom: "1px solid var(--line-2)", display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="clip1" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{t.title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5 }}>
          <span className="clip1" style={{ fontSize: 11.5, color: "var(--muted)", maxWidth: 150 }}>{t.organisme}</span>
          <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>·</span>
          <Deadline days={t.deadlineDays} date={t.deadline} />
        </div>
      </div>
      <div style={{ width: 110, flexShrink: 0 }}><MatchBar value={t.match} /></div>
      <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} onClick={() => onAnalyse(t)}>
        <Ico name="sparkles" className="ico-sm" /> Analyser
      </button>
    </div>
  );
}

function Reco({ tenders, onAnalyse, goMarches }) {
  return (
    <div className="card card-pad">
      <div className="card-h">
        <span className="ico"><Ico name="sparkles" className="ico-md" /></span>
        <span className="t">Recommandations marchés</span>
        <a className="more" onClick={goMarches}>Marchés <Ico name="arrow-right" className="ico-sm" /></a>
      </div>
      <div>{tenders.slice(0, 4).map((t) => <RecoCard key={t.id} t={t} onAnalyse={onAnalyse} />)}</div>
    </div>
  );
}

function RecentAnalyses({ analyses, onOpen }) {
  return (
    <div className="card card-pad">
      <div className="card-h">
        <span className="ico"><Ico name="file-search" className="ico-md" /></span>
        <span className="t">Mes dernières analyses</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {analyses.map((a, i) => (
          <button key={a.id} onClick={() => onOpen(a)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 6px", borderTop: i ? "1px solid var(--line-2)" : "none", textAlign: "left", width: "100%", borderRadius: 8, transition: "background .14s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="clip1" style={{ fontSize: 13, fontWeight: 700 }}>{a.title}</p>
              <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{a.organisme} · {a.date}</p>
            </div>
            <VChip verdict={a.verdict} sm />
            <Ico name="chevron-right" className="ico-sm" />
          </button>
        ))}
      </div>
    </div>
  );
}

function CaCard({ ca, onChat }) {
  return (
    <div className="card card-pad" style={{ display: "flex", flexDirection: "column" }}>
      <div className="card-h">
        <span className="ico" style={{ color: "var(--warn-fg)" }}><Ico name="user-round-check" className="ico-md" /></span>
        <span className="t">Mon chargé d'affaires</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <Avatar initials={ca.initials} size={52} accent />
        <div>
          <p style={{ fontSize: 15, fontWeight: 800 }}>{ca.display_name}</p>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>{ca.role} · secteur Rhône</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 15 }}>
        <a href={`tel:${ca.phone}`} className="btn btn-ghost btn-sm"><Ico name="phone" className="ico-sm" /> Appeler</a>
        <a href={`mailto:${ca.email}`} className="btn btn-ghost btn-sm"><Ico name="mail" className="ico-sm" /> Email</a>
      </div>
      <button onClick={onChat} className="btn btn-accent" style={{ marginTop: 9 }}>
        <Ico name="message-circle" className="ico-sm" /> Écrire à {ca.display_name.split(" ")[0]}
      </button>
    </div>
  );
}

function Dashboard({ data, onAnalyse, onOpenAnalysis, onChat, goMarches }) {
  useLucide();
  return (
    <div className="page page-anim">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>Bonjour {data.company.contact.split(" ")[0]} 👋</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Voici l'activité de <strong style={{ color: "var(--ink-2)" }}>{data.company.name}</strong> aujourd'hui.</p>
        </div>
        <button className="btn btn-primary" onClick={goMarches}><Ico name="plus" className="ico-sm" /> Analyser un nouvel AO</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "var(--gap)" }}>
        {data.kpis.map((k) => <KpiCard key={k.id} k={k} />)}
      </div>

      <div style={{ marginBottom: "var(--gap)" }}>
        <Pipeline dossiers={data.dossiers} onOpen={onOpenAnalysis} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.35fr 1fr" }}>
        <Reco tenders={data.tenders} onAnalyse={onAnalyse} goMarches={goMarches} />
        <CaCard ca={data.ca} onChat={onChat} />
      </div>

      <div style={{ marginTop: "var(--gap)" }}>
        <RecentAnalyses analyses={data.analyses} onOpen={onOpenAnalysis} />
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
