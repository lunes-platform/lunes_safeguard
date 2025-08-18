/**
 * 🔍 Sistema de Diagnóstico Automático para Carteiras Web3
 * 
 * Este utilitário fornece ferramentas de diagnóstico para identificar
 * e resolver problemas comuns com extensões de carteira e conectividade Web3.
 */

import { chromeExtensionErrorHandler, ChromeDiagnosticResult } from './chromeExtensionErrorHandler';

export interface DiagnosticResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  solution?: string;
  details?: any;
}

export interface DiagnosticReport {
  timestamp: string;
  userAgent: string;
  url: string;
  results: DiagnosticResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

/**
 * Executa diagnóstico completo do sistema Web3
 */
export async function runFullDiagnostic(): Promise<DiagnosticReport> {
  const results: DiagnosticResult[] = [];
  
  console.log('🔍 Iniciando diagnóstico completo do sistema Web3...');
  
  // Testes de ambiente
  results.push(...await testEnvironment());
  
  // Testes de extensões
  results.push(...await testExtensions());
  
  // Diagnóstico de erros Chrome
  results.push(...await runChromeExtensionDiagnostic());
  
  // Testes de conectividade
  results.push(...await testConnectivity());
  
  // Testes de compatibilidade
  results.push(...await testCompatibility());
  
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    warnings: results.filter(r => r.status === 'warning').length,
  };
  
  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    results,
    summary
  };
  
  console.log('📊 Diagnóstico concluído:', summary);
  return report;
}

/**
 * Testa o ambiente do navegador
 */
async function testEnvironment(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  // Teste de HTTPS
  results.push({
    category: 'Environment',
    test: 'HTTPS Protocol',
    status: window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? 'pass' : 'fail',
    message: window.location.protocol === 'https:' || window.location.hostname === 'localhost' 
      ? 'Protocolo seguro detectado' 
      : 'HTTPS necessário para extensões de carteira',
    solution: window.location.protocol !== 'https:' && window.location.hostname !== 'localhost'
      ? 'Acesse o site via HTTPS ou localhost para desenvolvimento'
      : undefined
  });
  
  // Teste de WebSocket support
  results.push({
    category: 'Environment',
    test: 'WebSocket Support',
    status: typeof WebSocket !== 'undefined' ? 'pass' : 'fail',
    message: typeof WebSocket !== 'undefined' 
      ? 'WebSocket suportado pelo navegador' 
      : 'WebSocket não suportado',
    solution: typeof WebSocket === 'undefined'
      ? 'Atualize seu navegador para uma versão mais recente'
      : undefined
  });
  
  // Teste de localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    results.push({
      category: 'Environment',
      test: 'LocalStorage',
      status: 'pass',
      message: 'LocalStorage funcionando corretamente'
    });
  } catch (error) {
    results.push({
      category: 'Environment',
      test: 'LocalStorage',
      status: 'fail',
      message: 'LocalStorage não disponível',
      solution: 'Verifique se o modo privado está desabilitado e se há espaço disponível'
    });
  }
  
  return results;
}

/**
 * Executa diagnóstico específico para erros de extensões Chrome
 */
async function runChromeExtensionDiagnostic(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  try {
    const diagnosticResults: ChromeDiagnosticResult[] = await chromeExtensionErrorHandler.diagnose();
    
    diagnosticResults.forEach((result: ChromeDiagnosticResult) => {
      results.push({
        category: 'Chrome Extensions',
        test: result.test,
        status: result.status,
        message: result.message,
        solution: result.solution,
        details: result.details
      });
    });
  } catch (error) {
    results.push({
      category: 'Chrome Extensions',
      test: 'Diagnóstico de Erros',
      status: 'fail',
      message: 'Erro ao executar diagnóstico de extensões Chrome',
      solution: 'Verifique se as extensões estão instaladas corretamente',
      details: error instanceof Error ? error.message : String(error)
    });
  }
  
  return results;
}

/**
 * Testa extensões de carteira instaladas
 */
