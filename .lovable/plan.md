## Doel
De FTFA homepage omtoveren in de stijl van Coached by Matteo: pure zwart/wit, full-bleed cinematische video-hero, monogram + `[MENU]` chrome, editorial typografie. Strakke premium uitstraling, rustig en zelfverzekerd.

## Design tokens (pure monochroom)
- Achtergrond: `#0a0a0a` (off-black)
- Surface: `#141414`
- Tekst primair: `#ffffff`, secundair: `rgba(255,255,255,0.6)`, mute: `rgba(255,255,255,0.4)`
- Border: `rgba(255,255,255,0.12)`
- Geen accentkleur — wit is het accent
- Type: display in Inter Black (zwaar, tight tracking) of Big Shoulders Display; UI/labels in JetBrains Mono uppercase met wide tracking
- Spacing: ruim, editorial; veel negative space
- Radius: 0 (vierkant, brutalist-editorial)

## Hero video
- AI-gegenereerd via videogen: cinematische monochrome trainingsshot (~5s, 16:9, 1080p), camera_fixed=true voor stabiel loopen
- Asset: `src/assets/hero-training.mp4`
- HTML5 `<video autoplay muted loop playsinline>` met grayscale + lichte contrast/brightness filter
- Bottom vignette voor leesbaarheid
- Fallback: poster image van eerste frame

## Hero layout (v1 Cinematic monochrome)
- 100vh full-bleed video
- Top-left: `FT` monogram (Inter Black, klein, met "FERDI TARHAN ACADEMY" microtype eronder)
- Top-right: `[MENU]` in mono — opent overlay menu met grote linkjes
- Center: headline "ELITE TRAINING. REAL DEVELOPMENT." in massive display type
- Subkop + 2 knoppen (Apply Now wit/zwart, Book Training outline)
- Bottom-center: dunne lijn + scroll arrow (bounce)
- Bottom rand: mono microtype links (200+ PLAYERS · 12 TO BVO · 10-23 · 1:1) en rechts (EST. NETHERLANDS)

## Menu overlay
- Full-screen zwart overlay bij klik op `[MENU]`
- Grote linkjes: HOME / THE COACH / PROGRAMS / RESULTS / CONTACT
- Sluit met `[CLOSE]`
- Mono label per link (01, 02, …)

## Rest van de site (editorial restyle, zelfde tokens)
- **About / The Coach**: split layout, grote foto links, narratieve tekst rechts, mono kicker
- **Programs**: 3-koloms grid van kaarten — zwart, witte border, hover invert
- **Proof / Results**: full-bleed beeldsectie met testimonial quote in display type
- **CTA**: massive type "READY?" + Apply knop
- **Footer**: minimal, mono, kolommen met links + socials

Behoud bestaande functionaliteit (Calendly, WaitlistForm, PublicSlots, Instagram/TikTok embeds) — alleen styling/structuur restyling, geen logica wijzigen.

## Technische aanpak
1. Genereer hero video via `videogen--generate_video` (monochrome training, 5s, 16:9, camera_fixed)
2. Update `src/index.css` met monochrome tokens + Inter/Big Shoulders/JetBrains Mono via Google Fonts
3. Update `tailwind.config.ts` met de fontFamilies
4. Herschrijf `src/components/site/Hero.tsx` naar full-bleed video layout
5. Herschrijf `src/components/site/Nav.tsx` naar minimal monogram + `[MENU]` overlay
6. Restyle `About.tsx`, `Programs.tsx`, `Proof.tsx`, `CTA.tsx`, `Footer.tsx` met dezelfde tokens
7. Behoud StickyCTA functioneel maar restyle subtieler

## Scope guardrails
- Geen kleur-accenten toevoegen (puur monochroom)
- Geen functionaliteit/backend wijzigen
- Bestaande secties/embeds blijven werken
- Admin/Dashboard schermen blijven ongemoeid (separate styling concern)
- Mobile responsive — alles schaalt netjes naar mobiel
