import Link from 'next/link';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource/instrument-serif/400-italic.css';
import './globals.css';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { themeScript } from '@/components/theme-toggle';
import { getProfile } from '@/content/localize';
import { defaultLocale, localeMeta, localePath } from '@/i18n/config';
import { getDict } from '@/i18n/ui';

/**
 * Shown for any address that matches no page. Next renders this outside the
 * /[locale] tree and gives it no params, so it speaks the default language.
 */
export default function NotFound() {
  const t = getDict(defaultLocale);
  const profile = getProfile(defaultLocale);
  return (
    <html lang={localeMeta[defaultLocale].htmlLang} data-theme="dark" suppressHydrationWarning>
      <head>
        <title>{`404 · ${profile.name}`}</title>
        <meta name="robots" content="noindex" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">{t.a11y.skip}</a>
        <SiteHeader locale={defaultLocale} name={profile.name} location={profile.location} />
        <main id="main" tabIndex={-1} className="outline-none">
          <div className="mx-auto flex max-w-[1240px] flex-col items-start px-5 py-32 sm:px-8">
            <p className="label mb-4 text-accent">404</p>
            <h1 className="display text-[clamp(2.5rem,6vw,4.5rem)] text-ink">{t.notFound.title}</h1>
            <p className="mt-6 max-w-[44ch] text-[1rem] leading-[1.7] text-ink-2">{t.notFound.text}</p>
            <Link href={localePath(defaultLocale, '/projects')} className="label mt-10 rounded-[var(--radius-md)] bg-accent px-6 py-3.5 font-semibold text-accent-ink hover:opacity-90">
              {t.notFound.button}
            </Link>
          </div>
        </main>
        <SiteFooter locale={defaultLocale} />
      </body>
    </html>
  );
}
