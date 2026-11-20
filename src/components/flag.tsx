import { useId } from 'react';
import type { Locale } from '@/i18n/config';

/**
 * Small SVG flags for the language switcher. SVG rather than emoji: Windows
 * renders flag emoji as plain letters ("GB", "RU").
 */
export function Flag({ locale, className = '' }: { locale: Locale; className?: string }) {
  const id = useId().replace(/:/g, '');
  const common = { className: `inline-block shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/15 ${className}`, width: 20, height: 14, 'aria-hidden': true as const };
  if (locale === 'ru') {
    return (
      <svg {...common} viewBox="0 0 9 6" preserveAspectRatio="none">
        <rect width="9" height="2" fill="#fff" />
        <rect y="2" width="9" height="2" fill="#0039a6" />
        <rect y="4" width="9" height="2" fill="#d52b1e" />
      </svg>
    );
  }
  if (locale === 'uz') {
    const stars: [number, number][] = [
      [125, 22], [150, 22], [175, 22],
      [100, 45], [125, 45], [150, 45], [175, 45],
      [75, 68], [100, 68], [125, 68], [150, 68], [175, 68],
    ];
    return (
      <svg {...common} viewBox="0 0 500 250" preserveAspectRatio="none">
        <rect width="500" height="250" fill="#1eb53a" />
        <rect width="500" height="125" fill="#0099b5" />
        <rect y="80" width="500" height="90" fill="#ce1126" />
        <rect y="85" width="500" height="80" fill="#fff" />
        <circle cx="70" cy="45" r="30" fill="#fff" />
        <circle cx="82" cy="45" r="30" fill="#0099b5" />
        {stars.map(([x, y]) => <circle key={`${x}-${y}`} cx={x + 60} cy={y} r="6" fill="#fff" />)}
      </svg>
    );
  }
  return (
    <svg {...common} viewBox="0 0 60 30" preserveAspectRatio="none">
      <clipPath id={`${id}s`}><path d="M0 0v30h60V0z" /></clipPath>
      <clipPath id={`${id}t`}><path d="M30 15h30v15zv15H0zH0V0zV0h30z" /></clipPath>
      <g clipPath={`url(#${id}s)`}>
        <path d="M0 0v30h60V0z" fill="#012169" />
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0l60 30m0-30L0 30" clipPath={`url(#${id}t)`} stroke="#c8102e" strokeWidth="4" />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}
