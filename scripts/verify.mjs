// Browser verification: renders every route at three viewports, then checks
// console errors, horizontal overflow, axe accessibility violations and the
// interactive features. Usage: node scripts/verify.mjs [baseUrl] [outDir]
import { readFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const BASE = process.argv[2] ?? 'http://localhost:3100';
const OUT = process.argv[3] ?? 'captures/verify';
mkdirSync(OUT, { recursive: true });

const ROUTES = ['/', '/projects', '/projects/xn-crm', '/projects/coma', '/categories', '/categories/education', '/about', '/contact', '/does-not-exist'];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
];

const report = { routes: [], interactions: [] };
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    const errors = [];
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    const res = await page.goto(BASE + route, { waitUntil: 'networkidle' });
    // reveal everything so the full-page shot is honest
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(700);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    let axe = null;
    if (vp.name !== 'tablet') {
      await page.addScriptTag({ content: axeSource });
      axe = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } });
        return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, sample: v.nodes[0]?.target?.join(' ') }));
      });
    }
    const slug = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '');
    await page.screenshot({ path: `${OUT}/${vp.name}-${slug}.png`, fullPage: false });
    report.routes.push({ vp: vp.name, route, status: res?.status(), overflow, errors, axe });
  }
  await ctx.close();
}

// ── interactions ─────────────────────────────────────────────
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const check = (name, ok, detail = '') => report.interactions.push({ name, ok, detail });

await page.goto(BASE + '/projects', { waitUntil: 'networkidle' });
const before = await page.locator('article[data-card]').count();
await page.getByRole('button', { name: /^Education/ }).click();
await page.waitForURL(/category=education/);
await page.waitForTimeout(300);
const afterCat = await page.locator('article[data-card]').count();
check('category filter narrows and writes URL', afterCat > 0 && afterCat < before, `${before} → ${afterCat}, url ${page.url().split('?')[1]}`);
await page.reload({ waitUntil: 'networkidle' });
check('filter survives reload', (await page.locator('article[data-card]').count()) === afterCat);
await page.getByLabel('Search projects').fill('zzzz-nothing');
await page.waitForTimeout(400);
check('empty state renders', await page.getByText('No projects match these filters.').isVisible());
await page.getByRole('button', { name: 'Clear filters' }).click();
await page.waitForTimeout(400);
check('clear restores all', (await page.locator('article[data-card]').count()) === before);
await page.getByLabel('Search projects').fill('Supabase');
await page.waitForTimeout(400);
const sb = await page.locator('article[data-card]').count();
check('stack search works', sb > 0 && sb < before, `${sb} match Supabase`);

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Switch to light theme/ }).click();
check('theme switches to light', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light');
await page.reload({ waitUntil: 'networkidle' });
check('theme persists across reload', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light');
await page.screenshot({ path: `${OUT}/desktop-home-light.png` });
await page.evaluate(() => localStorage.removeItem('theme'));

await page.goto(BASE + '/contact', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Compose email' }).click();
const invalid = await page.locator('[aria-invalid="true"]').count();
check('contact validation flags empty fields', invalid === 3, `${invalid} invalid`);
check('first invalid field receives focus', await page.evaluate(() => document.activeElement?.getAttribute('name') === 'name'));

await page.keyboard.press('Tab');
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
check('skip link is first focus stop', (await page.evaluate(() => document.activeElement?.textContent)) === 'Skip to content');

const m = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mp = await m.newPage();
await mp.goto(BASE + '/', { waitUntil: 'networkidle' });
await mp.getByRole('button', { name: 'Open menu' }).click();
check('mobile menu opens', await mp.locator('#mobile-nav').isVisible());
check('mobile menu locks scroll', (await mp.evaluate(() => document.body.style.overflow)) === 'hidden');
await mp.screenshot({ path: `${OUT}/mobile-menu.png` });
await mp.keyboard.press('Escape');
check('Escape closes mobile menu', !(await mp.locator('#mobile-nav').isVisible()));

await browser.close();

// ── summary ──────────────────────────────────────────────────
let fail = 0;
console.log('\nROUTES');
for (const r of report.routes) {
  const ax = r.axe ? (r.axe.length ? r.axe.map((v) => `${v.id}(${v.impact},${v.nodes})`).join(' ') : 'clean') : '—';
  const expected404 = r.route === '/does-not-exist';
  const errs = expected404 ? r.errors.filter((e) => !e.includes('404')) : r.errors;
  const bad = (expected404 ? r.status !== 404 : r.status !== 200) || r.overflow > 0 || errs.length || (r.axe && r.axe.length);
  if (bad) fail++;
  console.log(`${bad ? '✗' : '✓'} ${r.vp.padEnd(7)} ${r.route.padEnd(24)} ${String(r.status).padEnd(4)} overflow=${r.overflow} errors=${r.errors.length} axe=${ax}`);
  for (const e of r.errors.slice(0, 2)) console.log('     err:', e.slice(0, 160));
  if (r.axe) for (const v of r.axe) console.log(`     axe ${v.id}: ${v.help} → ${v.sample}`);
}
console.log('\nINTERACTIONS');
for (const i of report.interactions) { if (!i.ok) fail++; console.log(`${i.ok ? '✓' : '✗'} ${i.name}${i.detail ? `  (${i.detail})` : ''}`); }
console.log(`\n${fail === 0 ? 'ALL CHECKS PASSED' : fail + ' FAILING'}`);
