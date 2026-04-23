import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Returns the next Sunday's ISO date (yyyy-mm-dd)
function nextSundayISO(): string {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sunday
  const diff = (7 - day) % 7 || 7
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff))
  return d.toISOString().slice(0, 10)
}

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let isFinal = false
  try {
    const body = await req.json().catch(() => ({}))
    isFinal = !!body.isFinal
  } catch { /* noop */ }

  const sessionDate = nextSundayISO()
  const sessionDateLabel = fmtDate(sessionDate)

  // Active fixed Sunday slots → players → parent_user_id
  const { data: slots, error: slotsErr } = await supabase
    .from('fixed_sunday_slots')
    .select('player_id, slot_time, players!inner(id, player_name, parent_user_id)')
    .eq('active', true)

  if (slotsErr) {
    console.error('Failed to load slots', slotsErr)
    return new Response(JSON.stringify({ error: 'load_failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Existing confirmations for this Sunday
  const playerIds = (slots ?? []).map((s: any) => s.player_id)
  const { data: existing } = playerIds.length
    ? await supabase
        .from('weekly_confirmations')
        .select('player_id')
        .eq('session_date', sessionDate)
        .in('player_id', playerIds)
    : { data: [] as any[] }
  const responded = new Set((existing ?? []).map((c: any) => c.player_id))

  // Resolve parent emails from auth.users
  const targetParents = new Map<string, { playerName: string; slotTime: string }>()
  for (const s of slots ?? []) {
    const player = (s as any).players
    if (!player?.parent_user_id) continue
    if (responded.has(s.player_id)) continue
    targetParents.set(player.parent_user_id, {
      playerName: player.player_name,
      slotTime: (s as any).slot_time,
    })
  }

  let sent = 0
  let skipped = 0
  for (const [userId, info] of targetParents) {
    const { data: userResp } = await supabase.auth.admin.getUserById(userId)
    const email = userResp?.user?.email
    if (!email) { skipped++; continue }

    const { error: sendErr } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'sunday-reminder',
        recipientEmail: email,
        idempotencyKey: `sunday-reminder-${sessionDate}-${userId}-${isFinal ? 'final' : 'first'}`,
        templateData: {
          playerName: info.playerName,
          sessionDate: sessionDateLabel,
          slotTime: info.slotTime,
          isFinal,
        },
      },
    })
    if (sendErr) {
      console.error('send failed', { email, sendErr })
      skipped++
    } else {
      sent++
    }
  }

  return new Response(
    JSON.stringify({ ok: true, sessionDate, sent, skipped, isFinal }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
