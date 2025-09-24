import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface BoampTender {
  id: string
  title: string
  organisme: string
  montant: string
  datePublication: string
  famille: string
  procedure: string
  url: string
}

interface BoampResponse {
  success: boolean
  data: BoampTender[]
  count: number
  lastUpdate: string
  error?: string
  fallback?: boolean
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

      setTenders(response.data || [])
      setLastUpdate(response.lastUpdate)
      setUsingFallback(response.fallback || false)
      
      if (response.fallback) {
        setError('Utilisation des données de secours - API BoAmp indisponible')
      }

      console.log('BOAMP tenders loaded:', response.data?.length || 0, 'items')

    } catch (err) {
      console.error('Error fetching BOAMP tenders:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      
      // Use fallback data when there's an error
      setTenders([
        { 
          id: '1', 
          title: "AO - Fournitures de bureau", 
          organisme: "Mairie de Paris", 
          montant: "45 k€",
          datePublication: new Date().toISOString(),
          famille: "MAPA",
          procedure: "Appel d'offres ouvert",
          url: "#"
        },
        { 
          id: '2', 
          title: "AO - Travaux de voirie", 
          organisme: "Conseil Départemental", 
          montant: "180 k€",
          datePublication: new Date().toISOString(),
          famille: "FNS",
          procedure: "Appel d'offres ouvert",
          url: "#"
        },
        { 
          id: '3', 
          title: "AO - Services de nettoyage", 
          organisme: "Université Lyon 1", 
          montant: "75 k€",
          datePublication: new Date().toISOString(),
          famille: "MAPA",
          procedure: "Procédure adaptée",
          url: "#"
        }
      ])
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