# Release audit — portfolio

Date: 19 November 2026. Production build (`next build && next start`), tested in Chromium
(Playwright 1.x, the only browser engine available in this environment).
**Not published.** Vercel deployment is prepared but nothing has been deployed.

## Verdict

Ready to deploy once you give the go-ahead. All automated checks pass:
`npm run verify` (axe-core WCAG 2.1 AA, interaction tests) and `npm run audit` (layout,
metadata, links, media, video behaviour). Open items that need a decision from you are at the
end, under **Needs you**.

## What was checked, and the result

| Area | How | Result |
|---|---|---|
| Visual consistency | Every route at 320 / 390 / 768 / 1440 / 1920 px, dark and light theme, reviewed in screenshots | ✅ after one fix (below) |
| Responsive layout | `scrollWidth` vs viewport on 21 routes × 5 widths × 2 themes | ✅ no horizontal overflow |
| Accessibility | axe-core WCAG 2.1 AA on every route at 3 widths; skip link, focus order, menu (Escape, scroll lock), form errors and focus; reduced motion | ✅ 0 violations |
| Animation quality | Frame captures of the word reveal, card hover, media reveal and the card → case-study page transition; reduced-motion run | ✅ all motion disabled under reduced motion; plain navigation where View Transitions are absent |
| Video autoplay | Desktop: no clip fetched until hover, plays muted + looping on hover, pauses on leave. Touch: plays at ≥60 % on screen, pauses off screen. Reduced motion: never autoplays. Case-study films: controls, no autoplay, `preload=none` | ✅ |
| Loading performance | Web Vitals measured in Chromium (mobile: 4× CPU slowdown, 150 ms latency, 1.6 Mbit/s) | ✅ see table |
| SEO | Title, description, canonical, Open Graph image and a single `h1` on every page; sitemap, robots, JSON-LD (Person site-wide, CreativeWork per case study) | ✅ after fixes (below) |
| Broken links | Every internal link (42) and media file (45) fetched | ✅ all resolve; 404 page returns 404 |
| External links | All 11 fetched through the environment's proxy | 8 × 200; 3 could not be reached **from this sandbox** (see Needs you) |
| Security | CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policy; no third-party requests; secret scan of every tracked file | ✅ no keys, tokens or real phone numbers |
| Private data in media | Every film and still reviewed | ✅ parent reviews blurred (Jony Kids); XN CRM recorded on invented demo data; COMA messages are illustrative and labelled |
| Content accuracy | Figures re-checked against the repositories; unverifiable claims removed; client-reported results attributed | ✅ (list below) |

### Performance (Chromium, production build)

| Page | Mobile FCP / LCP | Desktop LCP | CLS | Transferred |
|---|---|---|---|---|
| `/` | 640 / 640 ms | 176 ms | 0 | ~143 KB |
| `/projects` | 596 / 616 ms | 176 ms | 0 | ~121 KB |
| `/projects/xn-crm` | 608 / 608 ms | 224 ms | 0.001 | ~168 KB |
| `/about` | 532 / 532 ms | 116 ms | 0 | ~109 KB |

First-load JavaScript: 102 KB shared, ~112 KB per page. Fonts are self-hosted; no third-party requests.
Lighthouse itself could not be run here (starting its Chrome was not permitted in this
session) — the figures above are the same Web Vitals measured directly in the browser.

## Fixed during the audit

1. **Home overflowed by 10 px at 320 px** — the new “Case study →” cue would not shrink; the card footer now wraps.
2. **Three case studies had no Open Graph image** (Jony Taxi, Ish Ritmi, Link Board): their page metadata replaced the site default. They now fall back to a generated site card (`/opengraph-image`).
3. **No favicon, no default share image** — added `app/icon.svg` (AE monogram) and a generated 1200×630 Open Graph image.
4. **No structured data** — JSON-LD added: `Person` site-wide, `CreativeWork` per case study.
5. **Home had no canonical URL** — added.
6. **Canonical URLs would point at `localhost` on Vercel** unless an env var was set — the site URL now falls back to Vercel's production domain automatically.
7. **No Content-Security-Policy or HSTS** — added (`next.config.ts`).
8. **/about LCP was 2.6 s on mobile** — its opening paragraph waited for the scroll-reveal script; it now paints with the page (0.53 s).
9. **Desktop fetched card clips before anyone hovered** (~1.9 MB on the home page) — clips are now attached at the first hover or focus (home: ~150 KB).
10. **Share card said “10 products in production”** — two are not (Brain Train is an MVP, Jony Taxi is dormant). Now “shipped”.
11. **COMA benefit claimed a “weekly score”** that the code does not clearly have — reworded to the progress board and per-report delivery it does have.
12. Earlier in this pass: line counts corrected (XN CRM 175k → 160k hand-written; site total 205k → 190k); unverified claims removed (“in daily use”, “structure reused”, child counts, a client name).

## Placeholders and unfinished elements

| Item | State |
|---|---|
| Jony Taxi, Ish Ritmi, Link Board | **No demo film.** Cards show a typographic panel with a measured figure; case studies omit the media panel. Reasons and what each needs are in `capture/REPORT.md`. |
| FLASHY | Live, but its source is not in version control (stated on the page). |
| Brain Train | Presented as an MVP: onboarding is complete, the games are not built (stated on the page). |
| Contact form | Composes an email in the visitor's mail app (`mailto:`); there is no form backend. |
| `NEXT_PUBLIC_SITE_URL` | Not set; Vercel's domain is used until you choose a custom domain. |
| Film soundtracks | Synthesised and checked technically — loudness −15.6…−16.5 LUFS, true peak ≤ −1.6 dBTP, click effects within 3 ms of the on-screen click, spectrogram reviewed — **but not listened to by a person.** Please listen before publishing. |

## Browser compatibility

Only Chromium could be tested here. The CSS baseline is Tailwind CSS 4's: **Safari 16.4+,
Chrome/Edge 111+, Firefox 128+** (it relies on `color-mix()` and `@property`). Features beyond
that degrade without breaking anything:

- View Transitions (page cross-fade, card → case-study picture) — Chrome/Edge 111+, Safari 18+; others navigate normally.
- `text-wrap: balance / pretty` — headline line breaks are simply less even where unsupported.
- `overflow-clip-margin` (word reveal) — without it the rising words clip slightly tighter.
- MP4 (H.264 + AAC) plays in every current browser.

**Recommended before launch:** a quick manual pass in Safari (macOS and iOS) and Firefox.

## Needs you

1. **Permission to publish.** Nothing has been deployed. Steps are in `README.md` → *Deploying to Vercel*; the repository needs a GitHub remote first.
2. **Listen to the films** (sound on) and tell me if anything should change.
3. **Jony Taxi:** demo still blocked. Also a real defect found on the way: `generate_daily_trips` (migrations 0021 / 0023 / 0027) reads `centers.seat_capacity` and `centers.stop_interval_min`, which **no migration creates** — a database built from the migrations alone cannot generate trips. Production presumably has them added by hand; worth a migration.
4. **XN CRM:** in the student picker of *To‘lov qilish*, a mouse click on a search result did not select it in automated testing (the keyboard did). Possibly an artefact of synthetic events — worth one manual check.
5. **External links I could not reach from here:** `jony-taxi-ten.vercel.app` (blocked by this environment's network policy) and two GitHub URLs (the sandbox proxy only allows this session's own repository). The project inventory recorded all three as live and public; a manual click before launch is enough.
6. The local XN CRM demo password appears in an earlier local commit of the capture scene. It only opens a throwaway database on this machine; it now comes from `XN_DEMO_PASSWORD`.
