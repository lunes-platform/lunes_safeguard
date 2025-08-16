import React, { useState, useEffect } from 'react';
import { WsProvider } from '@polkadot/api';
import { LUNES_NETWORK } from '../../../web3/src/polkadot/types';

interface EndpointStatus {
  endpoint: string;
  status: 'testing' | 'connected' | 'failed' | 'timeout';
  latency?: number;
  error?: string;
}

/**
 * Componente de diagnóstico para testar conectividade com endpoints da rede Lunes
 * Ajuda a identificar problemas de conectividade WebSocket
 */
export function NetworkDiagnostic() {
  const [endpointStatuses, setEndpointStatuses] = useState<EndpointStatus[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);

  const allEndpoints = [
    LUNES_NETWORK.endpoint,
    ...(LUNES_NETWORK.fallbackEndpoints || [])
  ];

  useEffect(() => {
    // Inicializar status dos endpoints
    setEndpointStatuses(
      allEndpoints.map(endpoint => ({
        endpoint,
        status: 'testing' as const
      }))
    );
  }, []);

  const testEndpoint = async (endpoint: string): Promise<EndpointStatus> => {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      let resolved = false;
      
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve({
            endpoint,
            status: 'timeout',
            error: 'Connection timeout after 10 seconds'
          });
        }
      }, 10000);

      try {
        const wsProvider = new WsProvider(endpoint, 1000, {}, 10000);

        wsProvider.on('connected', () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            const latency = Date.now() - startTime;
            
            wsProvider.disconnect();
            resolve({
              endpoint,
              status: 'connected',
              latency
            });
          }
        });

        wsProvider.on('error', (error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            
            wsProvider.disconnect();
            resolve({
              endpoint,
              status: 'failed',
              error: error ? error.toString() : 'Unknown WebSocket error'
            });
          }
        });

      } catch (error) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve({
            endpoint,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    });
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    
    // Resetar status
    setEndpointStatuses(
      allEndpoints.map(endpoint => ({
        endpoint,
        status: 'testing' as const
      }))
    );

    // Testar cada endpoint
    for (let i = 0; i < allEndpoints.length; i++) {
      const endpoint = allEndpoints[i];
      console.log(`🔍 Testing endpoint: ${endpoint}`);
      
      const result = await testEndpoint(endpoint);
      
      setEndpointStatuses(prev => 
        prev.map(status => 
          status.endpoint === endpoint ? result : status
        )
      );
    }
    
    setIsTestingAll(false);
  };

  const getStatusColor = (status: EndpointStatus['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'timeout': return 'text-orange-600';
      case 'testing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: EndpointStatus['status']) => {
    switch (status) {
      case 'connected': return '✅';
      case 'failed': return '❌';
      case 'timeout': return '⏰';
      case 'testing': return '🔄';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          🌐 Diagnóstico de Conectividade - Rede Lunes
        </h2>
        <button
          onClick={testAllEndpoints}
          disabled={isTestingAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTestingAll ? '🔄 Testando...' : '🔍 Testar Endpoints'}
        </button>
      </div>

      <div className="space-y-4">
        {endpointStatuses.map((status, index) => (
          <div 
            key={status.endpoint}
            className="border rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(status.status)}</span>
                <div>
                  <p className="font-medium text-gray-900">
                    {index === 0 ? '🎯 Endpoint Principal' : `🔄 Fallback ${index}`}
                  </p>
                  <p className="text-sm text-gray-600 font-mono">
                    {status.endpoint}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-medium ${getStatusColor(status.status)}`}>
                  {status.status === 'testing' && '🔄 Testando...'}
                  {status.status === 'connected' && '✅ Conectado'}
                  {status.status === 'failed' && '❌ Falhou'}
                  {status.status === 'timeout' && '⏰ Timeout'}
                </p>
                
                {status.latency && (
                  <p className="text-sm text-gray-600">
                    ⚡ {status.latency}ms
                  </p>
                )}
                
                {status.error && (
                  <p className="text-sm text-red-600 mt-1 max-w-xs truncate" title={status.error}>
                    {status.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Informações de Diagnóstico</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Endpoint Principal:</strong> Usado como primeira opção de conexão</li>
          <li>• <strong>Fallback Endpoints:</strong> Usados automaticamente se o principal falhar</li>
          <li>• <strong>Latência:</strong> Tempo de resposta da conexão WebSocket</li>
          <li>• <strong>Timeout:</strong> Conexão demorou mais de 10 segundos</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-medium text-yellow-900 mb-2">🔧 Possíveis Soluções</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Verifique sua conexão com a internet</li>
          <li>• Tente desabilitar extensões de bloqueio (AdBlock, etc.)</li>
          <li>• Verifique se o firewall não está bloqueando conexões WebSocket</li>
          <li>• Se todos os endpoints falharem, pode ser um problema temporário da rede</li>
        </ul>
      </div>
    </div>
  );
}