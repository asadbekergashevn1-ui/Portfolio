# Asadbek Ergashev — portfolio

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · the **Signal** design system.
Trilingual: English, Russian and Uzbek.
Every page is prerendered to static HTML; the only client JavaScript is the header,
the project filter, the contact form, the theme toggle, card video playback, the scroll
reveal and one small motion layer (page transitions and the card spotlight).

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run typecheck
node scripts/verify.mjs http://localhost:3000   # browser checks, see below
```

## Pages

| Route | What it is |
|---|---|
| `/` | Hero, measured figures, featured work, categories, principles |
| `/projects` | All projects — filter by category and state, search by name or stack. Filters live in the URL |
| `/projects/[slug]` | Case study: summary, facts, media, figures, problem / approach / outcome, features, stack, links |
| `/categories` | The work grouped by what it does |
| `/categories/[slug]` | One category |
| `/about` | Background, principles, toolbox |
| `/contact` | Validated form that composes an email; direct links |

## Languages

English is served from the bare paths (`/projects`), Russian and Uzbek from a prefix
(`/ru/projects`, `/uz/projects`). `src/middleware.ts` rewrites the bare paths onto the
`[locale]` segment and, on a first visit to `/`, redirects once to the language the browser
asks for (a saved choice in the `NEXT_LOCALE` cookie wins). Every page is prerendered in all
three languages and links its translations with `hreflang`.

```
src/i18n/config.ts    the locale list, paths, plural rules
src/i18n/ui.ts        every interface string, per language
src/content/i18n/     project, category and profile text: en.json + ru.json + uz.json
src/content/localize.ts  overlays a translation on the English content
```

**To change wording**, edit the matching key. Interface text lives in `ui.ts` (TypeScript keeps
the three dictionaries in step). Project copy lives in `src/content/i18n/<locale>.json`, which
must keep exactly the shape of `en.json`:

```bash
node src/content/i18n/check-shape.mjs ru    # same keys, same array lengths, nothing empty
```

Anything a translation is missing falls back to English, so a gap never breaks a page.

## Content lives in data, not in pages

```
src/content/
  types.ts        the content model — read this first
  projects.ts     every project
  categories.ts   category names and blurbs
  profile.ts      name, bio, principles, toolbox, contact
```

**To add a project**, append an object to `projects` in `src/content/projects.ts`. TypeScript
will tell you which fields are missing. It appears on the projects page, its category page,
the sitemap, and gets its own static route — no page code changes.

| Field | Notes |
|---|---|
| `order` | Lower sorts first |
| `featured` | Shown on the home page |
| `draft` | Hidden everywhere until removed |
| `reviewNote` | Internal only — never rendered |
| `metrics` | Measured figures. The first one becomes the card image when there is no capture |
| `links[].access` | `public`, `private` or `login-required` — shown next to each link |
| `media` | Filled by the capture pipeline — see below |

## Media

Every clip, poster and screenshot under `public/media/<slug>/` is produced by the capture
pipeline in `capture/` (see `capture/REPORT.md` for what each film shows, how it was
recorded and which projects have no film yet, and why).

- `node capture/run.mjs [slug…]` — records real product demos with Playwright: cursor-led
  shots, camera push-ins, cuts, posters and stills. Production sites are read-only (every
  non-GET request is blocked); a scene may opt in to writes only against `localhost`.
- `node capture/motion/render-motion.mjs` + `publish.mjs coma` — the COMA motion piece.
- `python3 capture/sound/sound.py [slug…]` — music and sound effects for each demo film,
  synthesised from the capture's event log and muxed into `demo.mp4` (card loops stay silent).
  Re-run it after re-recording a film.

`ProjectMedia` handles card playback:

- **Desktop** (fine pointer): muted, loops, plays while the card is hovered or focused
- **Touch**: plays while 60% of it is on screen, pauses when it leaves
- **Reduced motion**: never autoplays, the poster stays
- The video source is attached only when the card nears the viewport

A project with no capture keeps a typographic card and its case study omits the media panel.

## Deploying to Vercel

1. Import the repository in Vercel. The framework preset (Next.js) and the defaults
   (`npm run build`, Node 20+) are correct; no `vercel.json` is needed.
2. Optional: set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) once a custom domain exists.
   Until then canonical URLs, Open Graph and the sitemap use Vercel's production domain.
3. No secrets are required. Security headers (CSP, HSTS, frame and referrer policy) are set
   in `next.config.ts`.

## Verification

`npm run audit` (against `next start -p 3100`) is the release audit: every route at
320 / 390 / 768 / 1440 / 1920 px in both themes (overflow, console and CSP errors), page
metadata, every internal link and media file, external links, card video behaviour (lazy
loading, hover, viewport, reduced motion) and the case-study films.

`scripts/verify.mjs` renders every route at 1440, 820 and 390 px wide and fails on any
console error, horizontal overflow, or axe-core WCAG 2.1 AA violation, then exercises the
filter (including URL persistence), search, empty state, theme persistence, form
validation and focus, the skip link, and the mobile menu (scroll lock, Escape).

## Decisions worth knowing

- **No animation library.** Reveals, word rises, the media reveal and the spotlight are CSS
  driven by a few lines of JS; page transitions use the View Transitions API where it exists
  and fall back to ordinary navigation. A motion library would cost ~40 KB per page.
- **Reveals check position, not intersection.** An IntersectionObserver misses elements the
  page jumps past (anchor links, Back restoring scroll), which would leave them hidden.
  Content is only hidden while JS can reveal it, and never in print.
- **Fonts are self-hosted** from npm (`@fontsource`), so builds do not depend on Google Fonts
  and the browser makes no third-party requests.
- **`ink-faint` meets 4.5:1** in both themes. It started at 2.9:1 and failed the audit.
