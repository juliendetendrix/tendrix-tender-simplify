import { defineConfig } from "@trigger.dev/sdk";
import { playwright } from "@trigger.dev/build/extensions/playwright";

// ⚠️ Remplace "proj_xxxxxxxx" par l'ID de projet affiché dans ton dashboard Trigger.dev
// (Settings → Project ref). Voir le guide d'installation.
export default defineConfig({
  project: "proj_REMPLACER",
  runtime: "node",
  logLevel: "info",
  maxDuration: 600, // 10 min max par exécution (scraping + download)
  retries: {
    enabledInDev: false,
    default: { maxAttempts: 2, minTimeoutInMs: 2000, maxTimeoutInMs: 10000, factor: 2 },
  },
  build: {
    // Installe Chromium dans l'image de déploiement pour Playwright
    extensions: [playwright({ browsers: ["chromium"] })],
  },
  dirs: ["./src/trigger"],
});
