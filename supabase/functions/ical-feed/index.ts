import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const esc = (s: string) => String(s ?? '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
const dt = (date: string, time: string) => {
  // Local Europe/Amsterdam wall time → emit as floating local
  return `${date.replace(/-/g, '')}T${time.replace(/:/g, '').padEnd(6, '0').slice(0, 6)}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  if (!token) return new Response('Missing token', { status: 400 })

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
  const { data: tk } = await admin.from('ical_tokens').select('user_id').eq('token', token).maybeSingle()
  if (!tk) return new Response('Invalid token', { status: 404 })

  // Admin gets every confirmed booking; players get their own.
  const { data: roleRow } = await admin.from('user_roles').select('role').eq('user_id', tk.user_id).eq('role', 'admin').maybeSingle()
  const isAdmin = !!roleRow

  let bookingQuery = admin
    .from('bookings')
    .select('id, slot_id, status, guest_name, profile_id, training_slots!inner(id, date, start_time, end_time, training_type, location, visibility)')
    .eq('status', 'confirmed')
  if (!isAdmin) bookingQuery = bookingQuery.eq('profile_id', tk.user_id)

  const { data: rows } = await bookingQuery
  const lines: string[] = []
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//FTFA Academy//Bookings//NL')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')
  lines.push('X-WR-CALNAME:FTFA Trainingen')
  lines.push('X-WR-TIMEZONE:Europe/Amsterdam')

  for (const r of (rows ?? []) as any[]) {
    const s = r.training_slots
    if (!s) continue
    const uid = `${r.id}@ftfaacademy.nl`
    const start = dt(s.date, s.start_time)
    const end = dt(s.date, s.end_time)
    const summary = isAdmin
      ? `FTFA · ${s.training_type}${r.guest_name ? ` · ${r.guest_name}` : ''}`
      : `FTFA Training`
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`)
    lines.push(`DTSTART;TZID=Europe/Amsterdam:${start}`)
    lines.push(`DTEND;TZID=Europe/Amsterdam:${end}`)
    lines.push(`SUMMARY:${esc(summary)}`)
    if (s.location) lines.push(`LOCATION:${esc(s.location)}`)
    lines.push(`DESCRIPTION:${esc(`${s.training_type} · ${s.visibility}`)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')

  return new Response(lines.join('\r\n'), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
})
