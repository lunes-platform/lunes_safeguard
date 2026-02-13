import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { type ToastData, type ToastVariant } from './Toast';
import { genId } from './toast-utils';
import { ToastViewport } from './ToastViewport';
import { ToastContext, type ToastContextValue } from '../../contexts/ToastContext';

export type ToastRecord = ToastData;



function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastContextValue['show']>(({ id, ...rest }) => {
    const finalId = id ?? genId();
    setToasts((list) => [{ id: finalId, ...rest }, ...list]);
    return finalId;
  }, []);

  const make = useCallback(
    (variant: ToastVariant) => (description: string, opts: Partial<Omit<ToastData, 'id' | 'variant' | 'description'>> & { title?: string } = {}) =>
      show({ id: genId(), description, variant, ...opts }),
    [show]
  );

  const value = useMemo<ToastContextValue>(() => ({
    show,
    make: (variant: ToastVariant, message: string, duration?: number) => make(variant)(message, { duration }),
    success: make('success'),
    warning: make('warning'),
    error: make('error'),
    info: make('info'),
    dismiss,
  }), [dismiss, make, show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={dismiss} />
    </ToastContext.Provider>
  );
}

export { ToastProvider };
