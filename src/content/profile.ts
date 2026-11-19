import type { Profile } from './types';

/** Personal details. The contact form composes its message to CONTACT_EMAIL. */
export const CONTACT_EMAIL = 'asadbekergashevn1@gmail.com';

export const profile: Profile = {
  name: 'Asadbek Ergashev',
  initials: 'AE',
  role: 'Software engineer',
  location: 'Termiz, Uzbekistan',
  available: true,
  headline: 'I build the software that brings a business its customers — and keeps everything after that in order.',
  intro: [
    'Websites that turn visitors into enrolled students. Systems that keep money, payroll, attendance and homework under control without anyone chasing it. Apps that put a working day, or a vocabulary course, into a clear order.',
    'Ten products, all shipped and in use with real data — built so the business can stop worrying about them.',
  ],
  about: [
    'I work from Termiz, in the south of Uzbekistan, mostly for small businesses that cannot afford for their software to be wrong: a school whose fees, payroll and attendance all live in one system I built, and whose owner gets a verdict on every lesson’s homework without opening a single chat.',
    'That shapes how I work. I model the business before I write an endpoint. I put the rules that matter in the database, where a second browser tab or a careless script cannot get around them. I design for the failure first — the model that returns 504s, the migration that runs against live data, the shuttle that never reaches the geofence — and I write down what happened when it does.',
    'I build across the whole stack because these clients need one person who understands all of it: Postgres and row-level security, NestJS and Prisma, Vue and React, Ionic and Expo on the phone, Python agents on a server under systemd.',
  ],
  principles: [
    { title: 'Model the business first', detail: 'The data model is the product. Endpoints, screens and reports follow from it, never the reverse.' },
    { title: 'Put the rules where they cannot be skipped', detail: 'Constraints, policies and unique indexes in the database, not in application code that a race can bypass.' },
    { title: 'Design the failure', detail: 'Every external dependency gets a fallback and a visible state. Nothing fails silently.' },
    { title: 'Measure, then claim', detail: 'If a number is on this site, it was counted from the repository.' },
  ],
  toolbox: [
    { group: 'Languages', items: ['TypeScript', 'Python', 'SQL'] },
    { group: 'Backend', items: ['NestJS', 'Prisma', 'PostgreSQL', 'Supabase', 'Redis / BullMQ'] },
    { group: 'Frontend', items: ['Next.js', 'React', 'Vue 3', 'Tailwind CSS'] },
    { group: 'Mobile', items: ['Ionic', 'Capacitor', 'Expo / React Native'] },
    { group: 'AI & automation', items: ['Gemini', 'Telethon', 'Telegram Bot API'] },
    { group: 'Operations', items: ['Docker', 'GitHub Actions', 'systemd', 'pm2 + nginx', 'Vercel'] },
  ],
  contact: [
    { label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, kind: 'email' },
    { label: 'GitHub', value: 'asadbekergashevn1-ui', href: 'https://github.com/asadbekergashevn1-ui', kind: 'github' },
  ],
};
