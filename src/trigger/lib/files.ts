import AdmZip from "adm-zip";
import type { DceFile } from "../adapters/types";

// Extensions de documents qu'on conserve (le reste = ignoré)
export const KEEP = /\.(pdf|docx?|xlsx?|odt|ods|rtf|txt)$/i;

export function contentTypeFor(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (n.endsWith(".doc")) return "application/msword";
  if (n.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (n.endsWith(".xls")) return "application/vnd.ms-excel";
  return "application/octet-stream";
}

export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks);
}

/** Décompresse un ZIP en mémoire et renvoie les fichiers documents utiles. */
export function zipToFiles(buffer: Buffer): DceFile[] {
  const zip = new AdmZip(buffer);
  const files: DceFile[] = [];
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const name = entry.entryName.split("/").pop() || entry.entryName;
    if (!KEEP.test(name)) continue;
    files.push({ name, buffer: entry.getData(), contentType: contentTypeFor(name) });
  }
  return files;
}
