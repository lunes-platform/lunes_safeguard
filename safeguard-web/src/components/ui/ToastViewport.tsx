import Toast from './Toast';
import { type ToastRecord } from './ToastProvider';

export function ToastViewport({ toasts, onClose }: { toasts: ToastRecord[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={onClose} />
      ))}
    </div>
  );
}