/**
 * XN CRM, recorded from the real application running locally against a throwaway
 * database seeded with invented demo data (no real school, student or payment).
 * The payment taken on camera is real application behaviour against that demo data.
 */
const go = async (page, href) => {
  await page.evaluate((h) => { history.pushState({}, '', h); dispatchEvent(new PopStateEvent('popstate')); }, href);
  await page.waitForTimeout(1600);
};
export default {
  id: 'xn-crm',
  url: 'http://localhost:5173/login',
  viewport: { width: 1440, height: 900 },
  allowHosts: ['localhost:5173'],
  localWrites: true,
  notes: [
    'Recorded from the real application running locally against a throwaway database. Every school, student, family and phone number on screen is invented demo data.',
    'The payment taken on camera is processed by the real application — against that demo database, never production.',
  ],
  outputs: [{ slug: 'xn-crm', preview: 'payment', poster: 'poster', posterStill: 'finance', shows: 'The director’s dashboard, groups filling up, a debt collected from the largest debtor and the books updating, the weekly timetable and cash flow.' }],
  async prepare(page) {
    page.setDefaultTimeout(10000);
    await page.getByText(/Use another login|Boshqa login/).click();
    await page.locator('input:visible:not([type=radio])').first().fill('director@jony.demo.xn.uz');
    await page.locator('input[type=password]').fill('DemoPass-2026');
    await page.keyboard.press('Enter');
    await page.waitForURL((u) => !/login/.test(u.pathname));
    await page.waitForTimeout(1200);
    if (/select-branch/.test(page.url())) await page.getByText('Barcha filiallar').first().click();
    await page.waitForTimeout(2200);
  },
  async run(d, page) {
    await d.shot('dashboard', async () => {
      await d.wait(600);
      await d.focus(page.locator('main div').filter({ hasText: 'Haqiqiy tushum' }).filter({ hasText: 'Davomat foizi' }).last(), { scale: 1.28, ms: 1100, hold: 1300 });
      await d.unfocus({ ms: 800 });
    });
    await go(page, '/groups');
    await d.shot('groups', async () => {
      const rows = page.locator('main tbody tr');
      await d.moveTo(rows.nth(1), { ms: 700, dx: -200 });
      await d.wait(300);
      await d.moveTo(rows.nth(4), { ms: 900, dx: 60 });
      await d.wait(400);
      await d.moveTo(rows.nth(6), { ms: 700, dx: 120 });
      await d.wait(500);
    });
    await d.still('groups', { alt: 'XN CRM groups list with course, teacher and how full each group is', caption: 'Every group: course, teacher, room and how full it is' });
    await go(page, '/finance');
    await d.shot('payment', async () => {
      const debtors = page.locator('main div').filter({ hasText: 'Eng katta qarzlar' }).filter({ hasText: 'Barchasini' }).last();
      await d.focus(debtors, { scale: 1.22, ms: 1000, hold: 700 });
      await d.unfocus({ ms: 700 });
      d.mark('poster');
      await d.click(page.locator('button', { hasText: 'To‘lov qilish' }).first(), { ms: 700, after: 700 });
      // click into the text, not on the combobox's chevron at its trailing edge
      const who = page.getByPlaceholder(/Talaba ismi/);
      await d.click(who, { ms: 600, after: 150, dx: -230 });
      await who.focus();
      d.events.push({ t: d.now(), type: 'type', n: 15, dur: 15 * 0.055 });
      await page.keyboard.type('Ergashev Kamron', { delay: 55 });
      await d.wait(1000);
      const option = page.getByRole('option', { name: /Ergashev Kamron/ });
      // the pointer rests on the match; the pick itself is made from the keyboard, which this
      // combobox handles reliably (a synthetic mouse click on an option did not select it)
      if (await option.count()) await d.moveTo(option.first(), { ms: 500, dx: -60 });
      await d.wait(250);
      await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
      await d.wait(500);
      await d.wait(700); // the dialog settles after a student is picked
      await d.click(page.locator('button', { hasText: 'Davom etish' }).last(), { ms: 600, after: 1300 });
      await d.click(page.locator('label', { hasText: /^\s*Karta\s*$/ }).first(), { ms: 700, after: 600 });
      await d.click(page.locator('button[type=submit]', { hasText: 'Davom etish' }), { ms: 700, after: 1300 });
      await d.click(page.locator('button', { hasText: 'Tasdiqlash va qabul qilish' }), { ms: 700, after: 1800 });
      await d.focus(page.getByText('Hozirgi qarz').locator('xpath=ancestor::div[1]'), { scale: 1.3, ms: 1000, hold: 1200 });
      await d.unfocus({ ms: 700 });
    });
    await d.still('finance', { alt: 'XN CRM finance page with the largest debts and the month’s income', caption: 'Largest debts, the cash drawer and the month’s figures on one page' });
    await go(page, '/schedule');
    await d.shot('schedule', async () => {
      await d.hideCursor();
      await d.focus(page.getByText(/^pa$/i).first().locator('xpath=..'), { scale: 1.4, ms: 1300, hold: 900 });
      await d.unfocus({ ms: 900 });
    });
    await d.still('schedule', { alt: 'XN CRM weekly timetable: every group, teacher and room', caption: 'The week at a glance — 24 lessons, no double-booked rooms' });
    await go(page, '/reports?tab=cashFlow');
    await d.shot('cashflow', async () => {
      await d.wait(700);
      await d.wheel(380, 1700);
      await d.wait(900);
      await d.showCursor();
    });
    await d.still('cashflow', { alt: 'XN CRM cash flow report with daily income and running balance', caption: 'Cash flow, day by day' });
  },
};
