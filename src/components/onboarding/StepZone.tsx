import { useState } from "react";
import { Check, ArrowRight, Globe, MapPin } from "lucide-react";
import type { OnboardingData } from "./OnboardingQuestionnaire";

const REGIONS = [
  "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne",
  "Centre-Val de Loire", "Corse", "Grand Est", "Hauts-de-France",
  "Île-de-France", "Normandie", "Nouvelle-Aquitaine", "Occitanie",
  "Pays de la Loire", "Provence-Alpes-Côte d'Azur",
  "Guadeloupe", "Martinique", "Guyane", "La Réunion", "Mayotte",
];

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function StepZone({ data, update, onNext }: Props) {
  const [subStep, setSubStep] = useState<"type" | "regions">(
    data.zone_type === "regions" ? "regions" : "type"
  );

  const selectFrance = () => {
    update({ zone_type: "france", regions: [] });
    onNext();
  };

  const selectRegions = () => {
    update({ zone_type: "regions" });
    setSubStep("regions");
  };

  const toggleRegion = (r: string) => {
    const next = data.regions.includes(r)
      ? data.regions.filter((x) => x !== r)
      : [...data.regions, r];
    update({ regions: next });
  };

  const canContinue = data.regions.length >= 1;

  if (subStep === "type") {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <img src="/icon-tendrix-blue.svg" alt="" className="h-7 w-7 mx-auto opacity-25" />
          <h2 className="text-3xl font-bold text-foreground leading-tight">
            Sur quelle zone géographique intervenez-vous ?
          </h2>
          <p className="text-muted-foreground">
            Cela nous permet de filtrer les marchés dans votre secteur.
          </p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={selectFrance}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-white hover:border-primary hover:bg-primary/5 transition-all text-left group"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
              <Globe className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Toute la France</p>
              <p className="text-sm text-muted-foreground mt-0.5">Je réponds à des marchés partout en France</p>
            </div>
          </button>

          <button
            onClick={selectRegions}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-white hover:border-primary hover:bg-primary/5 transition-all text-left group"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/15 transition-colors">
              <MapPin className="w-7 h-7 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Régions spécifiques</p>
              <p className="text-sm text-muted-foreground mt-0.5">Je travaille uniquement dans certaines régions</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground leading-tight">
          Quelles régions ?
        </h2>
        <p className="text-muted-foreground">
          Sélectionnez toutes les régions où vous intervenez.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {REGIONS.map((r) => {
          const selected = data.regions.includes(r);
          return (
            <button
              key={r}
              onClick={() => toggleRegion(r)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:border-primary/50"
              }`}
            >
              {selected && <Check className="w-3.5 h-3.5" />}
              {r}
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
        {canContinue ? `Continuer (${data.regions.length} région${data.regions.length > 1 ? "s" : ""})` : "Sélectionnez au moins une région"}
        {canContinue && <ArrowRight className="w-5 h-5" />}
      </button>
    </div>
  );
}
