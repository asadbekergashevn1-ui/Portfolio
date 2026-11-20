import type { Locale } from '@/i18n/config';
import { categories as baseCategories } from './categories';
import ruText from './i18n/ru.json';
import uzText from './i18n/uz.json';
import { profile as baseProfile } from './profile';
import { projects as baseProjects } from './projects';
import type { Category, Feature, Profile, Project } from './types';

/**
 * Translations are overlays on the English content: same keys, same array order
 * (checked by src/content/i18n/check-shape.mjs). Anything a translation lacks
 * falls back to English, so a missing string never breaks a page.
 */
type Text = {
  projects: Record<string, {
    tagline?: string; role?: string; client?: string; summary?: string; problem?: string; approach?: string; outcome?: string;
    benefits?: Feature[]; features?: Feature[];
    metrics?: { label: string; note?: string }[];
    links?: { label: string; note?: string }[];
    stackGroups?: string[];
    demoNote?: string;
    screenshots?: { alt: string; caption?: string }[];
  }>;
  categories: Record<string, { name: string; blurb: string }>;
  profile: { role: string; location: string; headline: string; intro: string[]; about: string[]; principles: Feature[]; toolboxGroups: string[] };
};

const texts: Partial<Record<Locale, Text>> = { ru: ruText as Text, uz: uzText as Text };

const at = <T,>(arr: T[] | undefined, i: number): T | undefined => (arr ? arr[i] : undefined);

function localizeProject(p: Project, t: Text['projects'][string] | undefined): Project {
  if (!t) return p;
  return {
    ...p,
    tagline: t.tagline ?? p.tagline,
    role: t.role ?? p.role,
    client: p.client ? t.client ?? p.client : undefined,
    summary: t.summary ?? p.summary,
    problem: t.problem ?? p.problem,
    approach: t.approach ?? p.approach,
    outcome: t.outcome ?? p.outcome,
    benefits: p.benefits.map((b, i) => at(t.benefits, i) ?? b),
    features: p.features.map((f, i) => at(t.features, i) ?? f),
    metrics: p.metrics.map((m, i) => ({ ...m, label: at(t.metrics, i)?.label ?? m.label, note: m.note ? at(t.metrics, i)?.note ?? m.note : undefined })),
    links: p.links.map((l, i) => ({ ...l, label: at(t.links, i)?.label ?? l.label, note: l.note ? at(t.links, i)?.note ?? l.note : undefined })),
    stack: p.stack.map((g, i) => ({ ...g, group: at(t.stackGroups, i) ?? g.group })),
    media: {
      ...p.media,
      demoNote: p.media.demoNote ? t.demoNote ?? p.media.demoNote : undefined,
      screenshots: p.media.screenshots.map((s, i) => ({ ...s, alt: at(t.screenshots, i)?.alt ?? s.alt, caption: s.caption ? at(t.screenshots, i)?.caption ?? s.caption : undefined })),
    },
  };
}

const cache = new Map<Locale, { projects: Project[]; categories: Category[]; profile: Profile }>();

function content(locale: Locale) {
  const hit = cache.get(locale);
  if (hit) return hit;
  const t = texts[locale];
  const value = t
    ? {
        projects: baseProjects.map((p) => localizeProject(p, t.projects[p.slug])),
        categories: baseCategories.map((c) => ({ ...c, ...(t.categories[c.slug] ?? {}) })),
        profile: {
          ...baseProfile,
          role: t.profile.role,
          location: t.profile.location,
          headline: t.profile.headline,
          intro: t.profile.intro,
          about: t.profile.about,
          principles: t.profile.principles,
          toolbox: baseProfile.toolbox.map((g, i) => ({ ...g, group: t.profile.toolboxGroups[i] ?? g.group })),
        },
      }
    : { projects: baseProjects, categories: baseCategories, profile: baseProfile };
  cache.set(locale, value);
  return value;
}

export const getProfile = (locale: Locale) => content(locale).profile;
export const getCategories = (locale: Locale) => content(locale).categories;
export const getCategory = (locale: Locale, slug: string) => content(locale).categories.find((c) => c.slug === slug);
export const categoryName = (locale: Locale, slug: string) => getCategory(locale, slug)?.name ?? slug;

export function sortedProjects(locale: Locale): Project[] {
  return content(locale).projects.filter((p) => !p.draft).sort((a, b) => a.order - b.order);
}
export const getProject = (locale: Locale, slug: string) => content(locale).projects.find((p) => p.slug === slug);
export const featuredProjects = (locale: Locale) => sortedProjects(locale).filter((p) => p.featured);
export const projectsByCategory = (locale: Locale, slug: string) => sortedProjects(locale).filter((p) => p.category === slug);
