'use client';

import { useEffect, useRef, useState } from 'react';
import { useShown } from './reveal';

/**
 * A figure that counts up from zero the first time it comes on screen.
 *
 * - The server renders the final value, so it is right without JS, in search
 *   results and in print; the count only runs in the browser.
 * - Only the leading number moves ("160k" counts 0 → 160, the "k" stays); values
 *   with no number ("24/7", "—") are left alone.
 * - Screen readers get the final value once, never the ticking digits.
 * - Tabular figures and a reserved width keep the layout from shifting.
 * - Reduced motion: the final value, no count.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useShown(ref, 0.99); // start as soon as the figure is on screen
  const match = /^(\D*)(\d+(?:[.,]\d+)?)(.*)$/.exec(value);
  const target = match ? parseFloat(match[2].replace(',', '.')) : 0;
  const decimals = match?.[2].split(/[.,]/)[1]?.length ?? 0;
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    if (!match || target === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!shown) {
      setN(0); // below the fold: hold at zero until it is seen
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // expo out: fast start, soft landing
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, target, duration]);

  if (!match) return <>{value}</>;
  const shownText = n === null ? value : `${match[1]}${n.toFixed(decimals)}${match[3]}`;
  return (
    <span ref={ref} className="relative inline-block">
      <span className="sr-only">{value}</span>
      {/* the final value reserves the width; the counting value sits on top of it */}
      <span aria-hidden="true" className="invisible">{value}</span>
      <span aria-hidden="true" className="absolute inset-0">{shownText}</span>
    </span>
  );
}
