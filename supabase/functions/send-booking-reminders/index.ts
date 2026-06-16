import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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

Deno.serve(async (_req) => {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

  const now = new Date()
  const from = new Date(now.getTime() + 24 * 3600 * 1000).toISOString()
  const to = new Date(now.getTime() + 25 * 3600 * 1000).toISOString()

  // Fetch confirmed bookings whose slot starts in [now+24h, now+25h] and reminder_sent=false.
  // We post-filter on slot start in JS to avoid PostgREST cross-table filter issues.
  const { data: rows, error } = await admin
    .from('bookings')
    .select(`
      id, profile_id, guest_email, guest_parent_name, guest_name, reminder_sent, status,
      training_slots!inner(id, date, start_time, end_time, training_type, location),
      profiles:profile_id ( full_name )
    `)
    .eq('status', 'confirmed')
    .eq('reminder_sent', false)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  let sent = 0
  for (const r of (rows ?? []) as any[]) {
    const s = r.training_slots
    if (!s) continue
    const startIso = new Date(`${s.date}T${s.start_time}`).toISOString()
    if (startIso < from || startIso > to) continue

    const recipient: string | null = r.guest_email ?? null
    let userEmail: string | null = recipient
    if (!userEmail && r.profile_id) {
      const { data: u } = await admin.auth.admin.getUserById(r.profile_id)
      userEmail = u?.user?.email ?? null
    }
    if (!userEmail) continue

    const name = r.guest_parent_name ?? r.profiles?.full_name ?? ''
    try {
      await admin.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'booking-reminder-24h',
          recipientEmail: userEmail,
          idempotencyKey: `reminder-${r.id}`,
          templateData: {
            parentName: name,
            playerName: r.guest_name ?? '',
            date: fmtDateNL(s.date),
            slotTime: fmtTime(s.start_time),
            trainingType: typeLabel(s.training_type),
            location: s.location ?? '',
          },
        },
      })
      await admin.from('bookings').update({ reminder_sent: true }).eq('id', r.id)
      sent++
    } catch (e) {
      console.warn('reminder send failed', r.id, e)
    }
  }
  return new Response(JSON.stringify({ ok: true, sent }), { headers: { 'Content-Type': 'application/json' } })
})
