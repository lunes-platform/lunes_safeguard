// Declaração de tipos para o módulo @safeguard/shared-ui
// Este arquivo resolve o erro de tipos implícitos 'any' do módulo

declare module '@safeguard/shared-ui' {
  // Hook para queries da API usando TanStack Query
  export function useApiQuery<TData = unknown, TError = Error>(
    options: {
      queryKey: readonly unknown[];
      queryFn: () => Promise<TData>;
      enabled?: boolean;
      staleTime?: number;
      refetchOnWindowFocus?: boolean;
    }
  ): {
    data: TData | undefined;
    isLoading: boolean;
    error: TError | null;
    refetch: () => void;
  };

  // Hook para conexões WebSocket
  export function useWebSocketConnection(
    options: {
      endpoints: string[];
      maxReconnectAttempts?: number;
      reconnectDelay?: number;
      connectionTimeout?: number;
      enableNetworkDetection?: boolean;
      exponentialBackoff?: boolean;
      maxBackoffDelay?: number;
    }
  ): {
    wsProvider: any | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    reconnect: () => void;
    isConnected: boolean;
    isConnecting: boolean;
    isReconnecting: boolean;
    connectionAttempts: number;
    currentEndpoint: string | null;
    error: string | null;
    networkStatus: 'fast' | 'slow' | 'offline';
  };

  // Outros exports que podem ser necessários
  export * from './components';
  export * from './hooks';
  export * from './utils';
}