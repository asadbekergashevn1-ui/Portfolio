import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale, locales } from '@/i18n/config';

/**
 * English lives at the bare paths (/projects), the other languages under a
 * prefix (/ru/projects). Internally every page is /[locale]/..., so a bare path
 * is rewritten onto /en/... — the URL in the address bar never changes.
 *
 * A first-time visitor landing on "/" is redirected once to the language they
 * asked for (cookie first, then Accept-Language). Any deeper bare path is left
 * alone: a shared link should open in the language it was shared in.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const seg = pathname.split('/')[1];

  // already prefixed: /ru/... and /uz/... are served as-is
  if (isLocale(seg) && seg !== defaultLocale) return NextResponse.next();

  // /en/... is an internal detail; send it to the bare path
  if (seg === defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (pathname === '/') {
    const preferred = preferredLocale(req);
    if (preferred !== defaultLocale) {
      const url = req.nextUrl.clone();
      url.pathname = `/${preferred}`;
      return NextResponse.redirect(url, 307); // 307: the choice can change, do not cache it
    }
  }

  return NextResponse.rewrite(new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}${search}`, req.url));
}

function preferredLocale(req: NextRequest): Locale {
  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  const header = req.headers.get('accept-language');
  if (!header) return defaultLocale;
  const wanted = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of wanted) {
    if (isLocale(tag)) return tag;
    if (tag === 'uz' || tag === 'kaa') return 'uz';
    // Russian is the working second language across the region
    if (['ru', 'be', 'kk', 'ky', 'tg', 'tk', 'az', 'hy'].includes(tag)) return 'ru';
  }
  return defaultLocale;
}

export const config = {
  matcher: ['/((?!_next/|media/|icon|opengraph-image|sitemap.xml|robots.txt|favicon.ico).*)'],
};
