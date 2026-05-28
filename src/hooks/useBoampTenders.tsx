import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useCurrentCompany } from './useCurrentCompany'

export interface BoampTender {
  id: string
  title: string
  summary: string | null
  organisme: string | null
  location: string | null
  budget: string | null
  datePublication: string | null
  deadline: string | null
  famille: string | null
  procedure: string | null
  cpvCodes: string[]
  url: string | null
  hoursAgo: number
  compatibility: number | null
}

interface CompanyForMatching {
  sector: string | null
  zone: string | null
}

// Map sector keywords to BOAMP "famille" categories
const SECTOR_TO_FAMILLE: Record<string, string[]> = {
  travaux: ["maçonnerie", "maconnerie", "btp", "construction", "bâtiment", "batiment", "travaux", "rénovation", "renovation", "gros œuvre", "second œuvre", "voirie"],
  services: ["service", "conseil", "informatique", "it ", "digital", "nettoyage", "maintenance", "formation"],
  fournitures: ["fourniture", "matériel", "materiel", "équipement", "equipement", "mobilier"],
};

function inferFamille(sector: string | null | undefined): string | null {
  if (!sector) return null;
  const s = sector.toLowerCase();
  for (const [famille, keywords] of Object.entries(SECTOR_TO_FAMILLE)) {
    if (keywords.some((k) => s.includes(k))) return famille;
  }
  return null;
}

// French department code → region/department names for fuzzy location matching
const DEPT_NAMES: Record<string, string[]> = {
  "13": ["bouches-du-rhône", "bouches du rhone", "marseille", "aix", "paca", "provence"],
  "75": ["paris", "île-de-france", "ile-de-france", "idf"],
  "69": ["rhône", "rhone", "lyon", "auvergne-rhône-alpes"],
  "33": ["gironde", "bordeaux", "nouvelle-aquitaine"],
  "31": ["haute-garonne", "toulouse", "occitanie"],
  "06": ["alpes-maritimes", "nice", "cannes", "paca"],
  "59": ["nord", "lille", "hauts-de-france"],
  "44": ["loire-atlantique", "nantes", "pays de la loire"],
  "67": ["bas-rhin", "strasbourg", "grand est"],
  "34": ["hérault", "herault", "montpellier", "occitanie"],
};

const DEPT_LABELS: Record<string, string> = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence",
  "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes",
  "09": "Ariège", "10": "Aube", "11": "Aude", "12": "Aveyron", "13": "Bouches-du-Rhône",
  "14": "Calvados", "15": "Cantal", "16": "Charente", "17": "Charente-Maritime",
  "18": "Cher", "19": "Corrèze", "21": "Côte-d'Or", "22": "Côtes-d'Armor",
  "23": "Creuse", "24": "Dordogne", "25": "Doubs", "26": "Drôme", "27": "Eure",
  "28": "Eure-et-Loir", "29": "Finistère", "30": "Gard", "31": "Haute-Garonne",
  "32": "Gers", "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine",
  "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura", "40": "Landes",
  "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique",
  "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozère",
  "49": "Maine-et-Loire", "50": "Manche", "51": "Marne", "52": "Haute-Marne",
  "53": "Mayenne", "54": "Meurthe-et-Moselle", "55": "Meuse", "56": "Morbihan",
  "57": "Moselle", "58": "Nièvre", "59": "Nord", "60": "Oise", "61": "Orne",
  "62": "Pas-de-Calais", "63": "Puy-de-Dôme", "64": "Pyrénées-Atlantiques",
  "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales", "67": "Bas-Rhin",
  "68": "Haut-Rhin", "69": "Rhône", "70": "Haute-Saône", "71": "Saône-et-Loire",
  "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie", "75": "Paris",
  "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines", "79": "Deux-Sèvres",
  "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse",
  "85": "Vendée", "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne",
  "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine",
  "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise",
}

