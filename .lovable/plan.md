

## Plan: Mobiele verbeteringen, waitlist-form fix, player linking & Calendly koppeling

Vier losse fixes/features in één ronde.

---

### 1. Waitlist form — input verliest focus bij elke toets

**Oorzaak:** `Field` en `Wrapper` zijn binnen `WaitlistForm` gedefinieerd. Bij elke keystroke maakt React nieuwe componenten → React unmount/remount alle inputs → focus weg.

**Fix:** `Field` en `Wrapper` buiten de component verplaatsen (op module-niveau), zodat ze stabiel zijn tussen renders. Geen gedragsverandering, alleen stabiele referenties.

---

### 2. Mobiele bruikbaarheid + zichtbare Sign-in knop

Huidige `Nav.tsx`: "Sign in" en "Join Waitlist" zijn `hidden sm:inline-flex` → onzichtbaar op telefoon. Geen hamburger menu.

**Fix:**
- **Mobiel hamburger menu** (Sheet) met alle nav-links + **Sign in** + **Join Waitlist** prominent.
- "Sign in" knop ook standaard zichtbaar in de header (kleine icon-variant) op mobiel.
- `StickyCTA` bottom-bar uitbreiden: naast "Book Training" ook een "Sign in" link voor niet-ingelogde gebruikers.
- Tap targets vergroten naar min. 44px, container padding op mobiel checken.
- Quick mobile pass op Dashboard en Admin (tabellen → kaarten op klein scherm waar nodig).

---

### 3. "Speler goedkeuren en koppelen" — waar doe je dat?

Op dit moment: een ouder die zich registreert heeft géén `players` rij. De koppeling moet handmatig in `/admin/players` via "Edit" → veld `parent_user_id` invullen. Dat veld bestaat nu **niet** in de edit-form, dus koppelen is feitelijk onmogelijk vanuit de UI.

**Fix — nieuwe Admin tab "Approvals" + linking UI:**

1. **`/admin/approvals`** (nieuwe pagina, link in sidebar):
   - Lijst van alle geregistreerde users (`profiles`) die nog **geen** gekoppelde player hebben.
   - Per rij: naam, email, telefoon, signup datum.
   - Knop **"Link to player…"** → opent dropdown met alle bestaande players zonder `parent_user_id` + zoekveld + knop "Create new player from this account".
   - Knop **"Promote from waitlist"** → laat waitlist entries zien die matchen op email/telefoon, één klik koppelt + maakt player aan.

2. **`/admin/players` edit-form uitbreiden** met een "Linked parent account" sectie:
   - Toont huidige link (email) of "Not linked".
   - Zoek-dropdown om een user te koppelen/ontkoppelen.

3. **Notificatie** (optioneel email): wanneer admin een player koppelt, krijgt de ouder een welcome-mail "Je bent nu actief, log in op /dashboard".

**Database:** geen schema wijzigingen nodig. Wel een nieuwe RLS-policy zodat admin alle `profiles` mag lezen (bestaat al: "Admins view all profiles" ✅).

---

### 4. Calendly koppelen aan trainingen

Twee niveaus mogelijk; ik stel **niveau B** voor (lichte integratie, geen complete vervanging van eigen booking system).

**Niveau B — Calendly als externe boekings-link per trainingstype:**

- **Settings tab**: invoervelden voor Calendly URLs per training type:
  - 1-on-1 training URL
  - Duo training URL
  - Group training URL
  - Trial training URL
  - Optioneel: per booking window een eigen Calendly link.
- **Parent dashboard** "Available bookings" sectie: naast eigen ParentBooking-flow een knop **"Book via Calendly"** die opent in nieuwe tab met de juiste URL per trainingstype van de speler.
- **Calendly webhook** (edge function `calendly-webhook`):
  - Endpoint dat `invitee.created` + `invitee.canceled` events ontvangt.
  - Matcht op email → vindt `players.parent_user_id` → schrijft een rij in `bookings` (of nieuwe `external_bookings` tabel) met datum/tijd, type, calendly_event_uri.
  - Stuurt automatisch een booking-confirmation email (bestaande template).
- **Admin Sunday Planning** toont Calendly-bookings naast eigen slots, met badge "via Calendly".
- Setup vereist: Calendly **Personal Access Token** (Calendly Pro/Teams account nodig voor webhooks) → opslaan als secret `CALENDLY_API_TOKEN`. Ik vraag deze pas wanneer we hier zijn.

**Database:** nieuwe tabel `external_bookings` (id, source='calendly', user_id, player_id, event_uri uniek, scheduled_at, training_type, status, raw payload jsonb).

---

### Build-volgorde

1. Fix waitlist form re-render bug (5 min).
2. Mobiele nav + sticky CTA + sign-in zichtbaarheid.
3. Admin Approvals pagina + player↔user linking UI.
4. Calendly: Settings velden + dashboard knoppen + webhook + tabel.
5. QA pass mobiel (375px) op alle key flows.

