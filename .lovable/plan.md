## Plan: Volledige herbouw boekingssysteem FTFA

Grote refactor. Ik splits dit in 4 fasen die ik achter elkaar uitvoer in dit gesprek. Na elke fase een korte check.

---

### Fase 0 — Destructieve cleanup + nieuw schema

**Drop oude tabellen** (data weg, jij hebt dit bevestigd):
- `bookings`, `booking_windows`, `booking_window_slots`
- `weekly_confirmations`, `weekly_attendance`, `fixed_sunday_slots`, `fixed_players`
- `waitlist`, `waitlist_entries`, `waitlist_entry_tags`, `external_bookings`
- `players` (huidige vorm) — wordt vervangen

**Nieuwe tabellen** (in 1 migratie, met GRANTs + RLS + policies):

`profiles` (bestaand uitbreiden):
- voeg `role` (enum: `guest` default, `active_player`, `admin`) — voor admin gebruiken we `user_roles` (bestaat al), `role` op profile geeft alleen `guest` vs `active_player` status.
- voeg `status` (`pending`, `active`, `inactive`)

`players` (nieuw):
- `parent_profile_id`, `player_name`, `birth_year`, `club`, `team`, `position`, `status`, `notes`

`training_slots`:
- `date`, `start_time`, `end_time`, `training_type` (enum: `one_on_one`, `duo`, `small_group`, `bvo_small_group`, `trial`), `visibility` (enum: `private`, `public`, `hidden`), `status` (enum: `open`, `reserved`, `booked`, `cancelled`, `expired`), `max_players`, `price_per_player`, `location`, `admin_note`, `player_note`, `auto_public_enabled`, `auto_public_hours_before`, `auto_public_min_bookings_threshold`, `created_by`

`bookings`:
- `slot_id`, `player_id` (nullable voor guests), `profile_id` (nullable voor guests), `guest_name`, `guest_email`, `guest_phone`, `guest_birth_year`, `guest_club`, `guest_team`, `guest_position`, `guest_goal`, `guest_notes`, `status` (enum), `payment_status` (enum), `payment_method` (enum)

`applications`:
- `parent_name`, `player_name`, `birth_year`, `email`, `phone`, `club`, `team`, `position`, `goal`, `status` (`pending`/`approved`/`rejected`), bij approve → profile + player + role update.

`feedback`:
- `player_id`, `slot_id`, `feedback_text`, `development_points`, `strengths`, `visible_to_player`

**RLS samenvatting:**
- Guests: SELECT op `training_slots` waar `visibility='public' AND status='open'`; INSERT op `bookings` alleen voor public slots; INSERT op `applications`.
- Active players: SELECT private + public slots; INSERT/SELECT/UPDATE eigen bookings; SELECT eigen players + feedback (waar `visible_to_player=true`).
- Admin (via `has_role`): alles.

**Server-side checks via DB-trigger op `bookings`:**
- Capaciteit niet overschrijden (count vs max_players)
- Slot status = `open`
- Active player check voor private slots
- Dubbele boeking zelfde slot voorkomen
- Overlappende tijden voor zelfde speler voorkomen
- Slot niet verlopen (`date + start_time > now()`)

---

### Fase 1 — Admin: slot beheer + kalender

- Nieuwe pagina `src/pages/admin/Calendar.tsx` met dag/week/maand view (gebruik `react-day-picker` voor maand, custom week/dag grid).
- Kleurcodering per status/visibility.
- Klik op leeg moment → modal "Slot aanmaken" met alle velden uit spec.
- Klik op bestaand slot → detailpaneel: aanpassen, visibility toggle (private/public/hidden), verwijderen, boekingen bekijken, speler handmatig toevoegen/verwijderen.
- Vervang huidige `SundayPlanning` route door deze kalender als admin index.
- Nieuwe pagina `src/pages/admin/Applications.tsx` (vervangt `Approvals`): aanmeldingen lijst, approve → maakt profile active + player record, reject.
- `Players.tsx` herschrijven voor nieuwe `players` tabel: lijst, edit, status toggle, handmatig toevoegen (zonder application).
- `BookingWindows.tsx`, `FixedPlayers.tsx`, `Waitlist.tsx` verwijderen uit routes en bestanden.

---

### Fase 2 — Speler dashboard + public site flow

**Dashboard (`/dashboard`) — volledige herbouw:**
- Sectie "Beschikbare trainingen": private (en optioneel public) slots in lijst, filterbaar op type. Toont "X van Y plekken beschikbaar". Knop "Boek".
- Sectie "Mijn boekingen": aankomend + verleden. Annuleren alleen >24u voor start, anders bericht.

