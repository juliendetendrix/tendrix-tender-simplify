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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    const url = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records'
    const params = new URLSearchParams({ limit: '20', order_by: 'dateparution desc' })
    const resp = await fetch(`${url}?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Tendrix-App/1.0' },
    })

    let tenders: any[] = []

    if (resp.ok) {
      const data = await resp.json()
      tenders = (data.results ?? []).map((r: any) => {
        const organisme = nullIfEmpty(
          r.annonceur ?? r.acheteur ?? r.nom_acheteur ?? r.pouvoir_adjudicateur ?? r.identite_nom
        )

        let location: string | null = null
        const ville = nullIfEmpty(r.ville ?? r.ville_execution ?? r.lieu_ville)
        const cp = nullIfEmpty(r.code_postal ?? r.cp_execution ?? r.lieu_code_postal)
        const dept = r.departement ?? r.code_departement ?? r.lieu_departement
        const lieuExec = nullIfEmpty(r.lieuexecution ?? r.lieu_execution ?? r.lieu_exec)
        if (ville && cp) location = `${ville} (${cp})`
        else if (ville) location = ville
        else if (lieuExec) location = lieuExec
        else if (dept) location = `Département ${Array.isArray(dept) ? dept[0] : dept}`

        let budget: string | null = null
        if (r.montant != null) {
          const m = parseFloat(r.montant)
          if (!isNaN(m) && m > 0) budget = `${Math.round(m / 1000)} k€ HT`
        }

        const objet = nullIfEmpty(r.objet) ?? "Appel d'offres"
        const rawSummary = nullIfEmpty(r.objetmarche) ?? nullIfEmpty(r.objet)
        const summary = rawSummary ? (rawSummary.length > 150 ? rawSummary.slice(0, 150) + '…' : rawSummary) : null

        const id = String(r.id ?? r.idweb ?? Math.random().toString(36).slice(2))

        return {
          id,
          title: objet,
          summary,
          organisme,
          location,
          budget,
          date_publication: r.dateparution ?? new Date().toISOString(),
          deadline: r.datelimitereponse || null,
          famille: nullIfEmpty(r.familleannonce),
          procedure: nullIfEmpty(r.typeprocedure),
          cpv_codes: r.cpv ? [String(r.cpv)] : [],
          source: 'boamp',
          source_url: r.url || `https://www.boamp.fr/avis/detail/${id}`,
          raw: r,
        }
      })

      // Upsert into DB
      if (tenders.length) {
        const { error: upsertErr } = await supabase
          .from('tenders')
          .upsert(tenders, { onConflict: 'id' })
        if (upsertErr) console.error('Upsert error:', upsertErr)
      }
    } else {
      console.error('BOAMP API non-ok:', resp.status)
    }

    // Return current DB rows (most recent first) — single source of truth
    const { data: dbTenders } = await supabase
      .from('tenders')
      .select('*')
      .order('date_publication', { ascending: false })
      .limit(40)

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
      JSON.stringify({ success: true, data: formatted, lastUpdate: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('Error:', e)
    return new Response(
      JSON.stringify({ success: false, error: 'fetch_failed', data: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  }
})
