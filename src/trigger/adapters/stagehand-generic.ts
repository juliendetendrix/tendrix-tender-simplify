import { Stagehand } from "@browserbasehq/stagehand";
import type { BrowserContext, Download } from "playwright";
import type { DceFile, ScrapeInput } from "./types";
import { zipToFiles, contentTypeFor, KEEP } from "../lib/files";
import { CAPTCHA_MARKER } from "./aws";

// ─────────────────────────────────────────────────────────────────────────────
// Adaptateur GÉNÉRIQUE piloté par un agent IA (Stagehand + Playwright).
//
// Rôle : repli quand aucun adaptateur déterministe (PLACE/Atexo, AWS) ne couvre
// la plateforme. L'agent lit la page comme un humain et tente de récupérer le
// DCE sur n'importe quel profil acheteur OUVERT (sans login).
//
// Garde-fous STRICTS :
//   • on ne crée jamais de compte, on ne saisit jamais de mot de passe ;
//   • si un captcha / une vérification anti-robot apparaît → on s'ARRÊTE
//     (throw CAPTCHA_MARKER), on ne tente jamais de le résoudre ;
//   • repli humain (manuel) si l'agent ne ramène rien.
//
// Prérequis d'exécution : variable d'env ANTHROPIC_API_KEY côté Trigger.dev.
// ─────────────────────────────────────────────────────────────────────────────

const AGENT_MODEL = "anthropic/claude-sonnet-4-5";
const CAPTCHA_RE = /captcha|recaptcha|hcaptcha|cloudflare|turnstile|êtes-vous un robot|are you a robot/i;

export async function scrapeGenericWithAgent(input: ScrapeInput): Promise<DceFile[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquante (agent générique désactivé)");

  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: AGENT_MODEL,
    modelClientOptions: { apiKey },
    verbose: 1,
    localBrowserLaunchOptions: { headless: true, acceptDownloads: true },
  });
  await stagehand.init();

  const collected: DceFile[] = [];
  try {
    // Stagehand v2 expose un contexte/page Playwright (typage d'events partiel
    // côté Stagehand → on caste vers le type Playwright pour l'écoute des downloads).
    const context = stagehand.context as unknown as BrowserContext;
    const page = context.pages()[0] ?? (await context.newPage());

    // Capture TOUT téléchargement (les downloads sont des événements de PAGE).
    const onDownload = async (dl: Download) => {
      try {
        const name = dl.suggestedFilename() || "dce";
        const stream = await dl.createReadStream();
        if (!stream) return;
        const chunks: Buffer[] = [];
        for await (const c of stream) chunks.push(Buffer.from(c as Buffer));
        collected.push({ name, buffer: Buffer.concat(chunks), contentType: contentTypeFor(name) });
      } catch {
        /* ignore une pièce illisible */
      }
    };
    page.on("download", onDownload);
    // …y compris si l'agent ouvre un nouvel onglet.
    context.on("page", (p) => p.on("download", onDownload));

    await page.goto(input.platformUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });

    // Détection captcha AVANT toute action — on ne résout jamais.
    const html = (await page.content()).toLowerCase();
    if (CAPTCHA_RE.test(html)) throw new Error(CAPTCHA_MARKER);

    // Navigation multi-étapes confiée à l'agent.
    const cible = input.reference
      ? `la référence de consultation « ${input.reference} »`
      : `l'objet « ${input.title ?? ""} »`;

    const agent = stagehand.agent();
    await agent.execute(
      `Tu es sur la plateforme de dématérialisation des marchés publics d'un acheteur. ` +
        `Objectif : récupérer le Dossier de Consultation des Entreprises (DCE) de ${cible}. ` +
        `Étapes : 1) trouve la consultation (recherche par la référence ou l'objet si besoin) ; ` +
        `2) ouvre la page de la consultation ; 3) accède au téléchargement du DCE ; ` +
        `4) si un retrait « anonyme » ou « sans identification » est proposé, choisis-le ; ` +
        `5) clique sur « télécharger le dossier complet » (ou équivalent) pour lancer le téléchargement. ` +
        `INTERDIT : créer un compte, saisir un mot de passe, fournir des données personnelles. ` +
        `Si une vérification anti-robot / captcha apparaît, ARRÊTE-TOI immédiatement sans la résoudre.`,
    );

    // Laisse les téléchargements se terminer.
    await page.waitForTimeout(8_000);

    // Re-vérifie qu'un captcha n'est pas apparu en cours de route.
    const after = (await page.content().catch(() => "")).toLowerCase();
    if (collected.length === 0 && CAPTCHA_RE.test(after)) throw new Error(CAPTCHA_MARKER);

    // Décompresse les .zip, garde les pièces utiles.
    const out: DceFile[] = [];
    for (const f of collected) {
      if (f.name.toLowerCase().endsWith(".zip")) {
        try {
          out.push(...zipToFiles(f.buffer));
          continue;
        } catch {
          /* zip illisible : on le garde tel quel */
        }
      }
      if (KEEP.test(f.name)) out.push(f);
    }
    return out;
  } finally {
    await stagehand.close().catch(() => {});
  }
}
