'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { LOCALE_COOKIE, type Locale, localeMeta, localePath, locales, splitLocale } from '@/i18n/config';
import { Flag } from './flag';

/**
 * Language picker: a button with the current flag that opens a short list of
 * plain links to the same page in each language — so it works without JS, is
 * crawlable, and the choice is remembered in a cookie for the next visit.
 */
export function LanguageSwitcher({ locale, label, compact = false }: { locale: Locale; label: string; compact?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const { path } = splitLocale(pathname);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    setSearch(window.location.search);
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const items = [...(wrapRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitemradio"]') ?? [])];
        const i = items.indexOf(document.activeElement as HTMLAnchorElement);
        const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
        items[next]?.focus();
        e.preventDefault();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    wrapRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const remember = (l: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${localeMeta[locale].label}`}
        className="flex h-9 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-line px-2.5 text-ink-2 transition-colors hover:border-edge hover:text-ink"
      >
        <Flag locale={locale} />
        {compact ? null : <span className="font-mono text-[11px] font-medium tracking-wide">{localeMeta[locale].short}</span>}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        id={listId}
        role="menu"
        aria-label={label}
        hidden={!open}
        className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[11.5rem] overflow-hidden rounded-[var(--radius-md)] border border-line bg-raised p-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]"
      >
        {locales.map((l) => {
          const current = l === locale;
          return (
            <a
              key={l}
              role="menuitemradio"
              aria-checked={current}
              href={`${localePath(l, path)}${search}`}
              hrefLang={localeMeta[l].htmlLang}
              lang={localeMeta[l].htmlLang}
              onClick={() => remember(l)}
              className={`flex items-center gap-3 rounded-[calc(var(--radius-md)-2px)] px-3 py-2.5 text-[0.875rem] outline-none transition-colors focus-visible:bg-hover ${current ? 'text-ink' : 'text-ink-2 hover:bg-hover hover:text-ink'}`}
            >
              <Flag locale={l} />
              <span className="flex-1">{localeMeta[l].label}</span>
              {current ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent">
                  <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </a>
          );
        })}
      </div>
    </div>
  );
}
