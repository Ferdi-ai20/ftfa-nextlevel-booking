## Admin Bookings — show full guest details

Single-file change in `src/pages/admin/Bookings.tsx`. All needed columns already exist in `bookings` and are readable by admins; no DB/RLS/edge function changes.

### Changes

1. **Extend `Row` type and `.select(...)`** to include:
   `guest_parent_name, guest_dob, guest_birth_year, guest_club, guest_team, guest_position`.

2. **Widen the search blob** so admin can also search by phone, club, team, and player name (not only guest name + email).

3. **Add an expandable "Details" toggle per row** (chevron button on the right, next to the status badge). Collapsed view stays exactly as it is today — date, slot, who, contact, sticky note, status, Cancel.

   Expanded view renders a small 2-column grid (English labels). Each field is hidden if empty.

   **For guest bookings:**
   - Parent name (`guest_parent_name`)
   - Player name (parsed from `guest_name` "X (ouder van Y)", fall back to `guest_parent_name`)
   - Date of birth (`guest_dob`, formatted DD-MM-YYYY; falls back to `guest_birth_year`)
   - Phone (`guest_phone`)
   - Club (`guest_club`)
   - Team (`guest_team`)
   - Position (`guest_position`)

   **For player bookings:** show linked profile's phone + sticky note (or hide the expander entirely if nothing extra to show, since those are already inline).

4. Use existing tokens (`text-muted-foreground`, `border-border`, `bg-card`) — no hardcoded colors.

No other files touched.
