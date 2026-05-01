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

// Compatibility v1: returns null when we don't have enough data to score
function calculateCompatibility(t: Omit<BoampTender, 'compatibility'>, company: CompanyForMatching | null): number | null {
  if (!company) return null
  let score = 0
  let weight = 0

  // Sector / famille (40%)
  if (company.sector && t.famille) {
    weight += 40
    if (t.famille.toLowerCase().includes(company.sector.toLowerCase().slice(0, 4))) score += 40
    else score += 10
  }

  // Geo zone (40%)
  if (company.zone && t.location) {
    weight += 40
    if (t.location.toLowerCase().includes(company.zone.toLowerCase().slice(0, 4))) score += 40
    else score += 15
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
    return (data ?? []).map((t: any): BoampTender => {
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
