import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProjectCard } from '@/components/project-card';
import { ProjectExplorer } from '@/components/project-explorer';
import { sortedProjects } from '@/content/localize';
import { isLocale } from '@/i18n/config';
import { alternates } from '@/i18n/meta';
import { fill, getDict } from '@/i18n/ui';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDict(locale);
  return { title: t.meta.workTitle, description: t.meta.workDescription, alternates: alternates(locale, '/projects') };
}

export default async function ProjectsPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : 'en';
  const t = getDict(locale);
  const all = sortedProjects(locale);
  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-14 sm:px-8 sm:pt-20">
      <header className="mb-12">
        <p className="label mb-4 text-accent">{t.work.eyebrow}</p>
        <h1 className="display text-[clamp(2.5rem,5.5vw,4.25rem)] text-ink">{t.work.title}</h1>
        <p className="pretty measure mt-6 text-[1rem] leading-[1.7] text-ink-2">{fill(t.work.intro, { n: all.length })}</p>
      </header>

      {/* The explorer reads the URL; the static grid below is what renders before hydration and without JS. */}
      <Suspense
        fallback={
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((p, i) => <ProjectCard key={p.slug} project={p} locale={locale} priority={i < 3} headingLevel={2} />)}
          </div>
        }
      >
        <ProjectExplorer projects={all} locale={locale} />
      </Suspense>
    </div>
  );
}
