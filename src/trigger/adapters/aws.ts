import { chromium, type Browser, type Page } from "playwright";
import type { DceFile, ScrapeInput } from "./types";
import { zipToFiles, contentTypeFor } from "../lib/files";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

// Erreur dédiée : un captcha barre le chemin anonyme. On NE le résout JAMAIS,
// on remonte proprement pour basculer l'analyse en intervention manuelle.
export const CAPTCHA_MARKER = "CAPTCHA_DETECTED";

/**
 * Adaptateur AWS-Achat / marches-publics.info (moteur ColdFusion « index.cfm »).
 *
 * Plateforme multi-acheteurs (≈70 000 AO/an). Le retrait du DCE en mode ANONYME
 * est légalement autorisé (arrêté du 14/12/2009) et proposé via un lien dédié.
 *
 * Parcours visé (à confirmer/affiner en conditions réelles) :
 *  1. Ouvrir la page de retrait (lien profond avec IDM=… extrait de l'avis BOAMP)
 *     → établit une session ColdFusion (cookies CFID/CFTOKEN).
 *  2. Suivre le lien « retirer le DCE en mode anonyme ».
 *  3. Page d'avertissement / conditions : cocher + valider.
 *  4. Cliquer « Télécharger le DCE » → ZIP → décompresser.
 *
 * SÉCURITÉ : si un CAPTCHA apparaît sur le chemin anonyme, on lève CAPTCHA_MARKER
 * et on abandonne (jamais de résolution de captcha).
 */
export async function scrapeAws(input: ScrapeInput): Promise<DceFile[]> {
  const { platformUrl } = input;
  if (!platformUrl) throw new Error("URL plateforme AWS manquante");

  const parsed = new URL(platformUrl);
  const idm = parsed.searchParams.get("IDM");
  if (!idm) throw new Error("IDM introuvable dans l'URL AWS");

  // Reconstruit la base « …/<tenant>/index.cfm » (le tenant varie : mpiaws, avis, _aws…)
  const dir = parsed.pathname.replace(/index\.cfm.*$/i, "");
  const base = `${parsed.origin}${dir}index.cfm`;
  const cfm = (fuseaction: string) =>
    `${base}?fuseaction=${fuseaction}&IDM=${idm}&type=DCE`;

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ acceptDownloads: true, userAgent: UA });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    // 1) Ouvrir la page de retrait fournie par l'avis (établit la session CFID).
    await page.goto(platformUrl, { waitUntil: "domcontentloaded" });

    // 2) Suivre le lien « retirer le DCE en mode anonyme » s'il est présent,
    //    sinon tenter directement la page d'avertissement (chemin anonyme).
    const anon = page.getByRole("link", { name: /anonyme/i }).first();
    if (await anon.count()) {
      await anon.click().catch(() => {});
      await page.waitForLoadState("networkidle").catch(() => {});
    } else {
      await page.goto(cfm("dce.avertissement"), { waitUntil: "domcontentloaded" }).catch(() => {});
    }

    // 3) Garde-fou captcha : si présent sur le chemin anonyme → abandon.
    if (await hasCaptcha(page)) throw new Error(CAPTCHA_MARKER);

    // 4) Page d'avertissement / conditions : cocher cases + choisir motif + valider.
    await acceptAndContinue(page);
    if (await hasCaptcha(page)) throw new Error(CAPTCHA_MARKER);

    // 5) Télécharger le DCE complet → ZIP.
    const buffer = await captureDownload(page);
    if (!buffer) throw new Error("Téléchargement du DCE non déclenché (AWS)");

    if (buffer.slice(0, 2).toString() === "PK") return zipToFiles(buffer);
    return [{ name: `DCE-${idm}.bin`, buffer, contentType: contentTypeFor("x.bin") }];
  } finally {
    if (browser) await browser.close();
  }
}

// Détecte un captcha image (« Texte de l'image », champ/illustration dédiés).
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

// Coche d'éventuelles cases de conditions, sélectionne un motif de retrait,
// puis clique le bouton de poursuite (en ignorant le « Rafraîchir » du captcha).
async function acceptAndContinue(page: Page): Promise<void> {
  const checks = page.locator('input[type="checkbox"]');
  const nc = await checks.count();
  for (let i = 0; i < nc; i++) await checks.nth(i).check().catch(() => {});

  const radios = page.locator('input[type="radio"]');
  if (await radios.count()) await radios.first().check().catch(() => {});

  const next = page
    .getByRole("button", { name: /valider|acc[ée]der|continuer|poursuivre|j['’]accepte|t[ée]l[ée]charger/i })
    .or(page.getByRole("link", { name: /valider|acc[ée]der|continuer|poursuivre/i }))
    .first();
  if (await next.count()) {
    await next.click().catch(() => {});
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1000);
  }
}

// Déclenche et capture le téléchargement du DCE.
async function captureDownload(page: Page): Promise<Buffer | null> {
  const trigger = page
    .getByRole("link", { name: /t[ée]l[ée]charger.*(dce|dossier)|acc[ée]der au dce|t[ée]l[ée]charger le dossier/i })
    .or(page.getByRole("button", { name: /t[ée]l[ée]charger.*(dce|dossier)|acc[ée]der au dce|t[ée]l[ée]charger le dossier/i }))
    .first();
  if (!(await trigger.count())) return null;

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 60000 }),
    trigger.click().catch(() => {}),
  ]);
  const chunks: Buffer[] = [];
  for await (const c of await download.createReadStream()) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks);
}
