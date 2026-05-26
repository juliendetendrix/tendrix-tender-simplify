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

function zoneTokens(zone: string | null | undefined): string[] {
  if (!zone) return [];
  const z = zone.toLowerCase().trim();
  const tokens = new Set<string>([z]);
  // Add department-based aliases (e.g. "13" → bouches-du-rhône, marseille…)
  const deptMatch = z.match(/\b(\d{2,3})\b/);
  if (deptMatch && DEPT_NAMES[deptMatch[1]]) {
    DEPT_NAMES[deptMatch[1]].forEach((n) => tokens.add(n));
  }
  // Add reverse: if zone is a city/region name, find its dept code
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

  const loadFromDb = async () => {
    const { data } = await supabase
      .from('tenders')
      .select('*')
      .order('date_publication', { ascending: false })
      .limit(40)
    const items = (data ?? []).map((t: any): BoampTender => {
      const base = {
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
      }
      return { ...base, compatibility: calculateCompatibility(base, company) }
    })
    // When we have company data, sort by compatibility desc so the best matches come first
    if (company) {
      items.sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0))
    }
    return items
  }


  const fetchTenders = async () => {
    try {
      setLoading(true)
      setError(null)

      // Trigger the edge function to refresh DB
      const { error: fnErr } = await supabase.functions.invoke('fetch-boamp-tenders', { body: {} })
      if (fnErr) console.warn('Edge invoke error:', fnErr)

      const items = await loadFromDb()
      setTenders(items)
      setLastUpdate(new Date().toISOString())
      setUsingFallback(false)
    } catch (err) {
      console.error('Error fetching tenders:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      try {
        const items = await loadFromDb()
        setTenders(items)
      } catch {
        setUsingFallback(true)
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
