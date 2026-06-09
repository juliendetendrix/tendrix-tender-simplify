// Aperçu d'un marché recommandé (avant analyse), dans le shell desktop.
// Donne les infos disponibles AVANT analyse (méta, compatibilité estimée, résumé IA)
// + un aperçu flouté de la fiche analyse avec CTA "Lancer l'analyse" par-dessus.
import {
  ArrowLeft, Sparkles, Building2, MapPin, Calendar, Coins, Loader2, FileText, Timer, Lock,
} from "lucide-react";
import { MatchRing } from "@/components/desktop/DesignKit";
import { useTenderSummary } from "@/hooks/useTenderSummary";
import type { BoampTender } from "@/hooks/useBoampTenders";

function Fact({ icon, label, value, strong }: { icon: React.ReactNode; label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 11, padding: "11px 0", borderTop: "1px solid var(--line-2)" }}>
      <span style={{ color: "var(--navy)", marginTop: 1, display: "flex" }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: strong ? 800 : 600, color: "var(--ink)", lineHeight: 1.4 }}>{value}</div>
      </div>
    </div>
  );
}

// Barre grise (placeholder de contenu flouté)
const Bar = ({ w }: { w: string }) => <div style={{ height: 11, borderRadius: 6, background: "var(--line)", width: w }} />;

export default function TenderPreviewDesktop({ tender, onBack, onAnalyse, analysisCost = 1 }:
  { tender: BoampTender; onBack: () => void; onAnalyse: (t: BoampTender) => void; analysisCost?: number }) {
  // Résumé concis (2-3 lignes) généré automatiquement depuis les infos BOAMP,
  // sans analyse. Disponible d'emblée pour tout marché recommandé.
  const { summary, loading } = useTenderSummary(tender);
  const compat = tender.compatibility;
  const hasFacts = !!(tender.budget || tender.deadline || tender.location);

  return (
    <div className="page page-anim" style={{ maxWidth: 1240 }}>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><ArrowLeft className="ico-sm" /> Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 7 }}>
        <Sparkles className="ico-sm" /> APERÇU DU MARCHÉ
      </div>
      <h2 style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.2, maxWidth: 820 }}>{tender.title}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 11, fontSize: 13, color: "var(--muted)" }}>
        {tender.organisme && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Building2 className="ico-sm" />{tender.organisme}</span>}
        {tender.location && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin className="ico-sm" />{tender.location}</span>}
        {tender.deadline && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Calendar className="ico-sm" />Date limite : {tender.deadline}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "344px minmax(0,1fr)", gap: 22, marginTop: 24, alignItems: "start" }}>
        {/* ─ Gauche : compatibilité estimée + faits + CTA ─ */}
        <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {compat != null && (
            <div className="card card-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 24, paddingBottom: 22 }}>
              <MatchRing value={compat} label="compatibilité estimée" />
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 12, lineHeight: 1.45 }}>Estimation avant analyse, basée sur votre métier et votre zone. L'analyse affine ce score.</p>
            </div>
          )}

          {hasFacts && (
            <div className="card card-pad" style={{ paddingTop: 6 }}>
              {tender.budget && <Fact icon={<Coins className="ico-sm" />} label="Budget indiqué" value={tender.budget} strong />}
              {tender.deadline && <Fact icon={<Calendar className="ico-sm" />} label="Remise des offres" value={tender.deadline} strong />}
              {tender.location && <Fact icon={<MapPin className="ico-sm" />} label="Lieu d'exécution" value={tender.location} />}
              {tender.procedure && <Fact icon={<Timer className="ico-sm" />} label="Procédure" value={tender.procedure} />}
            </div>
          )}

          <button onClick={() => onAnalyse(tender)} className="btn btn-primary" style={{ height: 48, fontSize: 14.5 }}>
            <Sparkles className="ico-sm" /> Lancer l'analyse
            <span className="v-chip" style={{ background: "rgba(249,189,67,.22)", color: "var(--yellow)" }}><Coins className="ico-sm" /> {analysisCost}</span>
          </button>
        </div>

        {/* ─ Droite : résumé IA + aperçu flouté de la fiche analyse ─ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Résumé de l'appel d'offres (dispo avant analyse) */}
          <div className="card card-pad">
            <div className="card-h"><span className="ico"><FileText className="ico-md" /></span><span className="t">Résumé de l'appel d'offres</span></div>
            {loading ? (
              <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--muted)", fontSize: 13.5 }}><Loader2 className="ico-sm animate-spin" /> Génération du résumé…</div>
            ) : summary ? (
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-2)", whiteSpace: "pre-line" }}>{summary}</p>
            ) : (
              <p style={{ fontSize: 13.5, color: "var(--muted)" }}>Résumé indisponible pour le moment.</p>
            )}
          </div>

          {/* Aperçu flouté de la fiche analyse + overlay CTA */}
          <div style={{ position: "relative" }}>
            <div aria-hidden style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none", opacity: .8, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <Bar w="38%" /><Bar w="92%" /><Bar w="86%" /><Bar w="64%" />
              </div>
              <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <Bar w="28%" />
                <div style={{ display: "flex", gap: 10 }}><Bar w="48%" /><Bar w="14%" /></div>
                <div style={{ display: "flex", gap: 10 }}><Bar w="40%" /><Bar w="14%" /></div>
                <div style={{ display: "flex", gap: 10 }}><Bar w="30%" /><Bar w="14%" /></div>
              </div>
              <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <Bar w="34%" /><Bar w="80%" /><Bar w="72%" />
              </div>
            </div>

            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div className="card card-pad" style={{ textAlign: "center", maxWidth: 440, boxShadow: "var(--shadow-lg)" }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, background: "color-mix(in oklab, var(--navy) 9%, white)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Lock className="ico-md" /></span>
                <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Analyse non lancée</p>
                <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 16 }}>Lancez l'analyse IA pour révéler le verdict Go / No-Go, la compatibilité détaillée, les lots, le calendrier et les critères de jugement.</p>
                <button onClick={() => onAnalyse(tender)} className="btn btn-primary">
                  <Sparkles className="ico-sm" /> Lancer l'analyse
                  <span className="v-chip" style={{ background: "rgba(249,189,67,.22)", color: "var(--yellow)" }}><Coins className="ico-sm" /> {analysisCost}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
