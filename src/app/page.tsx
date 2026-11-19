import Link from 'next/link';
import { MetricTile } from '@/components/metric-tile';
import { ProjectCard } from '@/components/project-card';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { SplitWords } from '@/components/split-words';
import { categories } from '@/content/categories';
import { profile } from '@/content/profile';
import { featuredProjects, projectsByCategory, sortedProjects } from '@/content/projects';

export const metadata = { alternates: { canonical: '/' } };

const shippedCount = sortedProjects().length;
const categoryCount = categories.filter((c) => projectsByCategory(c.slug).length).length;

const HEADLINE_METRICS = [
  { value: String(shippedCount), label: 'products shipped', note: `${categoryCount} categories` },
  { value: '190k', label: 'lines of code', note: 'hand-written, counted' },
  { value: '5', label: 'production databases', note: 'PostgreSQL and Supabase' },
  { value: '72', label: 'deploys on one site', note: 'and still shipping' },
];

export default function HomePage() {
  const featured = featuredProjects();
  const total = sortedProjects().length;

  return (
    <>
      <section className="mx-auto max-w-[1240px] px-5 pt-10 sm:px-8 sm:pt-14">
        <div className="grid-field hero-field relative overflow-hidden rounded-[var(--radius-lg)] border border-line px-6 py-14 sm:px-12 sm:py-20 lg:py-24">
          <p className="label mb-7 flex items-center gap-2.5 text-accent">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-live" style={{ boxShadow: '0 0 0 3px color-mix(in srgb, var(--status-live) 18%, transparent)' }} />
            {profile.available ? 'Available for new work' : 'Currently booked'}
            <span className="hidden sm:inline">· {profile.location}</span>
          </p>
          <h1 aria-label={profile.headline} className="display balance max-w-[18ch] text-[clamp(2.5rem,6.4vw,5.25rem)] text-ink">
            <SplitWords text={profile.headline} />
          </h1>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
            <p className="pretty measure text-[1.0625rem] leading-[1.7] text-ink-2">{profile.intro[0]}</p>
            <p className="font-serif text-[clamp(1.375rem,2.2vw,1.75rem)] italic leading-[1.35] text-accent">
              {profile.intro[1]}
            </p>
          </div>
          <div className="mt-11 flex flex-wrap gap-3">
            <Link href="/projects" className="label rounded-[var(--radius-md)] bg-accent px-6 py-3.5 font-semibold text-accent-ink transition-opacity hover:opacity-90">
              See the work <span aria-hidden="true" className="cta-arrow">→</span>
            </Link>
            <Link href="/projects/xn-crm" className="label rounded-[var(--radius-md)] border border-edge px-6 py-3.5 text-ink transition-colors hover:bg-hover">
              Read a case study
            </Link>
          </div>
        </div>

        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key figures">
          {HEADLINE_METRICS.map((m, i) => (
            <li key={m.label}>
              <Reveal delay={i * 0.06}>
                <MetricTile metric={m} size="lg" />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-24 max-w-[1240px] px-5 sm:px-8" aria-labelledby="featured-heading">
        <div id="featured-heading">
          <SectionHeading eyebrow="Selected work" title="Systems in production" href="/projects" hrefLabel={`All ${total}`} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.06}>
              <ProjectCard project={p} priority={i < 3} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-[1240px] px-5 sm:px-8" aria-labelledby="cat-heading">
        <div id="cat-heading">
          <SectionHeading eyebrow="By what it does" title="Categories" href="/categories" hrefLabel="Browse" />
        </div>
        <ul className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const n = projectsByCategory(c.slug).length;
            return (
              <li key={c.slug} className="bg-base">
                <Link href={`/categories/${c.slug}`} className="group flex h-full flex-col p-7 transition-colors hover:bg-hover">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">{c.name}</span>
                    <span className="figure font-mono text-[12px] text-ink-4">{String(n).padStart(2, '0')}</span>
                  </div>
                  <p className="pretty mt-3 text-[0.875rem] leading-[1.6] text-ink-3">{c.blurb}</p>
                  <span className="label mt-6 text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">Open →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto mt-24 max-w-[1240px] px-5 sm:px-8">
        <div className="card grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="label mb-4 text-accent">How I work</p>
            <h2 className="balance text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em] text-ink">
              The rules that matter go where they cannot be skipped.
            </h2>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2">
            {profile.principles.map((pr) => (
              <li key={pr.title}>
                <h3 className="text-[0.9375rem] font-semibold text-ink">{pr.title}</h3>
                <p className="pretty mt-1.5 text-[0.8125rem] leading-[1.6] text-ink-3">{pr.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-[1240px] px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-8 border-t border-line pt-14 md:flex-row md:items-end">
          <h2 className="display balance max-w-[18ch] text-[clamp(2rem,4.2vw,3.25rem)] text-ink">
            Have a business that runs on spreadsheets?
          </h2>
          <Link href="/contact" className="label shrink-0 rounded-[var(--radius-md)] bg-accent px-6 py-3.5 font-semibold text-accent-ink transition-opacity hover:opacity-90">
            Start a conversation
          </Link>
        </div>
      </section>
    </>
  );
}
