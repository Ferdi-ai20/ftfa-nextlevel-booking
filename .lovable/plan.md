

## Plan: Knoppen werkend maken + admin ziet de keuze + mobiel hamburgermenu weg

Drie gerichte fixes.

---

### 1. Attendance-knoppen werken niet → fixen

De knoppen op `/dashboard` reageren niet of de keuze wordt niet opgeslagen. Oorzaak ligt waarschijnlijk in `respond()` in `src/pages/Dashboard.tsx`: de upsert op `weekly_confirmations` mist een unieke constraint op (`player_id`, `session_date`), waardoor `upsert` faalt of een nieuwe rij maakt zonder dat de UI hem toont.

Wijzigingen:

- **DB-migratie**: unieke index toevoegen op `weekly_confirmations(player_id, session_date)` zodat `upsert({ onConflict: "player_id,session_date" })` betrouwbaar werkt.
- **`Dashboard.tsx` → `respond()`**: expliciet eerst `select` doen op bestaande rij voor (player_id, session_date); als die bestaat → `update` op `id`, anders `insert`. Geen `upsert` meer. Direct lokale state bijwerken na succes (geen `loadAll()` reload).
- Toast bij elke klik: succes ("Response saved") of fout met de echte foutmelding (nu wordt fout stil weggeslikt).
- Knoppen krijgen `disabled` state tijdens de request zodat dubbelklik geen race veroorzaakt.
- "Different time" knop opent nu het inline-formulier én slaat status `different_time` direct op zodra op "Save" wordt geklikt (alt_from / alt_to / note worden meegestuurd in dezelfde rij).

### 2. Admin ziet de keuze van de speler niet

In `src/pages/admin/SundayPlanning.tsx` worden alleen `weekly_confirmations` van spelers met een `fixed_sunday_slot` getoond. Bovendien wordt de pagina niet realtime ververst — de admin moet handmatig herladen.

Wijzigingen:

- **Realtime subscription** op `weekly_confirmations` in `SundayPlanning.tsx`: bij elke INSERT/UPDATE voor de huidige `session_date` direct de lokale `confirms` state bijwerken.
- Migratie: `ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_confirmations;` en `ALTER TABLE public.weekly_confirmations REPLICA IDENTITY FULL;`.
- Per slot tonen: huidige status badge + (bij `different_time`) het tijdvoorstel `alt_from–alt_to` en `note` direct zichtbaar onder de naam, niet pas na klik.
- "Last updated" timestamp tonen zodat de admin ziet wanneer een ouder reageerde.

### 3. Hamburgermenu (drie streepjes) op mobiel weghalen

In `src/pages/admin/AdminShell.tsx` staat nu een hamburger + Sheet drawer. Vervangen door een altijd-zichtbare horizontale tab-bar bovenaan op mobiel.

Wijzigingen in `AdminShell.tsx`:

- Sheet/hamburger volledig verwijderen.
- Mobiele header wordt: FTFA-titel + horizontaal scrollbare tab-rij met alle 7 admin-links direct zichtbaar (geen klik nodig om te openen).
- Approvals-link houdt de count badge (rood bolletje met aantal).
- Sign out wordt een kleine knop rechts in de mobiele header.
- Desktop sidebar blijft ongewijzigd.

Layout mobiel:

```text
┌─────────────────────────────────────┐
│ FTFA Admin              [Sign out]  │
├─────────────────────────────────────┤
│ Sunday│Players│Approvals③│Fixed│... │ ← horizontaal scrollbaar
└─────────────────────────────────────┘
```

---

### Technische details

**Files:**
- `src/pages/Dashboard.tsx` — `respond()` herschrijven (select-then-update/insert), toasts, disabled state, optimistic update.
- `src/pages/admin/SundayPlanning.tsx` — realtime subscription, alt-tijd/note inline tonen.
- `src/pages/admin/AdminShell.tsx` — hamburger weg, horizontale tab-bar terug op mobiel.

**DB-migraties:**
- `CREATE UNIQUE INDEX weekly_confirmations_player_session_uniq ON public.weekly_confirmations (player_id, session_date);`
- `ALTER TABLE public.weekly_confirmations REPLICA IDENTITY FULL;`
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_confirmations;`

Geen edge-function changes, geen email-changes (komen later).

