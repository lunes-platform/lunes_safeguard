/**
 * Tipos comuns utilizados em toda a aplicação SafeGuard
 */

// Tipos básicos de endereços blockchain
export type Address = string;
export type Hash = string;
export type TokenId = string;
export type Amount = string; // Usando string para evitar problemas de precisão com números grandes

// Status genéricos
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Tipos de rede
export type NetworkType = 'mainnet' | 'testnet' | 'local';

// Configuração de rede
export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Tipos de erro
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

// Tipos de paginação
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Tipos de filtro
export interface FilterParams {
  search?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}

// Tipos de ordenação
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Tipos de validação
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Tipos de configuração
export interface AppConfig {
  apiUrl: string;
  contractAddress: Address;
  network: NetworkConfig;
  features: {
    voting: boolean;
    nftSupport: boolean;
    multiAsset: boolean;
  };
}

// Tipos de tema
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
}

// Tipos de notificação
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: {
    label: string;
    action: () => void;
  }[];
  timestamp: number;
}

// Tipos de modal
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// Tipos de formulário
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => ValidationResult;
  };
  options?: { label: string; value: string | number }[];
}

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Tipos de dados de tempo
export interface TimeRange {
  start: Date;
  end: Date;
}

export interface Duration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Tipos de métricas
export interface Metric {
  label: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  format?: 'number' | 'currency' | 'percentage';
}

// Tipos de ação
export interface Action {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick: () => void | Promise<void>;
}