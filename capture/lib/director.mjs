import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * A visible pointer, injected before every page loads. It is an indicator of
 * where the real Playwright mouse is — the same thing a screen recorder draws —
 * and never part of the product UI. It is hidden for still screenshots.
 */
export const CURSOR_SCRIPT = `(() => {
  if (window.__cursor) return; window.__cursor = true;
  const mount = () => {
    const c = document.createElement('div');
    c.id = '__cap_cursor';
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 3.2v17.4l4.6-4.4 3 6.6 3.3-1.5-3-6.4 6.3-.4L5 3.2Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: 'fixed', left: '0', top: '0', width: '26px', height: '26px', zIndex: 2147483647, pointerEvents: 'none', transform: 'translate(720px,450px)', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.35))', transition: 'opacity .2s' });
    document.documentElement.appendChild(c);
    const ring = (x, y) => {
      const r = document.createElement('div');
      Object.assign(r.style, { position: 'fixed', left: x - 18 + 'px', top: y - 18 + 'px', width: '36px', height: '36px', borderRadius: '50%', border: '2.5px solid rgba(216,181,95,.95)', background: 'rgba(216,181,95,.18)', zIndex: 2147483646, pointerEvents: 'none', transform: 'scale(.35)', opacity: '1', transition: 'transform .45s cubic-bezier(.2,.8,.2,1), opacity .45s ease' });
      document.documentElement.appendChild(r);
      requestAnimationFrame(() => { r.style.transform = 'scale(1.25)'; r.style.opacity = '0'; });
      setTimeout(() => r.remove(), 520);
    };
    addEventListener('mousemove', (e) => { c.style.transform = 'translate(' + (e.clientX - 5) + 'px,' + (e.clientY - 3) + 'px)'; }, true);
    addEventListener('mousedown', (e) => { ring(e.clientX, e.clientY); c.style.transform += ' scale(.88)'; }, true);
    addEventListener('mouseup', (e) => { c.style.transform = 'translate(' + (e.clientX - 5) + 'px,' + (e.clientY - 3) + 'px)'; }, true);
  };
  if (document.documentElement) mount(); else addEventListener('DOMContentLoaded', mount);
})();`;

/**
 * Directs one recording. Everything inside `shot()` is kept; everything between
 * shots — jumping to the next section, waiting for it to settle, loading data —
 * happens off camera and is cut. That is how a long page becomes a tight edit of
 * its best moments with nothing boring left in.
 */
export class Director {
  constructor(page, { width, height, dir }) {
    this.page = page;
    this.w = width;
    this.h = height;
    this.dir = dir;
    this.pos = { x: width / 2, y: height / 2 };
    this.shots = [];
    this.camera = [{ t: 0, s: 1, cx: width / 2, cy: height / 2 }];
    this.marks = {};
    this.stills = [];
  }

  now() {
    return Date.now() / 1000;
  }

  async wait(ms) {
    await sleep(ms);
  }

  // ── pointer ───────────────────────────────────────────────
  async move(x, y, ms = 650) {
    const from = { ...this.pos };
    const dx = x - from.x;
    const dy = y - from.y;
    const dist = Math.hypot(dx, dy) || 1;
    const bow = Math.min(70, dist * 0.14); // a slight arc, the way a hand moves
    const cx = from.x + dx / 2 + (-dy / dist) * bow;
    const cy = from.y + dy / 2 + (dx / dist) * bow;
    const start = performance.now();
    for (;;) {
      const p = Math.min(1, (performance.now() - start) / ms);
      const t = easeInOut(p);
      await this.page.mouse.move((1 - t) ** 2 * from.x + 2 * (1 - t) * t * cx + t * t * x, (1 - t) ** 2 * from.y + 2 * (1 - t) * t * cy + t * t * y);
      if (p >= 1) break;
      await sleep(12);
    }
    this.pos = { x, y };
  }

  /** Scroll-only shots: a pointer drifting over a passive screen is noise, so it fades out. */
  async hideCursor() {
    await this.page.evaluate(() => { const c = document.getElementById('__cap_cursor'); if (c) c.style.opacity = '0'; });
  }

  async showCursor() {
    await this.page.evaluate(() => { const c = document.getElementById('__cap_cursor'); if (c) c.style.opacity = '1'; });
  }

  async box(target) {
    const loc = typeof target === 'string' ? this.page.locator(target).first() : target;
    const b = await loc.boundingBox();
    if (!b) throw new Error(`not visible: ${target}`);
    return b;
  }

  async moveTo(target, { ms = 650, dx = 0, dy = 0 } = {}) {
    const b = await this.box(target);
    await this.move(b.x + b.width / 2 + dx, b.y + b.height / 2 + dy, ms);
  }

