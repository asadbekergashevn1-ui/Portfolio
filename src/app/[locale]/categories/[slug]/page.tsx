import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectCard } from '@/components/project-card';
import { getCategories, getCategory, projectsByCategory } from '@/content/localize';
import { isLocale, type Locale, localePath, locales, plural } from '@/i18n/config';
import { alternates } from '@/i18n/meta';
import { getDict } from '@/i18n/ui';

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  return locales.flatMap((locale) =>
    getCategories(locale as Locale).filter((c) => projectsByCategory(locale as Locale, c.slug).length).map((c) => ({ locale, slug: c.slug })),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const c = getCategory(raw, slug);
  if (!c) return { title: getDict(raw).meta.notFoundTitle };
  return { title: c.name, description: c.blurb, alternates: alternates(raw, `/categories/${c.slug}`) };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : 'en';
  const t = getDict(locale);
  const category = getCategory(locale, slug);
  if (!category) notFound();
  const items = projectsByCategory(locale, category.slug);
  const others = getCategories(locale).filter((c) => c.slug !== category.slug && projectsByCategory(locale, c.slug).length);

  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-10 sm:px-8 sm:pt-14">
      <nav aria-label={t.a11y.breadcrumb} className="mb-10">
        <ol className="label flex items-center gap-2 text-ink-4">
          <li><Link href={localePath(locale, '/categories')} className="hover:text-ink">{t.categories.title}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-3">{category.name}</li>
        </ol>
      </nav>

      <header className="mb-12">
        <h1 className="display text-[clamp(2.5rem,5.5vw,4.25rem)] text-ink">{category.name}</h1>
        <p className="pretty measure mt-6 text-[1.0625rem] leading-[1.7] text-ink-2">{category.blurb}</p>
        <p className="label mt-6 text-ink-4">{items.length} {plural(locale, items.length, t.common.project)}</p>
      </header>

      {items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => <ProjectCard key={p.slug} project={p} locale={locale} priority={i < 3} headingLevel={2} />)}
        </div>
      ) : (
        <p className="card px-6 py-16 text-center text-ink-3">{t.categories.empty}</p>
      )}

      <section className="mt-20 border-t border-line pt-10" aria-labelledby="other-h">
        <h2 id="other-h" className="label mb-5 text-ink-4">{t.categories.others}</h2>
        <ul className="flex flex-wrap gap-2">
          {others.map((c) => (
            <li key={c.slug}>
              <Link href={localePath(locale, `/categories/${c.slug}`)} className="label inline-block rounded-[var(--radius-md)] border border-line px-3.5 py-2 text-ink-3 transition-colors hover:border-edge hover:text-ink">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
