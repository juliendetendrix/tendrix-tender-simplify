// Composants partagés du design system Tendrix (handoff webapp redesign).
// Recréés en TSX + lucide-react (le prototype design/ui.jsx utilisait lucide UMD).
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// Verdicts : clés réelles du système (go / go_with_reserve / no_go).
export type VerdictKey = "go" | "go_with_reserve" | "no_go";
export const VERDICT_TONE: Record<string, { label: string; tone: "go" | "warn" | "no"; phrase: string }> = {
  go:              { label: "GO",              tone: "go",   phrase: "Foncez, ce marché est fait pour vous." },
  go_with_reserve: { label: "GO AVEC RÉSERVE", tone: "warn", phrase: "Profil compatible, quelques points à lever." },
  no_go:           { label: "NO GO",           tone: "no",   phrase: "Ce marché ne semble pas adapté à votre profil." },
};

function toneByValue(value: number): "go" | "warn" | "no" {
  return value >= 75 ? "go" : value >= 55 ? "warn" : "no";
}
const DOT: Record<string, string> = { go: "var(--go-dot)", warn: "var(--warn-dot)", no: "var(--no-dot)" };

// Animation de comptage (KPI) — easing cubic, 900ms.
export function useCountUp(target: number, dur = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return val;
}

// Anneau SVG de compatibilité animé.
export function MatchRing({ value, size = 132, stroke = 11, label = "compatibilité" }:
  { value: number; size?: number; stroke?: number; label?: string }) {
  const [p, setP] = useState(0);
  useEffect(() => { const t = setTimeout(() => setP(value), 120); return () => clearTimeout(t); }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (p / 100) * c;
  const tone = DOT[toneByValue(value)];
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke}
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

// Barre fine de matching (listes).
export function MatchBar({ value }: { value: number | null }) {
  const v = value ?? 0;
  const tone = DOT[toneByValue(v)];
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(v), 80); return () => clearTimeout(t); }, [v]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 116 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 6, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: tone, borderRadius: 6, transition: "width .9s cubic-bezier(.22,.61,.36,1)" }} />
      </div>
      <span className="tnum" style={{ fontSize: 12.5, fontWeight: 800, color: tone, width: 34, textAlign: "right" }}>{value == null ? "—" : `${Math.round(v)}%`}</span>
    </div>
  );
}

// Badge de verdict (pastille + label).
export function VChip({ verdict, sm }: { verdict?: string | null; sm?: boolean }) {
  if (!verdict || !VERDICT_TONE[verdict]) return null;
  const { label, tone } = VERDICT_TONE[verdict];
  return (
    <span className={`v-chip v-${tone}`} style={sm ? { fontSize: 10 } : undefined}>
      <span className="dot" style={{ background: DOT[tone] }} />{label}
    </span>
  );
}

// Échéance avec urgence (J−N / Aujourd'hui / Clôturé).
export function Deadline({ days, date }: { days?: number | null; date?: string | null }) {
  if (date == null && days == null) return null;
  const d = days ?? 99;
  const past = d < 0;
  const urgent = d <= 7 && !past;
  const color = past ? "var(--muted)" : urgent ? "var(--no-fg)" : "var(--ink-2)";
  const txt = past ? "Clôturé" : d === 0 ? "Aujourd'hui" : `J−${d}`;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color, whiteSpace: "nowrap" }}>
      <Clock className="ico-sm" />
      {date && <span>{date}</span>}
      {days != null && <span style={{ fontWeight: 800, color: urgent ? "var(--no-fg)" : "var(--muted)" }}>{date ? "· " : ""}{txt}</span>}
    </span>
  );
}

// Avatar à initiales (variante accent jaune pour le chargé d'affaires).
export function Avatar({ initials, size = 38, accent }: { initials: string; size?: number; accent?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, flexShrink: 0,
      background: accent ? "var(--yellow-soft)" : "color-mix(in oklab, var(--navy) 10%, white)",
      color: accent ? "var(--warn-fg)" : "var(--navy)",
      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.38,
    }}>{initials}</div>
  );
}
