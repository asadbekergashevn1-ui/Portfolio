import type { Project } from './types';

/**
 * The work. Figures here were measured from the repositories — lines of code,
 * migrations, policies — never estimated. If a number cannot be verified it is
 * left out rather than rounded up.
 */
export const projects: Project[] = [
  {
    slug: 'xn-crm',
    name: 'XN CRM',
    tagline: 'A multi-tenant platform that runs a school end to end',
    category: 'crm',
    status: 'live',
    year: '2026',
    order: 1,
    featured: true,
    role: 'Architecture, backend and frontend',
    client: 'Private education centre, Termiz',
    summary:
      'Enrolment, attendance, monthly billing, payroll, leads and audit for a multi-branch education centre, replacing the spreadsheets an owner was running it all on.',
    problem:
      'The centre had grown to several branches. Fees lived in spreadsheets, attendance on paper, and teacher pay was recalculated by hand every month. Nobody could say who owed what without losing an afternoon, and every branch kept its own version of the truth.',
    approach:
      'I modelled the business before writing a single endpoint: organisation, sub-centre, branch, and a membership edge for every person. Tenant isolation is enforced three times over — a guard that resolves the tenant from the request against the database, a filter in every query, and composite foreign keys with check constraints so the database itself refuses a cross-tenant row.',
    outcome:
      'Running in production on self-hosted infrastructure, deployed on every push to main behind a CI gate of lint, typecheck, unit and end-to-end tests. A written backup runbook with a monthly restore drill backs it, and the deploy script backs up first and refuses to continue if that backup fails.',
    features: [
      { title: 'Gap-free invoicing', detail: 'Invoice numbers draw from a row-locked counter rather than a sequence, because sequences leave gaps on rollback and gaps in invoice numbers are an audit problem.' },
      { title: 'Billing engine', detail: 'Monthly course fees generate on each centre’s own payment day, with deferrals, refunds and a debtor work queue.' },
      { title: 'Cashier shifts', detail: 'One open session per cashier, enforced by a partial unique index rather than application logic a second tab can race.' },
      { title: 'Payroll and HR', detail: 'Teacher pay by lesson days, fines, balance adjustments and closing runs, with positions and departments.' },
      { title: 'Geo-verified attendance', detail: 'Staff check in and out on location, with lateness rules and penalties derived from the schedule.' },
      { title: 'Separate students app', detail: 'Students and parents use their own progressive web app that can only reach a narrow portal API — eleven screens, never the staff console.' },
      { title: 'Notifications that degrade', detail: 'A Redis queue carries delivery with retries and falls back in-process when Redis is absent. Telegram linking by one-time code, webhook guarded by a secret.' },
      { title: 'Append-only audit', detail: 'A database trigger records every change that touches money; the log cannot be rewritten from the application.' },
    ],
    stack: [
      { group: 'Backend', items: ['NestJS 11', 'Express 5', 'TypeScript', 'Prisma 6'] },
      { group: 'Data', items: ['PostgreSQL 17', 'Redis 7', 'BullMQ'] },
      { group: 'Frontend', items: ['Vue 3.5', 'Vite', 'Pinia', 'TanStack Query', 'Tailwind 4'] },
      { group: 'Operations', items: ['Docker', 'pm2 + nginx', 'GitHub Actions'] },
    ],
    metrics: [
      { value: '175k', label: 'lines of code' },
      { value: '125', label: 'data models' },
      { value: '78', label: 'migrations', note: 'Sept to Nov 2026' },
      { value: '110', label: 'permissions' },
    ],
    links: [
      { label: 'Private repository', href: '#', kind: 'repo', access: 'private', note: 'Source is private; walkthrough available on request.' },
    ],
    media: { poster: null, video: null, screenshots: [], captureBlocker: 'Self-hosted behind a tunnel; needs a seeded demo tenant before capture.' },
  },

  {
    slug: 'jony-kids-english',
    name: 'Jony Kids English',
    tagline: 'A live site that turns traffic into tracked leads',
    category: 'websites',
    status: 'live',
    year: '2026',
    order: 2,
    featured: true,
    role: 'Design, build and operations',
    client: 'Jony Kids English, Termiz',
    summary:
      'A marketing site for a children’s English school, with a built-in admin panel that works the leads it captures through to a sale.',
    problem:
      'Instagram and Telegram traffic arrived as chat messages and got lost. There was no record of who had been called, who was thinking it over, and who had bought.',
    approach:
      'One hand-written static page — no framework, no build step — so it loads fast on the mid-range Android phones the audience actually uses. Every lead is written to two places at once: a database row and an instant Telegram message to the staff who answer. Behind a login sits a small CRM that moves each lead through a pipeline.',
    outcome:
      'Live on its own domain with 72 production deploys and counting, and the most actively maintained project in this portfolio.',
    features: [
      { title: 'Dual-path lead capture', detail: 'A submission posts to the database and to a serverless function that fans it out to several Telegram chats, so a failure in one path does not lose the lead.' },
      { title: 'Lead pipeline', detail: 'Inbox, call back, thinking it over, bought, declined, archived — with notes, search, filters and CSV export.' },
      { title: 'Installable admin', detail: 'The panel is a progressive web app with a network-first service worker that deliberately bypasses non-GET and cross-origin requests.' },
      { title: 'Role-gated access', detail: 'Admin check runs as a database function; a non-admin session is signed out rather than shown an empty screen.' },
      { title: 'Full SEO surface', detail: 'Canonical URL, Open Graph and Twitter cards, structured data for an educational organisation, sitemap, and the admin path excluded from robots.' },
      { title: 'Scroll choreography', detail: 'GSAP with ScrollTrigger and smooth scrolling drive the section reveals and the parent-review marquee.' },
    ],
    stack: [
      { group: 'Frontend', items: ['Hand-written HTML, CSS and JS', 'GSAP + ScrollTrigger', 'Lenis'] },
      { group: 'Backend', items: ['Supabase (Postgres, Auth, RPC)', 'Serverless function', 'Telegram Bot API'] },
      { group: 'Hosting', items: ['Vercel', 'Custom domain'] },
    ],
    metrics: [
      { value: '72', label: 'production deploys' },
      { value: '2.1k', label: 'lines, hand-written' },
      { value: '0', label: 'build steps' },
    ],
    links: [
      { label: 'jonykids.uz', href: 'https://jonykids.uz', kind: 'live', access: 'public' },
      { label: 'Source on GitHub', href: 'https://github.com/asadbekergashevn1-ui/jony-kids-website', kind: 'repo', access: 'public' },
    ],
    media: { poster: null, video: null, screenshots: [] },
  },

  {
    slug: 'coma',
    name: 'COMA',
    tagline: 'An unattended agent that audits every teacher’s homework',
    category: 'automation',
    status: 'live',
    year: '2026',
    order: 3,
    featured: true,
    role: 'Design, build and operations',
    client: 'Private education centre, Termiz',
    summary:
      'A read-only Telegram agent that watches teacher group chats, decides whether homework was actually set after each lesson, and reports compliance with a weekly score per group.',
    problem:
      'The owner of a multi-branch school could not read dozens of teacher group chats every evening to check that homework had been set on time. The check was real work nobody was doing.',
    approach:
      'A userbot reads the groups and never writes to them; a separate admin bot takes commands in a private chat. Each group’s schedule is parsed out of its own Telegram title, so the agent configures itself. A homework window runs from the start of the lesson to an hour past its end, and only messages inside it are considered at all.',
    outcome:
      'In production on a server under systemd, with a self-update timer. Its development log reads as a run of real incidents — a model returning 504s, a classification that took 92 seconds, a migration that left it silent — each one closed with a fix and a regression test.',
    features: [
      { title: 'The decision is the model’s', detail: 'One synthesis call over every message in the window picks the homework, or says there is none. A per-message second opinion can never upgrade a "no" into a recorded assignment — which is what stopped student roll-call lists being logged as homework.' },
      { title: 'Timeliness grading', detail: 'Early, on time, late, or not set — measured against the schedule read from the group title, with a per-group lesson duration for the two-hour classes.' },
      { title: 'Model health tracking', detail: 'Failing models are pushed aside on an exponential cooldown from two minutes to six hours, persisted to disk so a restart does not retry a broken model. The last good model is tried first.' },
      { title: 'Prompt-injected skills', detail: 'Plain-text knowledge files are concatenated into the classifier prompt, and a bot command appends a newly learned rule — so the agent is taught without a deploy.' },
      { title: 'Idempotent catch-up', detail: 'On restart or after the overnight sleep it rescans the offline interval, skipping anything already recorded.' },
      { title: 'Two-way group cards', detail: 'The owner corrects a schedule or a teacher by replying to a card in plain Uzbek; the reply is parsed and applied.' },
    ],
    stack: [
      { group: 'Runtime', items: ['Python 3.12', 'Telethon', 'asyncio'] },
      { group: 'Intelligence', items: ['Google Gemini', 'Multi-key rotation', 'Model health tracking'] },
      { group: 'State', items: ['Single JSON document', 'Append-only audit log'] },
      { group: 'Operations', items: ['systemd', 'Self-update timer', 'GitHub Actions'] },
    ],
    metrics: [
      { value: '4.0k', label: 'lines of Python' },
      { value: '3', label: 'dependencies' },
      { value: '23', label: 'admin commands' },
      { value: '0', label: 'messages written to teacher groups' },
    ],
    links: [
      { label: 'Private repository', href: '#', kind: 'repo', access: 'private', note: 'Source is private; architecture walkthrough available on request.' },
    ],
    media: { poster: null, video: null, screenshots: [], captureBlocker: 'No user interface: lives in Telegram and a terminal. Needs an architecture animation and an anonymised transcript instead of a screen capture.' },
  },

  {
    slug: 'jony-taxi',
    name: 'Jony Taxi',
    tagline: 'Puts 75 children in the right car, twice a day',
    category: 'mobile',
    status: 'dormant',
    year: '2026',
    order: 4,
    featured: true,
    role: 'Architecture, database and application',
    client: 'Private education centre, Termiz',
    summary:
      'School shuttle dispatch and tracking, with separate panels for drivers, parents, branch admins and a super admin. Not a taxi-hailing app.',
    problem:
      'A school ran branch shuttles for more than seventy children on alternating-day schedules, coordinated by phone. When a child was missed, nobody could say whether the child had not come out or the driver had never arrived.',
    approach:
      'The day is generated, not typed: each group produces two trips, each trip splits into runs sized by the driver’s vehicle capacity, each run holds ordered legs. A geofence decides when the driver has arrived, which starts a five-minute countdown on the parent’s phone before the child is marked absent — and the outcome distinguishes a no-show from a driver who never reached the zone.',
    outcome:
      'A complete, working application whose real development record lives in a chain of 27 numbered migrations against live data. Dormant since September 2026.',
    features: [
      { title: 'Four roles, four panels', detail: 'Driver, parent, branch admin and super admin, each with its own routes and row-level policies.' },
      { title: 'Accountability by design', detail: 'A failed pickup records whose fault it was — child did not appear, driver did not arrive in time, or parent declined — so reports can separate them.' },
      { title: 'Routing with a fallback', detail: 'OSRM for real road routes, cached in memory, degrading to a dashed straight line when the service is slow rather than blocking the screen.' },
      { title: 'Live tracking', detail: 'Driver position is pushed periodically and streamed to parents and admins over realtime channels.' },
      { title: 'Auth without an SMS bill', detail: 'Phone numbers are mapped to synthetic email addresses so Supabase Auth can be used without paying for an SMS provider.' },
      { title: 'Attendance reporting', detail: 'Lateness and attendance exported to Excel for the office.' },
    ],
    stack: [
      { group: 'Application', items: ['Vue 3', 'Ionic 8', 'Pinia', 'vue-i18n (uz/ru/en)'] },
      { group: 'Native', items: ['Capacitor 8', 'Geolocation', 'Haptics'] },
      { group: 'Data', items: ['Supabase', 'PostgreSQL', 'Row-level security', 'Realtime'] },
      { group: 'Maps', items: ['Leaflet', 'OSRM'] },
    ],
    metrics: [
      { value: '18.5k', label: 'lines of code' },
      { value: '27', label: 'migrations' },
      { value: '44', label: 'RLS policies' },
      { value: '33', label: 'database functions' },
    ],
    links: [
      { label: 'Deployed build', href: 'https://jony-taxi-ten.vercel.app', kind: 'live', access: 'login-required', note: 'Sign-in required; a demo tenant can be provisioned on request.' },
    ],
    media: { poster: null, video: null, screenshots: [], captureBlocker: 'Every screen past login needs a seeded Supabase project. Capture requires a throwaway demo instance.' },
  },

  {
    slug: 'ish-ritmi',
    name: 'Ish Ritmi',
    tagline: 'Turns a working day into points, streaks and consequences',
    category: 'web-apps',
    status: 'live',
    year: '2026',
    order: 5,
    featured: false,
    role: 'Design and build',
    summary:
      'A personal task and discipline system: a drag-and-drop board by difficulty, a points economy, attendance, and a weekly streak with a reward or a fine attached.',
    problem:
      'Task apps record what you intend to do and stay silent about whether you did it. The missing half is consequence.',
    approach:
      'Tasks sit in four columns by difficulty and are worth 10, 25, 50 or 100 points. An eight-hour planner distributes the day automatically and warns when it will not fit. Attendance deducts points for arriving late or leaving early, and the weekly average decides whether the week ends in a reward or a fine the user defines themselves.',
    outcome:
      'In daily use, synced across devices and installable as an app, with a working offline cache.',
    features: [
      { title: 'Difficulty board', detail: 'Drag and drop between four columns on desktop; press and hold to move on a phone.' },
      { title: 'Eight-hour planner', detail: 'Distributes the day by difficulty, accounts for the lunch break, and warns about overload.' },
      { title: 'Multi-day goals', detail: 'Long projects take a deadline in days and advance one step at a time.' },
      { title: 'Reward and fine', detail: 'A good week earns a defined reward, a bad week costs a defined amount. Both are edited in the profile.' },
      { title: 'Offline first', detail: 'Works from the local cache without a connection and syncs when it returns.' },
    ],
    stack: [
      { group: 'Application', items: ['React 18', 'Ionic 8', 'TypeScript', 'Vite'] },
      { group: 'Native', items: ['Capacitor 6', 'PWA'] },
      { group: 'Data', items: ['Supabase Auth', 'PostgreSQL'] },
    ],
    metrics: [
      { value: '4.8k', label: 'lines of code' },
      { value: '4', label: 'difficulty tiers' },
      { value: '2', label: 'deploy targets', note: 'Vercel and a home server' },
    ],
    links: [
      { label: 'Live app', href: 'https://motionsites-seven.vercel.app', kind: 'live', access: 'public', note: 'Sign-in required to save; the interface is browsable.' },
      { label: 'Source on GitHub', href: 'https://github.com/asadbekergashevn1-ui/motionsites', kind: 'repo', access: 'public' },
    ],
    media: { poster: null, video: null, screenshots: [] },
  },

  {
    slug: 'flashy',
    name: 'FLASHY',
    tagline: 'Vocabulary by active recall, not rereading',
    category: 'education',
    status: 'live',
    year: '2026',
    order: 6,
    featured: true,
    role: 'Design and build',
    summary:
      'An English vocabulary trainer built on active recall, spaced repetition and sentence practice, installable as an app.',
    problem:
      'Most vocabulary apps measure exposure. Exposure is not retention — recall under slight difficulty is, and the interval between attempts is what decides whether a word survives.',
    approach:
      'Cards are scheduled by a spaced-repetition interval rather than a fixed list, and each word is practised in a sentence as well as in isolation, so it is learned in use.',
    outcome:
      'Live and installable. Its source is not yet in version control — recovering it is the next task on this project.',
    features: [
      { title: 'Active recall', detail: 'The answer is produced before it is revealed, not recognised from a list.' },
      { title: 'Spaced repetition', detail: 'Review intervals stretch as a word is recalled correctly and collapse when it is missed.' },
      { title: 'Sentence practice', detail: 'Each word is also drilled in context so it transfers into use.' },
      { title: 'Installable', detail: 'A service worker makes it an offline-capable app on a phone home screen.' },
    ],
    stack: [
      { group: 'Application', items: ['Vite', 'TypeScript', 'PWA'] },
    ],
    metrics: [{ value: 'PWA', label: 'installable' }],
    links: [{ label: 'Live app', href: 'https://flashy-tan.vercel.app', kind: 'live', access: 'public' }],
    media: { poster: null, video: null, screenshots: [] },
  },

  {
    slug: 'level-up',
    name: 'LEVEL UP',
    tagline: 'A language school told as a scroll',
    category: 'websites',
    status: 'live',
    year: '2026',
    order: 7,
    featured: false,
    role: 'Design and build',
    client: 'LEVEL UP language centre',
    summary:
      'A scroll-driven marketing site where the narrative is the layout: pinned sections, type that assembles letter by letter, and counters that run as the results come into view.',
    problem:
      'A language centre’s results — band scores, certificates, branches — are numbers on a page everywhere else. They needed to land as a story rather than a table.',
    approach:
      'Sections pin while their content advances, headlines assemble per letter and per word, and a radar diagram traces the path a student takes from admission to result. An accessible description of the animation is provided for screen readers.',
    outcome: 'Live and the most visually ambitious site in this portfolio.',
    features: [
      { title: 'Pinned scroll chapters', detail: 'Hero, relay and growth sections hold while their content moves through.' },
      { title: 'Letter-level reveals', detail: 'Headlines animate per character, body copy per word.' },
      { title: 'Counting results', detail: 'Student and certificate figures count up when scrolled into view.' },
      { title: 'Described for screen readers', detail: 'A visually hidden paragraph narrates the animation that sighted users see.' },
    ],
    stack: [
      { group: 'Framework', items: ['Next.js (App Router)', 'Turbopack', 'React'] },
      { group: 'Styling', items: ['Tailwind CSS', 'Self-hosted variable fonts'] },
    ],
    metrics: [
      { value: '3', label: 'pinned sections' },
      { value: '6', label: 'self-hosted font files' },
    ],
    links: [{ label: 'Live site', href: 'https://lu-demo-nine.vercel.app', kind: 'live', access: 'public' }],
    media: { poster: null, video: null, screenshots: [] },
  },

  {
    slug: 'brain-train',
    name: 'Jony Kids Brain Train',
    tagline: 'An Uzbek welcome for children aged five to twelve',
    category: 'mobile',
    status: 'mvp',
    year: '2026',
    order: 8,
    featured: false,
    role: 'Design and build',
    client: 'Jony Kids English, Termiz',
    summary:
      'A cross-platform children’s app: an animated mascot walks a child through name, age, favourite colour and subjects, then opens a gamified stage map. The learning games themselves are not built yet.',
    problem:
      'Children’s learning apps in this market arrive in English or Russian. A five-year-old meeting one in a third language gives up before the first lesson.',
    approach:
      'Everything is in Uzbek and almost nothing requires reading. The child’s chosen colour re-themes the entire app, so the result feels personally theirs. One hashed device identifier enforces one run per device without accounts or personal data beyond a contact number.',
    outcome:
      'A complete, polished onboarding slice — nine screens, fully animated — presented honestly as an MVP, because the games are not implemented.',
    features: [
      { title: 'Animated SVG mascot', detail: 'Four moods, and clothing that follows the child’s chosen accent colour.' },
      { title: 'Live re-theming', detail: 'Picking a colour restyles every later screen: buttons, progress, backgrounds and mascot.' },
      { title: 'Claymorphism system', detail: 'A soft-shadow component set built from scratch — buttons, cards, inputs, dots, progress.' },
      { title: 'Device-scoped identity', detail: 'A hashed device token enforces one play per device without login.' },
      { title: 'Runs without a backend', detail: 'With no credentials configured the whole flow still completes; nothing is persisted and nothing errors.' },
    ],
    stack: [
      { group: 'Application', items: ['Expo SDK 51', 'React Native', 'expo-router', 'TypeScript'] },
      { group: 'Motion', items: ['Reanimated 3', 'react-native-svg'] },
      { group: 'Data', items: ['Supabase'] },
    ],
    metrics: [
      { value: '9', label: 'screens' },
      { value: '11', label: 'components' },
      { value: '2.9k', label: 'lines of code' },
    ],
    links: [
      { label: 'Web export', href: 'https://desktop-tutorial-eight-lovat.vercel.app', kind: 'live', access: 'public', note: 'Expo web build of the mobile app.' },
    ],
    media: { poster: null, video: null, screenshots: [] },
  },

  {
    slug: 'b2-path-calculator',
    name: 'B2 Path Calculator',
    tagline: 'How many hours to B2 — and it admits what it cannot know',
    category: 'education',
    status: 'live',
    year: '2026',
    order: 9,
    featured: false,
    role: 'Method and build',
    client: 'Jony Kids English, Termiz',
    summary:
      'A teacher-facing tool that converts a placement result and two rubric judgements into an estimated date for B1 and B2, and recalibrates against the student’s own measured growth.',
    problem:
      'Parents ask when their child will reach B2. Staff were answering from intuition, and an intuition stated as a date becomes a promise.',
    approach:
      'Each level is given an hours-to-reach figure. Reading and grammar come from the test with the guessing probability subtracted; speaking and writing come from a rubric the teacher applies. The overall level is set by the weakest skill, because exams require all four. Hours remaining are divided by real teaching hours adjusted for attendance.',
    outcome:
      'In use by teachers and a methodologist. The page states its own limitations on screen and prints to PDF for the parent meeting.',
    features: [
      { title: 'Weakest-skill rule', detail: 'Overall level is set by the lowest skill, not the average — which is how multi-skill exams actually work.' },
      { title: 'Guess correction', detail: 'The 25% chance of guessing a four-option question is subtracted before partial credit is given.' },
      { title: 'Self-calibration', detail: 'Given a previous result and date, it computes the child’s real growth rate and uses that instead of the generic coefficient.' },
      { title: 'States its limits', detail: 'The page says in plain language that it is untested, has no listening section, is not an official level, and that no date should be promised to a parent.' },
      { title: 'Stores nothing', detail: 'Entirely client-side. No data leaves the browser.' },
    ],
    stack: [{ group: 'Build', items: ['Hand-written HTML, CSS and JS', 'Single file', 'Print stylesheet'] }],
    metrics: [
      { value: '44', label: 'test items' },
      { value: '4', label: 'skills modelled' },
      { value: '1', label: 'file' },
    ],
    links: [
      { label: 'Calculator', href: 'https://jke-natija-hisob.vercel.app', kind: 'live', access: 'public' },
      { label: 'Placement test', href: 'https://jke-level-test.vercel.app', kind: 'live', access: 'public' },
    ],
    media: { poster: null, video: null, screenshots: [] },
  },

  {
    slug: 'link-board',
    name: 'Link Board',
    tagline: 'Every link in one place, offline first',
    category: 'web-apps',
    status: 'live',
    year: '2026',
    order: 10,
    featured: false,
    role: 'Design and build',
    summary:
      'A bookmark manager built for phones: sign in with a number and a four-digit PIN, then search, categorise and open links in one tap.',
    problem:
      'Browser bookmarks do not survive moving between a phone and a desktop, and a password is too much friction for something opened twenty times a day.',
    approach:
      'Phone number and a four-digit PIN instead of an email and password. The last saved copy renders when the connection is gone, with an honest banner saying edits need a network.',
    outcome:
      'Live and installable, and the most carefully configured deployment in this portfolio — strict security headers and a pinned, integrity-checked dependency.',
    features: [
      { title: 'Phone and PIN', detail: 'Four digits rather than a password, with the country prefix handled for the user.' },
      { title: 'Offline mode', detail: 'Shows the cached copy and states plainly that adding and editing need a connection.' },
      { title: 'Search and sort', detail: 'Keyboard shortcut to search; sort by recent, alphabetical, or favourites first; category chips built from the data.' },
      { title: 'Install guidance', detail: 'Native install prompt on Android, and a step-by-step dialog for iOS where there is none.' },
      { title: 'No theme flash', detail: 'The saved theme is applied before first paint.' },
    ],
    stack: [
      { group: 'Frontend', items: ['Hand-written ES modules', 'Native dialog elements', 'PWA'] },
      { group: 'Backend', items: ['Supabase'] },
    ],
    metrics: [
      { value: '4', label: 'digit PIN' },
      { value: '5', label: 'security headers' },
    ],
    links: [{ label: 'Live app', href: 'https://link-board-two.vercel.app', kind: 'live', access: 'public', note: 'Sign-in required to see saved links.' }],
    media: { poster: null, video: null, screenshots: [] },
  },

  {
    slug: 'jony-math',
    name: 'Jony Math',
    tagline: 'One free month of mathematics',
    category: 'websites',
    status: 'live',
    year: '2026',
    order: 11,
    featured: false,
    role: 'Design and build',
    client: 'Jony Kids, Termiz',
    summary:
      'A landing page for a free one-month mathematics course for six and seven year olds, written to answer a parent’s objections in the order they occur.',
    problem:
      'A free course is suspicious. The page has to earn trust before it asks for a phone number.',
    approach:
      'The page is structured as a conversation: name the difficulty the parent is already seeing, show the ten things the child will be able to do, lay out all twelve lessons, then answer the objections, and only then ask.',
    outcome: 'Live, and the structure has been reused for later campaign pages.',
    features: [
      { title: 'Objection-ordered sections', detail: 'Every block answers the question a parent would ask at that exact point.' },
      { title: 'Concrete outcomes', detail: 'Ten specific things the child will be able to do, instead of a curriculum summary.' },
      { title: 'Full lesson plan', detail: 'All twelve lessons across four weeks are shown before the signup.' },
    ],
    stack: [{ group: 'Build', items: ['Hand-written HTML, CSS and JS', 'Scroll reveals'] }],
    metrics: [
      { value: '12', label: 'lessons' },
      { value: '4', label: 'weeks' },
    ],
    links: [{ label: 'Live page', href: 'https://jony-math-bepul-kurs.vercel.app', kind: 'live', access: 'public' }],
    media: { poster: null, video: null, screenshots: [] },
  },

  {
    slug: 'jke-level-test',
    name: 'JKE Level Test',
    tagline: 'Placement in forty-four questions',
    category: 'education',
    status: 'live',
    year: '2026',
    order: 12,
    featured: false,
    role: 'Method and build',
    client: 'Jony Kids English, Termiz',
    summary:
      'The student-facing half of the placement system: a forty-four item test that ends by issuing a code the teacher pastes into the calculator.',
    problem:
      'A placement test and the decision made from it usually live in two disconnected places, and the link between them is a teacher’s memory.',
    approach:
      'The test issues a compact code carrying every answer. Nothing is stored and nothing is transmitted; the code is the record, and it travels with the student to the teacher.',
    outcome: 'In use alongside the calculator as one workflow.',
    features: [
      { title: 'Code as the record', detail: 'All answers are encoded into one short string, so no database is needed and no personal data is held.' },
      { title: 'Four levels in one sitting', detail: 'Grammar and reading items spanning A1 to B2, eleven per level.' },
      { title: 'Unindexed', detail: 'Excluded from search engines as an internal tool.' },
    ],
    stack: [{ group: 'Build', items: ['Hand-written HTML, CSS and JS'] }],
    metrics: [
      { value: '44', label: 'items' },
      { value: '4', label: 'levels' },
    ],
    links: [{ label: 'Take the test', href: 'https://jke-level-test.vercel.app', kind: 'live', access: 'public' }],
    media: { poster: null, video: null, screenshots: [] },
  },
];

export const visibleProjects = projects.filter((p) => !p.draft);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function sortedProjects(): Project[] {
  return [...visibleProjects].sort((a, b) => a.order - b.order);
}

export function featuredProjects(): Project[] {
  return sortedProjects().filter((p) => p.featured);
}

export function projectsByCategory(slug: string): Project[] {
  return sortedProjects().filter((p) => p.category === slug);
}
