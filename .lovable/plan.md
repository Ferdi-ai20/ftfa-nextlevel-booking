

## Plan: Woensdag-deadline terug + email-reminder (geen WhatsApp)

Twee delen, allebei klein.

---

### 1. Woensdag 20:00 deadline terug aanzetten

In `src/pages/Dashboard.tsx` is de `locked`/deadline-check uitgezet (knoppen werken nu na deadline). Terugdraaien:

- `respond()` blokkeert opnieuw zodra `isPastDeadline(sunday)` true is, met toast: *"Deadline passed (Wednesday 20:00). Contact your coach to change your response."*
- Knoppen *Attending / Not attending / Different time* worden weer `disabled` na woensdag 20:00.
- Banner bovenaan toont weer rood: *"Deadline passed — contact your coach"* in plaats van *"late responses still accepted"*.
- Het *"My preferred training time"*-blok blijft wél altijd bewerkbaar (heeft niets met de weekdeadline te maken).

De deadline-logica in `src/lib/dates.ts` (`deadlineFor` = woensdag 20:00 vóór de zondag) blijft zoals hij is.

### 2. Email-reminder bevestigen + handmatige trigger

De email-reminder via `send-sunday-reminders` bestaat al en draait via cron (ma 17:00 + wo 14:00). De `sunday-reminder` template is gekoppeld. Wat er ontbreekt:

- **Spelers zonder fixed slot worden overgeslagen.** De edge function leest alleen uit `fixed_sunday_slots`. Uitbreiden: ook spelers zonder fixed slot meenemen als ze een `preferred_time_from` hebben gezet (en nog niet hebben gereageerd voor de komende zondag). Voor die spelers wordt `slotTime` weggelaten of vervangen door hun voorkeurstijd.
- **Handmatige knop "Send reminders now"** in `src/pages/admin/SundayPlanning.tsx`: roept `send-sunday-reminders` direct aan met checkbox *"Final reminder"* (zet `isFinal: true`). Toont resultaat als toast: `sent: X, skipped: Y`.
- **Reminder-status per speler** in `SundayPlanning.tsx`: kleine grijze tag *"Reminder sent ma 17:00"* / *"wo 14:00"* op basis van `email_send_log` waar `template_name='sunday-reminder'` en de `idempotencyKey` de `session_date` + `userId` bevat. Zo zie je per ouder of de mail eruit is.
- **Betere logging** in `send-sunday-reminders/index.ts`: per parent een console-regel met `email + status (sent/skipped + reason)` zodat we in de Edge Function logs kunnen zien wie wel/niet bereikt is.

Geen Twilio, geen WhatsApp, geen extra connector nodig — puur Lovable Emails (al ingericht).

### 3. Wat blijft hetzelfde

- Realtime subscription op `weekly_confirmations` in admin (al gedaan vorige loop).
- Mobiele tab-bar in admin (al gedaan).
- Voorkeurtijd-blok op het dashboard (al gedaan).
- `sunday-reminder` email template (geen wijzigingen nodig).

---

### Technische details

**Files:**
- `src/pages/Dashboard.tsx` — deadline-check terug in `respond()`, banner-tekst, knoppen `disabled` na deadline.
- `src/pages/admin/SundayPlanning.tsx` — knop *"Send reminders now"* + checkbox *"Final reminder"*, reminder-status tag per speler op basis van `email_send_log`.
- `supabase/functions/send-sunday-reminders/index.ts` — ook spelers zonder fixed slot meenemen indien `preferred_time_from` gezet, betere per-recipient logging.

**Edge function deploy:** `send-sunday-reminders` wordt opnieuw uitgerold na de wijziging.

**Geen DB-migraties, geen nieuwe templates, geen secrets nodig.**

