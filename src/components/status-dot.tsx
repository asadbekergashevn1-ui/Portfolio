import type { ProjectStatus } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { getDict } from '@/i18n/ui';

const COLOR: Record<ProjectStatus, string> = {
  live: 'var(--status-live)',
  dormant: 'var(--status-dormant)',
  mvp: 'var(--status-mvp)',
};

export function statusLabel(locale: Locale, status: ProjectStatus) {
  return getDict(locale).status[status];
}

export function StatusDot({ status, locale, withLabel = true }: { status: ProjectStatus; locale: Locale; withLabel?: boolean }) {
  const m = { color: COLOR[status], label: statusLabel(locale, status) };
  return (
    <span className="label inline-flex items-center gap-2 text-ink-3">
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: m.color, boxShadow: `0 0 0 3px color-mix(in srgb, ${m.color} 18%, transparent)` }}
      />
      {withLabel ? m.label : <span className="sr-only">{m.label}</span>}
    </span>
  );
}
