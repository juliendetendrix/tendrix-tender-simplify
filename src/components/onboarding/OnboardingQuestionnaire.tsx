import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StepContact } from "./StepContact";
import { StepCompany } from "./StepCompany";
import { StepSectors } from "./StepSectors";
import { StepZone } from "./StepZone";
import { StepMarkets } from "./StepMarkets";
import { StepExperience } from "./StepExperience";
import { StepAccount } from "./StepAccount";

export interface OnboardingData {
  company_name: string;
  siren: string;
  siret: string;
  address: string;
  postal_code: string;
  city: string;
  sectors: string[];
  zone_type: "france" | "regions";
  regions: string[];
  market_types: string[];
  market_description: string;
  has_ao_experience: boolean | null;
  ao_volume: string;
  ao_pain_points: string[];
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

const INITIAL: OnboardingData = {
  company_name: "",
  siren: "",
  siret: "",
  address: "",
  postal_code: "",
  city: "",
  sectors: [],
  zone_type: "france",
  regions: [],
  market_types: [],
  market_description: "",
  has_ao_experience: null,
  ao_volume: "",
  ao_pain_points: [],
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
};

const STEPS = [
  { label: "Coordonnées", short: "1" },
  { label: "Entreprise",  short: "2" },
  { label: "Secteurs",    short: "3" },
  { label: "Zone",        short: "4" },
  { label: "Marchés",     short: "5" },
  { label: "Expérience",  short: "6" },
  { label: "Mon compte",  short: "7" },
];

const TOTAL = STEPS.length;

export function OnboardingQuestionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [animKey, setAnimKey] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [savingLead, setSavingLead] = useState(false);

  const update = (patch: Partial<OnboardingData>) =>
    setData((d) => ({ ...d, ...patch }));

  const next = () => {
    setDirection("right");
    setAnimKey((k) => k + 1);
    setStep((s) => Math.min(s + 1, TOTAL));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setDirection("left");
    setAnimKey((k) => k + 1);
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContactNext = async () => {
    setSavingLead(true);
    try {
      await supabase.from("leads").upsert(
        {
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim() || null,
          source: "questionnaire",
        },
        { onConflict: "email" }
      );
    } catch {
      // Lead save is best-effort — don't block the user
    } finally {
      setSavingLead(false);
    }
    next();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: `${data.first_name} ${data.last_name}`.trim() } },
      });
      if (signUpError) throw signUpError;

      const userId = signUpData.user?.id;
      if (!userId) throw new Error("Création du compte échouée");

      if (!signUpData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (signInError) {
          toast({
            title: "Compte créé !",
            description: "Vérifiez votre email pour activer votre compte, puis connectez-vous.",
          });
          navigate("/login");
          return;
        }
      }

      await supabase.from("user_roles").insert({ user_id: userId, role: "entreprise" });

      const zone =
        data.zone_type === "france" ? "France entière" : data.regions.join(", ");

      await supabase.from("companies").insert({
        owner_user_id: userId,
        name: data.company_name,
        siren: data.siren || null,
        contact_name: data.first_name || null,
        contact_phone: data.phone || null,
        sector: data.sectors.join(", ") || null,
        zone: zone || null,
        onboarding_completed: true,
      });

      navigate("/app");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (step / TOTAL) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #f8f9ff 0%, #ffffff 60%)" }}>

      {/* ── Barre de progression duale couleur ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-sm">
        {/* Barre duale : jaune derrière, bleu qui avance */}
        <div
          className="h-2 w-full relative overflow-hidden"
          style={{ backgroundColor: "#f9bd43" }}
        >
          <div
            className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, backgroundColor: "#0c1c98" }}
          />
        </div>

        {/* Row : retour + étape + compteur */}
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={step > 1 ? prev : () => navigate("/")}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all -ml-1"
            aria-label={step > 1 ? "Retour" : "Accueil"}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Step dots */}
          <div className="flex-1 flex items-center justify-center gap-1.5">
            {STEPS.map((s, i) => {
              const idx = i + 1;
              const done = idx < step;
              const active = idx === step;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-center rounded-full font-bold text-[10px] transition-all duration-300 ${
                    done
                      ? "w-5 h-5 text-white"
                      : active
                      ? "w-6 h-6 text-white shadow-md"
                      : "w-5 h-5 text-muted-foreground"
                  }`}
                  style={{
                    backgroundColor: done
                      ? "#0c1c98"
                      : active
                      ? "#0c1c98"
                      : "#e5e7eb",
                    transform: active ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {done ? <Check className="w-2.5 h-2.5" /> : idx}
                </div>
              );
            })}
          </div>

          <div className="flex-shrink-0 flex items-center gap-1.5">
            <img src="/icon-tendrix-bicolor.svg" alt="" className="h-5 w-5 opacity-70" />
            <span className="text-xs font-semibold text-muted-foreground tabular-nums">{step} / {TOTAL}</span>
          </div>
        </div>
      </div>

      {/* ── Contenu de l'étape ── */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 pb-20">
        {/* Zone animée */}
        <div
          key={animKey}
          className={direction === "right" ? "step-enter-right" : "step-enter-left"}
        >
          {step === 1 && <StepContact data={data} update={update} onNext={handleContactNext} saving={savingLead} />}
          {step === 2 && <StepCompany data={data} update={update} onNext={next} />}
          {step === 3 && <StepSectors data={data} update={update} onNext={next} />}
          {step === 4 && <StepZone data={data} update={update} onNext={next} />}
          {step === 5 && <StepMarkets data={data} update={update} onNext={next} />}
          {step === 6 && <StepExperience data={data} update={update} onNext={next} />}
          {step === 7 && (
            <StepAccount
              data={data}
              update={update}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
