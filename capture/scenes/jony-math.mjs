export default {
  id: 'jony-math',
  url: 'https://jony-math-bepul-kurs.vercel.app/',
  viewport: { width: 1280, height: 800 },
  allowHosts: ['jony-math-bepul-kurs.vercel.app'],
  notes: ['The sign-up form is filled with sample values and never submitted; all writes were blocked.'],
  outputs: [{ slug: 'jony-math', preview: 'table', poster: 'poster', shows: 'The interactive multiplication table in the hero, the ten outcomes, the four-week plan and the sign-up form.' }],
  async run(d, page) {
    await d.shot('table', async () => {
      // the hero's table is live: each cell is a button and the equation below it answers
      await d.wait(500);
      await d.focus('.table-card', { scale: 1.22, ms: 1000 });
      for (const [j, [r, c]] of [[6, 7], [9, 8], [4, 6]].entries()) {
        await d.click(page.locator(`.table-card [data-r="${r}"][data-c="${c}"]`), { ms: 620, after: 800 });
        if (j === 1) d.mark('poster');
      }
      await d.unfocus({ ms: 800 });
    });
    await d.still('table', { alt: 'Jony Math hero with the interactive multiplication table', caption: 'The hero is a working multiplication table' });
    await d.jump('#natija', { offset: 560, settle: 800 });
    await d.shot('outcomes', async () => {
      await d.hideCursor();
      await d.wheel(620, 1500);
      await d.wait(1300);
    });
    await d.still('outcomes', { alt: 'Ten things the child will be able to do', caption: 'Ten concrete outcomes, not a syllabus' });
    await d.jump('#weeks', { offset: 150, settle: 1100 });
    await d.shot('weeks', async () => {
      await d.wheel(420, 1600);
      await d.wait(900);
      await d.showCursor();
    });
    await d.jump('#yozilish', { offset: 20, settle: 900 });
    await d.shot('form', async () => {
      const f = page.locator('#form, #yozilish form').first();
      await d.type(f.locator('[name="parent"]'), 'Dilnoza', { delay: 80, after: 150 });
      await d.focus(f, { scale: 1.25, ms: 900, hold: 900 });
    });
  },
};
