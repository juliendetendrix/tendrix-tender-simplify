// =============================================================================
// Classification d'un DCE (Dossier de Consultation des Entreprises)
// -----------------------------------------------------------------------------
// Étape DÉTERMINISTE (sans IA, sans coût) qui s'exécute dès que les documents
// sont déposés. Elle répond à trois questions :
//   1. Quel est le TYPE de chaque document ? (RC, CCAP, CCTP, DPGF, AE…)
//   2. À quel LOT appartient-il ? (préfixe "06", "08", "Lot 6"… ; null = commun)
//   3. Quels lots sont RÉELLEMENT OUVERTS à la candidature ?
//
// Heuristique clé des lots ouverts (validée sur un DCE réel) : l'acheteur dépose
// souvent les CCTP de TOUS les lots, mais SEULS les lots ouverts ont une
// DPGF/CDPGF (cadre de prix à remplir). La présence d'une DPGF = signal fiable.
// =============================================================================

export type DocType =
  | "RC"       // Règlement de consultation (critères de jugement)
  | "CCAP"     // Cahier des Clauses Administratives Particulières
  | "CCTP"     // Cahier des Clauses Techniques Particulières
  | "DPGF"     // Décomposition du Prix Global et Forfaitaire / BPU / DQE (cadre de prix)
  | "AE"       // Acte d'Engagement
  | "DUME"     // Document Unique de Marché Européen
  | "MEMOIRE"  // Cadre de mémoire technique
  | "PLAN"     // Plans, DWG, repérages
  | "ETUDE"    // Études & contexte (géotech, RE2020, ACV, STD, PGC, DIUO, RICT, notices…)
  | "GUIDE"    // Guides plateforme (AWS, manuel de dépôt, conditions générales…)
  | "ANNEXE"   // Annexe non typée
  | "AUTRE";

export interface ClassifiedDoc {
  fileName: string;
  docType: DocType;
  /** Numéro de lot normalisé sans zéro initial ("6", "8") ; null = commun/transverse. */
  lot: string | null;
}

export interface LotGroup {
  /** "6", "8"… ou la chaîne spéciale "commun". */
  lot: string;
  /** Intitulé déduit du nom de fichier (best-effort), surchargé ensuite par l'IA. */
  intitule: string | null;
  /** Le lot est-il ouvert à la candidature ? (présence d'une DPGF/CDPGF) */
  ouvert: boolean;
  docs: ClassifiedDoc[];
  /** Documents à mettre en avant (les pièces structurantes du lot). */
  documentsCles: ClassifiedDoc[];
}

export interface DceClassification {
  docs: ClassifiedDoc[];
  /** Groupes par lot, ordre : lots ouverts d'abord, puis fermés, puis "commun". */
  groupes: LotGroup[];
  /** Numéros des lots ouverts (DPGF présente). */
  lotsOuverts: string[];
  /** Pièces administratives communes (CCAP, RC, AE, DUME…). */
  commun: ClassifiedDoc[];
  /** Études & contexte (transverses, non liés à un lot précis). */
  etudes: ClassifiedDoc[];
  /** Guides plateforme (à ignorer dans l'analyse métier). */
  guides: ClassifiedDoc[];
}

// Pondération pour faire ressortir les documents clés d'un lot / du commun.
const TYPE_PRIORITY: Record<DocType, number> = {
  RC: 100, CCAP: 90, CCTP: 80, DPGF: 70, AE: 60, DUME: 50,
  MEMOIRE: 40, PLAN: 20, ETUDE: 15, ANNEXE: 10, GUIDE: 5, AUTRE: 0,
};

/** Ordre de priorité d'envoi à l'IA (les plus structurants d'abord). */
export const AI_DOC_PRIORITY: Record<DocType, number> = TYPE_PRIORITY;

/** Devine le type d'un document à partir de son nom de fichier. */
export function classifyDocType(name: string): DocType {
  const n = name.toLowerCase();

  // Guides plateforme : à écarter de l'analyse métier.
  if (/aws[\s_-]?achat|manuel|guide|conditions?[\s_-]?g[ée]n[ée]rales|depot[\s_-]?pli|d[ée]p[oô]t[\s_-]?pli|tutoriel/.test(n))
    return "GUIDE";

  // Cadre de prix (signal des lots ouverts) — avant CCTP car "CDPGF" contient "C".
  if (/\b(c?dpgf|bpu|dqe|dpgfp|bordereau)\b|cadre[\s_-]?(de[\s_-]?)?prix|d[ée]composition[\s_-]?du[\s_-]?prix/.test(n))
    return "DPGF";

  // CCTP avant CCAP/CCAG (les noms contiennent parfois "CCAG" en suffixe réglementaire).
  if (/\bcctp\b|clauses?[\s_-]?techniques/.test(n)) return "CCTP";
  if (/\bccap\b|clauses?[\s_-]?administratives/.test(n)) return "CCAP";

  if (/\bdume\b/.test(n)) return "DUME";
  if (/acte[\s_-]?d.?engagement|\bae[\s_-]|[\s_-]ae\b|\bae\.|^ae\b/.test(n)) return "AE";
  if (/r[èe]glement[\s_-]?(de[\s_-]?)?consultation|\brc[\s_-]|[\s_-]rc\b|\brc\./.test(n)) return "RC";

  if (/m[ée]moire[\s_-]?technique|cadre[\s_-]?m[ée]moire/.test(n)) return "MEMOIRE";

  // Études & contexte technique.
  if (/re2020|\bacv\b|g[ée]otech|\bg[0-9]\b|g2[\s_-]?(pro|avp)|\bstd\b|[ée]tanch[ée]it[ée]|\bpgc\b|\bdiuo\b|\brict\b|notice|[ée]tude|diagnostic|sondage/.test(n))
    return "ETUDE";

  if (/\bplan\b|\.dwg|rep[ée]rage|coupe|fa[çc]ade|niveau/.test(n)) return "PLAN";
  if (/annexe/.test(n)) return "ANNEXE";

  return "AUTRE";
}

