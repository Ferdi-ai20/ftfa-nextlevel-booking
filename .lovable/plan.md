## Findings

**1. File is correct and saved.** `src/pages/admin/Bookings.tsx` already renders the always-visible details grid unconditionally at lines 192–201 (no toggle, no `expanded` state). The `hasDetails` check is the only gate, and for the VVZA booking it evaluates to `true`.

**2. DB row is complete.** Direct query on `bookings` for `ferditarhan19@gmail.com` returns two rows; the VVZA / Jo10-1 / Middenvelder booking has every field populated:

| field | value |
|---|---|
| guest_parent_name | Jan |
| guest_name | Jan (ouder van Boerman) |
| guest_dob | 2006-07-29 |
| guest_birth_year | 2006 |
| guest_club | VVZA |
| guest_team | Jo10-1 |
| guest_position | Middenvelder |
| guest_phone | 0621275348 |
| guest_email | ferditarhan19@gmail.com |

So `PublicSlots.tsx` is writing all fields correctly — no upstream fix needed.

**3. Root cause: stale preview bundle.** Code + data are right, but the browser is still being served the previous transformed `Bookings.tsx` module. A browser hard refresh doesn't help because the Vite dev server's HMR gate is still holding the buffered edit from the previous turn — it only releases at the end of a turn that ran in build mode, and the preceding `__hmr_flush` apparently didn't take effect for this module.

## Plan

1. Re-flush the dev server HMR gate (`POST /__hmr_flush`) to force re-transform of `src/pages/admin/Bookings.tsx`.
2. Open the preview at `/admin/bookings` in the actual viewport and confirm the details grid (Parent, Player, DOB, Phone, Club, Team, Position, Email) is rendered under the "Jan (ouder van Boerman)" row.
3. If after the flush the grid still doesn't appear, take a screenshot, inspect the served module via `curl http://localhost:8080/src/pages/admin/Bookings.tsx` to confirm what the browser is actually receiving, and only then investigate further (e.g. a wrapping component or CSS rule hiding the grid). No source edits planned unless step 2 fails.

No DB changes, no `PublicSlots.tsx` changes, no other file edits.