  /**
   * Hover → press → result. The pointer lands near the control's trailing edge, so
   * the arrow (which extends down-right from its tip) never covers the label or the
   * number the click produces. Large targets — cards, panels — are hit in the middle.
   */
  async click(target, { ms = 650, after = 350, dx, dy, hover = 230 } = {}) {
    const b = await this.box(target);
    const big = b.width > 420 || b.height > 160;
    const x = big ? b.x + b.width / 2 : b.x + b.width - Math.min(24, b.width * 0.2);
    const y = big ? b.y + b.height / 2 : b.y + b.height * 0.64;
    await this.move(x + (dx ?? 0), y + (dy ?? 0), ms);
    await sleep(hover);
    await this.page.mouse.down();
    await sleep(90);
    await this.page.mouse.up();
    await sleep(after);
  }

  async type(target, text, { delay = 62, after = 300 } = {}) {
    await this.click(target, { after: 160 });
    await this.page.keyboard.type(text, { delay });
    await sleep(after);
  }

  /** Real wheel events, eased, so the site's own smooth-scrolling and scroll triggers respond. */
  async wheel(dy, ms = 1800) {
    // time-driven: however slow each wheel call is on a heavy page, the scroll lasts `ms`
    let sent = 0;
    const start = performance.now();
    for (;;) {
      const p = Math.min(1, (performance.now() - start) / ms);
      const target = dy * easeInOut(p);
      if (Math.abs(target - sent) >= 1) { await this.page.mouse.wheel(0, target - sent); sent = target; }
      if (p >= 1) break;
      await sleep(14);
    }
    await sleep(250);
  }

  /** Off camera only: put an element at the top of the viewport and let it settle. */
  async jump(target, { offset = 0, settle = 900 } = {}) {
    const loc = typeof target === 'string' ? this.page.locator(target).first() : target;
    await loc.evaluate((e, off) => {
      const y = e.getBoundingClientRect().top + scrollY - off;
      window.scrollTo({ top: y, behavior: 'instant' });
      if (window.lenis?.scrollTo) window.lenis.scrollTo(y, { immediate: true });
    }, offset);
    await sleep(settle);
  }

  // ── camera ────────────────────────────────────────────────
  /** Push in on a region. Sharpness holds up to 1.5× because frames are captured at 1.5× DPR. */
  async focus(target, { scale = 1.35, ms = 950, hold = 0 } = {}) {
    const b = typeof target === 'object' && 'x' in target && 'width' in target ? target : await this.box(target);
    const s = Math.min(1.5, scale);
    const halfW = this.w / (2 * s);
    const halfH = this.h / (2 * s);
    const cx = Math.min(this.w - halfW, Math.max(halfW, b.x + b.width / 2));
    const cy = Math.min(this.h - halfH, Math.max(halfH, b.y + b.height / 2));
    const last = this.camera[this.camera.length - 1];
    const t = this.now();
    this.camera.push({ t, s: last.s, cx: last.cx, cy: last.cy }, { t: t + ms / 1000, s, cx, cy });
    await sleep(ms + hold);
  }

  async unfocus({ ms = 850 } = {}) {
    const last = this.camera[this.camera.length - 1];
    const t = this.now();
    this.camera.push({ t, s: last.s, cx: last.cx, cy: last.cy }, { t: t + ms / 1000, s: 1, cx: this.w / 2, cy: this.h / 2 });
    await sleep(ms);
  }

  // ── editing ───────────────────────────────────────────────
  async shot(name, fn) {
    const s = { name, t0: this.now(), t1: 0 };
    this.shots.push(s);
    await fn();
    s.t1 = this.now();
    return s;
  }

  /** Remember this instant, e.g. the poster frame. Must fall inside a shot. */
  mark(name) {
    this.marks[name] = this.now();
  }

  /** A still for the case-study gallery. Taken off camera, pointer hidden. */
  async still(name, { alt, caption, fullPage = false } = {}) {
    const was = await this.page.evaluate(() => { const c = document.getElementById('__cap_cursor'); const o = c?.style.opacity ?? '1'; if (c) c.style.opacity = '0'; return o; });
    await sleep(240);
    const file = join(this.dir, `still-${name}.png`);
    writeFileSync(file, await this.page.screenshot({ type: 'png', fullPage }));
    await this.page.evaluate((o) => { const c = document.getElementById('__cap_cursor'); if (c) c.style.opacity = o; }, was);
    this.stills.push({ name, file, alt, caption });
  }

  cameraAt(t) {
    const k = this.camera;
    if (t <= k[0].t) return k[0];
    for (let i = 1; i < k.length; i++) {
      if (t <= k[i].t) {
        const a = k[i - 1];
        const b = k[i];
        const span = b.t - a.t;
        if (span <= 0) return b;
        const e = easeInOut((t - a.t) / span);
        return { s: a.s + (b.s - a.s) * e, cx: a.cx + (b.cx - a.cx) * e, cy: a.cy + (b.cy - a.cy) * e };
      }
    }
    return k[k.length - 1];
  }
}
