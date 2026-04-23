// Notify eligible users when a booking window is opened.
// Admin-only. Sends one transactional email per eligible recipient.
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@supabase/supabase-js/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const windowId: string | undefined = body?.windowId;
    if (!windowId) {
      return new Response(JSON.stringify({ error: "windowId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: win, error: winErr } = await admin
      .from("booking_windows").select("*").eq("id", windowId).maybeSingle();
    if (winErr || !win) {
      return new Response(JSON.stringify({ error: "window not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build recipient list based on audience
    const recipients = new Map<string, { name?: string }>(); // email -> meta

    if (win.audience === "everyone") {
      // All players with parent_user_id linked → use profile email
      const { data: players } = await admin
        .from("players").select("player_name, email, parent_user_id").not("parent_user_id", "is", null);
      for (const p of players ?? []) {
        const email = (p as any).email;
        if (email) recipients.set(email.toLowerCase(), { name: (p as any).player_name });
      }
      // Also include all auth users with confirmed email (fallback) — skip; we only target known players to avoid spam
    } else if (win.audience === "waitlist_only") {
      const { data: entries } = await admin
        .from("waitlist_entries").select("player_name, email").not("email", "is", null);
      for (const e of entries ?? []) {
        const email = (e as any).email;
        if (email) recipients.set(email.toLowerCase(), { name: (e as any).player_name });
      }
    } else if (win.audience === "tagged_only") {
      const tags: string[] = win.audience_tags ?? [];
      if (tags.length) {
        const { data: tagged } = await admin
          .from("waitlist_entry_tags").select("entry_id, tag").in("tag", tags);
        const ids = Array.from(new Set((tagged ?? []).map((t: any) => t.entry_id)));
        if (ids.length) {
          const { data: entries } = await admin
            .from("waitlist_entries").select("player_name, email").in("id", ids).not("email", "is", null);
          for (const e of entries ?? []) {
            const email = (e as any).email;
            if (email) recipients.set(email.toLowerCase(), { name: (e as any).player_name });
          }
        }
      }
    }

    const dateStr = new Date(win.date).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long",
    });

    let sent = 0;
    let failed = 0;
    for (const [email, meta] of recipients) {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            templateName: "booking-window-open",
            recipientEmail: email,
            idempotencyKey: `notify-window-${windowId}-${email}`,
            templateData: {
              playerName: meta.name ?? "",
              date: dateStr,
              message: win.message ?? "",
            },
          }),
        });
        if (res.ok) sent++; else failed++;
      } catch {
        failed++;
      }
    }

    return new Response(JSON.stringify({ ok: true, total: recipients.size, sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
