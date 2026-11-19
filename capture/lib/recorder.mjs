import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Records the page through the Chrome DevTools screencast: one JPEG per painted
 * frame (≈60 fps while things move, nothing while the page is still) at the
 * context's device pixel ratio. Frames carry the compositor timestamp, which the
 * renderer uses to hold each frame exactly as long as it was on screen.
 */
export async function startRecording(page, dir, { width, height, quality = 90 }) {
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  let i = 0;
  cdp.on('Page.screencastFrame', (f) => {
    const name = `f${String(i++).padStart(6, '0')}.jpg`;
    writeFileSync(join(dir, name), Buffer.from(f.data, 'base64'));
    frames.push({ file: join(dir, name), t: f.metadata.timestamp, arrival: Date.now() / 1000 });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality, maxWidth: width, maxHeight: height, everyNthFrame: 1 });
  return {
    frames,
    async stop() {
      await cdp.send('Page.stopScreencast').catch(() => {});
      await cdp.detach().catch(() => {});
      return Date.now() / 1000;
    },
  };
}
