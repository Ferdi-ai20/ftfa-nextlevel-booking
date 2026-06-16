import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ADMIN_EMAIL = 'info@ftfaacademy.nl'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data: roleRow } = await admin.from('user_roles').select('role').eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle()
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = await req.json()
    const applicationId = body?.applicationId as string | undefined
    if (!applicationId) {
      return new Response(JSON.stringify({ error: 'applicationId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: app, error: appErr } = await admin.from('applications').select('*').eq('id', applicationId).maybeSingle()
    if (appErr || !app) {
      return new Response(JSON.stringify({ error: 'application not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (app.status === 'approved') {
      return new Response(JSON.stringify({ ok: true, already: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const email = String(app.email).toLowerCase().trim()
    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://www.ftfaacademy.nl'

    // Find or create user
    let userId: string | null = null
    const { data: existing } = await admin.auth.admin.listUsers()
    const found = existing?.users.find((u) => (u.email ?? '').toLowerCase() === email)
    if (found) {
      userId = found.id
    } else {
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/reset-password`,
        data: { full_name: app.parent_name, phone: app.phone ?? '' },
      })
      if (inviteErr) {
        return new Response(JSON.stringify({ error: 'invite failed', detail: inviteErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      userId = invited.user?.id ?? null
    }

    if (userId) {
      await admin.from('profiles').upsert({
        id: userId,
        full_name: app.parent_name,
        phone: app.phone ?? '',
        status: 'active',
      })
      // Create player record if not exists
      const { data: existingPlayer } = await admin.from('players')
        .select('id').eq('parent_profile_id', userId).eq('player_name', app.player_name).maybeSingle()
      if (!existingPlayer) {
        await admin.from('players').insert({
          parent_profile_id: userId,
          player_name: app.player_name,
          birth_year: app.birth_year,
          club: app.club,
          team: app.team,
          position: app.position,
        })
      }
    }

    await admin.from('applications').update({ status: 'approved' }).eq('id', applicationId)

    // Send confirmation emails via queue
    const enqueue = async (templateName: string, recipient: string, templateData: Record<string, any>, idempotencyKey: string) => {
      try {
        await admin.functions.invoke('send-transactional-email', {
          body: { templateName, recipientEmail: recipient, idempotencyKey, templateData },
        })
      } catch (e) {
        console.warn('email send failed', templateName, e)
      }
    }

    await enqueue('application-decision', email, {
      parentName: app.parent_name,
      playerName: app.player_name,
      approved: true,
    }, `app-approve-${applicationId}`)

    await enqueue('admin-application-approved', ADMIN_EMAIL, {
      parentName: app.parent_name,
      playerName: app.player_name,
      email,
    }, `admin-app-approved-${applicationId}`)

    return new Response(JSON.stringify({ ok: true, userId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? 'error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
