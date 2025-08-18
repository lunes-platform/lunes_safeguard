import React, { useEffect, useState } from 'react';
import { detectWeb3Extensions, extensionMonitor, getExtensionErrorStats } from '../utils/chromeExtensionFallback';
import { AlertTriangle, CheckCircle, Info, XCircle, RefreshCw } from 'lucide-react';

interface ExtensionStatus {
  name: string;
  installed: boolean;
  version?: string;
  error?: string;
}

interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  recent: Array<{
    type: string;
    message: string;
    timestamp: number;
  }>;
}

export default function Diagnostic() {
  const [extensions, setExtensions] = useState<ExtensionStatus[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDiagnostics = async () => {
      try {
        // Detectar extensões Web3
        const detectedExtensions = await detectWeb3Extensions();
        const extensionsArray: ExtensionStatus[] = Object.entries(
          detectedExtensions
        ).map(([name, installed]) => ({
          name,
          installed: installed as boolean,
        }));
        setExtensions(extensionsArray);

        // Obter estatísticas de erros
        const stats = getExtensionErrorStats();
        setErrorStats(stats);
      } catch (error) {
        console.error('Erro ao carregar diagnósticos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDiagnostics();
  }, []);

  const refreshDiagnostics = async () => {
    setIsLoading(true);
    try {
      const detectedExtensions = await detectWeb3Extensions();
      const extensionsArray: ExtensionStatus[] = Object.entries(
        detectedExtensions
      ).map(([name, installed]) => ({
        name,
        installed: installed as boolean,
      }));
      setExtensions(extensionsArray);
      
      const stats = getExtensionErrorStats();
      setErrorStats(stats);
    } catch (error) {
      console.error('Erro ao atualizar diagnósticos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Carregando diagnósticos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Diagnóstico do Sistema</h1>
        <button
          onClick={refreshDiagnostics}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </button>
      </div>

      {/* Status das Extensões Web3 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Extensões Web3 Detectadas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {extensions.map((ext) => (
            <div
              key={ext.name}
              className={`p-4 rounded-lg border ${
                ext.installed
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{ext.name}</h3>
                {ext.installed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              {ext.version && (
                <p className="text-sm text-gray-600 mt-1">v{ext.version}</p>
              )}
              {ext.error && (
                <p className="text-sm text-red-600 mt-1">{ext.error}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Estatísticas de Erros */}
      {errorStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Estatísticas de Erros de Extensões</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Total de Erros: {errorStats.total}</h4>
              <div className="space-y-2">
                {Object.entries(errorStats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-sm">{type}:</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Erros Recentes</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {errorStats.recent.slice(0, 5).map((error, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="font-medium">{error.type}</div>
                    <div className="text-gray-600 truncate">{error.message}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(error.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informações sobre Erros Chrome Extension */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Erros Comuns de Extensões Chrome</h2>
        <div className="space-y-4">
          <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
            <h3 className="font-semibold text-yellow-800">web_accessible_resources</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Recursos da extensão não estão listados no manifest como acessíveis externamente.
            </p>
          </div>
          <div className="p-4 border-l-4 border-red-400 bg-red-50">
            <h3 className="font-semibold text-red-800">dynamic_import</h3>
            <p className="text-sm text-red-700 mt-1">
              Falha ao carregar módulos dinamicamente da extensão.
            </p>
          </div>
          <div className="p-4 border-l-4 border-blue-400 bg-blue-50">
            <h3 className="font-semibold text-blue-800">buffer_externalized</h3>
            <p className="text-sm text-blue-700 mt-1">
              Módulo Buffer foi externalizado para compatibilidade com o navegador.
            </p>
          </div>
          <div className="p-4 border-l-4 border-gray-400 bg-gray-50">
            <h3 className="font-semibold text-gray-800">network_blocked</h3>
            <p className="text-sm text-gray-700 mt-1">
              Requisições de rede bloqueadas por ad-blockers ou políticas de segurança.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}