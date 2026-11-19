import Link from 'next/link';
import type { Project } from '@/content/types';
import { categoryName } from '@/content/categories';
import { ProjectMedia } from './project-media';
import { StatusDot } from './status-dot';

export function ProjectCard({ project, priority = false, headingLevel = 3 }: { project: Project; priority?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article data-card className="card card-interactive group relative flex flex-col overflow-hidden">
      <ProjectMedia project={project} priority={priority} className="border-b border-line" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <StatusDot status={project.status} />
          <span className="label text-ink-4">{categoryName(project.category)}</span>
        </div>
        <Heading className="mt-5 text-[1.3125rem] font-semibold tracking-[-0.02em] text-ink">
          <Link
            href={`/projects/${project.slug}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-[var(--radius-lg)] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--focus-ring)]"
          >
            {project.name}
          </Link>
        </Heading>
        <p className="pretty mt-2 text-[0.875rem] leading-[1.6] text-ink-3">{project.tagline}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-5" aria-label="Technologies">
          {project.stack.flatMap((g) => g.items).slice(0, 4).map((s) => (
            <li key={s} className="chip">{s}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
