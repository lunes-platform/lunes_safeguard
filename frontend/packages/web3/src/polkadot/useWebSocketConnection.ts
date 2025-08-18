import { useState, useEffect, useCallback, useRef } from 'react';
import { WsProvider } from '@polkadot/api';

/**
 * Hook utilitário para gerenciar conexões WebSocket robustas
 * com reconexão automática e detecção de status de rede
 */

export interface WebSocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connectionAttempts: number;
  currentEndpoint: string | null;
  error: string | null;
  networkStatus: 'online' | 'offline' | 'slow';
}

export interface WebSocketConnectionOptions {
  endpoints: string[];
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  connectionTimeout?: number;
  enableNetworkDetection?: boolean;
  exponentialBackoff?: boolean;
  maxBackoffDelay?: number;
}

export function useWebSocketConnection(options: WebSocketConnectionOptions) {
  const {
    endpoints,
    maxReconnectAttempts = 5,
    reconnectDelay = 2000,
    connectionTimeout = 15000,
    enableNetworkDetection = true,
    exponentialBackoff = true,
    maxBackoffDelay = 30000
  } = options;

  const [state, setState] = useState<WebSocketConnectionState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    connectionAttempts: 0,
    currentEndpoint: null,
    error: null,
    networkStatus: 'online'
  });

  const wsProviderRef = useRef<WsProvider | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endpointIndexRef = useRef(0);
  const lastHealthCheckRef = useRef<number>(Date.now());

  // Detectar status da rede
  useEffect(() => {
    if (!enableNetworkDetection) return;

    const handleOnline = () => {
      console.log('🌐 Network back online');
      setState(prev => ({ ...prev, networkStatus: 'online' }));
      // Tentar reconectar quando a rede voltar
      if (!state.isConnected && !state.isConnecting) {
        connect();
      }
    };

    const handleOffline = () => {
      console.log('🌐 Network offline');
      setState(prev => ({ 
        ...prev, 
        networkStatus: 'offline',
        error: 'No internet connection detected'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar status inicial
    if (!navigator.onLine) {
      setState(prev => ({ ...prev, networkStatus: 'offline' }));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableNetworkDetection, state.isConnected, state.isConnecting]);

  // Limpar timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (healthCheckTimeoutRef.current) {
      clearTimeout(healthCheckTimeoutRef.current);
      healthCheckTimeoutRef.current = null;
    }
  }, []);

  // Health check para detectar conexões lentas
  const startHealthCheck = useCallback(() => {
    if (!wsProviderRef.current || !state.isConnected) return;

    const performHealthCheck = () => {
      const startTime = Date.now();
      lastHealthCheckRef.current = startTime;

      try {
        // Simular uma operação simples para testar a responsividade
        wsProviderRef.current?.isConnected;
        
        const responseTime = Date.now() - startTime;
        
        // Considerar conexão lenta se demorar mais de 5 segundos
        if (responseTime > 5000) {
          setState(prev => ({
            ...prev,
            networkStatus: 'slow',
            error: 'Connection is slow. Consider switching networks.'
          }));
        } else if (state.networkStatus === 'slow') {
          setState(prev => ({
            ...prev,
            networkStatus: 'online',
            error: null
          }));
        }
      } catch (error) {
        console.warn('Health check failed:', error);
        setState(prev => ({
          ...prev,
          networkStatus: 'slow',
          error: 'Connection health check failed'
        }));
      }

      // Agendar próximo health check em 30 segundos
      healthCheckTimeoutRef.current = setTimeout(performHealthCheck, 30000);
    };

    // Iniciar health check após 10 segundos da conexão
    healthCheckTimeoutRef.current = setTimeout(performHealthCheck, 10000);
  }, [state.isConnected, state.networkStatus]);

  // Conectar ao WebSocket
  const connect = useCallback(async () => {
    if (state.isConnecting) return;
    if (state.networkStatus === 'offline') {
      setState(prev => ({ ...prev, error: 'Cannot connect while offline' }));
      return;
    }

    clearTimeouts();

    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }));

    const tryConnection = async (endpointIndex: number): Promise<WsProvider | null> => {
      if (endpointIndex >= endpoints.length) {
        return null;
      }

      const endpoint = endpoints[endpointIndex];
      console.log(`🔄 Attempting connection to: ${endpoint}`);

      try {
        // Timeout para conexão
        const connectionPromise = new Promise<WsProvider>((resolve, reject) => {
          const wsProvider = new WsProvider(endpoint, 1000, {}, connectionTimeout);

          wsProvider.on('connected', () => {
            console.log(`✅ WebSocket connected to: ${endpoint}`);
            setState(prev => ({
              ...prev,
              isConnected: true,
              isConnecting: false,
              isReconnecting: false,
              connectionAttempts: 0,
              currentEndpoint: endpoint,
              error: null,
              networkStatus: 'online'
            }));
            
            // Iniciar health check após conexão bem-sucedida
            setTimeout(() => startHealthCheck(), 1000);
            
            resolve(wsProvider);
          });

          wsProvider.on('disconnected', () => {
            console.log(`🔌 WebSocket disconnected from: ${endpoint}`);
            setState(prev => ({
              ...prev,
              isConnected: false,
              currentEndpoint: null
            }));
            
            // Tentar reconectar automaticamente com backoff exponencial
            setState(currentState => {
              if (currentState.connectionAttempts < maxReconnectAttempts) {
                const newAttempts = currentState.connectionAttempts + 1;
                
                // Calcular delay com backoff exponencial ou linear
                let delay: number;
                if (exponentialBackoff) {
                  delay = Math.min(
                    reconnectDelay * Math.pow(2, newAttempts - 1),
                    maxBackoffDelay
                  );
                } else {
                  delay = reconnectDelay * newAttempts;
                }
                
                console.log(`🔄 Reconnecting in ${delay}ms (attempt ${newAttempts}/${maxReconnectAttempts})`);
                
                reconnectTimeoutRef.current = setTimeout(() => {
                  // Rotacionar para próximo endpoint se disponível
                  endpointIndexRef.current = (endpointIndexRef.current + 1) % endpoints.length;
                  connect();
                }, delay);
                
                return {
                  ...currentState,
                  isReconnecting: true,
                  connectionAttempts: newAttempts
                };
              } else {
                return {
                  ...currentState,
                  isReconnecting: false,
                  error: `Max reconnection attempts reached (${maxReconnectAttempts}). Please check your network connection and try again.`
                };
              }
            });
          });

          wsProvider.on('error', (error) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ WebSocket error on ${endpoint}:`, {
              error: errorMessage,
              endpoint,
              timestamp: new Date().toISOString(),
              connectionAttempts: state.connectionAttempts
            });
            
            // Classificar tipos de erro para melhor tratamento
            let userFriendlyError = 'Connection error occurred';
            if (errorMessage.includes('timeout')) {
              userFriendlyError = 'Connection timeout - network may be slow';
            } else if (errorMessage.includes('refused')) {
              userFriendlyError = 'Connection refused - server may be unavailable';
            } else if (errorMessage.includes('network')) {
              userFriendlyError = 'Network error - check your internet connection';
            }
            
            reject(new Error(userFriendlyError));
          });

          // Timeout de conexão
          connectionTimeoutRef.current = setTimeout(() => {
            reject(new Error(`Connection timeout after ${connectionTimeout}ms`));
          }, connectionTimeout);
        });

        return await connectionPromise;

      } catch (error) {
        console.error(`❌ Failed to connect to ${endpoint}:`, error);
        
        // Tentar próximo endpoint
        return await tryConnection(endpointIndex + 1);
      }
    };

    try {
      const wsProvider = await tryConnection(endpointIndexRef.current);
      
      if (wsProvider) {
        wsProviderRef.current = wsProvider;
      } else {
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'Failed to connect to any available endpoint'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [endpoints, maxReconnectAttempts, reconnectDelay, connectionTimeout, exponentialBackoff, maxBackoffDelay, state.isConnecting, state.networkStatus, state.connectionAttempts, clearTimeouts, startHealthCheck]);

  // Desconectar
  const disconnect = useCallback(() => {
    clearTimeouts();
    
    if (wsProviderRef.current) {
      wsProviderRef.current.disconnect();
      wsProviderRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      connectionAttempts: 0,
      currentEndpoint: null,
      error: null,
      networkStatus: navigator.onLine ? 'online' : 'offline'
    });

    console.log('🔌 WebSocket disconnected manually');
  }, [clearTimeouts]);

  // Reconectar manualmente
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 1000);
  }, [disconnect, connect]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
      if (wsProviderRef.current) {
        wsProviderRef.current.disconnect();
      }
    };
  }, [clearTimeouts]);

  return {
    ...state,
    wsProvider: wsProviderRef.current,
    connect,
    disconnect,
    reconnect
  };
}