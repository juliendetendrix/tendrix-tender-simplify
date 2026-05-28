import { defineConfig } from "@trigger.dev/sdk";
import { playwright } from "@trigger.dev/build/extensions/playwright";

// Projet Trigger.dev « tendrix-scraper » (organisation Tendrix).
export default defineConfig({
  project: "proj_lmdupwynjootrdfdwgyd",
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
