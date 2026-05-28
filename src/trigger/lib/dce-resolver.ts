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

const ENGINE_BY_DOMAIN: { match: RegExp; engine: string }[] = [
  { match: /marches-publics\.gouv\.fr/i, engine: "place" },
  { match: /e-marchespublics\.com/i,     engine: "dematis" },
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

  const platformUrl = normalizeUrl(urlRaw);
  const reference =
    deepFind(donnees, ["identifiantInterne"]) ??
    (typeof record.contractfolderid === "string" ? record.contractfolderid : null);
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