function formatLocation(deptArr: any): string | null {
  if (!deptArr) return null
  const list: string[] = Array.isArray(deptArr) ? deptArr : [String(deptArr)]
  const cleaned = list.map(String).filter(Boolean)
  if (!cleaned.length) return null
  const code = cleaned[0]
  const label = DEPT_LABELS[code]
  return label ? `${label} (${code})` : `Département ${code}`
}

function buildTitle(objet: any): string {
  const raw = objet ? String(objet).trim() : null
  if (!raw) return "Appel d'offres"
  if (raw === raw.toUpperCase()) {
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  }
  return raw
}

function zoneTokens(zone: string | null | undefined): string[] {
  if (!zone) return [];
  const z = zone.toLowerCase().trim();
  const tokens = new Set<string>([z]);
  const deptMatch = z.match(/\b(\d{2,3})\b/);
  if (deptMatch && DEPT_NAMES[deptMatch[1]]) {
    DEPT_NAMES[deptMatch[1]].forEach((n) => tokens.add(n));
  }
  for (const [code, names] of Object.entries(DEPT_NAMES)) {
    if (names.some((n) => z.includes(n))) {
      tokens.add(code);
      names.forEach((n) => tokens.add(n));
    }
  }
  return Array.from(tokens).filter((t) => t.length >= 2);
}

// Compatibility v2: sector via famille synonyms, zone via department codes + aliases
function calculateCompatibility(t: Omit<BoampTender, 'compatibility'>, company: CompanyForMatching | null): number | null {
  if (!company) return null
  let score = 0
  let weight = 0

  // Sector / famille (40%)
  const targetFamille = inferFamille(company.sector);
  if (company.sector && t.famille) {
    weight += 40
    const tf = t.famille.toLowerCase();
    if (targetFamille && tf.includes(targetFamille)) score += 40
    else if (tf.includes(company.sector.toLowerCase().slice(0, 4))) score += 30
    else score += 8
  }

  // Geo zone (40%) — match by tokens (dept codes + city/region names)
  if (company.zone && t.location) {
    weight += 40
    const loc = t.location.toLowerCase();
    const tokens = zoneTokens(company.zone);
    if (tokens.some((tok) => loc.includes(tok))) score += 40
    else score += 10
  }

  // Budget (20%) — bracket within 50k–1M
  if (t.budget) {
    weight += 20
    const m = t.budget.match(/(\d+)\s*k€/)
    if (m) {
      const v = parseInt(m[1])
      if (v >= 50 && v <= 1000) score += 20
      else score += 10
    } else score += 10
  }

  if (weight === 0) return null
  return Math.min(100, Math.round((score / weight) * 100))
}

// ── Direct BOAMP API fetch (browser → OpenDataSoft, CORS-enabled) ────────────
async function fetchBoampDirect(): Promise<BoampTender[]> {
  const BOAMP_URL = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records'
  const params = new URLSearchParams({
    limit: '100',
    order_by: 'dateparution desc',
    where: 'type_marche_facette = "Travaux" AND etat = "INITIAL"',
  })
  const resp = await fetch(`${BOAMP_URL}?${params}`, {
    headers: { Accept: 'application/json' },
  })
  if (!resp.ok) throw new Error(`BOAMP API ${resp.status}`)
  const data = await resp.json()
  const results: any[] = data.results ?? []

  return results.map((r): BoampTender => {
    const id = String(r.id ?? r.idweb ?? Math.random().toString(36).slice(2))
    const location = formatLocation(r.code_departement ?? r.code_departement_prestation)
    const title = buildTitle(r.objet)

    let famille: string | null = null
    if (typeof r.type_marche_facette === 'string') famille = r.type_marche_facette
    else if (Array.isArray(r.type_marche_facette) && r.type_marche_facette.length) famille = String(r.type_marche_facette[0])
    else if (Array.isArray(r.descripteur_libelle) && r.descripteur_libelle.length) famille = String(r.descripteur_libelle[0])

    const procedure = r.procedure_libelle ? String(r.procedure_libelle).trim() : null

    let summary: string | null = null
    if (Array.isArray(r.descripteur_libelle) && r.descripteur_libelle.length) {
      summary = `Prestations : ${r.descripteur_libelle.slice(0, 4).join(', ')}.`
    }

    const datePublication = r.dateparution ? new Date(r.dateparution).toISOString() : new Date().toISOString()
    const hoursAgo = Math.floor((Date.now() - new Date(datePublication).getTime()) / 3_600_000)

    const base = {
      id,
      title,
      summary,
      organisme: r.nomacheteur ? String(r.nomacheteur).trim() : null,
      location,
      budget: null,
      datePublication,
      deadline: r.datelimitereponse || null,
      famille,
      procedure,
      cpvCodes: Array.isArray(r.descripteur_code) ? r.descripteur_code.map(String) : [],
      url: `https://www.boamp.fr/avis/detail/${r.idweb ?? id}`,
      hoursAgo,
    }
    return { ...base, compatibility: null } // compatibility added later with company context
  })
}

