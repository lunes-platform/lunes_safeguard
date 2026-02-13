import { createContext } from 'react';
import { type ToastData, type ToastVariant } from '../components/ui/Toast';

export type ToastContextValue = {
  show: (data: ToastData) => void;
  dismiss: (id: string) => void;
  make: (variant: ToastVariant, message: string, duration?: number) => void;
};

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);