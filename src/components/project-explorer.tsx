'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import type { CategorySlug, Project, ProjectStatus } from '@/content/types';
import { getCategories } from '@/content/localize';
import type { Locale } from '@/i18n/config';
import { fill, getDict } from '@/i18n/ui';
import { ProjectCard } from './project-card';

/**
 * Filterable grid. State lives in the URL (?category=&status=&q=) so a filtered
 * view can be shared and survives a reload and the back button.
 */
export function ProjectExplorer({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const t = getDict(locale);
  const categories = getCategories(locale);
  const STATUSES: { id: ProjectStatus | 'all'; label: string }[] = [
    { id: 'all', label: t.work.anyState },
    { id: 'live', label: t.status.live },
    { id: 'mvp', label: t.status.mvp },
    { id: 'dormant', label: t.status.dormant },
  ];
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const category = (params.get('category') ?? 'all') as CategorySlug | 'all';
  const status = (params.get('status') ?? 'all') as ProjectStatus | 'all';
  const q = params.get('q') ?? '';

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (status !== 'all' && p.status !== status) return false;
      if (!needle) return true;
      const hay = [p.name, p.tagline, p.summary, ...p.stack.flatMap((g) => g.items)].join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [projects, category, status, q]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of projects) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [projects]);

  const filtered = category !== 'all' || status !== 'all' || q !== '';

  return (
    <div>
      <div className="flex flex-col gap-5 border-y border-line py-5 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={t.work.filterCategory} className="-mx-1 flex flex-wrap gap-1.5">
          {[{ slug: 'all', name: t.work.all }, ...categories].map((c) => {
            const on = category === c.slug;
            const n = c.slug === 'all' ? projects.length : counts.get(c.slug) ?? 0;
            if (c.slug !== 'all' && n === 0) return null;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => set('category', c.slug)}
                aria-pressed={on}
                className={`label cursor-pointer rounded-[var(--radius-md)] border px-3 py-2 transition-colors ${on ? 'border-accent bg-accent-wash text-accent' : 'border-line text-ink-3 hover:border-edge hover:text-ink'}`}
              >
                {c.name} <span className="ml-1 text-ink-4">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="status-filter">{t.work.filterState}</label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => set('status', e.target.value)}
            className="label h-10 cursor-pointer rounded-[var(--radius-md)] border border-line bg-raised px-3 text-ink-2"
          >
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="project-search">{t.work.search}</label>
          <input
            id="project-search"
            type="search"
            defaultValue={q}
            onChange={(e) => set('q', e.target.value)}
            placeholder={t.work.searchPlaceholder}
            className="h-10 w-full rounded-[var(--radius-md)] border border-line bg-raised px-3.5 font-mono text-[12px] text-ink placeholder:text-ink-4 sm:w-64"
          />
        </div>
      </div>

      <p className="label mt-5 text-ink-4" role="status" aria-live="polite">
        {pending ? t.work.updating : fill(t.work.nOfM, { n: shown.length, m: projects.length })}
      </p>

      {shown.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center px-6 py-20 text-center">
          <p className="text-[1.0625rem] font-medium text-ink">{t.work.none}</p>
          <p className="mt-2 text-[0.875rem] text-ink-3">{t.work.noneHint}</p>
          <button
            type="button"
            onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
            className="label mt-6 cursor-pointer rounded-[var(--radius-md)] border border-edge px-4 py-2.5 text-ink hover:bg-hover"
          >
            {t.work.clear}
          </button>
        </div>
      ) : (
        <div className={`mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${pending ? 'opacity-70' : ''} transition-opacity`}>
          {shown.map((p, i) => (
            <ProjectCard key={p.slug} project={p} locale={locale} priority={!filtered && i < 3} headingLevel={2} />
          ))}
        </div>
      )}
    </div>
  );
}
