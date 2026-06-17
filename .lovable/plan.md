## Always-visible guest details in admin Bookings

Single file: `src/pages/admin/Bookings.tsx`.

- Remove the `expanded` state and the **Details / Hide** toggle button.
- Render the details grid **unconditionally** under each booking row.
  - **Guest bookings:** 2-column grid with Parent, Player, Date of birth, Phone, Club, Team, Position, Email. Each field hidden if empty.
  - **Player bookings:** phone + sticky note inline if present.
- Keep semantic tokens (`text-muted-foreground`, `border-border`, etc.). No hardcoded colors.
- Flush dev preview after the edit.
