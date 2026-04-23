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

  console.log(`[sunday-reminders] start sessionDate=${sessionDate} isFinal=${isFinal}`)

  // 1) Active fixed Sunday slots → players → parent_user_id
  const { data: slots, error: slotsErr } = await supabase
    .from('fixed_sunday_slots')
    .select('player_id, slot_time, players!inner(id, player_name, parent_user_id, preferred_time_from, preferred_time_to)')
    .eq('active', true)

  if (slotsErr) {
    console.error('[sunday-reminders] failed to load slots', slotsErr)
    return new Response(JSON.stringify({ error: 'load_failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 2) Also load players WITHOUT a fixed slot but WITH a preferred_time_from set
  const fixedPlayerIds = new Set((slots ?? []).map((s: any) => s.player_id))
  const { data: prefPlayers, error: prefErr } = await supabase
    .from('players')
    .select('id, player_name, parent_user_id, preferred_time_from, preferred_time_to')
    .not('parent_user_id', 'is', null)
    .not('preferred_time_from', 'is', null)

  if (prefErr) {
    console.error('[sunday-reminders] failed to load preferred-time players', prefErr)
  }

  const extraPlayers = (prefPlayers ?? []).filter((p: any) => !fixedPlayerIds.has(p.id))

  // 3) Existing confirmations for this Sunday (combined player set)
  const allPlayerIds = [
    ...(slots ?? []).map((s: any) => s.player_id),
    ...extraPlayers.map((p: any) => p.id),
  ]
  const { data: existing } = allPlayerIds.length
    ? await supabase
        .from('weekly_confirmations')
        .select('player_id')
        .eq('session_date', sessionDate)
        .in('player_id', allPlayerIds)
    : { data: [] as any[] }
  const responded = new Set((existing ?? []).map((c: any) => c.player_id))

  // 4) Build target map: parent_user_id → { playerName, slotTime }
  // If the same parent has multiple unanswered players we keep the first.
  const targetParents = new Map<string, { playerName: string; slotTime: string | null; playerId: string }>()

  for (const s of slots ?? []) {
    const player = (s as any).players
    if (!player?.parent_user_id) continue
    if (responded.has(s.player_id)) continue
    if (targetParents.has(player.parent_user_id)) continue
    targetParents.set(player.parent_user_id, {
      playerName: player.player_name,
      slotTime: (s as any).slot_time,
      playerId: s.player_id,
    })
  }

  for (const p of extraPlayers) {
    if (responded.has(p.id)) continue
    if (targetParents.has(p.parent_user_id)) continue
    const slotTime = p.preferred_time_to
      ? `${p.preferred_time_from}–${p.preferred_time_to} (preferred)`
      : `${p.preferred_time_from} (preferred)`
    targetParents.set(p.parent_user_id, {
      playerName: p.player_name,
      slotTime,
      playerId: p.id,
    })
  }

  console.log(`[sunday-reminders] targets=${targetParents.size} slots=${slots?.length ?? 0} extra=${extraPlayers.length} responded=${responded.size}`)

  let sent = 0
  let skipped = 0
  for (const [userId, info] of targetParents) {
    const { data: userResp } = await supabase.auth.admin.getUserById(userId)
    const email = userResp?.user?.email
    if (!email) {
      console.log(`[sunday-reminders] skip user=${userId} reason=no_email`)
      skipped++
      continue
    }

    const idempotencyKey = `sunday-reminder-${sessionDate}-${userId}-${isFinal ? 'final' : 'first'}`
    const { error: sendErr } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'sunday-reminder',
        recipientEmail: email,
        idempotencyKey,
        templateData: {
          playerName: info.playerName,
          sessionDate: sessionDateLabel,
          slotTime: info.slotTime ?? '',
          isFinal,
        },
      },
    })
    if (sendErr) {
      console.error(`[sunday-reminders] send failed email=${email} player=${info.playerName} error=${sendErr.message ?? sendErr}`)
      skipped++
    } else {
      console.log(`[sunday-reminders] sent email=${email} player=${info.playerName} slot=${info.slotTime ?? 'n/a'}`)
      sent++
    }
  }

  console.log(`[sunday-reminders] done sent=${sent} skipped=${skipped}`)

  return new Response(
    JSON.stringify({ ok: true, sessionDate, sent, skipped, isFinal }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
