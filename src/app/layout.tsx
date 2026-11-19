import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource/instrument-serif/400-italic.css';
import './globals.css';
import { SiteFooter } from '@/components/site-footer';
import { MotionLayer } from '@/components/motion-layer';
import { SiteHeader } from '@/components/site-header';
import { themeScript } from '@/components/theme-toggle';
import { profile } from '@/content/profile';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${profile.name} — ${profile.role}`, template: `%s · ${profile.name}` },
  description: `${profile.headline} ${profile.intro[0]}`,
  authors: [{ name: profile.name }],
  openGraph: { type: 'website', siteName: profile.name, locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0b0d' },
    { media: '(prefers-color-scheme: light)', color: '#faf8f4' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
        <MotionLayer />
      </body>
    </html>
  );
}
