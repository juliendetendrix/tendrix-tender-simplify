// Copie Node du résolveur DCE (l'original vit côté Edge Function Deno dans
// supabase/functions/_shared/dce-resolver.ts). Pur TypeScript, sans dépendance.
// Garder les deux synchronisés si on modifie la logique.

export interface DceResolution {
  platformUrl: string | null;
  platform: string | null;
  reference: string | null;
  buyer: string | null;
  resolvable: boolean;
}

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

function normalizeUrl(u: string | null): string | null {
  if (!u) return null;
  let url = u.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  if (/boamp\.fr/i.test(url)) return null;
  return url;
}

export function resolveDce(raw: unknown): DceResolution {
  const empty: DceResolution = {
    platformUrl: null, platform: null, reference: null, buyer: null, resolvable: false,
  };
  if (!raw || typeof raw !== "object") return empty;

  const record = raw as Record<string, unknown>;

  let donnees: unknown = record.donnees;
  if (typeof donnees === "string") {
    try { donnees = JSON.parse(donnees); } catch { /* texte libre */ }
  }

  let urlRaw =
    deepFind(donnees, ["urlProfilAch", "cbc:BuyerProfileURI", "BuyerProfileURI"]) ??
    deepFind(record,  ["urlProfilAch", "cbc:BuyerProfileURI", "BuyerProfileURI"]);

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

  let reference =
    deepFind(donnees, ["identifiantInterne"]) ??
    (typeof record.contractfolderid === "string" ? record.contractfolderid : null);
  // Le ContractFolderID des avis eForms est un UUID inutilisable comme clé de
  // recherche sur les plateformes (PLACE/Atexo cherche par réf. ou objet) → on
  // l'écarte pour que l'adaptateur recherche plutôt par l'objet du marché.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (reference && UUID_RE.test(reference)) reference = null;
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
