#!/usr/bin/env node
/**
 * Capture pipeline: records real product demos from live deployments.
 *
 *   node capture/run.mjs                 # every scene
 *   node capture/run.mjs flashy level-up # just these
 *
 * Writes public/media/<slug>/{demo,preview}.mp4, poster.webp, shot-*.webp,
 * src/content/media.generated.json and capture/REPORT.md.
 */
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { guard, redactionCss } from './lib/safety.mjs';
import { startRecording } from './lib/recorder.mjs';
import { Director, CURSOR_SCRIPT } from './lib/director.mjs';
import { renderDemo, renderPreview, renderPoster, stillToWebp, outputTime } from './lib/render.mjs';
import { scenes, unavailable } from './scenes/index.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const sharp = require('sharp');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORK = join(ROOT, 'capture', '.work');
const MEDIA = join(ROOT, 'public', 'media');
const MANIFEST = join(ROOT, 'src', 'content', 'media.generated.json');
const RESULTS = join(ROOT, 'capture', 'results.json');
const OUT_W = 1440; // every output is 1440×900; scenes choose how much page that frame holds
const SRC_W = 2160; // capture width in device pixels — keeps a 1.5× push-in native

const pick = process.argv.slice(2);
const todo = pick.length ? scenes.filter((s) => pick.includes(s.id)) : scenes;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const results = existsSync(RESULTS) ? JSON.parse(readFileSync(RESULTS, 'utf8')) : {};

const browser = await chromium.launch();
for (const scene of todo) {
  const started = Date.now();
  const dir = join(WORK, scene.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  console.log(`\n● ${scene.id}`);

  const VIEW = scene.viewport ?? { width: 1440, height: 900 };
  const DPR = SRC_W / VIEW.width;
  const k = OUT_W / VIEW.width;
  const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: DPR, locale: 'uz-UZ', colorScheme: scene.colorScheme ?? 'light', reducedMotion: 'no-preference' });
  const net = await guard(context, { allowHosts: scene.allowHosts, localWrites: scene.localWrites });
  const css = 'html{overflow-x:clip!important}' + redactionCss(scene.redact);
  await context.addInitScript(CURSOR_SCRIPT);
  if (css) await context.addInitScript(`addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.appendChild(s);});`);

  if (scene.build) await scene.build();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(scene.url, { waitUntil: 'networkidle', timeout: 60000 });
  try {
    if (scene.prepare) await scene.prepare(page);
  } catch (e) {
    console.log(`  ✗ prepare failed: ${e.message.split('\n')[0]}`);
    await context.close();
    continue;
  }
  await page.mouse.move(VIEW.width / 2, VIEW.height / 2);

  const rec = await startRecording(page, dir, { width: VIEW.width * DPR, height: VIEW.height * DPR });
  const d = new Director(page, { ...VIEW, dir });
  await page.waitForTimeout(300);
  try {
    await scene.run(d, page);
  } catch (e) {
    console.log(`  ✗ scene failed: ${e.message.split('\n')[0]}`);
    await page.screenshot({ path: join(WORK, `${scene.id}-fail.png`) }).catch(() => {});
    console.log((e.stack || '').split('\n').filter((l) => l.includes('scenes/')).slice(0, 2).join('\n'));
    errors.push(`scene: ${e.message.split('\n')[0]}`);
  }
  await rec.stop();
  await context.close();
  console.log(`  recorded ${rec.frames.length} frames, ${d.shots.length} shots`);

  for (const output of scene.outputs) {
    const out = join(MEDIA, output.slug);
    rmSync(out, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
    const shots = output.shots ? d.shots.filter((s) => output.shots.includes(s.name)) : d.shots;
    if (!shots.length) continue;
    const demoFile = join(out, 'demo.mp4');
    const { plan, total } = await renderDemo({ frames: rec.frames, shots, cameraAt: (t) => d.cameraAt(t), out: demoFile, k });

    const pv = plan.find((p) => p.name === output.preview) ?? plan[0];
    const pvLen = await renderPreview({ demo: demoFile, out: join(out, 'preview.mp4'), start: pv.g0, duration: Math.min(8, total - pv.g0) });

    const posterT = d.marks[output.poster] ?? pv.t0 + pv.dur * 0.6;
    const still = output.posterStill && d.stills.find((x) => x.name === output.posterStill);
    if (still) await sharp(still.file).resize(1440, 900).webp({ quality: 84 }).toFile(join(out, 'poster.webp'));
    else await renderPoster({ frames: rec.frames, cameraAt: (t) => d.cameraAt(t), t: posterT, out: join(out, 'poster.webp'), k });
    const events = d.events.map((e) => ({ ...e, t: outputTime(plan, e.t) })).filter((e) => e.t != null);
    writeFileSync(join(WORK, `${output.slug}-score.json`), JSON.stringify({ duration: total, cuts: plan.slice(1).map((p) => +p.g0.toFixed(3)), events }, null, 2));

    const screenshots = [];
    for (const [i, st] of d.stills.filter((x) => !output.stills || output.stills.includes(x.name)).entries()) {
      const file = `shot-${String(i + 1).padStart(2, '0')}.webp`;
      const dim = await stillToWebp(st.file, join(out, file));
      screenshots.push({ src: `/media/${output.slug}/${file}`, alt: st.alt, caption: st.caption, ...dim });
    }

    manifest[output.slug] = {
      poster: `/media/${output.slug}/poster.webp`,
      video: { src: `/media/${output.slug}/preview.mp4`, type: 'video/mp4' },
      demo: { src: `/media/${output.slug}/demo.mp4`, type: 'video/mp4' },
      screenshots,
      capturedFrom: scene.url,
      capturedAt: new Date().toISOString().slice(0, 10),
    };
    results[output.slug] = {
      status: 'captured',
      scene: scene.id,
      source: scene.url,
      shows: output.shows,
      demoSeconds: +total.toFixed(1),
      previewSeconds: +pvLen.toFixed(1),
      shots: plan.map((p) => p.name),
      stills: screenshots.length,
      blockedWrites: [...net.blockedWrites],
      blockedHosts: [...net.blockedHosts],
      notes: output.notes ?? scene.notes ?? [],
      errors,
    };
    console.log(`  → ${output.slug}: demo ${total.toFixed(1)}s, preview ${pvLen.toFixed(1)}s, ${screenshots.length} stills, poster @${outputTime(plan, posterT)?.toFixed(1) ?? '?'}s`);
  }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(RESULTS, JSON.stringify(results, null, 2) + '\n');
  console.log(`  blocked writes: ${[...net.blockedWrites].join(', ') || 'none attempted'}`);
  console.log(`  took ${((Date.now() - started) / 1000).toFixed(0)}s`);
}
await browser.close();

for (const u of unavailable) results[u.slug] = { status: 'unavailable', ...u };
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(RESULTS, JSON.stringify(results, null, 2) + '\n');
const { writeReport } = await import('./lib/report.mjs');
writeReport(results, join(ROOT, 'capture', 'REPORT.md'));
console.log('\nmanifest, results and REPORT.md written');