export const useBoampTenders = () => {
  const { company } = useCurrentCompany()
  const [tenders, setTenders] = useState<BoampTender[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const calcHoursAgo = (date: string | null) => {
    if (!date) return 0
    return Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000)
  }

  const withCompatibility = (items: BoampTender[]): BoampTender[] => {
    const enriched = items.map((t) => ({ ...t, compatibility: calculateCompatibility(t, company) }))
    if (company) enriched.sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0))
    return enriched
  }

  const loadFromDb = async (): Promise<BoampTender[]> => {
    const { data } = await supabase
      .from('tenders')
      .select('*')
      .order('date_publication', { ascending: false })
      .limit(40)
    return (data ?? []).map((t: any): BoampTender => ({
      id: t.id,
      title: t.title,
      summary: t.summary,
      organisme: t.organisme,
      location: t.location,
      budget: t.budget,
      datePublication: t.date_publication,
      deadline: t.deadline,
      famille: t.famille,
      procedure: t.procedure,
      cpvCodes: t.cpv_codes ?? [],
      url: t.source_url,
      hoursAgo: calcHoursAgo(t.date_publication),
      compatibility: null,
    }))
  }

  const fetchTenders = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Try edge function first (populates DB + returns data)
      const { error: fnErr } = await supabase.functions.invoke('fetch-boamp-tenders', { body: {} })
      if (fnErr) console.warn('Edge function not available, using direct BOAMP fetch:', fnErr.message)

      // 2. Read from DB (populated by edge function if it succeeded)
      let items = await loadFromDb()

      // 3. Si la base ne contient pas assez d'AO (edge function KO ou base
      //    quasi vide), on complète avec un fetch BOAMP direct (CORS-enabled)
      //    et on fusionne sans doublon. Garantit une liste fournie.
      if (items.length < 10) {
        console.log(`DB n'a que ${items.length} AO — complément via BOAMP direct`)
        setUsingFallback(true)
        try {
          const direct = await fetchBoampDirect()
          const map = new Map<string, BoampTender>()
          for (const t of direct) map.set(t.id, t)
          for (const t of items) if (!map.has(t.id)) map.set(t.id, t)
          items = Array.from(map.values())
        } catch (e) {
          console.warn('Fetch BOAMP direct échoué:', e)
        }
      } else {
        setUsingFallback(false)
      }

      setTenders(withCompatibility(items))
      setLastUpdate(new Date().toISOString())
    } catch (err) {
      console.error('Error fetching tenders:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Last-resort: try DB anyway
      try {
        const items = await loadFromDb()
        setTenders(withCompatibility(items))
      } catch {
        // nothing left to try
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id])

  return { tenders, loading, error, lastUpdate, usingFallback, refetch: fetchTenders }
}
