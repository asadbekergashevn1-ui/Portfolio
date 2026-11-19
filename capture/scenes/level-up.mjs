export default {
  id: 'level-up',
  url: 'https://lu-demo-nine.vercel.app/',
  allowHosts: ['lu-demo-nine.vercel.app'],
  outputs: [{ slug: 'level-up', preview: 'hero', poster: 'poster', shows: 'The pinned hero panels, the results counting up beside the radar, the 3D result-card stack and the growth path.' }],
  async run(d, page) {
    await d.hideCursor();
    await d.shot('hero', async () => {
      await d.wait(900);
      d.mark('poster');
      await d.wait(500);
      await d.wheel(2600, 4600);
      await d.wait(300);
    });
    await d.jump('#natijalar', { offset: 520, settle: 900 });
    await d.shot('results', async () => {
      await d.wheel(560, 1400);
      await d.wait(1900);
    });
    await d.still('results', { alt: 'LEVEL UP results section with counters and radar', caption: 'Results count up as they arrive on screen' });
    await d.jump('#natija-egalari', { offset: -40, settle: 1200 });
    await d.shot('cards', async () => {
      await d.showCursor();
      const card = page.getByRole('button', { name: /Bekzod|Malika|Diyor/ }).first();
      await d.click(card, { ms: 800, after: 1600 });
      await d.hideCursor();
    });
    await d.still('cards', { alt: 'LEVEL UP student result cards', caption: 'Student results as a rotating card stack' });
    // the card opens a modal; a clean reload off camera guarantees the next shot starts unobstructed
    await page.reload({ waitUntil: 'networkidle' });
    await d.hideCursor();
    await d.jump('#osish', { offset: 0, settle: 900 });
    await d.shot('growth', async () => {
      await d.wheel(2400, 4400);
      await d.wait(400);
    });
  },
};
