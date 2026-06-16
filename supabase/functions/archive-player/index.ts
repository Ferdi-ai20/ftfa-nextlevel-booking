import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
const ADMIN_EMAIL = 'info@ftfaacademy.nl'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } })
    const { data: u } = await userClient.auth.getUser()
    if (!u?.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data: roleRow } = await admin.from('user_roles').select('role').eq('user_id', u.user.id).eq('role', 'admin').maybeSingle()
    if (!roleRow) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { profileId } = await req.json()
    if (!profileId) return new Response(JSON.stringify({ error: 'profileId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    // Mark profile inactive
    await admin.from('profiles').update({ status: 'inactive' }).eq('id', profileId)
    // Mark players of this parent inactive
    await admin.from('players').update({ status: 'inactive' }).eq('parent_profile_id', profileId)

    // Cancel future confirmed bookings
    const todayIso = new Date().toISOString()
    const { data: future } = await admin
      .from('bookings')
      .select('id, training_slots!inner(date, start_time)')
      .eq('profile_id', profileId)
      .eq('status', 'confirmed')
    let cancelled = 0
    for (const b of (future ?? []) as any[]) {
      const ts = b.training_slots
      if (!ts) continue
      if (new Date(`${ts.date}T${ts.start_time}`).toISOString() <= todayIso) continue
      await admin.from('bookings').update({ status: 'cancelled', cancelled_by: 'admin', cancelled_at: new Date().toISOString() }).eq('id', b.id)
      cancelled++
    }

    // Disable auth user (ban)
    try {
      await admin.auth.admin.updateUserById(profileId, { ban_duration: '876000h' })
    } catch (e) {
      console.warn('ban failed', e)
    }

    const { data: target } = await admin.auth.admin.getUserById(profileId)
    const email = target?.user?.email ?? '—'

    await admin.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'admin-booking-cancelled',
        recipientEmail: ADMIN_EMAIL,
        idempotencyKey: `archive-${profileId}-${Date.now()}`,
        templateData: {
          who: `Player archived: ${email}`,
          cancelledBy: 'admin',
          cancelledAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          reason: `Player archived. ${cancelled} future booking(s) cancelled. Auth login disabled.`,
        },
      },
    })

    return new Response(JSON.stringify({ ok: true, cancelled }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? 'error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
