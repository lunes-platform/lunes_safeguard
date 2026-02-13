import type { ReactNode } from 'react';

export type TimelineStatus = 'completed' | 'in_progress' | 'upcoming';

export type TimelineItem = {
  id: string;
  date?: string;
  title: string;
  description?: string | ReactNode;
  status?: TimelineStatus;
};

type Props = {
  items: TimelineItem[];
  className?: string;
};

const statusStyles: Record<TimelineStatus, { dot: string; line: string; label: string }> = {
  completed: {
    dot: 'bg-primary-500 border-primary-500',
    line: 'bg-primary-200',
    label: 'Concluído',
  },
  in_progress: {
    dot: 'bg-white border-primary-500',
    line: 'bg-primary-200',
    label: 'Em andamento',
  },
  upcoming: {
    dot: 'bg-white border-neutral-300',
    line: 'bg-neutral-200',
    label: 'Próximo',
  },
};

export function Timeline({ items, className = '' }: Props) {
  return (
    <ol className={`relative border-l-2 border-neutral-200 pl-6 ${className}`} aria-label="Linha do tempo de eventos">
      {items.map((item, idx) => {
        const status: TimelineStatus = item.status ?? 'upcoming';
        const isLast = idx === items.length - 1;
        const styles = statusStyles[status];
        return (
          <li key={item.id} className="mb-8 last:mb-0 relative">
            {/* connector line overlay to handle per-item color if desired */}
            {!isLast && (
              <span className={`absolute left-[-2px] top-6 w-0.5 h-[calc(100%_-_1.5rem)] ${styles.line}`} aria-hidden />
            )}

            {/* dot */}
            <span
              className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 ${styles.dot}`}
              aria-hidden
            />

            {/* content */}
            <div className="ml-2">
              <div className="flex flex-wrap items-center gap-x-2">
                <h3 className="text-base font-semibold text-neutral-900">{item.title}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{styles.label}</span>
            {item.date && <time className="text-sm text-neutral-500" dateTime={item.date}>{item.date}</time>}
              </div>
              {item.description && (
                <div className="mt-1 text-sm text-neutral-700">
                  {item.description}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default Timeline;
