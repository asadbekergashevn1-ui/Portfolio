export default {
  id: 'jony-kids-english',
  url: 'https://jonykids.uz/',
  allowHosts: ['jonykids.uz', 'www.jonykids.uz'],
  // parent reviews are real people's chat screenshots: blurred, and never framed
  redact: ['#sharhlar img', '#jkRiver img', '#rvLightbox img'],
  notes: ['Parent review screenshots are blurred during capture and kept out of frame.', 'The sign-up form is filled with sample values and never submitted; all writes were blocked.'],
  outputs: [{ slug: 'jony-kids-english', preview: 'hero', poster: 'poster', posterStill: 'hero', shows: 'The hero, the course cards, the results carousel, the price plans and the sign-up modal — filled, never sent.' }],
  async run(d, page) {
    await d.shot('hero', async () => {
      await d.wait(700);
      d.mark('poster');
      await d.moveTo(page.getByText('Bepul sinov darsiga yozilish', { exact: false }).first(), { ms: 900, dx: 70 });
      await d.wait(1600);
    });
    await d.jump('#kurslar', { offset: 40, settle: 1300 });
    const ctas = page.locator('#kurslar a:visible, #kurslar button:visible');
    const nc = Math.min(3, await ctas.count());
    if (nc) await d.shot('courses', async () => {
      for (let i = 0; i < nc; i++) { await d.moveTo(ctas.nth(i), { ms: 640, dx: 40 }); await d.wait(650); }
    });
    await d.jump('#carTrack', { offset: 230, settle: 1200 });
    await d.shot('results', async () => {
      await d.hideCursor();
      await d.wait(2600);
      await d.showCursor();
    });
    await d.jump('#plansGrid', { offset: 150, settle: 1300 });
    await d.shot('pricing', async () => {
      const plans = page.locator('#plansGrid > *');
      const n = Math.min(3, await plans.count());
      for (let i = 0; i < n; i++) { await d.moveTo(plans.nth(i), { ms: 600, dy: -40 }); await d.wait(500); }
      if (n >= 2) await d.focus(plans.nth(1), { scale: 1.25, ms: 900, hold: 900 });
      await d.unfocus({ ms: 800 });
    });
    await d.still('pricing', { alt: 'Jony Kids English price plans', caption: 'Three plans and the bonuses that come with them' });
    await d.jump('#ariza', { offset: 0, settle: 900 });
    await d.shot('form', async () => {
      const f = page.locator('#ariza');
      await d.type(f.locator('[name="name"]').first(), 'Aziz', { delay: 80, after: 150 });
      await d.focus(f.locator('form').first(), { scale: 1.3, ms: 900, hold: 900 });
    });
    await d.still('form', { alt: 'Jony Kids English free trial lesson sign-up', caption: 'The sign-up that writes to the database and pings staff on Telegram' });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await d.wait(900);
    await d.still('hero', { alt: 'Jony Kids English home page hero', caption: 'The landing page on jonykids.uz' });
  },
};
