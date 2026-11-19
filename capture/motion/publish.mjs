#!/usr/bin/env node
/**
 * Turns a rendered motion piece into site media: a 30 fps card loop, a poster, and
 * manifest + report entries that say plainly it is a motion piece, not a recording.
 *   node capture/motion/publish.mjs coma
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PIECES = {
  coma: {
    preview: [9.0, 8.0], // cards land, the scan sorts them, the rule
    poster: 12.4, // the window holding all three messages
    shows: 'A motion piece built from COMA’s real rules: the schedule read from a group title, the homework window, the roll-call trap, the verdict and the weekly score.',
    notes: ['No user interface exists to record. Rendered from capture/motion/coma; message texts are illustrative and labelled so on screen, rules and figures come from the code and its tests.', 'Silent by decision: no one has listened to a soundtrack for it yet.'],
  },
};
const name = process.argv[2];
const cfg = PIECES[name];
const dir = join(ROOT, 'public', 'media', name);
const master = join(ROOT, 'capture', '.work', `${name}-master.mp4`); // full-quality render, never deployed
const demo = join(dir, 'demo.mp4');
const run = (args) => { const r = spawnSync('ffmpeg', args, { encoding: 'utf8' }); if (r.status) throw new Error(r.stderr); };

run(['-y', '-loglevel', 'error', '-i', master, '-vf', 'scale=1440:900:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an', demo]);
const [start, len] = cfg.preview;
const f = 0.35;
run(['-y', '-loglevel', 'error', '-ss', String(start), '-t', String(len), '-i', demo, '-r', '30',
  '-vf', `scale=960:600:flags=lanczos,fade=t=in:st=0:d=${f}:color=0x0a0b0d,fade=t=out:st=${len - f}:d=${f}:color=0x0a0b0d`,
  '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(dir, 'preview.mp4')]);
const png = join(ROOT, 'capture', '.work', `${name}-poster.png`);
run(['-y', '-loglevel', 'error', '-ss', String(cfg.poster), '-i', demo, '-frames:v', '1', png]);
await sharp(png).resize(1440, 900).webp({ quality: 84 }).toFile(join(dir, 'poster.webp'));
const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', demo], { encoding: 'utf8' });

const manifestFile = join(ROOT, 'src', 'content', 'media.generated.json');
const resultsFile = join(ROOT, 'capture', 'results.json');
const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : {};
const results = existsSync(resultsFile) ? JSON.parse(readFileSync(resultsFile, 'utf8')) : {};
manifest[name] = {
  kind: 'motion',
  poster: `/media/${name}/poster.webp`,
  video: { src: `/media/${name}/preview.mp4`, type: 'video/mp4' },
  demo: { src: `/media/${name}/demo.mp4`, type: 'video/mp4' },
  screenshots: [],
  capturedFrom: `capture/motion/${name}`,
  capturedAt: new Date().toISOString().slice(0, 10),
};
results[name] = { status: 'captured', scene: `motion/${name}`, source: `capture/motion/${name}/scene.html`, shows: cfg.shows, demoSeconds: +(+probe.stdout).toFixed(1), previewSeconds: len, shots: ['S1 title', 'S2 window', 'S3 arrivals', 'S4 decision', 'S5 week', 'S6 end'], stills: 0, blockedWrites: [], blockedHosts: [], notes: cfg.notes, errors: [] };
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(resultsFile, JSON.stringify(results, null, 2) + '\n');
console.log(`${name}: preview, poster and manifest entry written`);
