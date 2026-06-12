import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Find private slots with auto-public enabled where start is within the configured window
  const { data: slots, error } = await supabase
    .from('training_slots')
    .select('id, date, start_time, max_players, auto_public_hours_before, auto_public_min_bookings_threshold')
    .eq('visibility', 'private')
    .eq('status', 'open')
    .eq('auto_public_enabled', true)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const now = Date.now()
  const promoted: string[] = []
  const activeStates = ['confirmed', 'pending_review', 'pending_payment']

  for (const s of slots ?? []) {
    const startMs = new Date(`${s.date}T${s.start_time}`).getTime()
    const hoursUntil = (startMs - now) / 36e5
    if (hoursUntil > s.auto_public_hours_before || hoursUntil < 0) continue

    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('slot_id', s.id)
      .in('status', activeStates)

    if ((count ?? 0) < s.auto_public_min_bookings_threshold) {
      await supabase.from('training_slots').update({ visibility: 'public' }).eq('id', s.id)
      promoted.push(s.id)
    }
  }

  return new Response(JSON.stringify({ promoted, checked: slots?.length ?? 0 }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
