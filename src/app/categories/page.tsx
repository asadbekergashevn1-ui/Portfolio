import type { Metadata } from 'next';
import Link from 'next/link';
import { categories } from '@/content/categories';
import { projectsByCategory } from '@/content/projects';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'The work grouped by what it does: CRM and ERP, automation and AI, mobile, education, websites and web apps.',
  alternates: { canonical: '/categories' },
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-14 sm:px-8 sm:pt-20">
      <header className="mb-14">
        <p className="label mb-4 text-accent">Index</p>
        <h1 className="display text-[clamp(2.5rem,5.5vw,4.25rem)] text-ink">Categories</h1>
        <p className="pretty measure mt-6 text-[1rem] leading-[1.7] text-ink-2">
          Grouped by what each project does for the person using it, rather than by the stack it
          happens to be built on.
        </p>
      </header>

      <ul className="border-t border-line">
        {categories.map((c, i) => {
          const items = projectsByCategory(c.slug);
          if (!items.length) return null;
          return (
            <li key={c.slug} className="border-b border-line">
              <Link href={`/categories/${c.slug}`} className="group grid gap-5 py-9 transition-colors sm:grid-cols-[3rem_1fr] lg:grid-cols-[3rem_1.1fr_1.4fr_auto] lg:items-baseline">
                <span className="figure font-mono text-[12px] text-ink-4">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink transition-colors group-hover:text-accent">{c.name}</span>
                <span className="pretty text-[0.9375rem] leading-[1.65] text-ink-3 sm:col-start-2 lg:col-start-auto">
                  {c.blurb}
                  <span className="mt-3 block font-mono text-[11px] text-ink-4">{items.map((p) => p.name).join(' · ')}</span>
                </span>
                <span className="label text-ink-3 sm:col-start-2 lg:col-start-auto lg:text-right">
                  {items.length} {items.length === 1 ? 'project' : 'projects'} <span aria-hidden="true" className="text-accent">→</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
