import { chromium, type Browser, type Page } from "playwright";
import type { DceFile, ScrapeInput } from "./types";
import { zipToFiles, contentTypeFor } from "../lib/files";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const BASE = "https://www.marches-publics.gouv.fr";

// Sélecteurs VALIDÉS en conditions réelles (mai 2026) sur PLACE / Atexo.
const SEL = {
  quickSearchInput: "#ctl0_bandeauEntrepriseWithoutMenuSf_quickSearch",
  quickSearchBtn: "#btnGoToQuickResultSearch",
  detailLink: 'a[href*="/entreprise/consultation/"]',
  choixAnonyme: "#ctl0_CONTENU_PAGE_EntrepriseFormulaireDemande_choixAnonyme",
  etabFrance: "#ctl0_CONTENU_PAGE_EntrepriseFormulaireDemande_france",
  validateButton: "#ctl0_CONTENU_PAGE_validateButton",
  completeDownload: "#ctl0_CONTENU_PAGE_EntrepriseDownloadDce_completeDownload",
};

/**
 * Adaptateur PLACE (marches-publics.gouv.fr / Atexo) — plateforme de l'État.
 *
 * Parcours VALIDÉ (téléchargement anonyme, SANS captcha) :
 *  1. Rechercher la consultation (par référence / objet) → fiche détail.
 *  2. Extraire id + orgAcronyme de l'URL de la fiche.
 *  3. Page "demande de téléchargement" → cocher anonyme + France → Valider.
 *  4. Cliquer "Télécharger le Dossier de consultation" → ZIP.
 *  5. Décompresser → renvoyer les PDF/DOCX.
 *
 * L'étape de RECHERCHE (1) est la plus susceptible de demander un ajustement
 * selon la donnée disponible dans l'avis (référence vs objet).
 */
export async function scrapePlace(input: ScrapeInput): Promise<DceFile[]> {
  const { reference, buyer } = input;
  const query = (reference || input.title || buyer || "").trim();
  if (!query) throw new Error("Aucune clé de recherche (référence/objet) pour PLACE");

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ acceptDownloads: true, userAgent: UA });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    // 1) Recherche rapide
    await page.goto(`${BASE}/?page=entreprise.EntrepriseAdvancedSearch&AllCons`, { waitUntil: "networkidle" });
    const search = page.locator(SEL.quickSearchInput);
    if (await search.count()) {
      await search.fill(query);
      await page.locator(SEL.quickSearchBtn).click().catch(() => {});
      await page.waitForLoadState("networkidle").catch(() => {});
    }

    // 2) Ouvrir la 1re consultation → récupérer id + orgAcronyme
    const detail = page.locator(SEL.detailLink).first();
    if (!(await detail.count())) {
      throw new Error("Consultation introuvable sur PLACE pour cette recherche");
    }
    const href = (await detail.getAttribute("href")) || "";
    const idMatch = href.match(/consultation\/(\d+)/);
    const orgMatch = href.match(/orgAcronyme=([^&]+)/);
    if (!idMatch || !orgMatch) throw new Error("id/orgAcronyme introuvables");
    const id = idMatch[1];
    const org = orgMatch[1];

    // 3) Page de demande de téléchargement (anonyme)
    await page.goto(
      `${BASE}/index.php?page=Entreprise.EntrepriseDemandeTelechargementDce&id=${id}&orgAcronyme=${org}`,
      { waitUntil: "networkidle" },
    );
    await page.locator(SEL.choixAnonyme).check().catch(() => {});
    await page.locator(SEL.etabFrance).check().catch(() => {});
    await page.waitForTimeout(1200); // postback éventuel
    await page.locator(SEL.validateButton).click().catch(() => {});
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);

    // 4) Télécharger le DCE complet → ZIP
    const buffer = await captureDownload(page, SEL.completeDownload);
    if (!buffer) throw new Error("Téléchargement du DCE non déclenché");

    // 5) Décompresser
    if (buffer.slice(0, 2).toString() === "PK") return zipToFiles(buffer);
    return [{ name: `DCE-${id}.bin`, buffer, contentType: contentTypeFor("x.bin") }];
  } finally {
    if (browser) await browser.close();
  }
}

async function captureDownload(page: Page, selector: string): Promise<Buffer | null> {
  const btn = page.locator(selector).first();
  if (!(await btn.count())) return null;
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 60000 }),
    btn.click().catch(() => {}),
  ]);
  const chunks: Buffer[] = [];
  for await (const c of await download.createReadStream()) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks);
}
