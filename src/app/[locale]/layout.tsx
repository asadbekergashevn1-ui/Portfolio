import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/lora/wght-italic.css';
import '../globals.css';
import { MotionLayer } from '@/components/motion-layer';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { themeScript } from '@/components/theme-toggle';
import { getProfile } from '@/content/localize';
import { isLocale, type Locale, localeMeta, locales } from '@/i18n/config';
import { alternates } from '@/i18n/meta';
import { getDict } from '@/i18n/ui';
import { siteUrl } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const profile = getProfile(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${profile.name} — ${profile.role}`, template: `%s · ${profile.name}` },
    description: `${profile.headline} ${getDict(locale).meta.siteDescription}`,
    authors: [{ name: profile.name }],
    alternates: alternates(locale, '/'),
    openGraph: { type: 'website', siteName: profile.name, locale: localeMeta[locale].ogLocale },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0b0d' },
    { media: '(prefers-color-scheme: light)', color: '#faf8f4' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const profile = getProfile(locale);
  const t = getDict(locale);
  return (
    <html lang={localeMeta[locale].htmlLang} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: profile.name,
              jobTitle: profile.role,
              url: siteUrl,
              address: { '@type': 'PostalAddress', addressLocality: 'Termiz', addressCountry: 'UZ' },
              sameAs: profile.contact.filter((c) => c.kind === 'github').map((c) => c.href),
            }).replace(/</g, '\\u003c'),
          }}
        />
        <a href="#main" className="skip-link">{t.a11y.skip}</a>
        <SiteHeader locale={locale} name={profile.name} location={profile.location} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter locale={locale} />
        <MotionLayer />
      </body>
    </html>
  );
}
