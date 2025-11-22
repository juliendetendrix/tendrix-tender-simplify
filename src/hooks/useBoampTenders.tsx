import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface BoampTender {
  id: string
  title: string
  summary: string
  organisme: string
  location: string
  budget: string
  datePublication: string
  deadline: string
  famille: string
  procedure: string
  cpvCodes: string[]
  url: string
  hoursAgo: number
  compatibility?: number
}

interface BoampResponse {
  success: boolean
  data: BoampTender[]
  count: number
  lastUpdate: string
  error?: string
  fallback?: boolean
}

// Calculate compatibility score based on CPV, location, and budget
const calculateCompatibility = (tender: BoampTender): number => {
  let score = 0
  
  // Base compatibility (always give some base score)
  score += 20
  
  // CPV code match (40 points max)
  // For now, give points based on tender family (simplified)
  if (tender.famille?.toLowerCase().includes('travaux') || 
      tender.famille?.toLowerCase().includes('construction')) {
    score += 40
  } else if (tender.famille?.toLowerCase().includes('fourniture') ||
             tender.famille?.toLowerCase().includes('service')) {
    score += 30
  } else {
    score += 20
  }
  
  // Location proximity (40 points max)
  // For now, simplified: give points based on location being specified
  if (tender.location && tender.location !== 'Non spécifié') {
    score += 30
    // Bonus for specific regions (you can customize this)
    if (tender.location.match(/Dordogne|Gironde|Lot-et-Garonne|Charente/i)) {
      score += 10
    }
  }
  
  // Budget bracket (20 points max)
  // Extract numeric value from budget string
  const budgetMatch = tender.budget.match(/(\d+)\s*k€/)
  if (budgetMatch) {
    const budgetValue = parseInt(budgetMatch[1])
    if (budgetValue >= 100 && budgetValue <= 1000) {
      score += 20
    } else if (budgetValue >= 50 && budgetValue < 100) {
      score += 15
    } else if (budgetValue < 50) {
      score += 10
    } else {
      score += 5
    }
  }
  
  return Math.min(100, score)
}

export const useBoampTenders = () => {
  const [tenders, setTenders] = useState<BoampTender[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const fetchTenders = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching BOAMP tenders...')
      
      const { data, error: supabaseError } = await supabase.functions.invoke('fetch-boamp-tenders', {
        body: {}
      })

      if (supabaseError) {
        throw new Error(`Supabase function error: ${supabaseError.message}`)
      }

      const response: BoampResponse = data

      if (response.error && !response.fallback) {
        throw new Error(response.error)
      }

      // Calculate compatibility for each tender
      const tendersWithCompatibility = (response.data || []).map((tender: BoampTender) => ({
        ...tender,
        compatibility: calculateCompatibility(tender)
      }))

      setTenders(tendersWithCompatibility)
      setLastUpdate(response.lastUpdate)
      setUsingFallback(response.fallback || false)
      
      if (response.fallback) {
        setError('Utilisation des données de secours - API BoAmp indisponible')
      }

      console.log('BOAMP tenders loaded:', tendersWithCompatibility.length, 'items')

    } catch (err) {
      console.error('Error fetching BOAMP tenders:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      
      // Use fallback data when there's an error
      const fallbackData = [
        { 
          id: '1', 
          title: "Construction de 4 maisons individuelles",
          summary: "Projet de construction de 4 maisons individuelles avec garage intégré et aménagement paysager.",
          organisme: "Commune de Bergerac", 
          location: "Dordogne",
          budget: "320 k€ HT",
          datePublication: new Date().toISOString(),
          deadline: "2025-10-15",
          famille: "Travaux",
          procedure: "Appel d'offres ouvert",
          cpvCodes: ["45000000"],
          url: "#",
          hoursAgo: 12,
          compatibility: 82
        },
        { 
          id: '2', 
          title: "Rénovation énergétique d'un groupe scolaire",
          summary: "Travaux d'isolation thermique, remplacement des menuiseries et installation de VMC double flux.",
          organisme: "Département de la Gironde", 
          location: "Gironde",
          budget: "450 k€ HT",
          datePublication: new Date().toISOString(),
          deadline: "2025-10-22",
          famille: "Travaux",
          procedure: "Appel d'offres ouvert",
          cpvCodes: ["45000000"],
          url: "#",
          hoursAgo: 24,
          compatibility: 75
        }
      ]
      setTenders(fallbackData)
      setUsingFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenders()
  }, [])

  return {
    tenders,
    loading,
    error,
    lastUpdate,
    usingFallback,
    refetch: fetchTenders
  }
}