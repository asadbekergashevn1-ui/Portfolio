import type { ProjectStatus } from '@/content/types';

const META: Record<ProjectStatus, { label: string; color: string }> = {
  live: { label: 'In production', color: 'var(--status-live)' },
  dormant: { label: 'Dormant', color: 'var(--status-dormant)' },
  mvp: { label: 'MVP', color: 'var(--status-mvp)' },
};

export function statusLabel(status: ProjectStatus) {
  return META[status].label;
}

export function StatusDot({ status, withLabel = true }: { status: ProjectStatus; withLabel?: boolean }) {
  const m = META[status];
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
