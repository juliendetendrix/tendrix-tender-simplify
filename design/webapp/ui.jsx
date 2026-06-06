// ─── UI partagé (icônes Lucide, jauge, helpers) ───
const { useState, useEffect, useRef, useLayoutEffect } = React;

// Rafraîchit les icônes Lucide après chaque rendu
function useLucide(dep) {
  useLayoutEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
}
function Ico({ name, className }) {
  return <i data-lucide={name} className={className || ""}></i>;
}

// Animation de comptage (KPI)
function useCountUp(target, dur = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return val;
}

// Jauge de compatibilité (anneau SVG animé)
function MatchRing({ value, size = 132, stroke = 11, label = "compatibilité" }) {
  const [p, setP] = useState(0);
  useEffect(() => { const t = setTimeout(() => setP(value), 120); return () => clearTimeout(t); }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (p / 100) * c;
  const tone = value >= 75 ? "var(--go-dot)" : value >= 55 ? "var(--warn-dot)" : "var(--no-dot)";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle className="ring-track" cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={tone} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,.61,.36,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="tnum" style={{ fontSize: size * 0.3, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
          {Math.round(p)}<span style={{ fontSize: size * 0.15, color: "var(--muted)" }}>%</span>
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 3 }}>{label}</span>
      </div>
    </div>
  );
}

// Barre de matching fine (listes)
function MatchBar({ value }) {
  const tone = value >= 75 ? "var(--go-dot)" : value >= 55 ? "var(--warn-dot)" : "var(--no-dot)";
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 80); return () => clearTimeout(t); }, [value]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 116 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 6, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: tone, borderRadius: 6, transition: "width .9s cubic-bezier(.22,.61,.36,1)" }} />
      </div>
      <span className="tnum" style={{ fontSize: 12.5, fontWeight: 800, color: tone, width: 34, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function VChip({ verdict, sm }) {
  const v = window.VERDICT[verdict];
  const cls = v.tone === "go" ? "v-go" : v.tone === "warn" ? "v-warn" : "v-no";
  const dotc = v.tone === "go" ? "var(--go-dot)" : v.tone === "warn" ? "var(--warn-dot)" : "var(--no-dot)";
  return <span className={`v-chip ${cls}`} style={sm ? { fontSize: 10 } : null}><span className="dot" style={{ background: dotc }}></span>{v.label}</span>;
}

// Pastille d'échéance (urgence)
function Deadline({ days, date }) {
  const urgent = days <= 7;
  const past = days < 0;
  const color = past ? "var(--muted)" : urgent ? "var(--no-fg)" : "var(--ink-2)";
  const txt = past ? "Clôturé" : days === 0 ? "Aujourd'hui" : `J−${days}`;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color, whiteSpace: "nowrap" }}>
      <Ico name="clock" className="ico-sm" />
      <span>{date}</span>
      {!past && <span style={{ fontWeight: 800, color: urgent ? "var(--no-fg)" : "var(--muted)" }}>· {txt}</span>}
    </span>
  );
}

function Avatar({ initials, size = 38, accent }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, flexShrink: 0,
      background: accent ? "var(--yellow-soft)" : "color-mix(in oklab, var(--navy) 10%, white)",
      color: accent ? "var(--warn-fg)" : "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.38 }}>{initials}</div>
  );
}

Object.assign(window, { useLucide, Ico, useCountUp, MatchRing, MatchBar, VChip, Deadline, Avatar });
