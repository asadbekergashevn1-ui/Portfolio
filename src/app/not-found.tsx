import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col items-start px-5 py-32 sm:px-8">
      <p className="label mb-4 text-accent">404</p>
      <h1 className="display text-[clamp(2.5rem,6vw,4.5rem)] text-ink">Nothing at this address.</h1>
      <p className="mt-6 max-w-[44ch] text-[1rem] leading-[1.7] text-ink-2">
        The page may have moved, or the link was mistyped. The work is all in one place.
      </p>
      <Link href="/projects" className="label mt-10 rounded-[var(--radius-md)] bg-accent px-6 py-3.5 font-semibold text-accent-ink hover:opacity-90">
        See all projects
      </Link>
    </div>
  );
}
