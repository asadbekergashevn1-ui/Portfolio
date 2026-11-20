/**
 * Languages. English lives at the bare paths (/projects), the others under a
 * prefix (/ru/projects, /uz/projects); middleware maps the bare paths onto the
 * `[locale]` segment, so every page is prerendered once per language.
 */
export const locales = ['en', 'ru', 'uz'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeMeta: Record<Locale, { label: string; short: string; htmlLang: string; ogLocale: string }> = {
  en: { label: 'English', short: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
  ru: { label: 'Русский', short: 'RU', htmlLang: 'ru', ogLocale: 'ru_RU' },
  uz: { label: 'Oʻzbekcha', short: 'UZ', htmlLang: 'uz', ogLocale: 'uz_UZ' },
};

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && (locales as readonly string[]).includes(x);
}

/** The public path of `path` in `locale` ('/projects' → '/ru/projects'). */
export function localePath(locale: Locale, path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return p;
  return p === '/' ? `/${locale}` : `/${locale}${p}`;
}

/** Splits a public pathname into its locale and the path within it. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const seg = pathname.split('/')[1];
  if (isLocale(seg) && seg !== defaultLocale) {
    const rest = pathname.slice(seg.length + 1);
    return { locale: seg, path: rest || '/' };
  }
  if (seg === defaultLocale) return { locale: defaultLocale, path: pathname.slice(3) || '/' };
  return { locale: defaultLocale, path: pathname || '/' };
}

/** Plural form via CLDR rules: plural('ru', 3, { one: 'проект', few: 'проекта', many: 'проектов' }). */
export function plural(locale: Locale, n: number, forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other?: string }): string {
  const rule = new Intl.PluralRules(localeMeta[locale].htmlLang).select(n);
  return forms[rule] ?? forms.other ?? forms.many ?? forms.one ?? '';
}