/**
 * Devine le numéro de lot à partir du nom de fichier.
 * - Préfixe numérique 1-2 chiffres : "06 CCTP…", "8_DPGF…" → "6", "8".
 * - "00 …" = pièces communes → null.
 * - "Lot 6", "Lot n°6", "lot6" → "6".
 * - Les nombres de 3+ chiffres (codes opération type "50310") sont ignorés.
 */
export function detectLot(name: string): string | null {
  const base = name.replace(/\.[a-z0-9]+$/i, "");

  // "Lot 6", "Lot n°6", "lot6"…
  const m1 = base.match(/lot\s*n?[°o]?\s*0*(\d{1,2})\b/i);
  if (m1) return normLot(m1[1]);

  // Préfixe numérique en tête de nom : "06 …", "8_…", "06-…"
  const m2 = base.match(/^\s*0*(\d{1,2})\s*[\s_.\-)]/);
  if (m2) {
    // Évite de capter un code opération à 3+ chiffres ("50310 …").
    const leading = base.match(/^\s*(\d+)/);
    if (leading && leading[1].length <= 2) return normLot(m2[1]);
  }

  return null;
}

function normLot(n: string): string | null {
  const v = String(parseInt(n, 10));
  if (v === "0" || v === "NaN") return null; // "00" = commun
  return v;
}

export function classifyDoc(name: string): ClassifiedDoc {
  return { fileName: name, docType: classifyDocType(name), lot: detectLot(name) };
}

/** Intitulé approximatif d'un lot, déduit du nom de fichier le plus parlant. */
function guessLotIntitule(docs: ClassifiedDoc[]): string | null {
  // On part d'un CCTP/DPGF du lot et on retire le préfixe + le type + indices.
  const src = docs.find((d) => d.docType === "CCTP") ?? docs.find((d) => d.docType === "DPGF") ?? docs[0];
  if (!src) return null;
  let s = src.fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^\s*0*\d{1,2}\s*[\s_.\-)]+/, "")
    .replace(/\b(c?dpgf|cctp|ccap|bpu|dqe|dce|mapa|trx|lot)\b/gi, " ")
    .replace(/\bind\.?\s*[a-z0-9]\b/gi, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!s) return null;
  // Capitalise proprement.
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const TYPE_OF_GROUP_KEYS = new Set<DocType>(["RC", "CCAP", "AE", "DUME"]);

/** Classe l'ensemble d'un DCE : groupes par lot, lots ouverts, pièces communes. */
export function classifyDce(fileNames: string[]): DceClassification {
  const docs = fileNames.map(classifyDoc);

  const guides = docs.filter((d) => d.docType === "GUIDE");
  const etudes = docs.filter((d) => d.docType === "ETUDE" && d.lot === null);

  // Pièces communes : administratif transverse non rattaché à un lot.
  const commun = docs.filter(
    (d) => d.lot === null && TYPE_OF_GROUP_KEYS.has(d.docType),
  );

  // Regroupement par lot.
  const byLot = new Map<string, ClassifiedDoc[]>();
  for (const d of docs) {
    if (d.lot === null) continue;
    if (!byLot.has(d.lot)) byLot.set(d.lot, []);
    byLot.get(d.lot)!.push(d);
  }

  const groupes: LotGroup[] = [];
  for (const [lot, lotDocs] of byLot) {
    const ouvert = lotDocs.some((d) => d.docType === "DPGF");
    const sorted = [...lotDocs].sort(
      (a, b) => TYPE_PRIORITY[b.docType] - TYPE_PRIORITY[a.docType],
    );
    groupes.push({
      lot,
      intitule: guessLotIntitule(lotDocs),
      ouvert,
      docs: sorted,
      documentsCles: sorted.filter((d) =>
        ["CCTP", "DPGF", "RC", "CCAP"].includes(d.docType),
      ),
    });
  }

  // Ordre : lots ouverts d'abord (par numéro), puis fermés.
  groupes.sort((a, b) => {
    if (a.ouvert !== b.ouvert) return a.ouvert ? -1 : 1;
    return Number(a.lot) - Number(b.lot);
  });

  const lotsOuverts = groupes.filter((g) => g.ouvert).map((g) => g.lot);

  return { docs, groupes, lotsOuverts, commun, etudes, guides };
}

/** Libellés lisibles pour l'UI. */
export const DOC_TYPE_LABEL: Record<DocType, string> = {
  RC: "Règlement de consultation",
  CCAP: "Clauses administratives (CCAP)",
  CCTP: "Clauses techniques (CCTP)",
  DPGF: "Cadre de prix (DPGF)",
  AE: "Acte d'engagement",
  DUME: "DUME",
  MEMOIRE: "Cadre mémoire technique",
  PLAN: "Plan",
  ETUDE: "Étude / contexte",
  GUIDE: "Guide plateforme",
  ANNEXE: "Annexe",
  AUTRE: "Autre document",
};