**Public site:**
- Nieuwe sectie op `/` (en/of aparte `/proeftrainingen` route): toont public slots. Lege-state: "Er zijn momenteel geen open proeftrainingen…".
- Bookingformulier in modal met alle guest-velden uit spec. Submit → booking met status `pending_review`.
- Bestaande `ParentBooking.tsx` en oude WaitlistForm/WaitlistPage worden vervangen of opgeruimd.

---

### Fase 3 — Auto-public + notificaties + payments UI

**Auto-public:**
- Cron via pg_cron + edge function `auto-publish-slots` die elk uur draait: voor elk slot met `auto_public_enabled=true`, `visibility='private'`, `now() >= start - auto_public_hours_before`, en huidig aantal bookings < drempel → set `visibility='public'`.

**Notificaties:**
- Edge function `send-booking-email` (algemeen, met `event` type).
- Templates in `supabase/functions/_shared/transactional-email-templates/`:
  - `booking-confirmed-private.tsx` (naar ouder + admin variant)
  - `booking-pending-review.tsx` (naar ouder)
  - `booking-pending-admin.tsx` (naar Ferdi)
  - `booking-accepted-public.tsx`
  - `booking-cancelled-by-admin.tsx`
  - `booking-cancelled-by-player-admin.tsx`
- Bestaande `booking-confirmation.tsx` blijft of wordt aangepast.
- Triggers via edge function aangeroepen vanuit frontend na succesvolle insert/update (zelfde patroon als nu in `ParentBooking`).

**Payments (alleen UI/velden, geen integratie):**
- `payment_status` enum: `not_required`, `unpaid`, `paid`, `refunded`.
- `payment_method` enum: `cash`, `bank_transfer`, `tikkie`, `online`.
- Admin kan handmatig op `paid` zetten in booking-detail.

---

### Wat blijft staan
- `auth`, `useAuth`, admin role via `user_roles`.
- Email-infra (`email_send_log`, `email_send_state`, `process-email-queue`, `send-transactional-email`).
- Site marketing-componenten (Hero, Coach, Programs, Proof, Footer, Nav).
- `send-sunday-reminders` → verwijderen (oude flow weg) of behouden? **Voorstel: verwijderen** want bouwt op `weekly_confirmations` die we droppen.

---

### Technisch overzicht bestanden

**Nieuw:**
- `supabase/migrations/<ts>_full_booking_rebuild.sql`
- `src/pages/admin/Calendar.tsx`
- `src/pages/admin/Applications.tsx`
- `src/pages/admin/BookingDetail.tsx` (modal/drawer)
- `src/components/site/PublicSlots.tsx`
- `src/components/site/GuestBookingForm.tsx`
- `supabase/functions/auto-publish-slots/index.ts`
- `supabase/functions/send-booking-email/index.ts`
- 5-6 nieuwe email-templates

**Aangepast:**
- `src/App.tsx` (routes opschonen)
- `src/pages/Dashboard.tsx` (volledige herbouw)
- `src/pages/admin/AdminShell.tsx` (nav opnieuw)
- `src/pages/admin/Players.tsx` (herbouw)
- `src/pages/Index.tsx` (PublicSlots sectie)

**Verwijderd:**
- `src/pages/admin/SundayPlanning.tsx`, `BookingWindows.tsx`, `FixedPlayers.tsx`, `Waitlist.tsx`, `Approvals.tsx` (vervangen door Applications)
- `src/components/site/ParentBooking.tsx`, `WaitlistForm.tsx`, `src/pages/WaitlistPage.tsx`
- `supabase/functions/send-sunday-reminders/`, `notify-booking-window/`, `calendly-webhook/` (indien niet meer relevant)

---

### Belangrijk — risico's
1. **Destructief**: alle bestaande boekingen, zondag-bevestigingen, wachtlijst, fixed players gaan weg. Niet te recoveren.
2. **Eén lange sessie**: ik ga proberen alles in deze conversatie te doen, maar de migratie + fase 1 stuur ik eerst voor goedkeuring. Daarna bouw ik fase 2 en 3 zonder verdere bevestiging tenzij er keuzes opduiken.
3. **Email-templates**: ik maak ze sober, in dezelfde stijl als de huidige `booking-confirmation.tsx`. Geen brand-overleg vooraf.

Akkoord? Dan start ik met de migratie (Fase 0) als eerste stap.