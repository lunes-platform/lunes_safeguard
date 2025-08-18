'use client';

export * from './components/ErrorModal';
// Export all components
export * from './components/ui/button';
export * from './components/ui/input';
export * from './components/ui/file-input';
export * from './components/ui/modal';
export * from './components/ui/badge';
export * from './components/ui/avatar';
export * from './components/ui/spinner';
export * from './components/ui/card';
export * from './components/ui/ripple';
export * from './components/ui/skeleton';
export * from './components/ui/loading-page';
export * from './components/ui/tooltip'
export * from './components/ui/page-transition';
export * from './components/ui/shake-animation'
export * from './components/ui/icon-animations'
export * from './components/ui/audio-feedback'
export * from './components/ui/radio-group';
// Floating Labels
export {
  FloatingInput,
  FloatingTextarea,
  FloatingSelect,
  FloatingForm,
  FloatingFieldGroup,
  useFloatingLabel,
  type FloatingInputProps,
  type FloatingTextareaProps,
  type FloatingSelectProps,
  type FloatingFormProps,
  type FloatingFieldGroupProps
} from './floating-labels';

// Export custom components
export * from './components/ConnectWallet';
export * from './components/ConnectWalletButton';
export * from './components/WalletSelector';
export * from './components/ProjectRating';
export { default as Toast, type ToastProps, type ToastType } from './components/Toast';
export { default as ToastProvider, useToast } from './components/ToastProvider';

// Utilitários
export * from './lib/utils';

// Hooks
export * from './hooks/useNumberFormat';
export * from './hooks/useRipple';
export * from './hooks/useRealTimeValidation';

// Estilos globais
import './styles/globals.css';

// Re-exportar tipos importantes do @safeguard/types se necessário
export type {
  Address,
  Amount,
  Hash,
  LoadingState,
} from '@safeguard/types';