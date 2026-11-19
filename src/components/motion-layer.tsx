'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

/**
 * Site-wide motion that needs JavaScript, in one small listener set:
 *
 * - Page transitions: internal link clicks run inside the View Transitions API, so
 *   the page cross-fades and a project's picture travels from its card into the
 *   case study. Browsers without the API, modified clicks, new tabs, hash links
 *   and reduced motion all get ordinary navigation.
 * - Card spotlight: a fine pointer sets --mx/--my on the card it is over (one
 *   delegated, rAF-throttled listener; touch devices never attach it).
 */
export function MotionLayer() {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<(() => void) | null>(null);

  // the transition's "new state" is ready once the route has actually changed
  useEffect(() => {
    pending.current?.();
    pending.current = null;
  }, [pathname]);

  useEffect(() => {
    const doc = document as VTDocument;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onClick = (e: MouseEvent) => {
      if (!doc.startViewTransition || reduced.matches) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page (incl. hash and filter links)
      e.preventDefault(); // next/link sees this and stands down; we navigate below

      // give only the clicked card's picture the shared name, so it can travel
      const media = a.closest('[data-card]')?.querySelector<HTMLElement>('[data-media]');
      const slug = media?.dataset.media;
      if (media && slug) media.style.viewTransitionName = `media-${slug}`;

      doc.startViewTransition!(
        () =>
          new Promise<void>((resolve) => {
            const done = () => {
              clearTimeout(timer);
              resolve();
            };
            const timer = setTimeout(done, 1500);
            pending.current = done;
            router.push(url.pathname + url.search + url.hash);
          }),
      ).finished.finally(() => {
        if (media) media.style.viewTransitionName = '';
      });
    };
    document.addEventListener('click', onClick, true);

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      const card = (last?.target as Element | null)?.closest?.('[data-card]') as HTMLElement | null;
      if (!card || !last) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${last.clientX - r.left}px`);
      card.style.setProperty('--my', `${last.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    if (fine.matches) document.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [router]);

  return null;
}
