/**
 * Content model for the portfolio.
 *
 * Everything the site renders comes from `src/content/*`. No page or component
 * hard-codes project copy, so adding or editing work means touching data only.
 */

export type ProjectStatus = 'live' | 'dormant' | 'mvp';

export type CategorySlug =
  | 'crm'
  | 'automation'
  | 'mobile'
  | 'education'
  | 'websites'
  | 'web-apps';

export type LinkKind = 'live' | 'repo' | 'case-study' | 'docs' | 'video';

export interface ProjectLink {
  label: string;
  href: string;
  kind: LinkKind;
  /** Reachable by anyone, or gated behind a login / private repo. */
  access: 'public' | 'private' | 'login-required';
  note?: string;
}

export interface Feature {
  title: string;
  detail: string;
}

export interface StackGroup {
  group: string;
  items: string[];
}

export interface Metric {
  value: string;
  label: string;
  note?: string;
}

export interface Screenshot {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

/**
 * Media is produced by the capture pipeline (`scripts/capture`). Until a clip
 * exists, `video` stays null and cards fall back to the typographic treatment —
 * which the design system treats as a first-class state, not an error.
 */
export interface ProjectMedia {
  /** 'recording' = captured from the running product; 'motion' = rendered explainer for work with no UI. */
  kind?: 'recording' | 'motion';
  poster: string | null;
  /** Short muted loop for cards. */
  video: { src: string; type: string } | null;
  /** Full walkthrough for the case study, played with controls. */
  demo?: { src: string; type: string; audio?: boolean } | null;
  /** Shown under the demo when the recording needs context (e.g. recorded on demo data). */
  demoNote?: string;
  screenshots: Screenshot[];
  /** Why no capture exists yet, surfaced in the capture report. */
  captureBlocker?: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  category: CategorySlug;
  status: ProjectStatus;
  year: string;
  /** Lower sorts first on the Projects page. */
  order: number;
  featured: boolean;
  /** Hidden from listings until the note is resolved. */
  draft?: boolean;
  reviewNote?: string;

  /** What I did on it. Shown verbatim on the detail page. */
  role: string;
  client?: string;

  summary: string;
  problem: string;
  approach: string;
  outcome: string;

  /** What it changes for the business — benefit first, then the reason it holds. */
  benefits: Feature[];
  features: Feature[];
  stack: StackGroup[];
  metrics: Metric[];
  links: ProjectLink[];
  media: ProjectMedia;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  blurb: string;
}

export interface Profile {
  name: string;
  initials: string;
  role: string;
  location: string;
  available: boolean;
  headline: string;
  intro: string[];
  about: string[];
  principles: { title: string; detail: string }[];
  toolbox: StackGroup[];
  contact: { label: string; value: string; href: string; kind: string }[];
}
