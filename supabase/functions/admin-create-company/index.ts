import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { z } from "https://esm.sh/zod@3.23.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  name: z.string().trim().min(1).max(255),
  siren: z.string().trim().max(20).optional().or(z.literal('')),
  sector: z.string().trim().max(100).optional().or(z.literal('')),
  zone: z.string().trim().max(255).optional().or(z.literal('')),
  contact_name: z.string().trim().max(255).optional().or(z.literal('')),
  contact_phone: z.string().trim().max(50).optional().or(z.literal('')),
  charge_affaires_id: z.string().uuid().nullable().optional(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonError('unauthorized', 401)

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: userData } = await supabaseAuth.auth.getUser()
    if (!userData.user) return jsonError('unauthorized', 401)

    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
    const isAdmin = (roles ?? []).some((r: any) => r.role === 'admin')
    if (!isAdmin) return jsonError('forbidden', 403)

    const body = await req.json()
    const parse = BodySchema.safeParse(body)
    if (!parse.success) return jsonError('invalid_body', 400, parse.error.flatten())
    const p = parse.data

    // Invite user (sends magic link)
    const redirect = `${Deno.env.get('SUPABASE_URL')!.replace('.supabase.co', '.lovable.app')}/`
    const { data: invite, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(p.email, {
      redirectTo: redirect,
    })
    let userId: string | null = invite?.user?.id ?? null

    if (inviteErr || !userId) {
      // Maybe user already exists — look it up
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers()
      const found = existing?.users?.find((u: any) => u.email === p.email)
      if (found) userId = found.id
      else return jsonError(inviteErr?.message ?? 'invite_failed', 500)
    }

    // Insert role
    await supabaseAdmin.from('user_roles').insert({ user_id: userId, role: 'entreprise' }).select()

    // Insert company
    const { data: company, error: cErr } = await supabaseAdmin
      .from('companies')
      .insert({
        owner_user_id: userId,
        name: p.name,
        siren: p.siren || null,
        sector: p.sector || null,
        zone: p.zone || null,
        contact_name: p.contact_name || null,
        contact_phone: p.contact_phone || null,
        assigned_charge_affaires: p.charge_affaires_id || null,
      })
      .select()
      .single()

    if (cErr) return jsonError(cErr.message, 500)

    return new Response(JSON.stringify({ success: true, company }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return jsonError('internal_error', 500)
  }
})

function jsonError(msg: string, status: number, details?: any) {
  return new Response(JSON.stringify({ error: msg, details }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}
