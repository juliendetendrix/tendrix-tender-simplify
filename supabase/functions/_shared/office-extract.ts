// Extraction de texte des documents Office (.docx, .xlsx) — Deno / Edge Functions.
// Les pièces structurantes d'un DCE (CCTP, DPGF, RC, CCAP, AE) sont très souvent
// en Word/Excel, pas en PDF. Claude ne lit nativement que les PDF : on extrait
// donc le texte de ces fichiers pour l'injecter dans le prompt.
//
// .docx / .xlsx sont des archives ZIP de XML → on dézippe et on récupère le texte.
// .doc (ancien format binaire Word) n'est pas pris en charge (rare, legacy).

import { unzipSync, strFromU8 } from "https://esm.sh/fflate@0.8.2?target=deno";

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}

/** Texte d'un .docx : on lit word/document.xml et on respecte les paragraphes. */
export function extractDocxText(bytes: Uint8Array): string {
  try {
    const files = unzipSync(bytes);
    const docXml = files["word/document.xml"];
    if (!docXml) return "";
    let xml = strFromU8(docXml);
    // Sauts de ligne pour les fins de paragraphe et les retours forcés.
    xml = xml.replace(/<\/w:p>/g, "\n").replace(/<w:br\b[^>]*\/?>/g, "\n").replace(/<w:tab\b[^>]*\/?>/g, "\t");
    // On retire toutes les balises restantes.
    const text = decodeEntities(xml.replace(/<[^>]+>/g, ""));
    return text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
  } catch {
    return "";
  }
}

/** Texte d'un .xlsx : sharedStrings + reconstruction ligne par ligne des feuilles. */
export function extractXlsxText(bytes: Uint8Array): string {
  try {
    const files = unzipSync(bytes);

    // 1. Table des chaînes partagées (les libellés des cellules texte).
    const shared: string[] = [];
    const ssXml = files["xl/sharedStrings.xml"];
    if (ssXml) {
      const xml = strFromU8(ssXml);
      for (const m of xml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
        // Une <si> peut contenir plusieurs <t> (texte enrichi) → on concatène.
        const parts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]);
        shared.push(decodeEntities(parts.join("")));
      }
    }

    // 2. Feuilles, dans l'ordre.
    const sheetNames = Object.keys(files)
      .filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
      .sort();

    const out: string[] = [];
    for (const sheet of sheetNames) {
      const xml = strFromU8(files[sheet]);
      const rows: string[] = [];
      for (const rowM of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
        const cells: string[] = [];
        for (const cM of rowM[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
          const attrs = cM[1];
          const inner = cM[2];
          const vM = inner.match(/<v>([\s\S]*?)<\/v>/);
          const isM = inner.match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>[\s\S]*?<\/is>/);
          let val = "";
          if (/t="s"/.test(attrs) && vM) {
            val = shared[Number(vM[1])] ?? "";
          } else if (isM) {
            val = decodeEntities(isM[1]);
          } else if (vM) {
            val = decodeEntities(vM[1]);
          }
          if (val.trim() !== "") cells.push(val.trim());
        }
        if (cells.length) rows.push(cells.join(" | "));
      }
      if (rows.length) out.push(rows.join("\n"));
    }
    return out.join("\n").trim();
  } catch {
    return "";
  }
}

/** Aiguillage par nom de fichier. Renvoie "" si non pris en charge. */
export function extractOfficeText(fileName: string, bytes: Uint8Array): string {
  const n = fileName.toLowerCase();
  if (n.endsWith(".docx")) return extractDocxText(bytes);
  if (n.endsWith(".xlsx")) return extractXlsxText(bytes);
  return ""; // .doc / .xls (formats binaires anciens) non pris en charge
}
