import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/reveal';
import { profile } from '@/content/profile';

export const metadata: Metadata = {
  title: 'About',
  description: `${profile.name} — ${profile.role} in ${profile.location}. How I work and what I work with.`,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-14 sm:px-8 sm:pt-20">
      <header className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="label mb-4 text-accent">About · {profile.location}</p>
          <h1 className="display balance text-[clamp(2.5rem,6vw,4.75rem)] text-ink">{profile.name}</h1>
        </div>
        <p className="font-serif balance text-[clamp(1.375rem,2.4vw,1.875rem)] italic leading-[1.35] text-accent">
          I design for the failure first, and write down what happened when it comes.
        </p>
      </header>

      <div className="mt-16 grid gap-16 border-t border-line pt-14 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-7">
          {profile.about.map((para, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className="pretty measure text-[1.0625rem] leading-[1.8] text-ink-2">{para}</p>
            </Reveal>
          ))}
        </div>

        <section aria-labelledby="toolbox-h" className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="toolbox-h" className="label mb-6 text-ink-4">Toolbox</h2>
          <dl className="space-y-5">
            {profile.toolbox.map((g) => (
              <div key={g.group}>
                <dt className="label mb-2 text-ink-3">{g.group}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {g.items.map((t) => <span key={t} className="chip">{t}</span>)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="mt-24" aria-labelledby="principles-h">
        <h2 id="principles-h" className="label mb-8 text-accent">Principles</h2>
        <ol className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line md:grid-cols-2">
          {profile.principles.map((p, i) => (
            <li key={p.title} className="bg-base p-8">
              <span className="figure font-mono text-[12px] text-ink-4">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 text-[1.1875rem] font-semibold tracking-[-0.02em] text-ink">{p.title}</h3>
              <p className="pretty mt-2.5 text-[0.9375rem] leading-[1.65] text-ink-3">{p.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-line pt-12 sm:flex-row sm:items-center">
        <p className="text-[1.125rem] text-ink-2">The work says more than this page does.</p>
        <div className="flex gap-3">
          <Link href="/projects" className="label rounded-[var(--radius-md)] border border-edge px-5 py-3 text-ink hover:bg-hover">See the work</Link>
          <Link href="/contact" className="label rounded-[var(--radius-md)] bg-accent px-5 py-3 font-semibold text-accent-ink hover:opacity-90">Get in touch</Link>
        </div>
      </section>
    </div>
  );
}
