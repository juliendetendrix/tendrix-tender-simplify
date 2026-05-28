import { chromium, type Browser } from "playwright";
import AdmZip from "adm-zip";
import type { DceFile, ScrapeInput } from "./types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

// Extensions de documents qu'on garde (le reste = images/css ignorés)
const KEEP = /\.(pdf|docx?|xlsx?|odt|ods|zip|rtf|txt)$/i;

function contentTypeFor(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (n.endsWith(".doc")) return "application/msword";
  if (n.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (n.endsWith(".xls")) return "application/vnd.ms-excel";
  return "application/octet-stream";
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks);
}

/**
 * Adaptateur e-marchespublics / Dematis.
 *
 * Parcours reconstitué (à affiner en direct contre le site) :
 *  1. Aller sur la plateforme, rechercher la consultation par sa référence.
 *  2. Ouvrir la page d'annonce du marché.
 *  3. Suivre le lien de RETRAIT ANONYME (/dossier_de_consultation_anonyme_…).
 *  4. Soumettre le formulaire de retrait anonyme (sans s'identifier).
 *  5. Récupérer le ZIP téléchargé, le décompresser, renvoyer les fichiers.
 *
 * ⚠️ Les sélecteurs marqués "AFFINER" sont des hypothèses : ils doivent être
 *    validés/ajustés en lançant `npx trigger.dev dev` et en observant le site.
 */
export async function scrapeEmarchespublics(input: ScrapeInput): Promise<DceFile[]> {
  const { platformUrl, reference } = input;
  if (!reference) throw new Error("Référence de consultation manquante");

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ acceptDownloads: true, userAgent: UA });
    const page = await context.newPage();
    await page.setDefaultTimeout(30000);

    // 1) Page d'accueil de la plateforme
    await page.goto(platformUrl, { waitUntil: "domcontentloaded" });

    // 2) Recherche par référence — AFFINER le sélecteur du champ de recherche
    //    (souvent un input texte sur la page de recherche AAPC).
    const searchSelectors = [
      'input[name*="recherche"]',
      'input[type="search"]',
      'input[name="reference"]',
      '#recherche',
    ];
    let searched = false;
    for (const sel of searchSelectors) {
      const el = await page.$(sel);
      if (el) {
        await el.fill(reference);
        await page.keyboard.press("Enter");
        await page.waitForLoadState("domcontentloaded").catch(() => {});
        searched = true;
        break;
      }
    }
    if (!searched) {
      // Repli : la recherche AAPC dédiée
      await page.goto(new URL("/recherche_marches_publics_aapc_________1.html", platformUrl).toString(), {
        waitUntil: "domcontentloaded",
      }).catch(() => {});
    }

    // 3) Ouvrir l'annonce correspondant à la référence — AFFINER
    const annonce = page.locator('a[href*="annonce_marche_public"]').first();
    if (await annonce.count()) {
      await annonce.click();
      await page.waitForLoadState("domcontentloaded").catch(() => {});
    }

    // 4) Suivre le lien de retrait anonyme du DCE (validé lors du sondage)
    const anon = page.locator('a[href*="dossier_de_consultation"][href*="anonyme"]').first();
    if (!(await anon.count())) {
      throw new Error("Lien de retrait anonyme introuvable sur l'annonce");
    }
    await anon.click();
    await page.waitForLoadState("domcontentloaded").catch(() => {});

    // 5) Soumettre le formulaire de retrait anonyme et capturer le téléchargement.
    //    Le bouton de validation/téléchargement — AFFINER le sélecteur.
    const submitSelectors = [
      'form[name="inscriptionEntreprise"] [type="submit"]',
      'button:has-text("Télécharger")',
      'a:has-text("Télécharger le dossier")',
      'input[type="submit"][value*="élécharg"]',
    ];

    let buffer: Buffer | null = null;
    let downloadName = `dce-${reference}.zip`;

    for (const sel of submitSelectors) {
      const btn = page.locator(sel).first();
      if (!(await btn.count())) continue;
      try {
        const [download] = await Promise.all([
          page.waitForEvent("download", { timeout: 60000 }),
          btn.click(),
        ]);
        downloadName = download.suggestedFilename() || downloadName;
        buffer = await streamToBuffer(await download.createReadStream());
        break;
      } catch {
        // essayer le sélecteur suivant
      }
    }

    if (!buffer) throw new Error("Aucun téléchargement déclenché (formulaire de retrait à affiner)");

    // 6) Décompresser si ZIP, sinon renvoyer le fichier seul
    if (downloadName.toLowerCase().endsWith(".zip") || buffer.slice(0, 2).toString() === "PK") {
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

    return [{ name: downloadName, buffer, contentType: contentTypeFor(downloadName) }];
  } finally {
    if (browser) await browser.close();
  }
}
