import type { MetadataRoute } from 'next';
import { getCategories, projectsByCategory, sortedProjects } from '@/content/localize';
import { defaultLocale, type Locale, localeMeta, localePath, locales } from '@/i18n/config';
import { siteUrl } from '@/lib/site';

/** Every page in every language, each entry listing its translations (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = (locale: Locale) => [
    '/', '/projects', '/categories', '/about', '/contact',
    ...sortedProjects(locale).map((p) => `/projects/${p.slug}`),
    ...getCategories(locale).filter((c) => projectsByCategory(locale, c.slug).length).map((c) => `/categories/${c.slug}`),
  ];
  return locales.flatMap((locale) =>
    paths(locale).map((path) => ({
      url: `${siteUrl}${localePath(locale, path)}`,
      lastModified: now,
      alternates: {
        languages: Object.fromEntries([
          ...locales.map((l) => [localeMeta[l].htmlLang, `${siteUrl}${localePath(l, path)}`]),
          ['x-default', `${siteUrl}${localePath(defaultLocale, path)}`],
        ]),
      },
    })),
  );
}
