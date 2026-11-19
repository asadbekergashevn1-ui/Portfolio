import captured from './media.generated.json';
import type { Project, ProjectMedia } from './types';

type CapturedMedia = Partial<ProjectMedia> & { capturedFrom?: string; capturedAt?: string };
const media = captured as Record<string, CapturedMedia>;

/**
 * The work. Figures here were measured from the repositories — lines of code,
 * migrations, policies — never estimated. If a number cannot be verified it is
 * left out rather than rounded up.
 */
const authored: Project[] = [
  {
    slug: 'xn-crm',
    name: 'XN CRM',
    tagline: 'Run every branch of a school from one screen — and know who owes what, instantly',
    category: 'crm',
    status: 'live',
    year: '2026',
    order: 1,
    featured: true,
    role: 'Architecture, backend and frontend',
    client: 'Private education centre, Termiz',
    summary:
      'Education centres outgrow spreadsheets fast: fees go uncollected, payroll takes days, and every branch keeps its own version of the truth. XN CRM puts enrolment, attendance, billing, payroll and leads in one system, so the owner runs the whole operation from one place.',
    problem:
      'The centre had grown to several branches. Fees lived in spreadsheets, attendance on paper, and teacher pay was recalculated by hand every month. Nobody could say who owed what without losing an afternoon, and every branch kept its own version of the truth.',
    approach:
      'I modelled the business before writing a single endpoint: organisation, sub-centre, branch, and a membership edge for every person. Tenant isolation is enforced three times over — a guard that resolves the tenant from the request against the database, a filter in every query, and composite foreign keys with check constraints so the database itself refuses a cross-tenant row.',
    outcome:
      'Running in production on self-hosted infrastructure, deployed on every push to main behind a CI gate of lint, typecheck, unit and end-to-end tests. A written backup runbook with a monthly restore drill backs it, and the deploy script backs up first and refuses to continue if that backup fails.',
    benefits: [
      { title: 'Know who owes what, instantly', detail: 'Debtors, deferrals and refunds sit in one work queue instead of an afternoon of spreadsheets.' },
      { title: 'Payroll from the timetable', detail: 'Teacher pay is calculated from the lessons actually taught, so month-end becomes a review, not a rebuild.' },
      { title: 'Books an auditor can trust', detail: 'Gap-free invoice numbers and an append-only audit trail: every sum can be traced, nothing can be quietly changed.' },
      { title: 'Grow without the chaos', detail: 'Add a branch or a whole new centre without a new spreadsheet — every person, payment and permission stays in its own tenant.' },
      { title: 'Parents kept in the loop', detail: 'A separate app shows attendance, homework and points, while the staff console stays private.' },
    ],
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
      { value: '160k', label: 'lines of code' },
      { value: '125', label: 'data models' },
      { value: '78', label: 'migrations', note: 'Sept to Nov 2026' },
      { value: '110', label: 'permissions' },
    ],
    links: [
      { label: 'Private repository', href: '#', kind: 'repo', access: 'private', note: 'Source is private; walkthrough available on request.' },
    ],
    media: { poster: null, video: null, screenshots: [], demoNote: 'Recorded from the real application running on invented demo data — no real school, student or payment.', captureBlocker: 'Self-hosted behind a tunnel; needs a seeded demo tenant before capture.' },
  },

  {
    slug: 'jony-kids-english',
    name: 'Jony Kids English',
    tagline: 'A website that turns Instagram traffic into booked trial lessons',
    category: 'websites',
    status: 'live',
    year: '2026',
    order: 2,
    featured: true,
    role: 'Design, build and operations',
    client: 'Jony Kids English, Termiz',
    summary:
      'Interested parents used to message on Instagram and disappear between chats. This site captures every enquiry, alerts staff on Telegram the moment it arrives, and tracks each lead until it becomes a paying student.',
    problem:
      'Instagram and Telegram traffic arrived as chat messages and got lost. There was no record of who had been called, who was thinking it over, and who had bought.',
    approach:
      'One hand-written static page — no framework, no build step — so it loads fast on the mid-range Android phones the audience actually uses. Every lead is written to two places at once: a database row and an instant Telegram message to the staff who answer. Behind a login sits a small CRM that moves each lead through a pipeline.',
    outcome:
      'Live on its own domain with 72 production deploys and counting. According to the school, it is now one of its strongest sources of new students.',
    benefits: [
      { title: 'No enquiry goes unanswered', detail: 'Every sign-up lands in the database and on staff phones the moment it is sent.' },
      { title: 'Every lead has a next step', detail: 'Inbox, call back, thinking it over, enrolled — the team always knows who to call next.' },
      { title: 'Fast on the phones parents use', detail: 'Hand-built with no framework, it loads quickly on mid-range Android phones and mobile data.' },
      { title: 'Easy to find, easy to share', detail: 'Structured data, a sitemap and social previews, with the domain verified in Google Search Console.' },
    ],
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
    tagline: 'The nightly homework check — done for you, for every class',
    category: 'automation',
    status: 'live',
    year: '2026',
    order: 3,
    featured: true,
    role: 'Design, build and operations',
    client: 'Private education centre, Termiz',
    summary:
      'Making sure every teacher set homework meant reading dozens of group chats every evening — work nobody had time for. COMA watches every class group, decides whether homework was set and when, and reports to the owner, without ever posting in a teacher’s chat.',
    problem:
      'The owner of a multi-branch school could not read dozens of teacher group chats every evening to check that homework had been set on time. The check was real work nobody was doing.',
    approach:
      'A userbot reads the groups and never writes to them; a separate admin bot takes commands in a private chat. Each group’s schedule is parsed out of its own Telegram title, so the agent configures itself. A homework window runs from the start of the lesson to an hour past its end, and only messages inside it are considered at all.',
    outcome:
      'In production on a server under systemd, with a self-update timer. Its development log reads as a run of real incidents — a model returning 504s, a classification that took 92 seconds, a migration that left it silent — each one closed with a fix and a regression test.',
    benefits: [
      { title: 'No more evening audits', detail: 'The owner gets one clear verdict per lesson instead of scrolling through every group.' },
      { title: 'Fair to teachers', detail: 'Early, on time, late or not set — measured against each class’s own schedule, never a guess.' },
      { title: 'Accountability without micromanagement', detail: 'A weekly score per group shows the pattern at a glance, and teachers see the same report.' },
      { title: 'Invisible in the classroom', detail: 'It only reads. It never writes to a teacher’s group, so classes carry on exactly as before.' },
      { title: 'Keeps working when AI doesn’t', detail: 'If a model fails, COMA routes around it and re-checks later, rather than guessing.' },
    ],
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
    tagline: 'Every child picked up, every parent informed, every missed pickup explained',
    category: 'mobile',
    status: 'dormant',
    year: '2026',
    order: 4,
    featured: true,
    role: 'Architecture, database and application',
    client: 'Private education centre, Termiz',
    summary:
      'School shuttles run on phone calls until something goes wrong — and then nobody knows whether the child didn’t come out or the driver never arrived. Jony Taxi plans every run automatically, tells parents when the car is outside, and records exactly what happened at each stop.',
    problem:
      'A school ran branch shuttles for its students on alternating-day schedules, coordinated by phone. When a child was missed, nobody could say whether the child had not come out or the driver had never arrived.',
    approach:
      'The day is generated, not typed: each group produces two trips, each trip splits into runs sized by the driver’s vehicle capacity, each run holds ordered legs. A geofence decides when the driver has arrived, which starts a five-minute countdown on the parent’s phone before the child is marked absent — and the outcome distinguishes a no-show from a driver who never reached the zone.',
    outcome:
      'A complete, working application whose real development record lives in a chain of 27 numbered migrations against live data. Dormant since September 2026.',
    benefits: [
      { title: 'Calmer mornings for parents', detail: 'A notification and a five-minute countdown when the car arrives — no calls to the office.' },
      { title: 'Disputes settled by data', detail: 'Each missed pickup is recorded as a no-show, a late driver or a decline, so the right person is accountable.' },
      { title: 'Routes that plan themselves', detail: 'Daily trips are generated from class groups and vehicle capacity instead of being typed each morning.' },
      { title: 'One app, four views', detail: 'Drivers, parents, branch admins and the owner each see exactly what they need, and nothing else.' },
    ],
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
    tagline: 'A day planned to the hour — and a working rhythm that holds all week',
    category: 'web-apps',
    status: 'live',
    year: '2026',
    order: 5,
    featured: false,
    role: 'Design and build',
    summary:
      'Most days fall apart not for lack of work but for lack of order: tasks pile up, the important ones slip, and the evening ends without knowing what got done. Ish Ritmi lays the day out precisely across eight real hours, scores the work as it is finished, and closes every week with a reward you earned or a fine you set for yourself.',
    problem:
      'Task apps record what you intend to do and stay silent about whether you did it. The missing half is consequence.',
    approach:
      'Tasks sit in four columns by difficulty and are worth 10, 25, 50 or 100 points. An eight-hour planner distributes the day automatically and warns when it will not fit. Attendance deducts points for arriving late or leaving early, and the weekly average decides whether the week ends in a reward or a fine the user defines themselves.',
    outcome:
      'Live, synced across devices and installable as an app, with a working offline cache.',
    benefits: [
      { title: 'Every hour has a job', detail: 'The planner lays tasks out across eight real hours and warns you before you overcommit — you always know what comes next.' },
      { title: 'Effort that counts', detail: 'Harder work earns more points, so the score reflects real progress rather than ticked boxes.' },
      { title: 'Accountability built in', detail: 'Lateness costs points, and a weak week costs the fine you chose.' },
      { title: 'Wherever you work', detail: 'Synced between phone and desktop, and usable offline.' },
    ],
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
    media: { poster: null, video: null, screenshots: [], captureBlocker: 'The public build opens on sign-in, and the only way past it is a real account on the production database.' },
  },

  {
    slug: 'flashy',
    name: 'FLASHY',
    tagline: 'A complete vocabulary course in one app — learn every word through translation, synonyms and definitions, then pass the exam',
    category: 'education',
    status: 'live',
    year: '2026',
    order: 6,
    featured: true,
    role: 'Design and build',
    summary:
      'Memorising a word list gives you a translation and nothing else — you can’t use the word, explain it or swap it for another. FLASHY teaches each word from three sides — its translation, its synonyms and its definition — and then examines the learner on it, so a word counts as learned only when it has been proven.',
    problem:
      'Most vocabulary apps measure exposure. Exposure is not retention — recall under slight difficulty is, and a learner needs to see which words are slipping, not how many they have looked at.',
    approach:
      'Import is paste-first: a list of words on one side, translations on the other, synonyms and definitions optional, and numbered lists are matched by number so a definition that wraps across lines never misaligns. Each word can then be learned three ways — by definition, translation or synonym — and practised four ways: flashcards with self-rating, multiple choice, typed answers and a weak-words review.',
    outcome:
      'Live and installable, with no account and no server: nothing a learner imports leaves their device. Its source is not yet in version control — recovering it is the next task on this project.',
    benefits: [
      { title: 'Know a word, not just its translation', detail: 'Every word is learned through its translation, its synonyms and its definition — the way you actually need it in a sentence or an exam.' },
      { title: 'An exam, not a hunch', detail: 'Multiple-choice and typed tests check what has really stuck, so progress is proven rather than felt.' },
      { title: 'Study what you’re forgetting', detail: 'Weak words are tracked and come back on their own until they are mastered.' },
      { title: 'From any list to a course', detail: 'Paste words, translations, synonyms and definitions from a document; FLASHY lines them up, even when entries wrap.' },
      { title: 'Private by default', detail: 'No account and no server — everything stays on the learner’s device.' },
    ],
    features: [
      { title: 'Paste-first import', detail: 'Two lists side by side — words and translations — with optional synonyms and definitions, a live preview of matched pairs, and duplicate handling.' },
      { title: 'Numbered alignment', detail: 'Numbered lists are matched by number, so entries that wrap over several lines still pair up correctly.' },
      { title: 'Three things to learn', detail: 'Choose definitions, translations or synonyms as the side being recalled.' },
      { title: 'Four ways to practise', detail: 'Flashcards with “knew it / needs practice”, multiple choice, typed answers, and a review of weak words only.' },
      { title: 'Progress from real activity', detail: 'Accuracy, tests taken, reviews and word states — new, learning, review, mastered — are all computed from what the learner actually did.' },
      { title: 'Private by construction', detail: 'Everything stays in the browser. Recording it for this site, no request ever left the page.' },
    ],
    stack: [
      { group: 'Application', items: ['Vite', 'TypeScript', 'PWA'] },
      { group: 'Storage', items: ['In-browser only', 'No account, no server'] },
    ],
    metrics: [
      { value: '3', label: 'sides of every word' },
      { value: '4', label: 'practice and exam modes' },
      { value: '0', label: 'requests to a server' },
    ],
    links: [{ label: 'Live app', href: 'https://flashy-tan.vercel.app', kind: 'live', access: 'public' }],
    media: { poster: null, video: null, screenshots: [] },
  },

  {
    slug: 'level-up',
    name: 'LEVEL UP',
    tagline: 'A school’s results, told as a story parents can feel',
    category: 'websites',
    status: 'live',
    year: '2026',
    order: 7,
    featured: false,
    role: 'Design and build',
    summary:
      'On most school sites, band scores and certificates are a wall of numbers. LEVEL UP turns them into a scroll-driven story — a student pushing a boulder to the summit, results counting up as they arrive — so the track record is felt, not just listed.',
    problem:
      'A language centre’s results — band scores, certificates, branches — are numbers on a page everywhere else. They needed to land as a story rather than a table.',
    approach:
      'Sections pin while their content advances, headlines assemble per letter and per word, and a radar diagram traces the path a student takes from admission to result. An accessible description of the animation is provided for screen readers.',
    outcome: 'Live, and the most visually ambitious site in this portfolio. According to the school, its sites bring in a steady flow of new students.',
    benefits: [
      { title: 'Remembered after one visit', detail: 'A 3D hero that moves with the scroll gives the school an identity of its own.' },
      { title: 'Results at the centre', detail: 'Student outcomes are the centrepiece of the page, not a footnote.' },
      { title: 'Motion that includes everyone', detail: 'Every animation is also described for screen readers.' },
    ],
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
    tagline: 'A learning app children understand before they can read English',
    category: 'mobile',
    status: 'mvp',
    year: '2026',
    order: 8,
    featured: false,
    role: 'Design and build',
    client: 'Jony Kids English, Termiz',
    summary:
      'Children’s learning apps here arrive in English or Russian, and a five-year-old gives up before the first lesson. Brain Train welcomes them in Uzbek with a friendly robot, lets them make the app their own colour, and gets them to their first stage in a few taps.',
    problem:
      'Children’s learning apps in this market arrive in English or Russian. A five-year-old meeting one in a third language gives up before the first lesson.',
    approach:
      'Everything is in Uzbek and almost nothing requires reading. The child’s chosen colour re-themes the entire app, so the result feels personally theirs. One hashed device identifier enforces one run per device without accounts or personal data beyond a contact number.',
    outcome:
      'A complete, polished onboarding slice — nine screens, fully animated — presented honestly as an MVP, because the games are not implemented.',
    benefits: [
      { title: 'Speaks the child’s language', detail: 'Every screen is in Uzbek and designed for children who don’t read yet.' },
      { title: 'Theirs from the first tap', detail: 'The colour a child picks re-themes the whole app.' },
      { title: 'A warm lead for the school', detail: 'Onboarding ends with a parent’s contact for the centre — one per device, no accounts.' },
    ],
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
    slug: 'link-board',
    name: 'Link Board',
    tagline: 'Every link you need, one tap away — even offline',
    category: 'web-apps',
    status: 'live',
    year: '2026',
    order: 10,
    featured: false,
    role: 'Design and build',
    summary:
      'Bookmarks get lost between phone and laptop, and a password is too much friction for something opened twenty times a day. Link Board keeps every link in one searchable board behind a four-digit PIN.',
    problem:
      'Browser bookmarks do not survive moving between a phone and a desktop, and a password is too much friction for something opened twenty times a day.',
    approach:
      'Phone number and a four-digit PIN instead of an email and password. The last saved copy renders when the connection is gone, with an honest banner saying edits need a network.',
    outcome:
      'Live and installable, and the most carefully configured deployment in this portfolio — strict security headers and a pinned, integrity-checked dependency.',
    benefits: [
      { title: 'Faster than bookmarks', detail: 'Search, favourites and categories find any link in a keystroke.' },
      { title: 'Sign in with a number', detail: 'A phone number and a PIN instead of an email and a password.' },
      { title: 'Works on the move', detail: 'The last saved board opens without a connection.' },
      { title: 'Installs like an app', detail: 'Add it to the home screen on Android or iOS.' },
    ],
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
    media: { poster: null, video: null, screenshots: [], captureBlocker: 'Opens on phone-and-PIN sign-in; creating an account to record it would write to the production database.' },
  },

  {
    slug: 'jony-math',
    name: 'Jony Math',
    tagline: 'A free-course page that earns a parent’s trust before asking for a number',
    category: 'websites',
    status: 'live',
    year: '2026',
    order: 11,
    featured: false,
    role: 'Design and build',
    client: 'Jony Kids, Termiz',
    summary:
      'Free offers make parents suspicious. This page answers their doubts in the order they arise — and lets them try a working multiplication table on the spot — before asking for anything.',
    problem:
      'A free course is suspicious. The page has to earn trust before it asks for a phone number.',
    approach:
      'The page is structured as a conversation: name the difficulty the parent is already seeing, show the ten things the child will be able to do, lay out all twelve lessons, then answer the objections, and only then ask.',
    outcome: 'Live — and, according to the school, bringing in real sign-ups for the course.',
    benefits: [
      { title: 'Try before you trust', detail: 'A live multiplication table in the hero lets parents and children try the method immediately.' },
      { title: 'Doubts answered up front', detail: 'Each section answers the next question a parent would ask.' },
      { title: 'No surprises', detail: 'All twelve lessons are laid out before sign-up.' },
    ],
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

];

/** Hand-written content, with whatever the capture pipeline has produced layered over its media. */
export const projects: Project[] = authored.map((p) => {
  const m = media[p.slug];
  if (!m) return p;
  return {
    ...p,
    media: {
      ...p.media,
      kind: m.kind ?? 'recording',
      poster: m.poster ?? p.media.poster,
      video: m.video ?? p.media.video,
      demo: m.demo ?? null,
      screenshots: m.screenshots?.length ? m.screenshots : p.media.screenshots,
      captureBlocker: undefined,
    },
  };
});

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
