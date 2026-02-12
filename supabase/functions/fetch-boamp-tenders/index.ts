import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Helper function to calculate hours ago
function calculateHoursAgo(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60))
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching recent BOAMP tenders from OpenDataSoft API...')
    
    const boampApiUrl = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records'
    
    const params = new URLSearchParams({
      'limit': '20',
      'order_by': 'dateparution desc',
    })

    const response = await fetch(`${boampApiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Tendrix-App/1.0'
      },
    })

    if (!response.ok) {
      console.error('BOAMP API error:', response.status, response.statusText)
      throw new Error('External API unavailable')
    }

    const data = await response.json()
    console.log('BOAMP API response:', data.total_count || 0, 'records found')

    // Transform the data to match our expected format
    const tenders = data.results?.map((record: any) => {
      const organisme = record.annonceur 
        || record.acheteur 
        || record.nom_acheteur
        || record.pouvoir_adjudicateur
        || record.identite_nom
        || 'Organisme non spécifié'
      
      let location = 'Lieu : Non spécifié'
      const ville = record.ville || record.ville_execution || record.lieu_ville
      const codePostal = record.code_postal || record.cp_execution || record.lieu_code_postal
      const dept = record.departement || record.code_departement || record.lieu_departement
      const lieuExec = record.lieuexecution || record.lieu_execution || record.lieu_exec
      
      if (ville && codePostal) {
        location = `${ville} (${codePostal})`
      } else if (ville) {
        location = ville
      } else if (lieuExec) {
        location = lieuExec
      } else if (dept) {
        if (Array.isArray(dept)) {
          location = `Département ${dept[0]}`
        } else {
          location = `Département ${dept}`
        }
      }
      
      let budget = 'Montant non spécifié'
      if (record.montant) {
        const montantValue = parseFloat(record.montant)
        if (!isNaN(montantValue)) {
          budget = `${Math.round(montantValue / 1000)} k€ HT`
        }
      }
      
      const cpvCodes = record.cpv ? [record.cpv] : []
      const summary = record.objetmarche?.slice(0, 150) + '...' || record.objet?.slice(0, 150) + '...' || 'Description non disponible'
      
      return {
        id: record.id || Math.random().toString(36),
        title: record.objet || 'Appel d\'offres',
        summary: summary,
        organisme: organisme,
        location: location,
        budget: budget,
        datePublication: record.dateparution || new Date().toISOString(),
        deadline: record.datelimitereponse || '',
        famille: record.familleannonce || 'Non spécifié',
        procedure: record.typeprocedure || 'Non spécifié',
        cpvCodes: cpvCodes,
        url: record.url || `https://www.boamp.fr/avis/detail/${record.id}`,
        hoursAgo: calculateHoursAgo(record.dateparution || new Date().toISOString())
      }
    }) || []

    console.log('Processed tenders:', tenders.length)

    return new Response(
      JSON.stringify({
        success: true,
        data: tenders,
        count: data.total_count || 0,
        lastUpdate: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error fetching BOAMP data:', error)
    
    // Return fallback data with generic error message
    const fallbackTenders = [
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
        hoursAgo: 12
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
        hoursAgo: 24
      }
    ]

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch tenders',
        data: fallbackTenders,
        fallback: true,
        lastUpdate: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})
