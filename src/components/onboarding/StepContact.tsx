import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { OnboardingData } from "./OnboardingQuestionnaire";

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  saving: boolean;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StepContact({ data, update, onNext, saving }: Props) {
  const [attempted, setAttempted] = useState(false);

  const errors = {
    first_name: !data.first_name.trim() ? "Votre prénom est requis" : null,
    last_name: !data.last_name.trim() ? "Votre nom est requis" : null,
    email: !emailRegex.test(data.email) ? "Veuillez saisir un email valide" : null,
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleNext = () => {
    setAttempted(true);
    if (hasErrors) return;
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <img src="/icon-tendrix-bicolor.svg" alt="" className="h-10 w-10 mx-auto opacity-90" />
        <h2 className="text-3xl font-bold text-foreground leading-tight">
          Vos coordonnées
        </h2>
        <p className="text-muted-foreground">
          Pour vous envoyer vos opportunités personnalisées.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              value={data.first_name}
              onChange={(e) => update({ first_name: e.target.value })}
              placeholder="Jean"
              autoComplete="given-name"
              autoFocus
              className={`w-full h-12 px-4 rounded-xl border-2 bg-white focus:outline-none transition-colors text-sm ${
                attempted && errors.first_name
                  ? "border-red-400 focus:border-red-500"
                  : "border-border focus:border-primary"
              }`}
            />
            {attempted && errors.first_name && (
              <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              value={data.last_name}
              onChange={(e) => update({ last_name: e.target.value })}
              placeholder="Dupont"
              autoComplete="family-name"
              className={`w-full h-12 px-4 rounded-xl border-2 bg-white focus:outline-none transition-colors text-sm ${
                attempted && errors.last_name
                  ? "border-red-400 focus:border-red-500"
                  : "border-border focus:border-primary"
              }`}
            />
            {attempted && errors.last_name && (
              <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="jean.dupont@entreprise.fr"
            autoComplete="email"
            className={`w-full h-12 px-4 rounded-xl border-2 bg-white focus:outline-none transition-colors text-sm ${
              attempted && errors.email
                ? "border-red-400 focus:border-red-500"
                : "border-border focus:border-primary"
            }`}
          />
          {attempted && errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Téléphone
          </label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 h-12 rounded-xl border-2 border-border bg-white text-sm text-foreground flex-shrink-0">
              🇫🇷 +33
            </div>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="6 12 34 56 78"
              autoComplete="tel"
              className="flex-1 h-12 px-4 rounded-xl border-2 border-border bg-white focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleNext}
          disabled={saving}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-bold transition-all disabled:opacity-50"
          style={{ backgroundColor: "#f9bd43", color: "#0c1c98" }}
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>Continuer <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Vos données sont protégées et ne seront jamais revendues.
        </p>
      </div>
    </div>
  );
}
