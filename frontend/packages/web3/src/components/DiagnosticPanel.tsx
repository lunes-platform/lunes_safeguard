import React, { useState, useCallback } from 'react';
import { runFullDiagnostic } from '../utils/diagnostics';
import type { DiagnosticReport, DiagnosticResult } from '../utils/diagnostics';

interface DiagnosticPanelProps {
  className?: string;
  onReportGenerated?: (report: DiagnosticReport) => void;
}

const StatusIcon: React.FC<{ status: DiagnosticResult['status'] }> = ({ status }) => {
  const icons = {
    pass: '✅',
    fail: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const colors = {
    pass: 'text-green-600',
    fail: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };
  
  return (
    <span className={`text-lg ${colors[status]}`}>
      {icons[status]}
    </span>
  );
};

const DiagnosticResult: React.FC<{ result: DiagnosticResult }> = ({ result }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="border-l-4 border-gray-200 pl-4 py-2">
      <div className="flex items-start gap-3">
        <StatusIcon status={result.status} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{result.test}</h4>
            {result.details && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showDetails ? 'Ocultar' : 'Detalhes'}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{result.message}</p>
          
          {result.solution && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <span className="font-medium">💡 Solução:</span> {result.solution}
              </p>
            </div>
          )}
          
          {showDetails && result.details && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CategorySection: React.FC<{ 
  category: string; 
  results: DiagnosticResult[];
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ category, results, isExpanded, onToggle }) => {
  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">📁 {category}</span>
          <div className="flex gap-2 text-sm">
            {passCount > 0 && <span className="text-green-600">{passCount}✅</span>}
            {failCount > 0 && <span className="text-red-600">{failCount}❌</span>}
            {warningCount > 0 && <span className="text-yellow-600">{warningCount}⚠️</span>}
          </div>
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
          ▶
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-3">
          {results.map((result, index) => (
            <DiagnosticResult key={index} result={result} />
          ))}
        </div>
      )}
    </div>
  );
};

const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ 
  className = '',
  onReportGenerated 
}) => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const runDiagnostic = useCallback(async () => {
    setIsRunning(true);
    try {
      const newReport = await runFullDiagnostic();
      setReport(newReport);
      onReportGenerated?.(newReport);
      
      // Expandir categorias com falhas por padrão
      const categoriesWithIssues = new Set<string>();
      newReport.results.forEach(result => {
        if (result.status === 'fail' || result.status === 'warning') {
          categoriesWithIssues.add(result.category);
        }
      });
      setExpandedCategories(categoriesWithIssues);
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
    } finally {
      setIsRunning(false);
    }
  }, [onReportGenerated]);
  
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);
  
  const downloadReport = useCallback(() => {
    if (!report) return;
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `web3-diagnostic-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [report]);
  
  const categories = report ? [...new Set(report.results.map(r => r.category))] : [];
  
  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">🔍 Diagnóstico Web3</h2>
            <p className="text-sm text-gray-600 mt-1">
              Verifique a compatibilidade e conectividade do seu sistema
            </p>
          </div>
          
          <div className="flex gap-2">
            {report && (
              <button
                onClick={downloadReport}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                📥 Baixar Relatório
              </button>
            )}
            
            <button
              onClick={runDiagnostic}
              disabled={isRunning}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? '🔄 Executando...' : '🚀 Executar Diagnóstico'}
            </button>
          </div>
        </div>
        
        {report && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              📅 {new Date(report.timestamp).toLocaleString()}
            </span>
            <div className="flex gap-3">
              <span className="text-green-600">{report.summary.passed}✅ Passou</span>
              <span className="text-red-600">{report.summary.failed}❌ Falhou</span>
              <span className="text-yellow-600">{report.summary.warnings}⚠️ Avisos</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {isRunning && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Executando diagnóstico...</span>
          </div>
        )}
        
        {report && !isRunning && (
          <div className="space-y-4">
            {categories.map(category => {
              const categoryResults = report.results.filter(r => r.category === category);
              return (
                <CategorySection
                  key={category}
                  category={category}
                  results={categoryResults}
                  isExpanded={expandedCategories.has(category)}
                  onToggle={() => toggleCategory(category)}
                />
              );
            })}
            
            {report.summary.failed === 0 && report.summary.warnings === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-lg font-medium text-green-600 mb-2">
                  Tudo funcionando perfeitamente!
                </h3>
                <p className="text-gray-600">
                  Seu sistema está configurado corretamente para usar carteiras Web3.
                </p>
              </div>
            )}
          </div>
        )}
        
        {!report && !isRunning && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Pronto para diagnóstico
            </h3>
            <p className="text-gray-600 mb-4">
              Execute o diagnóstico para verificar a compatibilidade do seu sistema com carteiras Web3.
            </p>
            <button
              onClick={runDiagnostic}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              🚀 Iniciar Diagnóstico
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { DiagnosticPanel };
export default DiagnosticPanel;