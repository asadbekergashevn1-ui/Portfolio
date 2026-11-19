/**
 * Capture runs against live production sites, so nothing it does may change them.
 *
 * - Every request that is not GET/HEAD is aborted: no form ever submits, no lead
 *   reaches a real CRM, no Telegram message reaches real staff.
 * - Only hosts a scene declares are reachable; analytics and anything unexpected
 *   are cut off.
 * Both lists are returned so the report can prove what was refused.
 */
export async function guard(context, { allowHosts }) {
  const log = { blockedWrites: new Set(), blockedHosts: new Set() };
  const allowed = [...allowHosts, 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];
  await context.route('**/*', (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.protocol === 'file:' || url.protocol === 'data:') return route.continue();
    if (!['GET', 'HEAD'].includes(req.method())) {
      log.blockedWrites.add(`${req.method()} ${url.host}${url.pathname}`);
      return route.abort();
    }
    if (!allowed.some((h) => url.host === h)) {
      log.blockedHosts.add(url.host);
      return route.abort();
    }
    return route.continue();
  });
  return log;
}

/** CSS injected into every page before it renders: hides things a capture must never show. */
export function redactionCss(selectors) {
  if (!selectors?.length) return '';
  return `${selectors.join(',')}{filter:blur(14px) saturate(.6)!important;}`;
}
