import { useState, useRef, useEffect } from "react";
import { Search, Building2, MapPin, X, ArrowRight } from "lucide-react";
import type { OnboardingData } from "./OnboardingQuestionnaire";

interface ApiResult {
  nom_complet: string;
  siren: string;
  siege: { siret: string; adresse: string; code_postal: string; libelle_commune: string };
}

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function StepCompany({ data, update, onNext }: Props) {
  const [query, setQuery] = useState(data.company_name || "");
  const [results, setResults] = useState<ApiResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [confirmed, setConfirmed] = useState(!!data.company_name);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (confirmed) return;
    clearTimeout(timer.current);
    if (query.trim().length < 2) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&per_page=6`);
        const json = await res.json();
        setResults(json.results ?? []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(timer.current);
  }, [query, confirmed]);

  const selectCompany = (r: ApiResult) => {
    update({ company_name: r.nom_complet, siren: r.siren ?? "", siret: r.siege?.siret ?? "", address: r.siege?.adresse ?? "", postal_code: r.siege?.code_postal ?? "", city: r.siege?.libelle_commune ?? "" });
    setQuery(r.nom_complet);
    setResults([]);
    setConfirmed(true);
  };

  const reset = () => {
    setConfirmed(false);
    setQuery("");
    setResults([]);
    update({ company_name: "", siren: "", siret: "", address: "", postal_code: "", city: "" });
  };

  const confirmManual = () => {
    if (query.trim().length < 2) return;
    update({ company_name: query.trim() });
    setConfirmed(true);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground leading-tight">
          Quel est le nom de votre entreprise ?
        </h2>
        <p className="text-muted-foreground">
          Recherchez par nom ou SIREN pour trouver votre entreprise.
        </p>
      </div>

      {!confirmed ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex : Dupont Électricité, 352 184 896…"
              className="w-full h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-border bg-white focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {results.length > 0 && (
            <div className="bg-white border-2 border-border rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
              {results.map((r) => (
                <button key={r.siren} onClick={() => selectCompany(r)} className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{r.nom_complet}</p>
                    <p className="text-xs text-muted-foreground">SIREN {r.siren}{r.siege?.libelle_commune ? ` · ${r.siege.libelle_commune}` : ""}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && !searching && (
            <div className="space-y-1.5">
              <button onClick={confirmManual} className="w-full h-12 rounded-2xl border-2 border-dashed border-primary/40 text-primary text-sm font-medium hover:bg-primary/5 transition-colors">
                Continuer avec « {query.trim()} »
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Vous pourrez modifier le nom de votre entreprise plus tard.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">{data.company_name}</p>
              {data.siren && <p className="text-xs text-muted-foreground mt-0.5">SIREN {data.siren}</p>}
              {data.city && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {data.city}</p>}
            </div>
          </div>
          <button onClick={reset} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/60 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!confirmed}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: confirmed ? "#f9bd43" : "#e5e7eb", color: confirmed ? "#0c1c98" : "#9ca3af" }}
      >
        Continuer <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
