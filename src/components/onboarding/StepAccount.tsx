import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import type { OnboardingData } from "./OnboardingQuestionnaire";

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function StepAccount({ data, update, onSubmit, submitting }: Props) {
  const [showPwd, setShowPwd] = useState(false);

  const canSubmit = data.password.length >= 8;

  const recap = [
    data.company_name && { label: "Entreprise", value: data.company_name },
    data.sectors.length > 0 && {
      label: "Secteurs",
      value: data.sectors.slice(0, 2).join(", ") + (data.sectors.length > 2 ? ` +${data.sectors.length - 2}` : ""),
    },
    { label: "Zone", value: data.zone_type === "france" ? "France entière" : `${data.regions.length} région${data.regions.length > 1 ? "s" : ""}` },
    data.market_types.length > 0 && { label: "Marchés", value: data.market_types.join(", ") },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div className="rounded-2xl p-6 text-center space-y-2" style={{ background: "linear-gradient(135deg, #0c1c98 0%, #1a2ecc 100%)" }}>
        <div className="flex items-center justify-center mx-auto">
          <img src="/logo-tendrix-white.svg" alt="Tendrix" className="h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Votre espace Tendrix est prêt !</h2>
        <p className="text-white/70 text-sm">
          Créez votre compte pour accéder à vos opportunités personnalisées.
        </p>
      </div>

      {/* Récap */}
      <div className="bg-muted/30 rounded-2xl p-4 divide-y divide-border">
        {recap.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <span className="text-xs font-semibold text-foreground text-right truncate max-w-[55%]">{value}</span>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Créez votre mot de passe <span className="font-normal text-muted-foreground">(8 caractères min.)</span>
          </label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={data.password}
              onChange={(e) => update({ password: e.target.value })}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full h-12 px-4 pr-11 rounded-xl border-2 border-border bg-white focus:outline-none focus:border-primary transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!canSubmit || submitting}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: canSubmit ? "#f9bd43" : "#e5e7eb", color: canSubmit ? "#0c1c98" : "#9ca3af" }}
      >
        {submitting ? (
          <><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Création en cours…</>
        ) : (
          <>Accéder à Tendrix <ArrowRight className="w-5 h-5" /></>
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        En créant votre compte, vous acceptez nos{" "}
        <a href="/mentions-legales" className="underline hover:text-foreground">conditions d'utilisation</a>.
      </p>
    </div>
  );
}
