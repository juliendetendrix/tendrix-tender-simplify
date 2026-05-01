import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { z } from "https://esm.sh/zod@3.23.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  display_name: z.string().trim().min(1).max(255),
  phone: z.string().trim().max(50).nullable().optional(),
  specialties: z.array(z.string().max(100)).max(20).optional(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return j('unauthorized', 401)

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: userData } = await supabaseAuth.auth.getUser()
    if (!userData.user) return j('unauthorized', 401)

    const { data: roles } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', userData.user.id)
    if (!(roles ?? []).some((r: any) => r.role === 'admin')) return j('forbidden', 403)

    const parse = BodySchema.safeParse(await req.json())
    if (!parse.success) return j('invalid_body', 400, parse.error.flatten())
    const p = parse.data

    const redirect = `${Deno.env.get('SUPABASE_URL')!.replace('.supabase.co', '.lovable.app')}/`
    const { data: invite, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(p.email, {
      redirectTo: redirect,
    })
    let userId: string | null = invite?.user?.id ?? null
    if (inviteErr || !userId) {
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers()
      const found = existing?.users?.find((u: any) => u.email === p.email)
      if (found) userId = found.id
      else return j(inviteErr?.message ?? 'invite_failed', 500)
    }

    await supabaseAdmin.from('user_roles').insert({ user_id: userId, role: 'charge_affaires' }).select()
    const { error: pErr } = await supabaseAdmin.from('charge_affaires_profiles').insert({
      user_id: userId,
      display_name: p.display_name,
      email: p.email,
      phone: p.phone ?? null,
      specialties: p.specialties ?? [],
    })
    if (pErr && !pErr.message.includes('duplicate')) return j(pErr.message, 500)

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return j('internal_error', 500)
  }
})

function j(msg: string, status: number, details?: any) {
  return new Response(JSON.stringify({ error: msg, details }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}
