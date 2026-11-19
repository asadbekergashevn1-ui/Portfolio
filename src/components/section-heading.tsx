import Link from 'next/link';

export function SectionHeading({ eyebrow, title, href, hrefLabel }: { eyebrow?: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="label mb-3 text-accent">{eyebrow}</p> : null}
        <h2 className="balance text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em] text-ink">{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="label link-underline text-accent">
          {hrefLabel ?? 'View all'} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  );
}
