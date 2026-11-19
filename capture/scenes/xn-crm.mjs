/**
 * XN CRM, recorded from the real application running locally against a throwaway
 * database seeded with invented demo data (no real school, student or payment).
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
  ],
  outputs: [{ slug: 'xn-crm', preview: 'groups', poster: 'poster', posterStill: 'finance', shows: 'A quick tour: the director’s dashboard, groups, students, finance and debts, the weekly timetable, attendance, cash flow and analytics.' }],
  async prepare(page) {
    page.setDefaultTimeout(10000);
    await page.getByText(/Use another login|Boshqa login/).click();
    await page.locator('input:visible:not([type=radio])').first().fill('director@jony.demo.xn.uz');
    // the local demo seed's password (DEMO_PASSWORD when seeding); never a real account
    if (!process.env.XN_DEMO_PASSWORD) throw new Error('set XN_DEMO_PASSWORD to the local demo seed password');
    await page.locator('input[type=password]').fill(process.env.XN_DEMO_PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForURL((u) => !/login/.test(u.pathname));
    await page.waitForTimeout(1200);
    if (/select-branch/.test(page.url())) await page.getByText('Barcha filiallar').first().click();
    await page.waitForTimeout(2200);
  },
  async run(d, page) {
    // A brisk tour of the main areas: a few seconds each, no long flows.
    await d.shot('dashboard', async () => {
      await d.wait(400);
      await d.focus(page.locator('main div').filter({ hasText: 'Haqiqiy tushum' }).filter({ hasText: 'Davomat foizi' }).last(), { scale: 1.22, ms: 900, hold: 500 });
      await d.unfocus({ ms: 700 });
    });
    await go(page, '/groups');
    await d.shot('groups', async () => {
      const rows = page.locator('main tbody tr');
      await d.moveTo(rows.nth(1), { ms: 600, dx: -200 });
      await d.moveTo(rows.nth(5), { ms: 900, dx: 80 });
      await d.wait(400);
    });
    await d.still('groups', { alt: 'XN CRM groups list with course, teacher and how full each group is', caption: 'Every group: course, teacher, room and how full it is' });
    await go(page, '/students');
    await d.shot('students', async () => {
      await d.hideCursor();
      await d.wheel(360, 1400);
      await d.wait(500);
    });
    await go(page, '/finance');
    await d.shot('finance', async () => {
      d.mark('poster');
      await d.focus(page.locator('main div').filter({ hasText: 'Eng katta qarzlar' }).filter({ hasText: 'Barchasini' }).last(), { scale: 1.2, ms: 900, hold: 700 });
      await d.unfocus({ ms: 700 });
    });
    await d.still('finance', { alt: 'XN CRM finance page with the largest debts and the month’s income', caption: 'Largest debts, the cash drawer and the month’s figures on one page' });
    await go(page, '/schedule');
    await d.shot('schedule', async () => {
      await d.focus(page.getByText(/^pa$/i).first().locator('xpath=..'), { scale: 1.35, ms: 1000, hold: 500 });
      await d.unfocus({ ms: 700 });
    });
    await d.still('schedule', { alt: 'XN CRM weekly timetable: every group, teacher and room', caption: 'The week at a glance — 24 lessons, no double-booked rooms' });
    await go(page, '/reports/attendance');
    await d.shot('attendance', async () => {
      await d.wheel(300, 1300);
      await d.wait(500);
    });
    await d.still('attendance', { alt: 'XN CRM attendance report: present, late and absent by day', caption: 'Attendance by day, group and student' });
    await go(page, '/reports?tab=cashFlow');
    await d.shot('cashflow', async () => {
      await d.wait(400);
      await d.wheel(340, 1400);
      await d.wait(600);
    });
    await d.still('cashflow', { alt: 'XN CRM cash flow report with daily income and running balance', caption: 'Cash flow, day by day' });
    await go(page, '/analytics');
    await d.shot('analytics', async () => {
      await d.wait(1600);
      await d.showCursor();
    });
  },
};
