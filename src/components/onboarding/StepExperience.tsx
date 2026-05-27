import { ArrowRight, ThumbsUp, Lightbulb } from "lucide-react";
import type { OnboardingData } from "./OnboardingQuestionnaire";

const PAIN_POINTS = [
  { value: "find",      label: "Trouver les bons AO", emoji: "🔍" },
  { value: "understand",label: "Comprendre les documents", emoji: "📄" },
  { value: "write",     label: "Rédiger la réponse", emoji: "✍️" },
  { value: "track",     label: "Suivre les dossiers", emoji: "📊" },
];

const VOLUMES = [
  { value: "<5",    label: "Moins de 5 / an" },
  { value: "5-20",  label: "5 à 20 / an" },
  { value: "20-50", label: "20 à 50 / an" },
  { value: "50+",   label: "Plus de 50 / an" },
];

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function StepExperience({ data, update, onNext }: Props) {
  const togglePain = (v: string) => {
    const next = data.ao_pain_points.includes(v)
      ? data.ao_pain_points.filter((p) => p !== v)
      : [...data.ao_pain_points, v];
    update({ ao_pain_points: next });
  };

  /* Sous-étape 1 : Oui / Non */
  if (data.has_ao_experience === null) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground leading-tight">
            Avez-vous déjà répondu à des appels d'offres ?
          </h2>
          <p className="text-muted-foreground">
            Cette information nous aide à personnaliser votre expérience.
          </p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => update({ has_ao_experience: true })}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-white hover:border-primary hover:bg-primary/5 transition-all text-left group"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
              <ThumbsUp className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Oui, j'ai de l'expérience</p>
              <p className="text-sm text-muted-foreground mt-0.5">J'ai déjà déposé des dossiers de réponse</p>
            </div>
          </button>

          <button
            onClick={() => update({ has_ao_experience: false })}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-white hover:border-primary hover:bg-primary/5 transition-all text-left group"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <Lightbulb className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Non, c'est la première fois</p>
              <p className="text-sm text-muted-foreground mt-0.5">Je veux me lancer dans les marchés publics</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* Sous-étape 2 : Volume (si oui) + Points de friction */
  return (
    <div className="space-y-8">
      {data.has_ao_experience && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-foreground">Combien d'appels d'offres par an ?</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {VOLUMES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => update({ ao_volume: value })}
                className={`p-4 rounded-2xl border-2 text-sm font-semibold transition-all ${
                  data.ao_volume === value
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-foreground hover:border-primary/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-foreground">
            {data.has_ao_experience
              ? "Qu'est-ce qui vous prend le plus de temps ?"
              : "Qu'est-ce qui vous semble le plus difficile ?"}
          </h3>
          <p className="text-sm text-muted-foreground">Plusieurs réponses possibles.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PAIN_POINTS.map(({ value, label, emoji }) => {
            const selected = data.ao_pain_points.includes(value);
            return (
              <button
                key={value}
                onClick={() => togglePain(value)}
                className={`flex items-center gap-2 p-4 rounded-2xl border-2 text-sm font-medium transition-all text-left ${
                  selected
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border bg-white text-foreground hover:border-primary/40"
                }`}
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-bold"
        style={{ backgroundColor: "#f9bd43", color: "#0c1c98" }}
      >
        Continuer <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
