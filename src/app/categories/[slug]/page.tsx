import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectCard } from '@/components/project-card';
import { categories, getCategory } from '@/content/categories';
import { projectsByCategory } from '@/content/projects';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return categories.filter((c) => projectsByCategory(c.slug).length).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCategory(slug);
  if (!c) return { title: 'Not found' };
  return { title: c.name, description: c.blurb, alternates: { canonical: `/categories/${c.slug}` } };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const items = projectsByCategory(category.slug);
  const others = categories.filter((c) => c.slug !== category.slug && projectsByCategory(c.slug).length);

  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-10 sm:px-8 sm:pt-14">
      <nav aria-label="Breadcrumb" className="mb-10">
        <ol className="label flex items-center gap-2 text-ink-4">
          <li><Link href="/categories" className="hover:text-ink">Categories</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-3">{category.name}</li>
        </ol>
      </nav>

      <header className="mb-12">
        <h1 className="display text-[clamp(2.5rem,5.5vw,4.25rem)] text-ink">{category.name}</h1>
        <p className="pretty measure mt-6 text-[1.0625rem] leading-[1.7] text-ink-2">{category.blurb}</p>
        <p className="label mt-6 text-ink-4">{items.length} {items.length === 1 ? 'project' : 'projects'}</p>
      </header>

      {items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => <ProjectCard key={p.slug} project={p} priority={i < 3} headingLevel={2} />)}
        </div>
      ) : (
        <p className="card px-6 py-16 text-center text-ink-3">Nothing published in this category yet.</p>
      )}

      <section className="mt-20 border-t border-line pt-10" aria-labelledby="other-h">
        <h2 id="other-h" className="label mb-5 text-ink-4">Other categories</h2>
        <ul className="flex flex-wrap gap-2">
          {others.map((c) => (
            <li key={c.slug}>
              <Link href={`/categories/${c.slug}`} className="label inline-block rounded-[var(--radius-md)] border border-line px-3.5 py-2 text-ink-3 transition-colors hover:border-edge hover:text-ink">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
