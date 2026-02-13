import { useEffect } from 'react';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export type ToastData = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

export function Toast({
  id,
  title,
  description,
  variant = 'info',
  duration = 4000,
  onClose,
}: ToastData & { onClose: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onClose]);

  const styles = getStyles(variant);
  const ariaLive = variant === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role="alert"
      aria-live={ariaLive}
      className={`${styles.container} shadow-lg rounded-md p-4 mb-3 w-80 pointer-events-auto`}
    >
      <div className="flex items-start">
        <div className={`${styles.icon} mr-3 mt-0.5`}>{styles.iconGlyph}</div>
        <div className="flex-1">
          {title && <div className="font-semibold text-neutral-900">{title}</div>}
        {description && <div className="text-sm text-neutral-700 mt-0.5">{description}</div>}
        </div>
        <button
          onClick={() => onClose(id)}
          aria-label="Fechar alerta"
          className="ml-3 text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function getStyles(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return {
        container: 'bg-success-100 border border-success-200',
        icon: 'text-success-600',
        iconGlyph: '✓',
      };
    case 'warning':
      return {
        container: 'bg-warning-100 border border-warning-200',
        icon: 'text-warning-600',
        iconGlyph: '⚠',
      };
    case 'error':
      return {
        container: 'bg-critical-100 border border-critical-200',
        icon: 'text-critical-600',
        iconGlyph: '⚠',
      };
    case 'info':
    default:
      return {
        container: 'bg-primary-100 border border-primary-200',
        icon: 'text-primary-600',
        iconGlyph: 'ℹ',
      };
  }
}

export default Toast;
