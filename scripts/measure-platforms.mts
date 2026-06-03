// Mesure de la répartition réelle des plateformes de dématérialisation.
//
// Tire un large échantillon d'avis BOAMP « Travaux » (le marché cible : BTP),
// passe chaque avis dans le VRAI résolveur DCE (celui qu'utilise le robot),
// et compte : moteur détecté (platform) + part résolvable.
//
// Aucune écriture en base, aucun crédit. Lecture seule de l'API publique BOAMP.
//
// Lancement :  npx tsx scripts/measure-platforms.mts [nbMax]
//   nbMax = nombre d'avis à échantillonner (défaut 1000)

import { resolveDce } from "../src/trigger/lib/dce-resolver.ts";

const API =
  "https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records";
const WHERE = `type_marche_facette = "Travaux" AND etat = "INITIAL"`;
const PAGE = 100; // max par page sur l'API v2.1

const target = Number(process.argv[2] ?? 1000);

async function fetchPage(offset: number): Promise<any[]> {
  const params = new URLSearchParams({
    limit: String(PAGE),
    offset: String(offset),
    order_by: "dateparution desc",
    where: WHERE,
  });
  const resp = await fetch(`${API}?${params}`, {
    headers: { Accept: "application/json", "User-Agent": "Tendrix-App/1.0" },
  });
  if (!resp.ok) {
    throw new Error(`BOAMP API ${resp.status} : ${await resp.text().catch(() => "")}`);
  }
  const data = await resp.json();
  return data.results ?? [];
}

async function main() {
  console.log(`\nÉchantillonnage BOAMP « Travaux » (cible ${target} avis)…\n`);

  const records: any[] = [];
  for (let offset = 0; offset < target; offset += PAGE) {
    const page = await fetchPage(offset);
    if (page.length === 0) break;
    records.push(...page);
    process.stdout.write(`  ${records.length} avis récupérés\r`);
    if (page.length < PAGE) break; // dernière page
  }
  console.log(`\n\nTotal échantillon : ${records.length} avis\n`);

  const platformCount = new Map<string, number>();
  const platformResolvable = new Map<string, number>();
  let resolvable = 0;
  let noUrl = 0;

  for (const r of records) {
    const dce = resolveDce(r);
    if (!dce.platformUrl) {
      noUrl++;
      continue;
    }
    const key = dce.platform ?? "unknown";
    platformCount.set(key, (platformCount.get(key) ?? 0) + 1);
    if (dce.resolvable) {
      resolvable++;
      platformResolvable.set(key, (platformResolvable.get(key) ?? 0) + 1);
    }
  }

  const total = records.length || 1;
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  console.log("=== Avec lien plateforme exploitable ===");
  console.log(`  ${resolvable} / ${records.length} (${pct(resolvable)})`);
  console.log(`  Sans aucun lien plateforme : ${noUrl} (${pct(noUrl)})\n`);

  const ranked = [...platformCount.entries()].sort((a, b) => b[1] - a[1]);
  console.log("=== Répartition par moteur (plateforme) ===");
  console.log("  rang  moteur                          avis    part");
  ranked.forEach(([engine, n], i) => {
    const rank = String(i + 1).padStart(2);
    const name = engine.padEnd(30);
    const count = String(n).padStart(5);
    console.log(`  ${rank}.   ${name} ${count}   ${pct(n)}`);
  });

  console.log("\n=== Lecture stratégique ===");
  const known = ["place", "aws-achat", "dematis", "achatpublic", "marches-securises", "maximilien", "megalis", "atexo", "xmarches"];
  const topKnown = ranked.filter(([e]) => known.includes(e));
  if (topKnown.length) {
    console.log("  Moteurs identifiés (adaptateur ciblable) :");
    topKnown.forEach(([e, n]) => console.log(`    - ${e} : ${n} avis (${pct(n)})`));
  }
  const others = ranked.filter(([e]) => !known.includes(e));
  if (others.length) {
    const sumOthers = others.reduce((s, [, n]) => s + n, 0);
    console.log(`  Autres domaines non mappés : ${others.length} domaines, ${sumOthers} avis (${pct(sumOthers)})`);
    console.log("    top 8 domaines bruts :");
    others.slice(0, 8).forEach(([e, n]) => console.log(`      - ${e} : ${n}`));
  }
  console.log("");
}

main().catch((e) => {
  console.error("Erreur :", e);
  process.exit(1);
});
