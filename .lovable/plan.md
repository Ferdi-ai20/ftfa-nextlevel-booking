

# Plan: FTFA Academy — Full CRM, Waitlist & Controlled Booking System

This expands the current site into a complete control-panel for your academy. The marketing site stays public; everything operational moves behind logins.

---

## 1. User accounts & roles

Two roles, both via email + password (with Google sign-in as an option for parents):

- **Admin** — you. Full access to `/admin`.
- **Parent/Player** — can create an account, log in at `/dashboard`, and see only their own data.

A `profiles` table stores name + role link. Roles live in the existing `user_roles` table (admin role only — parents are inferred by absence of admin role).

---

## 2. Parent/Player dashboard (`/dashboard`)

What a logged-in parent sees:

- **Their fixed Sunday slot** (e.g. "Sunday 27 April · 14:00–15:00") — only if you assigned them one.
- **This week's response card** with three buttons:
  1. **Attending**
  2. **Not attending**
  3. **Available at a different time** → opens fields for alternative time ranges + optional note.
- **Deadline banner**: "Respond before Wednesday 20:00." After the deadline, the form locks and shows *"Locked — contact coach to change"*. You can override from admin.
- **History**: previous weeks' responses (last 8 weeks).
- **Their player profile** (read-only): club, team, level, position, contact info — with a "request changes" button that flags it for you.

---

## 3. Sunday confirmation system (admin side)

Admin tab **"Sunday Planning"** (replaces current *This Sunday*):

- Picks the upcoming Sunday automatically; arrow buttons to look at future weeks.
- Table: time slot · player · status badge · alternative availability · note.
- Color coding: green = attending, red = absent (slot freed), amber = different time, grey = no response.
- **Highlight freed slots** at the top: "2 slots open this Sunday: 14:00, 15:00".
- One-click WhatsApp reminders for non-responders.
- Admin can override any response (e.g. mark a no-response as confirmed manually).

---

## 4. Waitlist system — expanded form

Public page `/waitlist` (also embedded on home page) — the form gets all the fields you listed:

- Player name, parent name, phone, email
- Birthdate (we compute age automatically)
- Club, team, position
- Level dropdown: **BVO, Divisie, Hoofdklasse, Eerste klasse, Recreatief**
- Preferred training type: **1-on-1 / Duo / Group**
- Available days (multi-select Mon–Sun)
- Available times (free text + preset chips like "weekday evenings 18:00–20:00")
- Extra notes

Submission stores everything; entry status starts as `new`.

---

## 5. Waitlist Manager (admin)

Tab **"Waitlist"** rebuilt as a full CRM table:

- **Columns**: name, age, level, club, position, training type, days/times, joined date, tags, last contact.
- **Filters**: age range, level, club, training type, available day, tag, status.
- **Sort**: by priority tag, by date, by age.
- **Tags / labels** (color chips, multi-select per entry):
  - High priority
  - Call back
  - Trial training
  - Not suitable
  - Offered fixed spot
- **Quick actions per row**: Call (`tel:`), WhatsApp, Add note, Tag, Promote to fixed player.
- **Click a row** → opens full **Player Profile drawer** with all info, full notes timeline, and history of contact.

---

## 6. Controlled Booking Windows

New tab **"Booking Windows"** — booking is opt-in, you create each window:

Per window:
- Date
- One or more time slots (e.g. 10:00, 11:00, 12:00)
- Spots per slot (e.g. 2)
- **Audience type**:
  - Open to everyone (anyone with an account)
  - Only waitlist users (must be in waitlist table)
  - Only selected priority groups (pick tags, e.g. "High priority")
- Open / closed toggle
- Optional message visible to invited users

Public-facing: parents see eligible windows on their dashboard under "Available bookings". They book one slot; system enforces capacity and audience rules. You can manually add/remove people from any window.

Optional notification: when you open a window, a "notify eligible users" button sends them an email.

---

## 7. Admin dashboard layout (`/admin`)

Single control center with sidebar nav:

```text
FTFA ADMIN
├─ Sunday Planning      ← weekly overview, free slots
├─ Fixed Players        ← roster CRUD + assign Sunday slot
├─ Waitlist             ← CRM table with tags, filters, profiles
├─ Booking Windows      ← create/manage windows + bookings
├─ Players              ← all profiles (fixed + booked + waitlist promoted)
└─ Settings             ← booking site toggles, slot times, deadline time
```

Header shows: today's Sunday at-a-glance (X confirmed, Y absent, Z no response).

---

## 8. Automated email reminders

Two scheduled jobs (run via `pg_cron` + edge function):

- **Monday 19:00** — emails every fixed player who hasn't responded yet for the upcoming Sunday.
- **Wednesday 16:00** — final reminder to non-responders. After 20:00, dashboard locks.

Optional: when you open a Booking Window, a one-off email to eligible users.

All emails use Lovable's built-in email system on your verified domain (no extra config — we'll set up the email domain as part of this).

---

## 9. Database structure

New / updated tables (all with proper RLS — admin-only writes, users see only their own rows):

```text
profiles              ─ id (= auth user), full_name, phone, role
players               ─ player profile, parent_user_id → profiles
parents               ─ optional secondary contacts
fixed_sunday_slots    ─ player_id, day, time, active        (replaces fixed_players)
weekly_confirmations  ─ player_id, session_date, status,
                         alt_from, alt_to, note, locked
waitlist_entries      ─ all expanded fields above, status
waitlist_tags         ─ entry_id, tag                        (many-to-many)
notes                 ─ subject_id, subject_type, body, author
booking_windows       ─ date, audience type, message, open
booking_window_slots  ─ window_id, time, capacity
bookings              ─ slot_id, user_id, created_at
```

All linked via foreign keys; existing `fixed_players`, `waitlist`, `weekly_attendance`, `app_settings`, `user_roles` are migrated/extended (no data loss for what's already there).

---

## 10. Design

- Keep the existing **black / white / grey premium aesthetic** — Anton display font, Inter body.
- Mobile-first dashboards: stacked cards on phone, table on desktop.
- Sticky action bars, color-coded status badges, fast filters.
- Clean sidebar admin shell; minimal chrome on the parent dashboard so it feels personal.

---

## What this delivers for you

- You stay in control: nobody books unless you open a window or assign them a slot.
- One screen tells you exactly who's training Sunday.
- Waitlist becomes a real CRM — filter, tag, find the best player in seconds.
- Parents handle their own weekly confirmation; you just react to absences.
- Reminders go out automatically; no chasing.

---

## Build order (one approval, executed in steps)

1. Database migrations + RLS for all new tables.
2. Auth: parent signup/login + admin login (extend existing).
3. Parent dashboard (`/dashboard`) with weekly confirmation.
4. Expanded public waitlist form.
5. Admin: Sunday Planning, Waitlist CRM, Player Profiles.
6. Admin: Booking Windows + parent-facing booking flow.
7. Email setup (verified domain) + scheduled reminders.
8. Polish, mobile pass, and final QA.

