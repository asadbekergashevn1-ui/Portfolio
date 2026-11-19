import Link from 'next/link';
import { profile } from '@/content/profile';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line" data-print-hide>
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-[1.125rem] font-semibold tracking-[-0.02em] text-ink">{profile.name}</p>
          <p className="mt-2 max-w-[38ch] text-[0.875rem] leading-[1.6] text-ink-3">{profile.headline}</p>
          {profile.available ? (
            <p className="label mt-5 inline-flex items-center gap-2 text-ink-3">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-live" />
              Available for new work
            </p>
          ) : null}
        </div>
        <nav aria-label="Footer">
          <p className="label mb-4 text-ink-4">Site</p>
          <ul className="space-y-2.5 text-[0.875rem]">
            {[['/', 'Home'], ['/projects', 'Work'], ['/categories', 'Categories'], ['/about', 'About'], ['/contact', 'Contact']].map(([href, label]) => (
              <li key={href}><Link href={href} className="text-ink-2 hover:text-ink">{label}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="label mb-4 text-ink-4">Elsewhere</p>
          <ul className="space-y-2.5 text-[0.875rem]">
            {profile.contact.map((c) => (
              <li key={c.kind}>
                <a href={c.href} className="text-ink-2 hover:text-ink" {...(c.kind !== 'email' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-8">
          <p className="font-mono text-[10.5px] text-ink-4">© {year} {profile.name} · {profile.location}</p>
          <p className="font-mono text-[10.5px] text-ink-4">Every figure on this site was measured from the source.</p>
        </div>
      </div>
    </footer>
  );
}
