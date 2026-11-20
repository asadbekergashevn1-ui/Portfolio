import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MetricTile } from '@/components/metric-tile';
import { ProjectMedia } from '@/components/project-media';
import { Reveal } from '@/components/reveal';
import { StatusDot, statusLabel } from '@/components/status-dot';
import { SplitWords } from '@/components/split-words';
import { categoryName, getProfile, getProject, sortedProjects } from '@/content/localize';
import type { ProjectLink } from '@/content/types';
import { isLocale, type Locale, localePath, locales } from '@/i18n/config';
import { alternates } from '@/i18n/meta';
import { type Dict, getDict } from '@/i18n/ui';
import { siteUrl } from '@/lib/site';

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  return locales.flatMap((locale) => sortedProjects(locale as Locale).map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const p = getProject(raw, slug);
  if (!p) return { title: getDict(raw).meta.notFoundTitle };
  return {
    title: p.name,
    description: `${p.tagline}. ${p.summary}`,
    alternates: alternates(raw, `/projects/${p.slug}`),
    openGraph: { title: p.name, description: p.tagline, type: 'article', images: [p.media.poster ?? '/opengraph-image'] },
  };
}

function LinkRow({ link, t }: { link: ProjectLink; t: Dict }) {
  const external = link.href.startsWith('http');
  const inner = (
    <>
      <span className="min-w-0">
        <span className="block text-[0.9375rem] font-medium text-ink">{link.label}</span>
        {link.note ? <span className="mt-1 block text-[0.8125rem] leading-[1.5] text-ink-3">{link.note}</span> : null}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <span className="label text-ink-4">{t.project.access[link.access]}</span>
        {external ? <span aria-hidden="true" className="text-accent">↗</span> : null}
      </span>
    </>
  );
  const cls = 'flex items-start justify-between gap-6 border-b border-line py-4 last:border-0';
  if (!external) return <div className={cls}>{inner}</div>;
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={`${cls} group transition-colors hover:text-accent`}>
      {inner}
      <span className="sr-only">{t.a11y.newTab}</span>
    </a>
  );
}

