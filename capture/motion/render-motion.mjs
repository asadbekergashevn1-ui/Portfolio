#!/usr/bin/env node
/**
 * Renders a motion piece frame by frame. Each scene exposes window.render(t): its
 * whole state is a function of time, so every frame is exact and repeatable —
 * no dependence on wall-clock playback or how many frames came before (apart
 * from motion blur, which is seeded from the previous frame).
 *
 *   node capture/motion/render-motion.mjs coma                      # full piece
 *   node capture/motion/render-motion.mjs coma --from 8 --to 13.4   # a slice, for review
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [name, ...rest] = process.argv.slice(2);
const arg = (k, d) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : d; };
const FPS = 60;
const W = 1920;
const H = 1200;

const font = (pkg, file) => readFileSync(join(ROOT, 'node_modules', pkg, 'files', file)).toString('base64');
const faces = [
  ['Inter Variable', '@fontsource-variable/inter', 'inter-latin-wght-normal.woff2', 'normal', '100 900'],
  ['JetBrains Mono Variable', '@fontsource-variable/jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2', 'normal', '100 800'],
  ['Instrument Serif', '@fontsource/instrument-serif', 'instrument-serif-latin-400-italic.woff2', 'italic', '400'],
].map(([fam, pkg, file, style, weight]) => `@font-face{font-family:'${fam}';src:url(data:font/woff2;base64,${font(pkg, file)}) format('woff2');font-style:${style};font-weight:${weight};font-display:block}`).join('\n');

const work = join(ROOT, 'capture', '.work', `motion-${name}`);
mkdirSync(work, { recursive: true });
const html = readFileSync(join(ROOT, 'capture', 'motion', name, 'scene.html'), 'utf8').replace('/*FONTS*/', faces);
const built = join(work, 'scene.html');
writeFileSync(built, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.route('**/*', (r) => (r.request().url().startsWith('file:') || r.request().url().startsWith('data:') ? r.continue() : r.abort()));
await page.goto('file://' + built);
await page.evaluate(() => document.fonts.ready);
const total = await page.evaluate(() => window.DURATION);
const from = Number(arg('--from', 0));
const to = Math.min(total, Number(arg('--to', total)));
const out = resolve(arg('--out', join(ROOT, 'capture', '.work', `${name}-master.mp4`)));
mkdirSync(dirname(out), { recursive: true });

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', out]);
let err = '';
ff.stderr.on('data', (d) => (err += d));
const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(err)))));
const write = (b) => (ff.stdin.write(b) ? Promise.resolve() : new Promise((r) => ff.stdin.once('drain', r)));

const n = Math.round((to - from) * FPS);
const t0 = Date.now();
await page.evaluate(([t, dt]) => window.render(t, dt), [Math.max(0, from - 1 / FPS), 1 / FPS]); // seed motion blur
for (let i = 0; i < n; i++) {
  await page.evaluate(([t, dt]) => window.render(t, dt), [from + i / FPS, 1 / FPS]);
  await write(await page.screenshot({ type: 'jpeg', quality: 94 }));
  if (i % 300 === 0) process.stdout.write(`  ${(from + i / FPS).toFixed(1)}s `);
}
ff.stdin.end();
await done;
await browser.close();
console.log(`\n${name}: ${n} frames (${from}–${to}s) in ${((Date.now() - t0) / 1000).toFixed(0)}s → ${out}`);
