import { chromium, type Browser, type Page } from "playwright";
import type { DceFile, ScrapeInput } from "./types";
import { zipToFiles, contentTypeFor } from "../lib/files";
import { CAPTCHA_MARKER } from "./aws";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const PLACE_BASE = "https://www.marches-publics.gouv.fr";

// Sélecteurs du moteur Atexo « MPE » — VALIDÉS sur PLACE (mai 2026).
// Atexo équipe PLACE ET de nombreux portails régionaux (Maximilien, Megalis,
// Ternum-BFC, Alsace…) avec le MÊME logiciel → mêmes ids, même parcours.
const SEL = {
  quickSearchInput: "#ctl0_bandeauEntrepriseWithoutMenuSf_quickSearch",
  quickSearchBtn: "#btnGoToQuickResultSearch",
  detailLink: 'a[href*="/entreprise/consultation/"]',
  choixAnonyme: "#ctl0_CONTENU_PAGE_EntrepriseFormulaireDemande_choixAnonyme",
  etabFrance: "#ctl0_CONTENU_PAGE_EntrepriseFormulaireDemande_france",
  validateButton: "#ctl0_CONTENU_PAGE_validateButton",
  completeDownload: "#ctl0_CONTENU_PAGE_EntrepriseDownloadDce_completeDownload",
};

// Déduit la base (origine) du portail Atexo depuis l'URL du profil acheteur.
// PLACE et les portails régionaux servent à la racine du domaine.
function baseFromUrl(platformUrl: string | null): string {
  if (!platformUrl) return PLACE_BASE;
  try {
    return new URL(platformUrl).origin;
  } catch {
    return PLACE_BASE;
  }
}

// Si l'URL du profil est déjà un lien profond Atexo vers la consultation,
// on récupère id + orgAcronyme directement (plus fiable que la recherche).
function extractIdOrg(url: string | null): { id: string; org: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // id : soit en paramètre (?id=…), soit dans le chemin (/consultation/<id>)
    const id =
      u.searchParams.get("id") ??
      (u.pathname.match(/consultation\/(\d+)/)?.[1] ?? null);
    const org = u.searchParams.get("orgAcronyme");
    if (id && org) return { id, org };
  } catch { /* ignore */ }
  const m = url.match(/[?&]id=(\d+)[^]*?[?&]orgAcronyme=([^&]+)/i);
  if (m) return { id: m[1], org: m[2] };
  return null;
}

/**
 * Adaptateur famille ATEXO (PLACE + portails régionaux marches-publics.gouv.fr,
 * maximilien, megalis, ternum-bfc, alsace…) — moteur MPE d'Atexo.
 *
 * Retrait anonyme du DCE, légalement autorisé, SANS captcha sur PLACE.
 *
 * Parcours :
 *  1. Si l'URL du profil contient déjà id + orgAcronyme → on saute la recherche.
 *     Sinon : recherche rapide par référence/objet → 1re consultation.
 *  2. Page « demande de téléchargement » → cocher anonyme + France → Valider.
 *  3. Cliquer « Télécharger le DCE complet » → ZIP → décompresser.
 *
 * SÉCURITÉ : si un portail ajoute un captcha sur le chemin anonyme, on lève
 * CAPTCHA_MARKER et on abandonne (jamais de résolution de captcha).
 */
export async function scrapePlace(input: ScrapeInput): Promise<DceFile[]> {
  const { reference, buyer, platformUrl } = input;
  const base = baseFromUrl(platformUrl);
  const direct = extractIdOrg(platformUrl);

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ acceptDownloads: true, userAgent: UA });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    let id: string;
    let org: string;

    if (direct) {
      // Chemin rapide : la consultation est déjà identifiée dans l'URL du profil.
      id = direct.id;
      org = direct.org;
    } else {
      // 1) Recherche rapide par référence / objet.
      const query = (reference || input.title || buyer || "").trim();
      if (!query) throw new Error("Aucune clé de recherche (référence/objet) pour Atexo");

      await page.goto(`${base}/?page=entreprise.EntrepriseAdvancedSearch&AllCons`, { waitUntil: "networkidle" });
      const search = page.locator(SEL.quickSearchInput);
      if (await search.count()) {
        await search.fill(query);
        await page.locator(SEL.quickSearchBtn).click().catch(() => {});
        await page.waitForLoadState("networkidle").catch(() => {});
      }

      // 2) Ouvrir la 1re consultation → récupérer id + orgAcronyme
      const detail = page.locator(SEL.detailLink).first();
      if (!(await detail.count())) {
        throw new Error("Consultation introuvable sur Atexo pour cette recherche");
      }
      const href = (await detail.getAttribute("href")) || "";
      const idMatch = href.match(/consultation\/(\d+)/);
      const orgMatch = href.match(/orgAcronyme=([^&]+)/);
      if (!idMatch || !orgMatch) throw new Error("id/orgAcronyme introuvables");
      id = idMatch[1];
      org = orgMatch[1];
    }

    // 3) Page de demande de téléchargement (anonyme)
    await page.goto(
      `${base}/index.php?page=Entreprise.EntrepriseDemandeTelechargementDce&id=${id}&orgAcronyme=${org}`,
      { waitUntil: "networkidle" },
    );
    if (await hasCaptcha(page)) throw new Error(CAPTCHA_MARKER);

    await page.locator(SEL.choixAnonyme).check().catch(() => {});
    await page.locator(SEL.etabFrance).check().catch(() => {});
    await page.waitForTimeout(1200); // postback éventuel
    await page.locator(SEL.validateButton).click().catch(() => {});
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);
    if (await hasCaptcha(page)) throw new Error(CAPTCHA_MARKER);

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

// Détecte un captcha (champ/illustration dédiés ou texte « recopiez l'image »).
async function hasCaptcha(page: Page): Promise<boolean> {
  const input = await page
    .locator('input[name*="captcha" i], input[id*="captcha" i]')
    .count();
  if (input > 0) return true;
  const img = await page
    .locator('img[src*="captcha" i], img[src*="securimage" i]')
    .count();
  if (img > 0) return true;
  const txt = await page
    .getByText(/texte de l['’]image|recopiez? l['’]image|code de s[ée]curit[ée]|caract[èe]res de l['’]image/i)
    .count();
  return txt > 0;
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
