// Trouve de vrais AO PLACE / famille Atexo dans le flux BOAMP « Travaux »,
// avec les champs résolus (référence, URL profil, acheteur) — pour tester
// l'adaptateur en réel. Lecture seule, aucun crédit.

import { resolveDce } from "../src/trigger/lib/dce-resolver.ts";

const API =
  "https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records";
const WHERE = `type_marche_facette = "Travaux" AND etat = "INITIAL"`;

async function fetchPage(offset: number) {
  const params = new URLSearchParams({
    limit: "100",
    offset: String(offset),
    order_by: "dateparution desc",
    where: WHERE,
  });
  const resp = await fetch(`${API}?${params}`, {
    headers: { Accept: "application/json", "User-Agent": "Tendrix-App/1.0" },
  });
  if (!resp.ok) throw new Error(`BOAMP ${resp.status}`);
  return (await resp.json()).results ?? [];
}

const want = (process.argv[2] ?? "place,atexo").split(",");

const records: any[] = [];
for (let off = 0; off < 500; off += 100) {
  const page = await fetchPage(off);
  records.push(...page);
  if (page.length < 100) break;
}

const hits = records
  .map((r) => ({ r, dce: resolveDce(r) }))
  .filter(({ dce }) => dce.platform && want.includes(dce.platform));

console.log(`\n${hits.length} candidats ${want.join("/")} sur ${records.length} AO\n`);
for (const { r, dce } of hits.slice(0, 12)) {
  console.log("──────────────────────────────────────");
  console.log("titre   :", String(r.objet ?? "").slice(0, 80));
  console.log("moteur  :", dce.platform);
  console.log("réf     :", dce.reference);
  console.log("acheteur:", dce.buyer);
  console.log("url     :", dce.platformUrl);
}
console.log("");
