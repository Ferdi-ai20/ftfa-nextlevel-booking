

# Plan: Engelse vertaling + Aanwezigheid & Wachtlijst systeem

## Wat er gebouwd wordt

### 1. Engelse vertaling
De drie program cards (`Programs.tsx`) worden volledig in het Engels:
- "Voetbalvisie" → **Football Vision**
- "Mentaliteit" → **Mentality**
- "BVO Voorbereiding" → **Pro Club Preparation**
De Marquee chips worden ook Engels (Technique, Vision, Mentality, Pro Prep, etc.).

### 2. Vaste spelers — wekelijkse aanwezigheidscheck (zondag)
Nieuwe sectie **"My Sunday Slot"** op de site:
- Speler vult telefoonnummer in → systeem herkent of hij/zij een vaste plek heeft
- Toont: "Hi [Naam], your slot is **Sunday [datum] at [tijd]**"
- Twee knoppen: **"I'll be there"** of **"Can't make it"**
- Bij "Can't make it" → optioneel veld: "I'm available between [van] – [tot]" (zodat je weet of ze geruild kunnen worden)
- Antwoorden komen in jouw admin binnen per week.

### 3. Wachtlijst (vervangt huidige Booking-form gedrag)
De huidige "Reserve Your Spot" wordt **"Join the Waitlist"**:
- Speler vult naam, telefoon, leeftijd, niveau, club + **voorkeurstijden** in (meerdere selecteerbaar: bv. zat 10:00, zat 14:00, zon 11:00)
- Plus open tekstveld: "Other availability"
- Bevestiging: *"You're on the list. We'll call you the moment a spot opens."*
- Spelers blijven op de lijst staan tot jij ze handmatig op "placed" of "removed" zet.

### 4. Bookings open/dicht regelen
In admin een simpele **"Booking status"**-toggle:
- **Open** → wachtlijstformulier zichtbaar
- **Closed** → formulier vervangen door bericht: *"Waitlist temporarily closed. Follow @ftfa.academy for updates."*
- Daarnaast kan jij per week aanvinken welke tijdslots überhaupt bestaan.

### 5. Admin dashboard (/admin)
Privé pagina, beschermd met een wachtwoord dat alleen jij kent. Vier tabbladen:

**a. Fixed Players** — lijst met vaste spelers. Voeg toe / verwijder. Per speler: naam, telefoon, vaste dag + tijd.

**b. This Sunday** — overzicht aankomende zondag:
```text
10:00 — Jan ✅ confirmed
11:00 — Mo  ❌ can't (available 14-17)
12:00 — Sem  ⏳ no response
```
Met één klik kan je een "no response" speler herinneren (opent WhatsApp).

**c. Waitlist** — alle wachtende spelers, gesorteerd op aanmelddatum. Per persoon: naam, telefoon (klikbaar → WhatsApp), voorkeurstijden. Filter: "show only people available on [tijd]" zodat je bij een afmelding direct ziet wie je kan bellen. Markeer als *placed* of *removed*.

**d. Settings** — Booking open/closed toggle + welke tijdslots actief zijn per week.

### 6. Geen login voor spelers
Spelers identificeren zich met telefoonnummer (zoals afgesproken). Admin pagina is beschermd met één wachtwoord.

---

## Technische details

- **Backend:** Lovable Cloud (Supabase) wordt aangezet. Tabellen: `fixed_players`, `weekly_attendance`, `waitlist`, `time_slots`, `app_settings`.
- **RLS:** publieke insert toegestaan op `weekly_attendance` en `waitlist` (rate-limited, gevalideerd met zod). Alleen admin role kan lezen / updaten / verwijderen.
- **Admin auth:** simpele Supabase email/wachtwoord login voor jouw account, met `user_roles` tabel + `has_role()` security definer functie (volgens best practice — rollen NOOIT op profiles).
- **Pages:** `/` (publiek, met nieuwe Sunday Slot + Waitlist secties), `/admin` (login + 4 tabs).
- **WhatsApp links:** klikbare `wa.me/<nummer>` links in admin zodat je direct kan bellen/appen.
- **Cron:** geen cron nodig — de "this Sunday" view berekent live de eerstvolgende zondag.

---

## Resultaat voor jou

- Vaste spelers melden zelf af → jij ziet direct wie er zondag wel/niet is
- Iedereen die wil trainen staat op één lijst met hun voorkeurstijden → bij afmelding 1 klik en je weet wie je belt
- Jij bepaalt of de wachtlijst open of dicht is
- Alle teksten in de programs sectie in het Engels

