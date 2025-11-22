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
      const fields = record.record?.fields || record.fields || {}
      
      // Extract location
      const location = fields.lieuexecution || fields.departement || 'Non spécifié'
      
      // Extract budget
      let budget = 'Montant non spécifié'
      if (fields.montant) {
        const montantValue = parseFloat(fields.montant)
        if (!isNaN(montantValue)) {
          budget = `${Math.round(montantValue / 1000)} k€ HT`
        }
      }
      
      // Extract CPV codes
      const cpvCodes = fields.cpv ? [fields.cpv] : []
      
      // Generate summary from description
      const summary = fields.objetmarche?.slice(0, 150) + '...' || fields.objet?.slice(0, 150) + '...' || 'Description non disponible'
      
      return {
        id: record.record?.id || record.recordid || Math.random().toString(36),
        title: fields.objet || 'Appel d\'offres',
        summary: summary,
        organisme: fields.annonceur || 'Organisme non spécifié',
        location: location,
        budget: budget,
        datePublication: fields.dateparution || new Date().toISOString(),
        deadline: fields.datelimitereponse || '',
        famille: fields.familleannonce || 'Non spécifié',
        procedure: fields.typeprocedure || 'Non spécifié',
        cpvCodes: cpvCodes,
        url: `https://www.boamp.fr/avis/detail/${record.record?.id || record.recordid}`,
        hoursAgo: calculateHoursAgo(fields.dateparution || new Date().toISOString())
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