import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Tipos de toast disponíveis
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Interface para um toast individual
 */
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Interface do contexto de toast
 */
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * Contexto de Toast para gerenciar notificações globais
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook para usar o contexto de toast
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Props do ToastProvider
 */
interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Provider do contexto de toast
 * Gerencia o estado global das notificações toast
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Adiciona um novo toast
   */
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000, // 5 segundos por padrão
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove o toast após a duração especificada
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  /**
   * Remove um toast específico
   */
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  /**
   * Remove todos os toasts
   */
  const clearToasts = () => {
    setToasts([]);
  };

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};