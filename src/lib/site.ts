/**
 * The site's public origin, used for canonical URLs, Open Graph and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL once a domain is chosen; on Vercel the production
 * domain (or this deployment's URL) is used automatically until then.
 */
const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  'http://localhost:3000';

export const siteUrl = fromEnv.replace(/\/$/, '');
