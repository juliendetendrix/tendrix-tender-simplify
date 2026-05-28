// =========================================================
// Résolveur DCE — transforme un avis BOAMP (champ `raw`) en :
//   { platformUrl, platform (moteur), reference (consultation), buyer }
// Préalable au téléchargement automatique du DCE.
// Pur TypeScript, sans dépendance → utilisable en Edge Function (Deno)
// ET dans le worker de scraping (Node / Trigger.dev).
// =========================================================

export interface DceResolution {
  platformUrl: string | null;   // URL du profil acheteur / plateforme de dématérialisation
  platform: string | null;      // moteur détecté (slug) : place | dematis | achatpublic | ...
  reference: string | null;     // référence interne de la consultation
  buyer: string | null;         // nom de l'acheteur
  resolvable: boolean;          // true si une URL exploitable a été trouvée
}

// Détection du moteur à partir du domaine de l'URL.
const ENGINE_BY_DOMAIN: { match: RegExp; engine: string }[] = [
  { match: /marches-publics\.gouv\.fr/i, engine: "place" },          // PLACE (Atexo) — État
  { match: /e-marchespublics\.com/i,     engine: "dematis" },        // Dematis
  { match: /marches-securises\.fr/i,     engine: "marches-securises" },
  { match: /achatpublic\.com/i,          engine: "achatpublic" },
  { match: /aws-achat|agysoft|marageo/i, engine: "aws-achat" },
  { match: /local-?trust|atexo/i,        engine: "atexo" },
  { match: /megalis\.bretagne/i,         engine: "megalis" },
  { match: /maximilien\.fr/i,            engine: "maximilien" },
  { match: /xmarches/i,                  engine: "xmarches" },
];

function detectEngine(url: string): string {
  for (const { match, engine } of ENGINE_BY_DOMAIN) {
    if (match.test(url)) return engine;
  }
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

// Recherche récursive de la 1re valeur (string non vide) pour une clé donnée
// (comparaison insensible à la casse, correspondance exacte du nom de clé).
function deepFind(obj: unknown, keys: string[]): string | null {
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) {
      for (const v of obj) {
        const r = deepFind(v, keys);
        if (r) return r;
      }
    } else {
      const rec = obj as Record<string, unknown>;
      for (const [k, v] of Object.entries(rec)) {
        if (keys.some((key) => key.toLowerCase() === k.toLowerCase())) {
          if (typeof v === "string" && v.trim()) return v.trim();
        }
        const r = deepFind(v, keys);
        if (r) return r;
      }
    }
  }
  return null;
}

function normalizeUrl(u: string | null): string | null {
  if (!u) return null;
  let url = u.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  // on rejette les liens BOAMP eux-mêmes (ce ne sont pas des profils acheteur)
  if (/boamp\.fr/i.test(url)) return null;
  return url;
}

/**
 * Résout les infos DCE depuis un record BOAMP brut (`tenders.raw`).
 * Gère les deux schémas rencontrés : FNSimple (urlProfilAch / identifiantInterne)
 * et eForms (cbc:BuyerProfileURI).
 */
export function resolveDce(raw: unknown): DceResolution {
  const empty: DceResolution = {
    platformUrl: null, platform: null, reference: null, buyer: null, resolvable: false,
  };
  if (!raw || typeof raw !== "object") return empty;

  const record = raw as Record<string, unknown>;

  // `donnees` peut être une chaîne JSON ou déjà un objet
  let donnees: unknown = record.donnees;
  if (typeof donnees === "string") {
    try { donnees = JSON.parse(donnees); } catch { /* texte libre : on tente le regex plus bas */ }
  }

  // 1) URL du profil acheteur
  let urlRaw =
    deepFind(donnees, ["urlProfilAch", "cbc:BuyerProfileURI", "BuyerProfileURI"]) ??
    deepFind(record,  ["urlProfilAch", "cbc:BuyerProfileURI", "BuyerProfileURI"]);

  // Repli : 1re URL non-BOAMP trouvée dans le texte de `donnees`
  if (!urlRaw && typeof record.donnees === "string") {
    const m = record.donnees.match(/https?:\/\/(?!www\.boamp)[^\s"'<>\\]+/i);
    if (m) urlRaw = m[0];
  }

  const platformUrl = normalizeUrl(urlRaw);

  // 2) Référence de consultation
  const reference =
    deepFind(donnees, ["identifiantInterne"]) ??
    (typeof record.contractfolderid === "string" ? record.contractfolderid : null);

  // 3) Acheteur
  const buyer =
    (typeof record.nomacheteur === "string" ? record.nomacheteur : null) ??
    deepFind(donnees, ["nomOfficiel"]);

  return {
    platformUrl,
    platform: platformUrl ? detectEngine(platformUrl) : null,
    reference,
    buyer,
    resolvable: !!platformUrl,
  };
}
