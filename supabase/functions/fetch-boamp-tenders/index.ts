import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function calculateHoursAgo(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
}

function nullIfEmpty(v: any): string | null {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  if (!s) return null
  return s
}

// Department code → readable region/city for nicer location display
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

function buildTitle(r: any): string {
  const raw = nullIfEmpty(r.objet)
  if (!raw) return "Appel d'offres"
  // BOAMP titles are often ALL CAPS — convert to sentence case
  if (raw === raw.toUpperCase()) {
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  }
  return raw
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    const url = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records'
    // Filter on real fields from the v2.1 schema (type_marche_facette is the clean enum)
    const where = `type_marche_facette = "Travaux" AND etat = "INITIAL"`
    const params = new URLSearchParams({
      limit: '100',
      order_by: 'dateparution desc',
      where,
    })
    const resp = await fetch(`${url}?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Tendrix-App/1.0' },
    })

    let tenders: any[] = []
    let apiError: string | null = null

    if (resp.ok) {
      const data = await resp.json()
      const results = data.results ?? []
      console.log(`BOAMP API returned ${results.length} results (total_count=${data.total_count})`)

      tenders = results.map((r: any) => {
        const id = String(r.id ?? r.idweb ?? Math.random().toString(36).slice(2))
        const organisme = nullIfEmpty(r.nomacheteur)
        const location = formatLocation(r.code_departement ?? r.code_departement_prestation)
        const title = buildTitle(r)

        // Family / category — prefer the descriptor labels, then type_marche_facette
        let famille: string | null = null
        if (Array.isArray(r.type_marche_facette) && r.type_marche_facette.length) {
          famille = String(r.type_marche_facette[0])
        } else if (Array.isArray(r.descripteur_libelle) && r.descripteur_libelle.length) {
          famille = String(r.descripteur_libelle[0])
        }

        const procedure = nullIfEmpty(r.procedure_libelle ?? r.type_procedure)

        // Build a short summary from descriptor labels (since API has no summary field)
        let summary: string | null = null
        if (Array.isArray(r.descripteur_libelle) && r.descripteur_libelle.length) {
          summary = `Prestations : ${r.descripteur_libelle.slice(0, 4).join(", ")}.`
        }

        const sourceUrl = `https://www.boamp.fr/avis/detail/${r.idweb ?? id}`

        return {
          id,
          title,
          summary,
          organisme,
          location,
          budget: null, // BOAMP API does not expose montant
          date_publication: r.dateparution
            ? new Date(r.dateparution).toISOString()
            : new Date().toISOString(),
          deadline: r.datelimitereponse || null,
          famille,
          procedure,
          cpv_codes: Array.isArray(r.descripteur_code) ? r.descripteur_code.map(String) : [],
          source: 'boamp',
          source_url: sourceUrl,
          raw: r,
        }
      })

      if (tenders.length) {
        const { error: upsertErr } = await supabase
          .from('tenders')
          .upsert(tenders, { onConflict: 'id' })
        if (upsertErr) console.error('Upsert error:', upsertErr)
        else console.log(`Upserted ${tenders.length} tenders`)
      }
    } else {
      apiError = `BOAMP API ${resp.status}`
      console.error('BOAMP API non-ok:', resp.status, await resp.text().catch(() => ''))
    }

    const { data: dbTenders } = await supabase
      .from('tenders')
      .select('*')
      .order('date_publication', { ascending: false })
      .limit(60)

    const formatted = (dbTenders ?? []).map((t: any) => ({
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
      hoursAgo: calculateHoursAgo(t.date_publication ?? new Date().toISOString()),
    }))

    return new Response(
      JSON.stringify({
        success: true,
        data: formatted,
        fetchedFromApi: tenders.length,
        apiError,
        lastUpdate: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('Error:', e)
    return new Response(
      JSON.stringify({ success: false, error: String(e), data: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  }
})
