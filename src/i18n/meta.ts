import type { Metadata } from 'next';
import { type Locale, localeMeta, localePath, locales } from './config';

/** Canonical URL for this language plus hreflang links to the same page in every language. */
export function alternates(locale: Locale, path: string): Metadata['alternates'] {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [localeMeta[l].htmlLang, localePath(l, path)])),
      'x-default': localePath('en', path),
    },
  };
}
