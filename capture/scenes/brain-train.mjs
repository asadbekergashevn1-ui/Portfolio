export default {
  id: 'brain-train',
  url: 'https://desktop-tutorial-eight-lovat.vercel.app/',
  viewport: { width: 960, height: 600 },
  allowHosts: ['desktop-tutorial-eight-lovat.vercel.app'],
  outputs: [{ slug: 'brain-train', preview: 'colour', poster: 'poster', posterStill: 'colour', shows: 'The mascot welcome, choosing an age, the whole app re-theming as colours are picked, and choosing subjects.' }],
  async run(d, page) {
    const go = (t) => d.click(page.getByText(t, { exact: false }).last(), { ms: 600, after: 700 });
    await d.shot('welcome', async () => {
      await d.wait(1400);
      await go('Davom etish');
      await go('Ok, boshladik');
    });
    await d.shot('about-you', async () => {
      await d.type(page.locator('input').first(), 'Aziz', { delay: 110 });
      await go('Davom etish');
      await d.click(page.getByText('8 - 12 yosh').first(), { after: 600 });
      await go('Davom etish');
    });
    await d.shot('colour', async () => {
      for (const [i, c] of ['Binafsha', 'Apelsin', 'Yashil', 'Pushti'].entries()) {
        await d.click(page.getByText(c, { exact: true }).first(), { ms: 520, after: 820 });
        if (i === 1) d.mark('poster');
      }
    });
    await d.still('colour', { alt: 'Brain Train colour picker re-theming the app', caption: 'The chosen colour re-themes every screen that follows' });
    await d.shot('subjects', async () => {
      await go('Davom etish');
      for (const s of ['Matematika', 'Ingliz tili', 'Tasviriy']) await d.click(page.getByText(s, { exact: false }).first(), { ms: 520, after: 520 });
      await d.wait(600);
    });
    await d.still('subjects', { alt: 'Brain Train subject choice', caption: 'Subjects, multi-select, in the child’s chosen colour' });
  },
};
