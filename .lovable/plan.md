## Plan: Admin layout fixes, mobile sidebar & full attendance override

Three focused fixes. No DB changes, no new routes.

---

### 1. Fix overlapping headers across all admin pages

Page headers (`SundayPlanning`, `Players`, `Approvals`, `Waitlist`, `FixedPlayers`, `BookingWindows`, `Settings`) currently put a huge `text-4xl/5xl` title and action buttons on one row with `flex-wrap`. At narrow widths they collide.

**Standardize all admin headers to:**
- Title: `text-2xl md:text-3xl` (down from `text-4xl/5xl`)
- Layout: `flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between`
- Action buttons get their own row on mobile, right-aligned on desktop
- Tighten the Approvals banner spacing in `AdminShell` so it doesn't crash into page content

---

### 2. Replace mobile horizontal-scroll tabs with proper Sidebar + hamburger

Currently mobile shows a horizontal scrollable strip of tab chips — cramped and not what a hamburger menu should be.

**Refactor `AdminShell.tsx` to use the shadcn `Sidebar` system:**
- Wrap in `SidebarProvider` with a sidebar that's `collapsible="offcanvas"` on mobile and persistent on desktop
- Top header always shows a `SidebarTrigger` (hamburger icon) on mobile
- Sidebar content: vertical list of all 7 admin links with large tap targets (`py-3`), the Approvals link displays the pending-count badge, sign out at bottom
- Active route highlighted via `NavLink`
- Sidebar auto-closes after navigation on mobile
- Keep existing Approvals top banner

---

### 3. Full attendance override on Sunday Planning

Parents already submit attending / not_attending / different_time from the dashboard, and the admin page loads these. Today the admin can only "Mark in" / "Mark out". Missing pieces:

**Add to `SundayPlanning.tsx`:**
- Third button **"Different time"** that opens an inline editor with `alt_from`, `alt_to` inputs and an optional note, saving status=`different_time`
- Small **edit icon** next to existing parent responses → opens the same inline editor pre-filled, so admin can adjust the alt time/note after submission
- **"Clear response"** action that deletes the `weekly_confirmations` row (resets to "no response")
- Parent's note (`c.note`) and alt times rendered slightly larger so they're easier to see at a glance

---

### 4. Fix ID/text overlapping action buttons

In `Approvals.tsx` and `Players.tsx` the row layout uses `md:grid-cols-12 items-center` and long values (full UUIDs, long emails) bleed into the action buttons.

**Fix:**
- **Approvals**: shorten displayed User ID to first 8 chars + ellipsis (full ID still in "View details" modal)
- Both pages: switch row layout to `flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:items-center`, so on mobile each row becomes a stacked card with action buttons on their own line separated by `border-t pt-3`
- Add `min-w-0 truncate` on text containers so long emails/phones can't push buttons off-screen
- Action buttons get `whitespace-nowrap` and consistent `min-h-[36px]`

---

### Files touched
- `src/pages/admin/AdminShell.tsx` — Sidebar refactor + header banner spacing
- `src/pages/admin/SundayPlanning.tsx` — header + Different-time override + edit/clear
- `src/pages/admin/Approvals.tsx` — header + ID truncation + mobile row layout
- `src/pages/admin/Players.tsx` — header + mobile row layout
- `src/pages/admin/Waitlist.tsx`, `FixedPlayers.tsx`, `BookingWindows.tsx`, `Settings.tsx` — header consistency only

No migrations, no new dependencies (`Sidebar` and `lucide-react` already in project).
