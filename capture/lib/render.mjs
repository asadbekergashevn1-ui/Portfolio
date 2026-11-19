import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const OUT_W = 1440;
const OUT_H = 900;
const FPS = 60; // demos at 60 fps; card loops are re-encoded at 30 below
const XFADE = 0.4; // seconds of crossfade between shots

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * Screencast timestamps and the director's clock are both epoch seconds but not
 * the same counter; align them by the median gap between when a frame was painted
 * and when it arrived.
 */
function alignFrames(frames) {
  const gaps = frames.map((f) => f.arrival - f.t).sort((a, b) => a - b);
  const offset = gaps[Math.floor(gaps.length / 2)] ?? 0;
  return frames.map((f) => ({ file: f.file, t: f.t + offset })).sort((a, b) => a.t - b.t);
}

function sourceAt(frames, t) {
  let lo = 0;
  let hi = frames.length - 1;
  if (t <= frames[0].t) return frames[0];
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return frames[lo];
}

/** Frame through the virtual camera: scale about a focus point, sub-pixel resample from the 1.5× source. */
async function frameBuffer(file, cam, k = 1) {
  const s = cam.s;
  const W = Math.round(OUT_W * s);
  const H = Math.round(OUT_H * s);
  let img = sharp(file).resize(W, H, { kernel: 'lanczos3', fit: 'fill' });
  if (s > 1.0005) {
    const left = clamp(Math.round(cam.cx * k * s - OUT_W / 2), 0, W - OUT_W);
    const top = clamp(Math.round(cam.cy * k * s - OUT_H / 2), 0, H - OUT_H);
    img = img.extract({ left, top, width: OUT_W, height: OUT_H });
  }
  return img.removeAlpha().raw().toBuffer();
}

function blend(a, b, alpha) {
  const out = Buffer.allocUnsafe(a.length);
  const ia = 1 - alpha;
  for (let i = 0; i < a.length; i++) out[i] = a[i] * ia + b[i] * alpha;
  return out;
}

function schedule(shots) {
  let g = 0;
  return shots.map((s, i) => {
    const dur = s.t1 - s.t0;
    const entry = { ...s, g0: g, dur };
    g += dur - (i < shots.length - 1 ? XFADE : 0);
    return entry;
  });
}

function encoder(out, { crf = 20 } = {}) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${OUT_W}x${OUT_H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-tune', 'animation', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', out]);
  let err = '';
  ff.stderr.on('data', (d) => (err += d));
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}: ${err}`)))));
  const write = (buf) => (ff.stdin.write(buf) ? Promise.resolve() : new Promise((r) => ff.stdin.once('drain', r)));
  return { write, end: async () => { ff.stdin.end(); await done; } };
}

/**
 * Renders the kept shots, in order, through the camera, crossfaded, to H.264.
 * Returns the edit schedule so callers can map source moments to output time.
 */
export async function renderDemo({ frames: raw, shots, cameraAt, out, crf = 20, k = 1 }) {
  const frames = alignFrames(raw);
  const plan = schedule(shots.filter((s) => s.t1 > s.t0));
  const total = plan.length ? plan[plan.length - 1].g0 + plan[plan.length - 1].dur : 0;
  const enc = encoder(out, { crf });
  const cache = new Map();
  const render = async (shot, u) => {
    const t = shot.t0 + u;
    const src = sourceAt(frames, t);
    const cam = cameraAt(t);
    const key = `${src.file}|${cam.s.toFixed(4)}|${cam.cx.toFixed(1)}|${cam.cy.toFixed(1)}`;
    if (!cache.has(key)) {
      if (cache.size > 6) cache.delete(cache.keys().next().value);
      cache.set(key, await frameBuffer(src.file, cam, k));
    }
    return cache.get(key);
  };

  const n = Math.round(total * FPS);
  for (let i = 0; i < n; i++) {
    const g = i / FPS;
    const live = plan.filter((p) => g >= p.g0 && g < p.g0 + p.dur);
    if (live.length === 0) continue;
    if (live.length === 1) {
      await enc.write(await render(live[0], g - live[0].g0));
    } else {
      const [a, b] = live;
      const alpha = clamp((g - b.g0) / XFADE, 0, 1);
      await enc.write(blend(await render(a, g - a.g0), await render(b, g - b.g0), alpha));
    }
  }
  await enc.end();
  return { plan, total };
}

/** Maps a moment in the recording to its time in the edited video. */
export function outputTime(plan, t) {
  const s = plan.find((p) => t >= p.t0 && t <= p.t1);
  return s ? s.g0 + (t - s.t0) : null;
}

/** The card clip: a short excerpt, scaled down, faded in and out so the loop never jumps. */
export async function renderPreview({ demo, out, start, duration }) {
  const d = Math.min(duration, 8);
  const f = 0.35;
  await new Promise((res, rej) => {
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(start), '-t', String(d), '-i', demo,
      '-r', '30', '-vf', `scale=960:600:flags=lanczos,fade=t=in:st=0:d=${f}:color=0x0a0b0d,fade=t=out:st=${(d - f).toFixed(2)}:d=${f}:color=0x0a0b0d`,
      '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', out]);
    let err = '';
    ff.stderr.on('data', (x) => (err += x));
    ff.on('close', (c) => (c === 0 ? res() : rej(new Error(err))));
  });
  return d;
}

/** A single frame of the edit, as WebP. */
export async function renderPoster({ frames: raw, cameraAt, t, out, k = 1 }) {
  const frames = alignFrames(raw);
  const buf = await frameBuffer(sourceAt(frames, t).file, cameraAt(t), k);
  await sharp(buf, { raw: { width: OUT_W, height: OUT_H, channels: 3 } }).webp({ quality: 84 }).toFile(out);
  return { width: OUT_W, height: OUT_H };
}

export async function stillToWebp(png, out) {
  const meta = await sharp(png).metadata();
  await sharp(png).webp({ quality: 82 }).toFile(out);
  return { width: meta.width, height: meta.height };
}
