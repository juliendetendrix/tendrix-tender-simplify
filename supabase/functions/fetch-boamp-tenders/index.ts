import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to calculate hours ago
function calculateHoursAgo(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60))
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching recent BOAMP tenders from OpenDataSoft API...')
    
    // API endpoint for BOAMP data via OpenDataSoft
    const boampApiUrl = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records'
    
    // Build query parameters
    const params = new URLSearchParams({
      'limit': '20', // Limit to 20 recent tenders
      'order_by': 'dateparution desc', // Sort by publication date descending
    })

    console.log('API URL:', `${boampApiUrl}?${params.toString()}`)

    const response = await fetch(`${boampApiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Tendrix-App/1.0'
      },
    })

    if (!response.ok) {
      console.error('BOAMP API error:', response.status, response.statusText)
      throw new Error(`BOAMP API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('BOAMP API response:', data.total_count || 0, 'records found')

    // Transform the data to match our expected format
    const tenders = data.results?.map((record: any) => {
      // OpenDataSoft v2.1 API structure - fields are directly in the record
      console.log('Full record fields:', Object.keys(record).join(', '))
      console.log('Record sample:', JSON.stringify(record).substring(0, 500))
      
      // Extract buyer/organisme with multiple field variations
      const organisme = record.annonceur 
        || record.acheteur 
        || record.nom_acheteur
        || record.pouvoir_adjudicateur
        || record.identite_nom
        || 'Organisme non spécifié'
      
      // Extract location with better formatting
      let location = 'Lieu : Non spécifié'
      
      // Try to build location from available fields
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
      
      // Extract budget
      let budget = 'Montant non spécifié'
      if (record.montant) {
        const montantValue = parseFloat(record.montant)
        if (!isNaN(montantValue)) {
          budget = `${Math.round(montantValue / 1000)} k€ HT`
        }
      }
      
      // Extract CPV codes
      const cpvCodes = record.cpv ? [record.cpv] : []
      
      // Generate summary from description
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
    
    // Return fallback data in case of error
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
        error: error instanceof Error ? error.message : 'Unknown error',
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