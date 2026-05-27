import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import type { OnboardingData } from "./OnboardingQuestionnaire";

const SECTOR_GROUPS = [
  {
    group: "Gros œuvre & Structure",
    items: [
      "Maçonnerie générale",
      "Béton armé & coffrages",
      "Charpente bois",
      "Charpente métallique",
      "Terrassement & fondations",
      "Démolition & déconstruction",
    ],
  },
  {
    group: "Travaux publics & Génie civil",
    items: [
      "VRD (Voirie & Réseaux Divers)",
      "Assainissement & canalisations",
      "Génie civil & ouvrages d'art",
      "Routes, bitume & enrobés",
      "Réseaux enterrés (eau, gaz, télécom)",
      "Éclairage public",
    ],
  },
  {
    group: "Clos & Couvert",
    items: [
      "Couverture tuiles & ardoises",
      "Couverture zinc & zinguerie",
      "Étanchéité & toiture-terrasse",
      "Bardage & vêture",
      "Ravalement de façade",
      "Isolation thermique par l'extérieur (ITE)",
    ],
  },
  {
    group: "Menuiseries & Fermetures",
    items: [
      "Menuiserie extérieure (PVC, aluminium, bois)",
      "Vitrage & miroiterie",
      "Serrurerie & métallerie",
      "Portails, clôtures & automatismes",
      "Stores, volets & occultants",
      "Vérandas & pergolas",
    ],
  },
  {
    group: "Plomberie & Sanitaire",
    items: [
      "Plomberie générale",
      "Sanitaire & salle de bain",
      "Chauffe-eau & ballon thermodynamique",
      "Piscines & spas",
    ],
  },
  {
    group: "Chauffage, Ventilation & Climatisation",
    items: [
      "Chauffage gaz & fioul",
      "Pompe à chaleur",
      "Climatisation & split-system",
      "VMC & ventilation",
      "Poêles & cheminées",
      "Plancher chauffant",
    ],
  },
  {
    group: "Électricité & Automatismes",
    items: [
      "Électricité résidentielle",
      "Électricité tertiaire & industrielle",
      "Domotique & automatismes",
      "Borne de recharge véhicule électrique (IRVE)",
      "Photovoltaïque & énergies renouvelables",
    ],
  },
  {
    group: "Courants faibles & Télécoms",
    items: [
      "Alarme intrusion & contrôle d'accès",
      "Vidéosurveillance (CCTV)",
      "Réseau informatique & câblage structuré",
      "Fibre optique",
      "Parabole & réception TV",
      "Sonorisation & audiovisuel",
    ],
  },
  {
    group: "Revêtements & Finitions intérieures",
    items: [
      "Peinture intérieure",
      "Carrelage & faïence",
      "Parquet & revêtements de sol",
      "Sol souple (PVC, LVT, moquette)",
      "Plâtrerie & cloisons sèches",
      "Faux plafonds & plafonds tendus",
      "Enduits & crépis",
    ],
  },
  {
    group: "Isolation",
    items: [
      "Isolation des combles",
      "Isolation des murs",
      "Isolation des planchers bas",
      "Étanchéité à l'air",
    ],
  },
  {
    group: "Aménagement extérieur",
    items: [
      "Espaces verts & paysagisme",
      "Pavage & dallage",
      "Terrasses bois & composite",
      "Arrosage automatique",
      "Élagage & abattage",
    ],
  },
  {
    group: "Travaux spéciaux",
    items: [
      "Désamiantage",
      "Dépollution des sols",
      "Restauration du patrimoine",
      "Traitement de l'humidité",
    ],
  },
  {
    group: "Équipements techniques du bâtiment",
    items: [
      "Ascenseurs & élévateurs",
      "Portes automatiques & quais de chargement",
      "Cuisine professionnelle (équipement)",
      "Extinction incendie & sprinklers",
      "Groupe électrogène & onduleur",
    ],
  },
  {
    group: "Nettoyage & Maintenance",
    items: [
      "Nettoyage industriel & tertiaire",
      "Entretien courant d'immeubles",
      "Maintenance multi-technique",
      "Déneigement & viabilité hivernale",
    ],
  },
  {
    group: "Gardiennage & Sécurité physique",
    items: [
      "Sécurité humaine & gardiennage",
      "Télésurveillance & télémaintenance",
    ],
  },
  {
    group: "Transport & Logistique",
    items: [
      "Transport de marchandises",
      "Location d'engins TP avec conducteur",
      "Grue mobile & levage",
      "Déménagement",
    ],
  },
  {
    group: "Fournitures & Location",
    items: [
      "Fournitures de matériaux de construction",
      "Quincaillerie & outillage",
      "Location de matériel & échafaudages",
      "Mobilier & équipement urbain",
    ],
  },
  {
    group: "Études & Ingénierie",
    items: [
      "Bureau d'études structure",
      "Bureau d'études fluides (CVC / plomberie)",
      "Maîtrise d'œuvre",
      "Topographie & géomètre-expert",
      "Diagnostic immobilier",
      "Coordination SPS",
    ],
  },
  {
    group: "Informatique & Numérique",
    items: [
      "Intégration de systèmes informatiques",
      "Développement logiciel",
      "Maintenance informatique",
      "Infogérance & cloud",
    ],
  },
];

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function StepSectors({ data, update, onNext }: Props) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (label: string) => {
    const next = data.sectors.includes(label)
      ? data.sectors.filter((s) => s !== label)
      : [...data.sectors, label];
    update({ sectors: next });
  };

  const toggleGroup = (group: string) => {
    setExpanded((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const filteredGroups = query.trim()
    ? SECTOR_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.toLowerCase().includes(query.toLowerCase())),
      })).filter((g) => g.items.length > 0)
    : SECTOR_GROUPS;

  const canContinue = data.sectors.length >= 1;
  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <img src="/icon-tendrix-blue.svg" alt="" className="h-7 w-7 mx-auto opacity-30" />
        <h2 className="text-3xl font-bold text-foreground leading-tight">
          Quelles sont vos spécialités ?
        </h2>
        <p className="text-muted-foreground">
          Sélectionnez toutes les activités que vous réalisez.
        </p>
      </div>

      {/* Sélections actuelles */}
      {data.sectors.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-primary/5 border border-primary/15 rounded-xl">
          {data.sectors.map((s) => (
            <button
              key={s}
              onClick={() => toggle(s)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/80 transition-colors"
            >
              {s} ×
            </button>
          ))}
        </div>
      )}

      {/* Recherche */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une spécialité…"
        className="w-full h-11 px-4 text-sm rounded-xl border-2 border-border bg-white focus:outline-none focus:border-primary transition-colors"
      />

      {/* Liste groupée */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filteredGroups.map(({ group, items }) => {
          const isOpen = isSearching || expanded.includes(group);
          const groupSelected = items.filter((i) => data.sectors.includes(i)).length;

          return (
            <div key={group} className="border border-border rounded-xl overflow-hidden bg-white">
              {/* En-tête de groupe */}
              <button
                onClick={() => !isSearching && toggleGroup(group)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">{group}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {groupSelected > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-white">
                      {groupSelected}
                    </span>
                  )}
                  <span className="text-muted-foreground text-xs">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Items */}
              {isOpen && (
                <div className="border-t border-border divide-y divide-border/60">
                  {items.map((item) => {
                    const selected = data.sectors.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggle(item)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                          selected ? "bg-primary/8 text-primary" : "hover:bg-muted/20 text-foreground"
                        }`}
                      >
                        <span>{item}</span>
                        {selected && (
                          <Check className="w-4 h-4 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed sticky bottom-4"
        style={{ backgroundColor: canContinue ? "#f9bd43" : "#e5e7eb", color: canContinue ? "#0c1c98" : "#9ca3af" }}
      >
        {canContinue
          ? `Continuer (${data.sectors.length} spécialité${data.sectors.length > 1 ? "s" : ""})`
          : "Sélectionnez au moins une spécialité"}
        {canContinue && <ArrowRight className="w-5 h-5" />}
      </button>
    </div>
  );
}
