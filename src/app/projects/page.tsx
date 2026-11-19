import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProjectCard } from '@/components/project-card';
import { ProjectExplorer } from '@/components/project-explorer';
import { sortedProjects } from '@/content/projects';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Products shipped across CRM, automation, mobile, education and websites — with measured figures for each.',
  alternates: { canonical: '/projects' },
};

export default function ProjectsPage() {
  const all = sortedProjects();
  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-14 sm:px-8 sm:pt-20">
      <header className="mb-12">
        <p className="label mb-4 text-accent">Work · 2023—2026</p>
        <h1 className="display text-[clamp(2.5rem,5.5vw,4.25rem)] text-ink">All projects</h1>
        <p className="pretty measure mt-6 text-[1rem] leading-[1.7] text-ink-2">
          {all.length} products, ordered by weight rather than date. Every figure — lines of code,
          migrations, policies — was counted from the repository. Filter by what a project does, or
          search by technology.
        </p>
      </header>

      {/* The explorer reads the URL; the static grid below is what renders before hydration and without JS. */}
      <Suspense
        fallback={
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((p, i) => <ProjectCard key={p.slug} project={p} priority={i < 3} headingLevel={2} />)}
          </div>
        }
      >
        <ProjectExplorer projects={all} />
      </Suspense>
    </div>
  );
}
