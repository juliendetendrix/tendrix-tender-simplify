import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching recent BOAMP tenders...')
    
    // API endpoint for BOAMP data via OpenDataSoft
    const boampApiUrl = 'https://boamp-datadila.opendatasoft.com/api/records/1.0/search/'
    
    // Build query parameters for recent tenders
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const dateFilter = yesterday.toISOString().split('T')[0]
    
    const params = new URLSearchParams({
      'dataset': 'boamp',
      'rows': '10', // Limit to 10 recent tenders
      'sort': '-dateparutionennouveau', // Sort by publication date descending
      'q': `dateparutionennouveau:[${dateFilter}T00:00:00Z TO NOW]`, // Filter last 24h
      'refine.etat': 'INITIAL', // Only initial announcements
    })
    
    // Add facets separately as they need to be added multiple times
    params.append('facet', 'famille_libelle')
    params.append('facet', 'etat')
    params.append('facet', 'procedure')

    console.log('API URL:', `${boampApiUrl}?${params.toString()}`)

    const response = await fetch(`${boampApiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Tendrix-Dashboard/1.0'
      },
    })

    if (!response.ok) {
      console.error('BOAMP API error:', response.status, response.statusText)
      throw new Error(`BOAMP API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('BOAMP API response:', data.nhits, 'records found')

    // Transform the data to match our expected format
    const tenders = data.records?.map((record: any) => {
      const fields = record.fields
      return {
        id: record.recordid,
        title: fields.objet || 'AO - Objet non spécifié',
        organisme: fields.annonceur || 'Organisme non spécifié',
        montant: fields.montant ? `${(fields.montant / 1000).toFixed(0)} k€` : 'Montant non spécifié',
        datePublication: fields.dateparutionennouveau || fields.dateparution,
        famille: fields.famille_libelle,
        procedure: fields.procedure,
        url: `https://www.boamp.fr/avis/detail/${record.recordid}`
      }
    }) || []

    console.log('Processed tenders:', tenders.length)

    return new Response(
      JSON.stringify({
        success: true,
        data: tenders,
        count: data.nhits || 0,
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
      { title: "AO - Fournitures de bureau", organisme: "Mairie de Paris", montant: "45 k€" },
      { title: "AO - Travaux de voirie", organisme: "Conseil Départemental", montant: "180 k€" },
      { title: "AO - Services de nettoyage", organisme: "Université Lyon 1", montant: "75 k€" }
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