// Classification déterministe d'un DCE — version Deno (Edge Functions).
// Miroir de src/lib/dce-classify.ts (front). Garder les deux synchronisés.
// Sert à : (1) prioriser les PDF envoyés à Claude, (2) fournir au prompt la
// structure des lots + la détection des lots ouverts (présence d'une DPGF).

export type DocType =
  | "RC" | "CCAP" | "CCTP" | "DPGF" | "AE" | "DUME"
  | "MEMOIRE" | "PLAN" | "ETUDE" | "GUIDE" | "ANNEXE" | "AUTRE";

export interface ClassifiedDoc {
  fileName: string;
  docType: DocType;
  lot: string | null;
}

export interface LotGroup {
  lot: string;
  intitule: string | null;
  ouvert: boolean;
  docs: ClassifiedDoc[];
}

export const TYPE_PRIORITY: Record<DocType, number> = {
  RC: 100, CCAP: 90, CCTP: 80, DPGF: 70, AE: 60, DUME: 50,
  MEMOIRE: 40, PLAN: 20, ETUDE: 15, ANNEXE: 10, GUIDE: 5, AUTRE: 0,
};

export function classifyDocType(name: string): DocType {
  const n = name.toLowerCase();
  if (/aws[\s_-]?achat|manuel|guide|conditions?[\s_-]?g[ée]n[ée]rales|depot[\s_-]?pli|d[ée]p[oô]t[\s_-]?pli|tutoriel/.test(n))
    return "GUIDE";
  if (/\b(c?dpgf|bpu|dqe|dpgfp|bordereau)\b|cadre[\s_-]?(de[\s_-]?)?prix|d[ée]composition[\s_-]?du[\s_-]?prix/.test(n))
    return "DPGF";
  if (/\bcctp\b|clauses?[\s_-]?techniques/.test(n)) return "CCTP";
  if (/\bccap\b|clauses?[\s_-]?administratives/.test(n)) return "CCAP";
  if (/\bdume\b/.test(n)) return "DUME";
  if (/acte[\s_-]?d.?engagement|\bae[\s_-]|[\s_-]ae\b|\bae\.|^ae\b/.test(n)) return "AE";
  if (/r[èe]glement[\s_-]?(de[\s_-]?)?consultation|\brc[\s_-]|[\s_-]rc\b|\brc\./.test(n)) return "RC";
  if (/m[ée]moire[\s_-]?technique|cadre[\s_-]?m[ée]moire/.test(n)) return "MEMOIRE";
  if (/re2020|\bacv\b|g[ée]otech|\bg[0-9]\b|g2[\s_-]?(pro|avp)|\bstd\b|[ée]tanch[ée]it[ée]|\bpgc\b|\bdiuo\b|\brict\b|notice|[ée]tude|diagnostic|sondage/.test(n))
    return "ETUDE";
  if (/\bplan\b|\.dwg|rep[ée]rage|coupe|fa[çc]ade|niveau/.test(n)) return "PLAN";
  if (/annexe/.test(n)) return "ANNEXE";
  return "AUTRE";
}

export function detectLot(name: string): string | null {
  const base = name.replace(/\.[a-z0-9]+$/i, "");
  const m1 = base.match(/lot\s*n?[°o]?\s*0*(\d{1,2})\b/i);
  if (m1) return normLot(m1[1]);
  const m2 = base.match(/^\s*0*(\d{1,2})\s*[\s_.\-)]/);
  if (m2) {
    const leading = base.match(/^\s*(\d+)/);
    if (leading && leading[1].length <= 2) return normLot(m2[1]);
  }
  return null;
}

function normLot(n: string): string | null {
  const v = String(parseInt(n, 10));
  if (v === "0" || v === "NaN") return null;
  return v;
}

export function classifyDoc(name: string): ClassifiedDoc {
  return { fileName: name, docType: classifyDocType(name), lot: detectLot(name) };
}

function guessLotIntitule(docs: ClassifiedDoc[]): string | null {
  const src = docs.find((d) => d.docType === "CCTP") ?? docs.find((d) => d.docType === "DPGF") ?? docs[0];
  if (!src) return null;
  const s = src.fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^\s*0*\d{1,2}\s*[\s_.\-)]+/, "")
    .replace(/\b(c?dpgf|cctp|ccap|bpu|dqe|dce|mapa|trx|lot)\b/gi, " ")
    .replace(/\bind\.?\s*[a-z0-9]\b/gi, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const COMMON_TYPES = new Set<DocType>(["RC", "CCAP", "AE", "DUME"]);

export interface DceClassification {
  docs: ClassifiedDoc[];
  groupes: LotGroup[];
  lotsOuverts: string[];
  commun: ClassifiedDoc[];
}

export function classifyDce(fileNames: string[]): DceClassification {
  const docs = fileNames.map(classifyDoc);
  const commun = docs.filter((d) => d.lot === null && COMMON_TYPES.has(d.docType));

  const byLot = new Map<string, ClassifiedDoc[]>();
  for (const d of docs) {
    if (d.lot === null) continue;
    if (!byLot.has(d.lot)) byLot.set(d.lot, []);
    byLot.get(d.lot)!.push(d);
  }

  const groupes: LotGroup[] = [];
  for (const [lot, lotDocs] of byLot) {
    const ouvert = lotDocs.some((d) => d.docType === "DPGF");
    const sorted = [...lotDocs].sort((a, b) => TYPE_PRIORITY[b.docType] - TYPE_PRIORITY[a.docType]);
    groupes.push({ lot, intitule: guessLotIntitule(lotDocs), ouvert, docs: sorted });
  }
  groupes.sort((a, b) => (a.ouvert !== b.ouvert ? (a.ouvert ? -1 : 1) : Number(a.lot) - Number(b.lot)));

  const lotsOuverts = groupes.filter((g) => g.ouvert).map((g) => g.lot);
  return { docs, groupes, lotsOuverts, commun };
}
