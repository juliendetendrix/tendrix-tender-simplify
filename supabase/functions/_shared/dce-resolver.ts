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
// L'ordre compte : on teste du plus spécifique au plus générique.
// La famille « atexo » (moteur MPE d'Atexo) regroupe PLACE + de nombreux
// portails régionaux/collectivités qui tournent sur le MÊME logiciel : même
// parcours de retrait anonyme, mêmes sélecteurs → un seul adaptateur les couvre.
const ENGINE_BY_DOMAIN: { match: RegExp; engine: string }[] = [
  // PLACE (État) : marches-publics.gouv.fr ET la variante sans tiret.
  { match: /marches?-?publics\.gouv\.fr/i, engine: "place" },
  // AWS / marches-publics.info & co. (captcha sur retrait anonyme → manuel).
  { match: /aws-achat|aws-entreprises|agysoft|marageo|marches-publics\.info/i, engine: "aws-achat" },
  { match: /e-marchespublics\.com/i,     engine: "dematis" },
  { match: /marches-securises\.fr/i,     engine: "marches-securises" },
  // achatpublic : .com et instances en marque blanche *.achatpublic.fr
  { match: /achatpublic\.(com|fr)/i,     engine: "achatpublic" },
  { match: /xmarches/i,                  engine: "xmarches" },
  // ── Famille Atexo (même moteur que PLACE) : portails régionaux connus ──
  { match: /local-?trust|atexo/i,                       engine: "atexo" },
  { match: /maximilien\.fr/i,                           engine: "atexo" }, // Île-de-France
  { match: /megalis\.(bretagne|fr)/i,                   engine: "atexo" }, // Bretagne
  { match: /ternum-bfc\.fr/i,                           engine: "atexo" }, // Bourgogne-Franche-Comté
  { match: /alsacemarchespublics\.eu/i,                 engine: "atexo" }, // Grand Est / Alsace
  { match: /marches\.grandlyon|marchespublics\.grandlyon/i, engine: "atexo" },
  { match: /marches\.normandie|marchespublics\.normandie/i, engine: "atexo" },
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

// Référence de consultation LISIBLE (PLACE/Atexo) : dans les avis eForms elle
// vit dans cac:CallForTendersDocumentReference > cbc:ID (≠ ContractFolderID UUID).
// C'est elle qui permet de retrouver l'AO sur le profil acheteur.
function findConsultationRef(raw: unknown): string | null {
  let text: string;
  try { text = JSON.stringify(raw); } catch { return null; }
  const m = text.match(/CallForTendersDocumentReference"\s*:\s*\{\s*"cbc:ID"\s*:\s*"([^"]+)"/i);
  return m && m[1].trim() ? m[1].trim() : null;
}

function normalizeUrl(u: string | null): string | null {
  if (!u) return null;
  let url = u.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  // on rejette les liens BOAMP eux-mêmes (ce ne sont pas des profils acheteur)
  if (/boamp\.fr/i.test(url)) return null;
  return url;
}

// AWS / marches-publics.info encode dans l'avis un lien de retrait portant
// l'identifiant de consultation (IDM=…). On le préfère à l'URL de profil
// générique (http://www.marches-publics.info), qui ne cible aucune consultation.
function findAwsDeepLink(raw: unknown): string | null {
  let text: string;
  try { text = JSON.stringify(raw); } catch { return null; }
  const re = /https?:\/\/[^\s"'<>\\]*(?:marches-publics\.info|aws-achat)[^\s"'<>\\]*IDM=\d+[^\s"'<>\\]*/gi;
  const matches = text.match(re);
  if (!matches) return null;
  const decoded = matches.map((m) => m.replace(/&amp;/gi, "&"));
  // Priorité aux pages qui mènent au retrait du DCE.
  return (
    decoded.find((u) => /fuseaction=(dce\.avertissement|dematEnt\.login)/i.test(u)) ??
    decoded[0]
  );
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

  let platformUrl = normalizeUrl(urlRaw);
  const platform = platformUrl ? detectEngine(platformUrl) : null;

  // AWS : remplacer l'URL profil générique par le lien profond (IDM=…) si présent.
  if (platform === "aws-achat") {
    const deep = findAwsDeepLink(raw);
    if (deep) platformUrl = deep;
  }

  // 2) Référence de consultation
  let reference =
    findConsultationRef(raw) ??
    deepFind(donnees, ["identifiantInterne"]) ??
    (typeof record.contractfolderid === "string" ? record.contractfolderid : null);
  // Garde-fou : le ContractFolderID eForms est un UUID inutilisable comme clé de
  // recherche → on l'écarte (l'adaptateur recherchera par objet du marché).
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (reference && UUID_RE.test(reference)) reference = null;

  // 3) Acheteur
  const buyer =
    (typeof record.nomacheteur === "string" ? record.nomacheteur : null) ??
    deepFind(donnees, ["nomOfficiel"]);

  return {
    platformUrl,
    platform,
    reference,
    buyer,
    resolvable: !!platformUrl,
  };
}
