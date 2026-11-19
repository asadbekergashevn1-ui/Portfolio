'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { profile } from '@/content/profile';
import { ThemeToggle } from './theme-toggle';

const NAV = [
  { href: '/projects', label: 'Work' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes, focus moves into the panel, scroll locks behind it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[color-mix(in_srgb,var(--surface-base)_88%,transparent)] backdrop-blur-xl" data-print-hide>
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3 rounded-md outline-none" aria-label={`${profile.name}, home`}>
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-live" style={{ boxShadow: '0 0 0 3px color-mix(in srgb, var(--status-live) 18%, transparent)' }} />
          <span className="font-mono text-[12px] font-medium tracking-tight text-ink">asadbek.ergashev</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`label rounded-[var(--radius-md)] px-3.5 py-2 transition-colors ${active ? 'bg-raised text-ink' : 'text-ink-3 hover:text-ink'}`}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="mx-2 h-5 w-px bg-line" aria-hidden="true" />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border border-line text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        ref={panelRef}
        hidden={!open}
        className="border-t border-line bg-base px-5 pb-8 pt-4 md:hidden"
        style={{ height: 'calc(100dvh - 4rem)' }}
      >
        <nav aria-label="Main">
          <ul className="flex flex-col">
            {[{ href: '/', label: 'Home' }, ...NAV].map((item) => {
              const active = item.href === '/' ? pathname === '/' : isActive(pathname, item.href);
              return (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between py-5 text-[1.75rem] font-semibold tracking-[-0.03em] ${active ? 'text-accent' : 'text-ink'}`}
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-ink-4">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <p className="label mt-8 text-ink-4">{profile.location}</p>
      </div>
    </header>
  );
}
