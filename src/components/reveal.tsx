'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/**
 * Fades and lifts content in once it is on screen or has been scrolled past.
 *
 * Not an IntersectionObserver on purpose: an observer only reports threshold
 * crossings, so a jump that moves an element from below the viewport to above it
 * — an anchor link, the End key, or the browser restoring scroll on Back — never
 * crosses, and the element would stay hidden for good. Instead, anything whose
 * top is above the fold line is revealed, checked once per frame while scrolling
 * and removed as soon as it fires.
 *
 * Content is hidden only when JS is running (`html.js`), never in print, and not
 * at all under reduced motion. No motion library: this is the only scroll
 * animation the site needs and a library would cost ~40 KB per page.
 */
/** True once the element is on screen or has been scrolled past (see Reveal). */
export function useShown(ref: RefObject<HTMLElement | null>) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    let frame = 0;
    const check = () => {
      frame = 0;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        setShown(true);
        cleanup();
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const cleanup = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    check();
    return cleanup;
  }, [ref]);
  return shown;
}

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref);
  return (
    <div ref={ref} className={`reveal ${shown ? 'is-shown' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}
