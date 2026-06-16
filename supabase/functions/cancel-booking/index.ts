import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
const ADMIN_EMAIL = 'info@ftfaacademy.nl'

const DAYS_NL = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const MONTHS_NL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
const fmtDateNL = (d: string) => {
  const [y, m, day] = d.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, day))
  return `${DAYS_NL[dt.getUTCDay()]} ${day} ${MONTHS_NL[m - 1]}`
}
const fmtTime = (t: string) => t.slice(0, 5)
const typeLabel = (t: string) =>
  t === '1on1' ? '1-op-1' : t === 'duo' ? '1-op-2' : t === 'small_group' ? 'small group' : t

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const body = await req.json().catch(() => ({}))
    const bookingId = body?.bookingId as string | undefined
    const reason = (body?.reason as string | undefined) ?? null
    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'bookingId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Determine caller role
    const authHeader = req.headers.get('Authorization') ?? ''
    let isAdmin = false
    let callerUserId: string | null = null
    if (authHeader) {
      const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } })
      const { data: u } = await userClient.auth.getUser()
      callerUserId = u?.user?.id ?? null
      if (callerUserId) {
        const { data: roleRow } = await admin.from('user_roles').select('role').eq('user_id', callerUserId).eq('role', 'admin').maybeSingle()
        isAdmin = !!roleRow
      }
    }

    const { data: b } = await admin
      .from('bookings')
      .select('id, status, profile_id, guest_email, guest_parent_name, guest_name, training_slots(id, date, start_time, end_time, training_type, location), profiles:profile_id(full_name)')
      .eq('id', bookingId).maybeSingle()
    if (!b) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    if (b.status === 'cancelled') {
      return new Response(JSON.stringify({ ok: true, already: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Authorization: admin OR owner of the booking
    if (!isAdmin) {
      if (!callerUserId || b.profile_id !== callerUserId) {
        return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    const cancelledBy = isAdmin ? 'admin' : b.profile_id ? 'player' : 'guest'

    // DB trigger enforces 48h rule (admin bypass)
    const { error: updErr } = await admin
      .from('bookings')
      .update({ status: 'cancelled', cancelled_by: cancelledBy, cancelled_at: new Date().toISOString() })
      .eq('id', bookingId)
    if (updErr) {
      const msg = /48 hours/i.test(updErr.message)
        ? 'Online annuleren is gesloten binnen 48 uur voor aanvang.'
        : updErr.message
      return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const s: any = (b as any).training_slots
    const recipientEmail: string | null =
      b.guest_email ?? (b.profile_id
        ? (await admin.auth.admin.getUserById(b.profile_id)).data?.user?.email ?? null
        : null)
    const name = b.guest_parent_name ?? (b as any).profiles?.full_name ?? ''

    const td = s ? {
      recipientName: name,
      date: fmtDateNL(s.date),
      slotTime: fmtTime(s.start_time),
      trainingType: typeLabel(s.training_type),
      byAdmin: isAdmin,
      reason,
    } : { recipientName: name, byAdmin: isAdmin, reason }

    if (recipientEmail) {
      await admin.functions.invoke('send-transactional-email', {
        body: { templateName: 'booking-cancelled', recipientEmail, idempotencyKey: `cancel-${bookingId}`, templateData: td },
      })
    }

    await admin.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'admin-booking-cancelled',
        recipientEmail: ADMIN_EMAIL,
        idempotencyKey: `admin-cancel-${bookingId}`,
        templateData: {
          who: name || recipientEmail || 'Unknown',
          contact: recipientEmail ?? '',
          date: s ? fmtDateNL(s.date) : undefined,
          slotTime: s ? fmtTime(s.start_time) : undefined,
          trainingType: s ? typeLabel(s.training_type) : undefined,
          location: s?.location ?? undefined,
          cancelledBy,
          cancelledAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          reason,
        },
      },
    })

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? 'error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
