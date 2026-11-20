#!/usr/bin/env node
/**
 * Release audit, run against a production build (`next build && next start -p 3100`):
 *   node scripts/audit.mjs [baseUrl]
 * Checks every route from the sitemap at five widths and both themes (overflow,
 * console/CSP errors), every internal link and media file, external links,
 * card video behaviour (hover, viewport, reduced motion, lazy loading), and
 * demo films (audio track, no autoplay). Prints a summary; exits 1 on failure.
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.argv[2] ?? 'http://localhost:3100';
const fails = [];
const warn = [];
const ok = (cond, msg, detail = '') => { (cond ? console.log : (m) => { fails.push(m); console.log(m); })(`${cond ? '✓' : '✗'} ${msg}${detail ? `  (${detail})` : ''}`); };

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const all = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
// Layout and metadata are checked in every language; media and link checks run
// once (the English set), since the files behind them are shared.
const routes = [...all, '/does-not-exist'];
const en = all.filter((p) => !/^\/(ru|uz)(\/|$)/.test(p));
console.log(`${routes.length} routes across 3 languages`);

const browser = await chromium.launch();
const links = new Set();
const media = new Set();
const external = new Set();

// 1. layout at five widths × two themes
for (const width of [320, 390, 768, 1440, 1920]) {
  for (const theme of ['dark', 'light']) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme });
    await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} }, theme);
    const page = await ctx.newPage();
    const errors = [];
    let current = '';
    page.on('console', (m) => { if (m.type() === 'error' && current !== '/does-not-exist') errors.push(`${current}: ${m.text().slice(0, 160)}`); });
    page.on('pageerror', (e) => errors.push(`${current}: ${String(e).slice(0, 160)}`));
    const over = [];
    for (const r of routes) {
      current = r;
      const res = await page.goto(BASE + r, { waitUntil: 'networkidle' });
      if (r === '/does-not-exist') { if (width === 1440 && theme === 'dark') ok(res.status() === 404, '404 route returns 404', String(res.status())); continue; }
      if (res.status() !== 200) fails.push(`${r} → ${res.status()}`);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (sw > 0) over.push(`${r} +${sw}px`);
      if (width === 1440 && theme === 'dark' && en.includes(r)) {
        for (const h of await page.$$eval('a[href]', (as) => as.map((a) => a.href))) (h.startsWith(BASE) ? links : external).add(h);
        for (const s of await page.$$eval('img[src], source[src], video[poster]', (es) => es.map((e) => e.getAttribute('src') || e.getAttribute('poster')))) media.add(new URL(s, BASE).href);
      }
      if (width === 1440 && theme === 'dark' && r !== '/does-not-exist') {
        const meta = await page.evaluate(() => ({ title: document.title, desc: document.querySelector('meta[name=description]')?.content, canon: document.querySelector('link[rel=canonical]')?.href, og: document.querySelector('meta[property="og:image"]')?.content, h1: document.querySelectorAll('h1').length, lang: document.documentElement.lang, alts: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.hreflang).sort().join(',') }));
        if (!meta.title || !meta.desc || !meta.og || meta.h1 !== 1) fails.push(`${r} meta: ${JSON.stringify(meta)}`);
        if (!meta.canon) warn.push(`${r}: no canonical`);
        const expectLang = /^\/ru(\/|$)/.test(r) ? 'ru' : /^\/uz(\/|$)/.test(r) ? 'uz' : 'en';
        if (meta.lang !== expectLang) fails.push(`${r}: html lang ${meta.lang} ≠ ${expectLang}`);
        if (meta.alts !== 'en,ru,uz,x-default') fails.push(`${r}: hreflang ${meta.alts}`);
      }
    }
    ok(!over.length, `no horizontal overflow @${width} ${theme}`, over.join(', '));
    ok(!errors.length, `no console/CSP errors @${width} ${theme}`, [...new Set(errors)].slice(0, 3).join(' | '));
    await ctx.close();
  }
}
const metaFails = fails.filter((f) => f.includes('meta:'));
ok(metaFails.length === 0, 'every page has title, description, og:image and one h1', metaFails.slice(0, 4).join(' | '));
const langFails = fails.filter((f) => f.includes('html lang') || f.includes('hreflang'));
ok(langFails.length === 0, 'every page declares its language and links its translations', langFails.slice(0, 4).join(' | '));

// language routing
{
  const probes = [
    ['/en', 308, '/'], ['/en/projects', 308, '/projects'],
  ];
  for (const [path, code, to] of probes) {
    const res = await fetch(BASE + path, { redirect: 'manual' });
    ok(res.status === code && new URL(res.headers.get('location'), BASE).pathname === to, `${path} redirects to ${to}`, `${res.status} ${res.headers.get('location')}`);
  }
  const ru = await fetch(BASE + '/', { redirect: 'manual', headers: { 'accept-language': 'ru-RU,ru;q=0.9' } });
  ok(ru.status === 307 && (ru.headers.get('location') ?? '').endsWith('/ru'), 'a Russian browser lands on /ru', `${ru.status} ${ru.headers.get('location')}`);
  const cookie = await fetch(BASE + '/', { redirect: 'manual', headers: { cookie: 'NEXT_LOCALE=uz' } });
  ok(cookie.status === 307 && (cookie.headers.get('location') ?? '').endsWith('/uz'), 'a saved choice wins over the browser', `${cookie.status} ${cookie.headers.get('location')}`);
  const plain = await fetch(BASE + '/', { redirect: 'manual', headers: { 'accept-language': 'en-GB,en;q=0.9' } });
  ok(plain.status === 200, 'an English browser stays on /', String(plain.status));
}

// 2. internal links and media
const bad = [];
for (const u of [...links, ...media]) {
  const res = await fetch(u.replace(/#.*$/, ''), { method: 'GET' });
  if (res.status >= 400) bad.push(`${res.status} ${u}`);
  await res.arrayBuffer().catch(() => {});
}
ok(!bad.length, `all ${links.size} internal links and ${media.size} media files resolve`, bad.join(', '));

// 3. external links (reported, not fatal: the sandbox network may refuse some hosts)
// curl honours the environment's HTTPS proxy, which Node's fetch does not
const ext = [];
for (const u of external) {
  if (u.startsWith('mailto:')) continue;
  let code = 'ERR';
  try { code = execFileSync('curl', ['-sS', '-L', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', u], { encoding: 'utf8' }).trim(); } catch (e) { code = `ERR ${String(e.stderr || e.message).trim().slice(0, 80)}`; }
  ext.push(`${code} ${u}`);
  if (!/^2|^3/.test(code)) warn.push(`external ${code}: ${u}`);
}
console.log('external links:\n  ' + ext.join('\n  '));

// 4. card video behaviour
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const previews = [];
  page.on('request', (r) => { if (r.url().includes('preview.mp4')) previews.push(r.url()); });
  await page.goto(BASE + '/projects', { waitUntil: 'networkidle' });
  const cards = await page.locator('[data-card]').count();
  ok(previews.length === 0, 'desktop: card clips load lazily', `${new Set(previews.map((u) => u.split('/media/')[1]?.split('/')[0])).size} of ${cards} requested before scrolling`);
  const card = page.locator('[data-card]:has(video), [data-card]:has([data-media])').first();
  await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  const v = card.locator('video');
  ok(await v.count() === 0, 'desktop: no clip is fetched before the first hover');
  await card.hover(); await page.waitForTimeout(1500);
  ok(await v.count() > 0, 'desktop: hovering attaches the clip');
  ok(await v.evaluate((e) => !e.paused && e.muted && e.loop), 'desktop: clip plays muted and looping on hover');
  await page.mouse.move(5, 5); await page.waitForTimeout(400);
  ok(await v.evaluate((e) => e.paused), 'desktop: clip pauses when the pointer leaves');
  await ctx.close();

  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const mp = await mob.newPage();
  await mp.goto(BASE + '/projects', { waitUntil: 'networkidle' });
  const mc = mp.locator('[data-card]').first();
  await mc.scrollIntoViewIfNeeded(); await mp.waitForTimeout(1800);
  ok(await mc.locator('video').evaluate((e) => !e.paused).catch(() => false), 'mobile: clip plays while on screen');
  await mp.evaluate(() => scrollTo(0, document.body.scrollHeight)); await mp.waitForTimeout(900);
  ok(await mc.locator('video').evaluate((e) => e.paused).catch(() => true), 'mobile: clip pauses off screen');
  await mob.close();

  const red = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await red.newPage();
  await rp.goto(BASE + '/projects', { waitUntil: 'networkidle' });
  const rc = rp.locator('[data-card]').first();
  await rc.hover(); await rp.waitForTimeout(1000);
  ok(await rc.locator('video').evaluate((e) => e.paused).catch(() => true), 'reduced motion: clips never autoplay');
  await red.close();
}

// 5. demo films on case studies
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const slugs = en.filter((r) => r.startsWith('/projects/')).map((r) => r.split('/')[2]);
  const rows = [];
  for (const s of slugs) {
    await page.goto(`${BASE}/projects/${s}`, { waitUntil: 'networkidle' });
    const v = page.locator('figure video');
    if (!(await v.count())) { rows.push(`${s}: no film`); continue; }
    const info = await v.evaluate((e) => ({ controls: e.controls, autoplay: e.autoplay, preload: e.preload }));
    if (!info.controls || info.autoplay) fails.push(`${s}: film controls/autoplay ${JSON.stringify(info)}`);
    rows.push(`${s}: controls, preload=${info.preload}, ${await page.locator('figure:has(video) figcaption').innerText().then((t) => t.replace(/\s+/g, ' '))}`);
  }
  console.log('films:\n  ' + rows.join('\n  '));
}
await browser.close();
if (warn.length) console.log('warnings:\n  ' + warn.join('\n  '));
console.log(fails.length ? `\n${fails.length} FAILURE(S)` : '\nAUDIT PASSED');
process.exit(fails.length ? 1 : 0);
