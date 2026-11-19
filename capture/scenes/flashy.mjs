const nav = (page, re) => page.locator('aside, nav').getByText(re).first();
const DEF = {
  ambitious: 'having a strong desire',
  meticulous: 'great attention to detail',
  resilient: 'recover quickly',
  candid: 'truthful and straightforward',
  pragmatic: 'sensibly and realistically',
};
async function answerQuiz(page, d, { onCamera, wrongOn = -1, count = 5 }) {
  for (let q = 0; q < count; q++) {
    const word = (await page.locator('main').innerText()).match(/\b(ambitious|meticulous|resilient|candid|pragmatic)\b/)?.[1];
    const opts = page.locator('main button').filter({ hasNotText: /^(Chiqish|Keyingi)$/ }).filter({ hasText: /[a-z]{4,}/ });
    let target = word ? opts.filter({ hasText: DEF[word] }).first() : opts.first();
    if (q === wrongOn) target = opts.filter({ hasNotText: DEF[word] ?? '§' }).first();
    if (onCamera) await d.click(target, { ms: 620, after: 900 });
    else await target.click();
    const next = page.locator('main button', { hasText: 'Keyingi' });
    if (await next.count()) { if (onCamera) await d.click(next, { ms: 500, after: 600 }); else await next.click(); }
    else break;
    await page.waitForTimeout(onCamera ? 200 : 250);
  }
  // the last answer ends on "Sessiya tugadi!"; pressing it is what records the attempt
  if (!onCamera) {
    const done = page.locator('main button', { hasText: 'Sessiya tugadi' });
    if (await done.count()) await done.first().click();
    await page.waitForTimeout(400);
  }
}
export default {
  id: 'flashy',
  url: 'https://flashy-tan.vercel.app/import',
  viewport: { width: 1280, height: 800 },
  allowHosts: ['flashy-tan.vercel.app'],
  notes: ['Seeded with FLASHY’s own built-in sample set through the real import screen. The statistics shown come from flashcard and quiz sessions actually run in the app before recording.'],
  outputs: [{ slug: 'flashy', preview: 'flashcards', poster: 'poster', posterStill: 'dashboard', shows: 'A dashboard filled by real study sessions, a flashcard round with self-rating, a multiple-choice test with feedback, and progress.' }],
  async prepare(page) {
    page.setDefaultTimeout(8000);
    await page.getByText('Namuna yuklash').click();
    await page.waitForTimeout(400);
    await page.locator('button', { hasText: 'import qilish' }).last().click();
    await page.waitForTimeout(900);
    // a real study session and a real test, so the dashboard has something true to show
    await page.goto('https://flashy-tan.vercel.app/learn', { waitUntil: 'networkidle' });
    await page.getByText('Example set').first().click();
    await page.getByText('Ta’riflar', { exact: true }).first().click();
    await page.getByText('Flashkartalar', { exact: true }).first().click();
    for (let i = 0; i < 5; i++) {
      const show = page.locator('main button', { hasText: 'Javobni ko‘rsatish' });
      if (!(await show.count())) break;
      await show.click();
      await page.locator('main button', { hasText: i % 3 === 1 ? 'Mashq kerak' : 'Bilardim' }).click();
      await page.waitForTimeout(250);
    }
    await page.goto('https://flashy-tan.vercel.app/tests', { waitUntil: 'networkidle' });
    await page.getByText('Variantli test').first().click();
    await page.waitForTimeout(500);
    await answerQuiz(page, null, { onCamera: false, wrongOn: 3 });
    await page.goto('https://flashy-tan.vercel.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
  },
  async run(d, page) {
    await d.shot('dashboard', async () => {
      await d.wait(700);
      d.mark('poster');
      await d.focus(page.locator('main').first(), { scale: 1.12, ms: 1400, hold: 300 });
      await d.unfocus({ ms: 900 });
    });
    await d.still('dashboard', { alt: 'FLASHY dashboard after real study sessions', caption: 'The dashboard after one flashcard round and one test' });
    await d.shot('flashcards', async () => {
      await d.click(page.locator('main').getByText(/rganishni boshlash/).first(), { ms: 750, after: 650 });
      await d.click(page.getByText('Example set').first(), { after: 500 });
      await d.click(page.getByText('Ta’riflar', { exact: true }).first(), { after: 500 });
      await d.click(page.getByText('Flashkartalar', { exact: true }).first(), { after: 700 });
      for (let i = 0; i < 2; i++) {
        await d.click(page.locator('main button', { hasText: 'Javobni ko‘rsatish' }), { after: 1000 });
        await d.click(page.locator('main button', { hasText: i === 0 ? 'Bilardim' : 'Mashq kerak' }), { after: 600 });
      }
    });
    await d.still('flashcard', { alt: 'A FLASHY flashcard', caption: 'Recall first, then reveal and rate yourself' });
    await d.shot('quiz', async () => {
      await d.click(page.locator('main button', { hasText: 'Chiqish' }), { after: 500 }).catch(() => {});
      await d.click(nav(page, /^Mashq testlari$/), { after: 600 });
      await d.click(page.getByText('Variantli test').first(), { after: 700 });
      await answerQuiz(page, d, { onCamera: true, wrongOn: 1, count: 2 });
    });
    await d.shot('progress', async () => {
      await d.click(page.locator('main button', { hasText: 'Chiqish' }), { after: 400 }).catch(() => {});
      await d.click(nav(page, /^Progress$/), { after: 700 });
      await d.hideCursor();
      await d.focus(page.locator('main section, main [class*="card"]').nth(1), { scale: 1.2, ms: 1100, hold: 1000 });
      await d.unfocus({ ms: 800 });
    });
    await d.still('progress', { alt: 'FLASHY progress and statistics', caption: 'Accuracy and word states, computed from real activity' });
  },
};
