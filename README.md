# Asadbek Ergashev — portfolio

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · the **Signal** design system.
Every page is prerendered to static HTML; the only client JavaScript is the header,
the project filter, the contact form, the theme toggle and the scroll reveal.

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

`media.video`, `media.poster` and `media.screenshots` are empty until real captures exist.
Cards and case studies are designed for that state: a card shows its lead figure, and a case
study with no capture simply omits the media panel rather than showing an empty frame.

Once a clip is added, `ProjectMedia` handles playback:

- **Desktop** (fine pointer): muted, loops, plays while the card is hovered or focused
- **Touch**: plays while 60% of it is on screen, pauses when it leaves
- **Reduced motion**: never autoplays, the poster stays
- The video source is attached only when the card nears the viewport

Put files under `public/media/<slug>/` and reference them as `/media/<slug>/demo.mp4`.

## Before you deploy

1. **Set `CONTACT_EMAIL`** in `src/content/profile.ts` — it is a placeholder.
2. **Resolve the `reviewNote` on XN CRM** in `src/content/projects.ts` (authorship), or set
   `draft: true` until you have.
3. Set `NEXT_PUBLIC_SITE_URL` in the host's environment (see `.env.example`).

## Verification

`scripts/verify.mjs` renders every route at 1440, 820 and 390 px wide and fails on any
console error, horizontal overflow, or axe-core WCAG 2.1 AA violation, then exercises the
filter (including URL persistence), search, empty state, theme persistence, form
validation and focus, the skip link, and the mobile menu (scroll lock, Escape).

## Decisions worth knowing

- **No animation library.** The site needs one scroll reveal. Motion cost ~40 KB on every
  page that used it; a 40-line component does the same.
- **Reveals check position, not intersection.** An IntersectionObserver misses elements the
  page jumps past (anchor links, Back restoring scroll), which would leave them hidden.
  Content is only hidden while JS can reveal it, and never in print.
- **Fonts are self-hosted** from npm (`@fontsource`), so builds do not depend on Google Fonts
  and the browser makes no third-party requests.
- **`ink-faint` meets 4.5:1** in both themes. It started at 2.9:1 and failed the audit.
