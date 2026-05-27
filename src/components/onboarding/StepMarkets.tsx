import { Check, ArrowRight, HardHat, Briefcase, Package } from "lucide-react";
import type { OnboardingData } from "./OnboardingQuestionnaire";

const MARKET_OPTIONS = [
  {
    value: "Travaux",
    icon: HardHat,
    title: "Travaux",
    desc: "Construction, rénovation, aménagement",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    value: "Prestations de services",
    icon: Briefcase,
    title: "Prestations de services",
    desc: "Maintenance, entretien, conseil, gardiennage",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    value: "Fournitures",
    icon: Package,
    title: "Fournitures",
    desc: "Matériaux, équipements, consommables",
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function StepMarkets({ data, update, onNext }: Props) {
  const toggle = (v: string) => {
    const next = data.market_types.includes(v)
      ? data.market_types.filter((t) => t !== v)
      : [...data.market_types, v];
    update({ market_types: next });
  };

  const canContinue = data.market_types.length >= 1;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground leading-tight">
          Quels types de marchés vous intéressent ?
        </h2>
        <p className="text-muted-foreground">
          Plusieurs réponses possibles.
        </p>
      </div>

      <div className="grid gap-3">
        {MARKET_OPTIONS.map(({ value, icon: Icon, title, desc, color, bg }) => {
          const selected = data.market_types.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggle(value)}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                selected
                  ? "border-primary bg-primary/8"
                  : "border-border bg-white hover:border-primary/40 hover:bg-primary/4"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${selected ? "bg-primary/15" : bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${selected ? "text-primary" : color}`} />
              </div>
              <div className="flex-1">
                <p className={`font-bold ${selected ? "text-primary" : "text-foreground"}`}>{title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-primary bg-primary" : "border-border"}`}>
                {selected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: canContinue ? "#f9bd43" : "#e5e7eb", color: canContinue ? "#0c1c98" : "#9ca3af" }}
      >
        {canContinue ? "Continuer" : "Sélectionnez au moins un type"}
        {canContinue && <ArrowRight className="w-5 h-5" />}
      </button>
    </div>
  );
}
