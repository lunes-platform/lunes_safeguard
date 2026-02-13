import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  value: number; // 0..100
  showLabel?: boolean;
};

export function Progress({ value, showLabel = true, className = '', ...rest }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full bg-neutral-200 rounded h-3 ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} {...rest}>
      <div className="h-3 rounded bg-primary-500 transition-all" style={{ width: `${v}%` }} />
      {showLabel && <span className="sr-only">{v}%</span>}
    </div>
  );
}

export default Progress;
