import type { Metric } from '@/content/types';
import { CountUp } from './count-up';

export function MetricTile({ metric, size = 'md' }: { metric: Metric; size?: 'md' | 'lg' }) {
  return (
    <div className="card px-6 py-6">
      <div className={`figure font-semibold leading-none text-ink ${size === 'lg' ? 'text-[2.75rem]' : 'text-[2.25rem]'}`}>
        <CountUp value={metric.value} />
      </div>
      <div className="label mt-3 text-ink-3">{metric.label}</div>
      {metric.note ? <div className="mt-1.5 font-mono text-[10.5px] text-ink-4">{metric.note}</div> : null}
    </div>
  );
}