function StorySection({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <Reveal>
      <section aria-labelledby={`${id}-h`}>
        <h2 id={`${id}-h`} className="label mb-4 text-accent">{title}</h2>
        <p className="pretty measure text-[1.0625rem] leading-[1.8] text-ink-2">{body}</p>
      </section>
    </Reveal>
  );
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : 'en';
  const t = getDict(locale);
  const project = getProject(locale, slug);
  if (!project || project.draft) notFound();

  const list = sortedProjects(locale);
  const idx = list.findIndex((p) => p.slug === project.slug);
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];
  const { video, demo, screenshots, poster, kind } = project.media;
  const film = demo ?? video;

  const facts: [string, string][] = [
    [t.project.role, project.role],
    ...(project.client ? ([[t.project.client, project.client]] as [string, string][]) : []),
    [t.project.year, project.year],
    [t.project.state, statusLabel(locale, project.status)],
  ];

  return (
    <article className="mx-auto max-w-[1240px] px-5 pt-10 sm:px-8 sm:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.name,
            headline: project.tagline,
            description: project.summary,
            url: `${siteUrl}${localePath(locale, `/projects/${project.slug}`)}`,
            dateCreated: project.year,
            image: poster ? `${siteUrl}${poster}` : undefined,
            author: { '@type': 'Person', name: getProfile(locale).name },
            keywords: project.stack.flatMap((g) => g.items).join(', '),
          }).replace(/</g, '\\u003c'),
        }}
      />
      <nav aria-label={t.a11y.breadcrumb} className="mb-10">
        <ol className="label flex flex-wrap items-center gap-2 text-ink-4">
          <li><Link href={localePath(locale, '/projects')} className="hover:text-ink">{t.project.work}</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={localePath(locale, `/categories/${project.category}`)} className="hover:text-ink">{categoryName(locale, project.category)}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-3">{project.name}</li>
        </ol>
      </nav>

      <header>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <StatusDot status={project.status} locale={locale} />
          <span className="label text-ink-4">{categoryName(locale, project.category)} · {project.year}</span>
        </div>
        <h1 aria-label={project.name} className="display mt-6 text-[clamp(2.75rem,6.5vw,5rem)] text-ink"><SplitWords text={project.name} /></h1>
        <p className="font-serif balance mt-6 max-w-[34ch] text-[clamp(1.375rem,2.4vw,1.875rem)] italic leading-[1.3] text-accent">
          {project.tagline}.
        </p>
        <p className="pretty measure mt-7 text-[1.0625rem] leading-[1.7] text-ink-2">{project.summary}</p>

        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line lg:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k} className="bg-base px-5 py-5">
              <dt className="label text-ink-4">{k}</dt>
              <dd className="mt-2 text-[0.875rem] leading-snug text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      {/* No capture yet: skip the panel entirely. The metric tiles below carry the
          page, and an empty full-width rectangle is the one thing Signal forbids. */}
      {film || poster || screenshots.length ? (
      <section className="mt-6" aria-label={t.project.media}>
        {film ? (
          <figure className="card overflow-hidden" style={{ viewTransitionName: `media-${project.slug}` }}>
            <video controls playsInline preload="none" poster={poster ?? undefined} className="block aspect-[16/10] w-full bg-sunken object-cover">
              <source src={film.src} type={film.type} />
              {t.project.noVideo}
            </video>
            <figcaption className="label flex flex-wrap justify-between gap-2 border-t border-line px-5 py-3 text-ink-4">
              <span>{kind === 'motion' ? t.project.motionCaption : project.media.demoNote ?? t.project.recordedCaption}</span>
              <span>{demo?.audio ? t.project.soundOn : t.project.noSound}</span>
            </figcaption>
          </figure>
        ) : (
          <div className="card overflow-hidden" style={{ viewTransitionName: `media-${project.slug}` }}>
            <ProjectMedia project={project} locale={locale} priority sizes="(min-width: 1240px) 1180px, 100vw" />
          </div>
        )}
      </section>
      ) : null}

      {project.metrics.length ? (
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label={t.project.figures}>
          {project.metrics.map((m) => <li key={m.label}><MetricTile metric={m} /></li>)}
        </ul>
      ) : null}

      <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-16">
          <StorySection id="problem" title={t.project.problem} body={project.problem} />

          {project.benefits.length ? (
            <Reveal>
              <section aria-labelledby="benefits-h">
                <h2 id="benefits-h" className="label mb-6 text-accent">{t.project.changes}</h2>
                <ol className="space-y-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line">
                  {project.benefits.map((b, i) => (
                    <li key={b.title} className="grid grid-cols-[1.75rem_1fr] gap-x-3 bg-base p-5 sm:grid-cols-[3rem_1fr] sm:gap-x-4 sm:p-6">
                      <span aria-hidden="true" className="figure text-[0.8125rem] text-accent">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className="text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">{b.title}</h3>
                        <p className="pretty mt-2 text-[0.9375rem] leading-[1.65] text-ink-2">{b.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </Reveal>
          ) : null}

          <StorySection id="approach" title={t.project.how} body={project.approach} />

          <section aria-labelledby="features-h">
            <h2 id="features-h" className="label mb-6 text-accent">{t.project.does}</h2>
            <ul className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2">
              {project.features.map((f) => (
                <li key={f.title} className="bg-base p-6">
                  <h3 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">{f.title}</h3>
                  <p className="pretty mt-2 text-[0.875rem] leading-[1.65] text-ink-3">{f.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <StorySection id="outcome" title={t.project.stands} body={project.outcome} />

          {screenshots.length > 0 ? (
            <section aria-labelledby="shots-h">
              <h2 id="shots-h" className="label mb-6 text-accent">{t.project.screens}</h2>
              <ul className="grid gap-5 sm:grid-cols-2">
                {screenshots.map((s) => (
                  <li key={s.src}>
                    <figure className="card overflow-hidden">
                      <Image src={s.src} alt={s.alt} width={s.width} height={s.height} sizes="(min-width: 1024px) 40vw, 100vw" className="h-auto w-full" loading="lazy" />
                      {s.caption ? <figcaption className="border-t border-line px-5 py-3 text-[0.8125rem] text-ink-3">{s.caption}</figcaption> : null}
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <section aria-labelledby="stack-h">
            <h2 id="stack-h" className="label mb-5 text-ink-4">{t.project.builtWith}</h2>
            <dl className="space-y-5">
              {project.stack.map((g) => (
                <div key={g.group}>
                  <dt className="label mb-2 text-ink-3">{g.group}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {g.items.map((i) => <span key={i} className="chip">{i}</span>)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {project.links.length ? (
            <section aria-labelledby="links-h">
              <h2 id="links-h" className="label mb-3 text-ink-4">{t.project.links}</h2>
              <div>{project.links.map((l) => <LinkRow key={l.label} link={l} t={t} />)}</div>
            </section>
          ) : null}
        </div>
      </div>

      <nav aria-label={t.project.more} className="mt-24 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2">
        <Link href={localePath(locale, `/projects/${prev.slug}`)} className="group bg-base p-7 transition-colors hover:bg-hover">
          <span className="label text-ink-4"><span aria-hidden="true">←</span> {t.project.previous}</span>
          <span className="mt-3 block text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">{prev.name}</span>
        </Link>
        <Link href={localePath(locale, `/projects/${next.slug}`)} className="group bg-base p-7 text-right transition-colors hover:bg-hover">
          <span className="label text-ink-4">{t.project.next} <span aria-hidden="true">→</span></span>
          <span className="mt-3 block text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">{next.name}</span>
        </Link>
      </nav>
    </article>
  );
}
