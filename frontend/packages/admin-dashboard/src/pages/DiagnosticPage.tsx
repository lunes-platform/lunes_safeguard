import React from 'react';
import { DiagnosticPanel } from '@safeguard/web3';
import type { DiagnosticReport } from '@safeguard/web3';

const DiagnosticPage: React.FC = () => {
  const handleReportGenerated = (report: DiagnosticReport) => {
    console.log('📊 Relatório de diagnóstico gerado:', report);
    
    // Aqui você pode implementar lógica adicional, como:
    // - Enviar o relatório para analytics
    // - Salvar no localStorage para histórico
    // - Mostrar notificações baseadas nos resultados
    
    if (report.summary.failed > 0) {
      console.warn('⚠️ Problemas detectados no diagnóstico:', {
        failed: report.summary.failed,
        warnings: report.summary.warnings
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Diagnóstico do Sistema
          </h1>
          <p className="text-lg text-gray-600">
            Verifique a compatibilidade e conectividade do seu sistema com carteiras Web3.
          </p>
        </div>
        
        <DiagnosticPanel 
          className="mb-8"
          onReportGenerated={handleReportGenerated}
        />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📚 Sobre o Diagnóstico
          </h2>
          
          <div className="space-y-4 text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🌐 Testes de Ambiente</h3>
              <p className="text-sm">
                Verifica se o navegador está configurado corretamente (HTTPS, WebSocket, LocalStorage).
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🔌 Detecção de Extensões</h3>
              <p className="text-sm">
                Identifica carteiras instaladas (Polkadot.js, Talisman, SubWallet) e verifica sua disponibilidade.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🌍 Conectividade</h3>
              <p className="text-sm">
                Testa a conexão com endpoints WebSocket da rede Polkadot/Substrate.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">⚙️ Compatibilidade</h3>
              <p className="text-sm">
                Verifica polyfills necessários (Buffer) e compatibilidade do navegador.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">💡 Dicas</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Execute o diagnóstico sempre que encontrar problemas de conectividade</li>
              <li>• Baixe o relatório para compartilhar com o suporte técnico</li>
              <li>• Verifique as soluções sugeridas para cada problema detectado</li>
              <li>• Mantenha suas extensões de carteira sempre atualizadas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;