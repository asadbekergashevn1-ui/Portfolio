/** Set NEXT_PUBLIC_SITE_URL in the deploy environment; used for canonical URLs and the sitemap. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
