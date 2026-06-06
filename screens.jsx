// ─── Marchés · Analyse · Réponse ───

// ============ MARCHÉS ============
const FILTERS = ["Tous", "Compatibilité > 80%", "Échéance proche", "Couverture / Étanchéité", "CVC", "Menuiserie"];

function TenderRow({ t, onAnalyse, onHide }) {
  return (
    <div className="card" style={{ padding: 16, transition: "box-shadow .15s, border-color .15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "color-mix(in oklab, var(--navy) 18%, white)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--line)"; }}>
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span className="chip" style={{ whiteSpace: "nowrap", color: "var(--navy)", background: "color-mix(in oklab, var(--navy) 7%, white)", borderColor: "transparent" }}>{t.procedure.split(" (")[0]}</span>
            <span className="chip" style={{ whiteSpace: "nowrap" }}>{t.famille}</span>
          </div>
          <h3 style={{ fontSize: 15.5, fontWeight: 800, lineHeight: 1.3, letterSpacing: "-.01em" }}>{t.title}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 10, fontSize: 12.5, color: "var(--muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Ico name="building-2" className="ico-sm" />{t.organisme}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Ico name="map-pin" className="ico-sm" />{t.location}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 700, color: "var(--ink-2)", whiteSpace: "nowrap" }}><Ico name="coins" className="ico-sm" />{t.budget}</span>
            <Deadline days={t.deadlineDays} date={t.deadline} />
          </div>
        </div>
        <div style={{ width: 168, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
          <div style={{ width: "100%" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5, textAlign: "right" }}>Compatibilité profil</div>
            <MatchBar value={t.match} />
          </div>
          <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onHide(t.id)} title="Ne plus afficher"><Ico name="eye-off" className="ico-sm" /></button>
            <button className="btn btn-primary btn-sm" onClick={() => onAnalyse(t)}><Ico name="sparkles" className="ico-sm" /> Lancer l'analyse</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Marches({ data, onAnalyse }) {
  useLucide();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [hidden, setHidden] = useState(new Set());
  let list = data.tenders.filter((t) => !hidden.has(t.id));
  if (q) list = list.filter((t) => `${t.title} ${t.organisme} ${t.location}`.toLowerCase().includes(q.toLowerCase()));
  if (filter === "Compatibilité > 80%") list = list.filter((t) => t.match > 80);
  if (filter === "Échéance proche") list = list.filter((t) => t.deadlineDays <= 14);
  else if (["Couverture / Étanchéité", "CVC", "Menuiserie"].includes(filter)) list = list.filter((t) => t.famille.includes(filter.split(" ")[0]));

  return (
    <div className="page page-anim">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>Marchés</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}><strong className="tnum" style={{ color: "var(--ink-2)" }}>{list.length}</strong> opportunités correspondant à votre profil</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost"><Ico name="upload" className="ico-sm" /> Importer une URL / un PDF</button>
          <button className="btn btn-ghost icon-btn" style={{ width: 40 }}><Ico name="refresh-cw" className="ico-sm" /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
        <div className="search" style={{ margin: 0, width: 320 }}>
          <Ico name="search" className="ico-sm" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un marché, un organisme…" />
        </div>
        <div className="scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="chip" style={{ whiteSpace: "nowrap", cursor: "pointer",
              ...(filter === f ? { background: "var(--navy)", color: "#fff", borderColor: "var(--navy)" } : {}) }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {list.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: "center", padding: 50, color: "var(--muted)" }}>Aucun marché ne correspond à ce filtre.</div>
        ) : list.map((t) => <TenderRow key={t.id} t={t} onAnalyse={onAnalyse} onHide={(id) => setHidden((s) => new Set(s).add(id))} />)}
      </div>
    </div>
  );
}

// ============ ANALYSE (fiche AO, 2 colonnes desktop) ============
function FactRow({ icon, label, value, strong }) {
  return (
    <div style={{ display: "flex", gap: 11, padding: "11px 0", borderTop: "1px solid var(--line-2)" }}>
      <span style={{ color: "var(--navy)", marginTop: 1 }}><Ico name={icon} className="ico-sm" /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: strong ? 800 : 600, color: "var(--ink)", lineHeight: 1.4 }}>{value}</div>
      </div>
    </div>
  );
}

