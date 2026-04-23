// Calendly webhook receiver.
// Subscribe in Calendly Admin → Integrations → Webhooks to events:
//   - invitee.created
//   - invitee.canceled
// POST endpoint: https://<project>.supabase.co/functions/v1/calendly-webhook
//
// Behavior:
//   - Looks up the parent profile by invitee email (auth.users via service role)
//   - Finds first linked player (player.parent_user_id) and uses its training_type
//   - Upserts a row in public.external_bookings keyed by event_uri
//   - On invitee.canceled, marks the row status='canceled'

import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, calendly-webhook-signature",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(supabaseUrl, serviceKey);

type CalendlyPayload = {
  event: string; // "invitee.created" | "invitee.canceled"
  payload: {
    uri?: string;
    email?: string;
    name?: string;
    status?: string;
    cancel_reason?: string;
    scheduled_event?: {
      uri?: string;
      name?: string;
      start_time?: string;
      end_time?: string;
    };
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as CalendlyPayload;
    const event = body.event;
    const p = body.payload || {};
    const eventUri = p.scheduled_event?.uri || p.uri;
    const inviteeEmail = (p.email || "").toLowerCase().trim();

    if (!eventUri) {
      return json({ error: "missing event uri" }, 400);
    }

    if (event === "invitee.canceled") {
      await admin
        .from("external_bookings")
        .update({ status: "canceled", raw: body })
        .eq("event_uri", eventUri);
      return json({ ok: true, action: "canceled" });
    }

    // Find parent user by email (auth.users via admin API)
    let parent_user_id: string | null = null;
    let player_id: string | null = null;
    let training_type: string | null = null;

    if (inviteeEmail) {
      const { data: usersList } = await admin.auth.admin.listUsers();
      const user = usersList?.users.find(
        (u) => (u.email || "").toLowerCase() === inviteeEmail
      );
      if (user) {
        parent_user_id = user.id;
        const { data: pl } = await admin
          .from("players")
          .select("id, training_type")
          .eq("parent_user_id", user.id)
          .limit(1)
          .maybeSingle();
        if (pl) {
          player_id = pl.id;
          training_type = pl.training_type;
        }
      }
    }

    const { error } = await admin.from("external_bookings").upsert(
      {
        source: "calendly",
        event_uri: eventUri,
        invitee_email: inviteeEmail || null,
        invitee_name: p.name || null,
        scheduled_at: p.scheduled_event?.start_time || new Date().toISOString(),
        ends_at: p.scheduled_event?.end_time || null,
        training_type,
        player_id,
        parent_user_id,
        status: "active",
        raw: body,
      },
      { onConflict: "event_uri" }
    );

    if (error) {
      console.error("upsert error", error);
      return json({ error: error.message }, 500);
    }

    return json({ ok: true, matched: !!parent_user_id });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
