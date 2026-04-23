

## Plan: Copy refresh, white accent color, club logos, WhatsApp link & approvals guidance

Five focused changes.

---

### 1. Shorter, punchier copy + Dutch → English

Replace verbose lines and translate remaining Dutch words:

- **Hero** (`Hero.tsx`)
  - Subheadline: `"For players who want to reach BVO level. High-level techniektraining and intuïtieve voetbalvisie — built for serious players only."`
  - → `"Built for players chasing pro level. Elite football technique and game intelligence — nothing else."`

- **About** (`About.tsx`)
  - Lead: `"FTFA is the football academy of Ferdi Tarhan — built around one obsession: developing technical execution and intuitive game intelligence at the highest level."`
  - → `"FTFA is Ferdi Tarhan's academy. One obsession: technical execution and game intelligence at the highest level."`
  - Second paragraph: replace `techniektraining` / `intuïtieve voetbalvisie` and shorten:
  - → `"A methodology unique in the Netherlands. Football technique plus intuitive game vision — players who think, decide and execute faster. No fluff."`
  - Stat tiles: `Techniek / Visie / Mentaliteit` → **Technique / Vision / Mentality**.

- **CTA** (`CTA.tsx`)
  - Subheadline → `"If you want entertainment, look elsewhere. If you want the next level — apply."`

- **Coach** (`Coach.tsx`)
  - First paragraph shortened: `"A decade obsessed with football technique and tactics. FTFA exists to give Dutch talent a methodology that produces real top-level players."`
  - **Remove the "UEFA Certified" stat tile.** Replace with `{ k: "200+", v: "Players Trained" }` so the row stays balanced (3 tiles: 10+ Years / 200+ Players / NL Based).

- **Programs** (`Programs.tsx`) — tighten the section intro:
  - → `"One principle across every program: only what produces real progression."`

---

### 2. Color: replace primary green/lime accent with white

Currently `--primary: 70 100% 50%` (lime). Change to white so all `text-primary`, `bg-primary`, `border-primary`, ring, gradients automatically follow.

In `src/index.css`:
- `--primary: 0 0% 98%;`
- `--primary-foreground: 0 0% 4%;` (already correct — black text on white button)
- `--accent: 0 0% 98%;`
- `--ring: 0 0% 98%;`
- `--gradient-radial`: change lime tint to white tint (very low opacity, e.g. `hsl(0 0% 100% / 0.06)`).
- `--shadow-glow`: change to white glow `0 0 60px hsl(0 0% 100% / 0.15)`.

Effect: all green accents (numbers, dots, arrows, buttons, hover borders) become white. No component edits needed beyond the token swap.

---

### 3. Club logos in "Players placed at" strip

Currently `Proof.tsx` renders club names as text. Replace with real logos.

- Add SVG logos for: Ajax, PSV, Feyenoord, AZ, FC Utrecht, Vitesse, FC Twente, Heerenveen — sourced as inline SVG components in a new file `src/components/site/ClubLogos.tsx` (or as `/public/clubs/{name}.svg` files). Use Wikimedia public-domain wordmarks where available; fall back to clean monochrome wordmark SVGs we generate ourselves.
- Update `Proof.tsx` clubs strip: render each as a grayscale logo (`opacity-60 hover:opacity-100`), height ~36px, uniform spacing. Remove text fallback.
- Note on rights: club logos are trademarked; we'll display them small, monochrome, in a neutral "alumni placement" context. Recommend the user replace with their own approved logo set if they have one.

---

### 4. WhatsApp "Message Us" → +31 6 21275348

In `Footer.tsx`, change:
- `href="https://wa.me/31600000000"` → `href="https://wa.me/31621275348"`
- Add a small line under "Message Us": `+31 6 21275348` so the number is visible.
- Same update in `StickyCTA` if it links WhatsApp.

---

### 5. "Where do I approve new signups?" — make it discoverable

The flow already exists at **Admin → Approvals** (`/admin/approvals`), but the welcome email tells parents the coach must approve, without telling the coach where. Two small additions:

- **Admin sidebar badge**: in `AdminShell.tsx`, fetch the count of unlinked profiles and show a small numeric badge next to the "Approvals" link (e.g. `Approvals (3)`) so you immediately see pending signups when you log in.
- **Admin header banner**: on `/admin` (any page), if pending approvals > 0, show a top banner: `"3 new parent signups waiting for approval → Review"` linking to `/admin/approvals`.
- **In-app explanation** on the Approvals page header: add one line — `"New parent signups land here. Link them to a player to grant /dashboard access."` (already partially there — keep wording consistent.)

No database changes. No new routes — just surfacing the existing page.

---

### Files touched

- `src/index.css` (color tokens)
- `src/components/site/Hero.tsx`, `About.tsx`, `CTA.tsx`, `Coach.tsx`, `Programs.tsx` (copy)
- `src/components/site/Proof.tsx` + new `ClubLogos.tsx` or `/public/clubs/*.svg`
- `src/components/site/Footer.tsx` + `StickyCTA.tsx` (WhatsApp number)
- `src/pages/admin/AdminShell.tsx` (sidebar badge + header banner)

No DB migrations, no edge functions.

