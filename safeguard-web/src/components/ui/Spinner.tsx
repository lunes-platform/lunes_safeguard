import type { HTMLAttributes } from 'react';

export function Spinner({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center justify-center ${className}`}
      {...rest}
    >
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

export default Spinner;
