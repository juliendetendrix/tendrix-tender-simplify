// Test RÉEL de l'adaptateur PLACE / Atexo sur de vrais appels d'offres.
// Aucune écriture, aucun crédit : on télécharge le DCE, on liste les fichiers,
// puis on jette tout. C'est la preuve directe que le scraping des documents marche.

import { scrapePlace } from "../src/trigger/adapters/place.ts";

// Candidats réels (BOAMP « Travaux »), à lien profond id+orgAcronyme → chemin fiable.
const CANDIDATES: { label: string; platformUrl: string; reference: string | null; buyer: string | null; title: string | null }[] = [
  {
    label: "PLACE — TGBT Hôtel (SGAMI Est)",
    platformUrl: "https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&AllCons&id=3002959&orgAcronyme=g6l",
    reference: "2026SGAMI57014",
    buyer: "SGAMI Est DAGF BCP",
    title: null,
  },
  {
    label: "PLACE — Réhabilitation atelier auto (SGAMI Est)",
    platformUrl: "https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&AllCons&id=3001034&orgAcronyme=g6l",
    reference: "2026SGAMI57003",
    buyer: "SGAMI Est DAGF BCP",
    title: null,
  },
  {
    label: "Atexo/Maximilien — Plantation arbres (SEDIF)",
    platformUrl: "https://marches.maximilien.fr/entreprise/consultation/939862?orgAcronyme=sedif",
    reference: "2026_QEE_01",
    buyer: "SEDIF",
    title: null,
  },
];

const onlyIdx = process.argv[2] ? Number(process.argv[2]) : null;
const list = onlyIdx != null ? [CANDIDATES[onlyIdx]] : CANDIDATES;

for (const c of list) {
  console.log("\n══════════════════════════════════════════════");
  console.log("TEST :", c.label);
  console.log("URL  :", c.platformUrl);
  const t0 = Date.now();
  try {
    const files = await scrapePlace({
      platformUrl: c.platformUrl,
      reference: c.reference,
      buyer: c.buyer,
      title: c.title,
    });
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`✅ SUCCÈS en ${secs}s — ${files.length} fichier(s) :`);
    for (const f of files) {
      console.log(`   • ${f.name}  (${f.contentType}, ${(f.buffer.length / 1024).toFixed(0)} Ko)`);
    }
  } catch (e) {
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`❌ ÉCHEC en ${secs}s :`, String(e).split("\n")[0]);
  }
}
console.log("");