async function testExtensions(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  const wallets = [
    { name: 'polkadot-js', displayName: 'Polkadot{.js}', key: 'polkadot-js' },
    { name: 'talisman', displayName: 'Talisman', key: 'talisman' },
    { name: 'subwallet-js', displayName: 'SubWallet', key: 'subwallet-js' }
  ];
  
  // Verificar injectedWeb3
  const injectedWeb3 = (window as any).injectedWeb3;
  
  if (!injectedWeb3) {
    results.push({
      category: 'Extensions',
      test: 'injectedWeb3 Global',
      status: 'fail',
      message: 'Nenhuma extensão Web3 detectada',
      solution: 'Instale pelo menos uma extensão de carteira (Polkadot{.js}, Talisman, SubWallet)'
    });
  } else {
    results.push({
      category: 'Extensions',
      test: 'injectedWeb3 Global',
      status: 'pass',
      message: `${Object.keys(injectedWeb3).length} extensão(ões) detectada(s)`,
      details: Object.keys(injectedWeb3)
    });
  }
  
  // Testar cada carteira
  for (const wallet of wallets) {
    const isInstalled = injectedWeb3?.[wallet.key] !== undefined;
    
    results.push({
      category: 'Extensions',
      test: `${wallet.displayName} Installation`,
      status: isInstalled ? 'pass' : 'info',
      message: isInstalled 
        ? `${wallet.displayName} instalada e detectada`
        : `${wallet.displayName} não instalada`,
      solution: !isInstalled 
        ? `Instale ${wallet.displayName} da Chrome Web Store`
        : undefined
    });
    
    // Testar funcionalidade se instalada
    if (isInstalled) {
      try {
        const extension = injectedWeb3[wallet.key];
        const hasEnable = typeof extension.enable === 'function';
        
        results.push({
          category: 'Extensions',
          test: `${wallet.displayName} Functionality`,
          status: hasEnable ? 'pass' : 'warning',
          message: hasEnable 
            ? `${wallet.displayName} funcional`
            : `${wallet.displayName} pode estar com problemas`,
          solution: !hasEnable 
            ? `Reinstale a extensão ${wallet.displayName}`
            : undefined
        });
      } catch (error) {
        results.push({
          category: 'Extensions',
          test: `${wallet.displayName} Functionality`,
          status: 'fail',
          message: `Erro ao testar ${wallet.displayName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          solution: `Reinstale ou atualize a extensão ${wallet.displayName}`
        });
      }
    }
  }
  
  return results;
}

/**
 * Testa conectividade de rede
 */
async function testConnectivity(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  const endpoints = [
    'wss://rpc.polkadot.io',
    'wss://kusama-rpc.polkadot.io',
    'wss://westend-rpc.polkadot.io'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const ws = new WebSocket(endpoint);
      
      const result = await new Promise<DiagnosticResult>((resolve) => {
        const timeout = setTimeout(() => {
          ws.close();
          resolve({
            category: 'Connectivity',
            test: `WebSocket ${endpoint}`,
            status: 'fail',
            message: `Timeout ao conectar com ${endpoint}`,
            solution: 'Verifique sua conexão com internet e firewall'
          });
        }, 5000);
        
        ws.onopen = () => {
          clearTimeout(timeout);
          const duration = Date.now() - startTime;
          ws.close();
          
          resolve({
            category: 'Connectivity',
            test: `WebSocket ${endpoint}`,
            status: duration < 3000 ? 'pass' : 'warning',
            message: `Conectado em ${duration}ms`,
            details: { duration, endpoint }
          });
        };
        
        ws.onerror = (error) => {
          clearTimeout(timeout);
          resolve({
            category: 'Connectivity',
            test: `WebSocket ${endpoint}`,
            status: 'fail',
            message: `Erro de conexão com ${endpoint}`,
            solution: 'Verifique firewall e bloqueadores de anúncio'
          });
        };
      });
      
      results.push(result);
    } catch (error) {
      results.push({
        category: 'Connectivity',
        test: `WebSocket ${endpoint}`,
        status: 'fail',
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        solution: 'Verifique sua conexão com internet'
      });
    }
  }
  
  return results;
}

/**
 * Testa compatibilidade do navegador
 */
async function testCompatibility(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  // Teste de Buffer polyfill
  try {
    const BufferTest = (window as any).Buffer;
    results.push({
      category: 'Compatibility',
      test: 'Buffer Polyfill',
      status: BufferTest ? 'pass' : 'warning',
      message: BufferTest 
        ? 'Buffer polyfill disponível'
        : 'Buffer polyfill não detectado',
      solution: !BufferTest 
        ? 'Polyfill será carregado automaticamente quando necessário'
        : undefined
    });
  } catch (error) {
    results.push({
      category: 'Compatibility',
      test: 'Buffer Polyfill',
      status: 'warning',
      message: 'Não foi possível verificar Buffer polyfill'
    });
  }
  
  // Teste de versão do Chrome
  const userAgent = navigator.userAgent;
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  
  if (chromeMatch) {
    const version = parseInt(chromeMatch[1]);
    results.push({
      category: 'Compatibility',
      test: 'Chrome Version',
      status: version >= 120 ? 'pass' : 'warning',
      message: `Chrome ${version} detectado`,
      solution: version < 120 
        ? 'Atualize o Chrome para versão 120 ou superior'
        : undefined,
      details: { version }
    });
  }
  
  return results;
}

/**
 * Gera relatório formatado para console
 */
export function printDiagnosticReport(report: DiagnosticReport): void {
  console.group('🔍 Relatório de Diagnóstico Web3');
  
  console.log(`📅 Data: ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`🌐 URL: ${report.url}`);
  console.log(`📊 Resumo: ${report.summary.passed}✅ ${report.summary.failed}❌ ${report.summary.warnings}⚠️`);
  
  const categories = [...new Set(report.results.map(r => r.category))];
  
  categories.forEach(category => {
    console.group(`📁 ${category}`);
    
    const categoryResults = report.results.filter(r => r.category === category);
    
    categoryResults.forEach(result => {
      const icon = {
        pass: '✅',
        fail: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }[result.status];
      
      console.log(`${icon} ${result.test}: ${result.message}`);
      
      if (result.solution) {
        console.log(`   💡 Solução: ${result.solution}`);
      }
      
      if (result.details) {
        console.log('   📋 Detalhes:', result.details);
      }
    });
    
    console.groupEnd();
  });
  
  console.groupEnd();
}

/**
 * Função de conveniência para executar diagnóstico completo
 */
export async function diagnose(): Promise<void> {
  try {
    const report = await runFullDiagnostic();
    printDiagnosticReport(report);
    
    // Salvar no localStorage para referência
    localStorage.setItem('web3-diagnostic-report', JSON.stringify(report));
    
    console.log('💾 Relatório salvo no localStorage como "web3-diagnostic-report"');
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error instanceof Error ? error.message : error);
  }
}

// Expor função globalmente para uso no console
if (typeof window !== 'undefined') {
  (window as any).diagnoseWeb3 = diagnose;
  console.log('🔧 Função diagnoseWeb3() disponível no console');
}

/**
 * Diagnóstico rápido para problemas específicos
 */
export const quickTests = {
  /**
   * Testa se extensões estão carregadas
   */
  checkExtensions(): void {
    const injected = (window as any).injectedWeb3;
    if (!injected) {
      console.log('❌ Nenhuma extensão Web3 detectada');
      console.log('💡 Instale Polkadot{.js}, Talisman ou SubWallet');
      return;
    }
    
    const extensions = Object.keys(injected);
    console.log(`✅ ${extensions.length} extensão(ões) detectada(s):`, extensions);
  },
  
  /**
   * Testa conectividade WebSocket
   */
  async checkConnectivity(): Promise<void> {
    console.log('🔍 Testando conectividade...');
    
    try {
      const ws = new WebSocket('wss://rpc.polkadot.io');
      const startTime = Date.now();
      
      ws.onopen = () => {
        const duration = Date.now() - startTime;
        console.log(`✅ Conectado em ${duration}ms`);
        ws.close();
      };
      
      ws.onerror = () => {
        console.log('❌ Erro de conexão');
        console.log('💡 Verifique firewall e bloqueadores');
      };
      
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          console.log('❌ Timeout de conexão');
        }
      }, 5000);
    } catch (error) {
      console.log('❌ Erro:', error instanceof Error ? error.message : String(error));
    }
  },
  
  /**
   * Mostra informações do ambiente
   */
  showEnvironment(): void {
    console.group('🌐 Informações do Ambiente');
    console.log('URL:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    console.log('User Agent:', navigator.userAgent);
    console.log('WebSocket Support:', typeof WebSocket !== 'undefined');
    console.log('LocalStorage:', typeof localStorage !== 'undefined');
    console.groupEnd();
  }
};

// Expor testes rápidos globalmente
if (typeof window !== 'undefined') {
  (window as any).web3QuickTests = quickTests;
}