function AnalyseSection({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "15px 18px", textAlign: "left" }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, flex: 1 }}>{title}</span>
        <span style={{ color: "var(--muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}><Ico name="chevron-down" className="ico-sm" /></span>
      </button>
      {open && <div style={{ padding: "0 18px 18px" }}>{children}</div>}
    </div>
  );
}

function Tabs({ tabs, active, setActive }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12, padding: 4, marginBottom: 18 }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{ flex: 1, height: 38, borderRadius: 9, fontSize: 13.5, fontWeight: 700, transition: "all .15s",
          ...(active === t.id ? { background: "var(--surface)", color: "var(--navy)", boxShadow: "var(--shadow-sm)" } : { color: "var(--muted)" }) }}>
          {t.label}{t.count != null ? ` (${t.count})` : ""}
        </button>
      ))}
    </div>
  );
}

function Analyse({ a, onBack, onRespond, onChat }) {
  useLucide();
  const [tab, setTab] = useState("analyse");
  const v = window.VERDICT[a.verdict];
  const tone = v.tone === "go" ? "go" : v.tone === "warn" ? "warn" : "no";
  const verdictColor = `var(--${tone}-fg)`;

  return (
    <div className="page page-anim" style={{ maxWidth: 1240 }}>
      {/* fil d'ariane + titre */}
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><Ico name="arrow-left" className="ico-sm" /> Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 7 }}>
        <Ico name="sparkles" className="ico-sm" /> FICHE ANALYSE IA
      </div>
      <h2 style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.2, maxWidth: 820 }}>{a.title}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 11, fontSize: 13, color: "var(--muted)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Ico name="building-2" className="ico-sm" />{a.organisme}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Ico name="map-pin" className="ico-sm" />{a.location}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Ico name="gavel" className="ico-sm" />{a.procedure.split(" — ")[0]}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "344px 1fr", gap: 22, marginTop: 24, alignItems: "start" }}>
        {/* ─ Colonne gauche : verdict + faits + CTA (sticky) ─ */}
        <div style={{ position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card card-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 24, paddingBottom: 22 }}>
            <MatchRing value={a.match} />
            <div className={`v-chip v-${tone}`} style={{ marginTop: 16, fontSize: 13, padding: "5px 13px" }}>
              <span className="dot" style={{ background: `var(--${tone}-dot)` }}></span>{v.label}
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: verdictColor, marginTop: 10, lineHeight: 1.4 }}>{v.phrase}</p>
          </div>

          <div className="card card-pad" style={{ paddingTop: 6 }}>
            <FactRow icon="coins" label="Budget estimé" value={a.budget} strong />
            <FactRow icon="calendar-clock" label="Remise des offres" value={`${a.deadline} · J−${a.deadlineDays}`} strong />
            <FactRow icon="timer" label="Durée du marché" value={a.duree} />
            <FactRow icon="map-pinned" label="Lieu d'exécution" value={a.lieu} />
          </div>

          <button onClick={onRespond} className="btn btn-primary" style={{ height: 48, fontSize: 14.5 }}>
            <Ico name="sparkles" className="ico-sm" /> Répondre à ce marché
            <span className="v-chip" style={{ background: "rgba(249,189,67,.22)", color: "var(--yellow)", marginLeft: 2 }}><Ico name="coins" className="ico-sm" /> 5</span>
          </button>
          <button onClick={onChat} className="btn btn-ghost" style={{ marginTop: -6 }}><Ico name="message-circle" className="ico-sm" /> Discuter avec mon chargé d'affaires</button>
        </div>

        {/* ─ Colonne droite : onglets ─ */}
        <div>
          <Tabs tabs={[{ id: "analyse", label: "L'analyse" }, { id: "prerequis", label: "Prérequis" }, { id: "documents", label: "Documents", count: a.documents.length }]} active={tab} setActive={setTab} />

          {tab === "analyse" && (
            <div>
              {a.attention && (
                <div style={{ display: "flex", gap: 12, padding: 16, borderRadius: 13, background: "#fff7ed", border: "1px solid #fed7aa", marginBottom: 14 }}>
                  <span style={{ color: "#ea580c", marginTop: 1 }}><Ico name="triangle-alert" className="ico-md" /></span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#c2410c", marginBottom: 3 }}>Point de vigilance</p>
                    <p style={{ fontSize: 13, color: "#9a3412", lineHeight: 1.5 }}>{a.attention}</p>
                  </div>
                </div>
              )}
              <AnalyseSection title="Avis de l'IA" defaultOpen>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-2)" }}>
                  <span style={{ fontWeight: 800, color: verdictColor }}>{v.label} · </span>{a.avis}
                </p>
              </AnalyseSection>
              <AnalyseSection title="Description du marché" defaultOpen>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-2)" }}>{a.description}</p>
              </AnalyseSection>
              <AnalyseSection title={`Lots (${a.lots.length})`} defaultOpen>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {a.lots.map((l) => (
                    <div key={l.numero} style={{ border: "1px solid var(--line)", borderRadius: 11, padding: 13, background: "var(--surface-2)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800 }}>Lot {l.numero} — {l.intitule}</span>
                        <span className={`v-chip ${l.ouvert ? "v-go" : "v-no"}`} style={{ fontSize: 9.5 }}>{l.ouvert ? "PERTINENT" : "HORS PROFIL"}</span>
                      </div>
                      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 5, lineHeight: 1.5 }}>{l.resume}</p>
                    </div>
                  ))}
                </div>
              </AnalyseSection>
              <AnalyseSection title="Calendrier de réponse">
                <div style={{ position: "relative", paddingLeft: 22 }}>
                  <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: "var(--line)" }} />
                  {a.calendrier.map((c, i) => {
                    const urgent = /limite/i.test(c.label) || /obligatoire/i.test(c.label);
                    return (
                      <div key={i} style={{ position: "relative", paddingBottom: i === a.calendrier.length - 1 ? 0 : 16 }}>
                        <span style={{ position: "absolute", left: -22, top: 3, width: 12, height: 12, borderRadius: "50%", background: urgent ? "var(--no-dot)" : "var(--navy)", border: "2px solid var(--surface)", boxShadow: "0 0 0 1.5px var(--line)" }} />
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: urgent ? "var(--no-fg)" : "var(--ink)" }}>{c.label}</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 1 }}>{c.valeur}</div>
                      </div>
                    );
                  })}
                </div>
              </AnalyseSection>
              <AnalyseSection title="Critères de jugement">
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {a.jugement.map((j, i) => {
                    const pct = parseInt(j.detail);
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                          <span style={{ fontWeight: 600 }}>{j.label}</span>
                          <span className="tnum" style={{ fontWeight: 800, color: "var(--navy)" }}>{j.detail}</span>
                        </div>
                        <div style={{ height: 7, borderRadius: 7, background: "var(--line)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "var(--navy)", borderRadius: 7 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AnalyseSection>
            </div>
          )}

          {tab === "prerequis" && (
            <div className="card card-pad">
              <div style={{ display: "flex", gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--navy)" }}><Ico name="map-pinned" className="ico-md" /></span>
                <div>
                  <p style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 4 }}>Visite de site</p>
                  <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>{a.visites}</p>
                </div>
              </div>
              <p style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "var(--navy)" }}><Ico name="shield-check" className="ico-md" /></span> Qualifications & pièces requises</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {a.qualifications.map((p, i) => (
                  <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 11, padding: 13, display: "flex", gap: 11, background: "var(--surface-2)" }}>
                    <span style={{ marginTop: 1, color: p.obligatoire ? "var(--no-dot)" : "var(--go-dot)" }}><Ico name={p.obligatoire ? "asterisk" : "check"} className="ico-sm" /></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{p.label}</span>
                        {p.obligatoire && <span className="v-chip v-no" style={{ fontSize: 9.5 }}>OBLIGATOIRE</span>}
                      </div>
                      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>{p.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "documents" && (
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--muted)", background: "var(--surface-2)" }}>
                <Ico name="link-2" className="ico-sm" /> Profil acheteur détecté · <strong style={{ color: "var(--ink-2)" }}>PLACE — marches-publics.gouv.fr</strong> · réf. 2026-VBN-0142
              </div>
              {a.documents.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 18px", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
                  <span style={{ color: d.key ? "var(--yellow)" : "var(--muted-2)" }}><Ico name={d.key ? "star" : "file-text"} className="ico-md" /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700 }}>{d.name}</p>
                    <p style={{ fontSize: 11.5, color: "var(--muted)" }}>{d.type}{d.key ? " · pièce clé" : ""} · {d.size}</p>
                  </div>
                  <button className="icon-btn" style={{ width: 34, height: 34 }}><Ico name="download" className="ico-sm" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Marches, Analyse });
