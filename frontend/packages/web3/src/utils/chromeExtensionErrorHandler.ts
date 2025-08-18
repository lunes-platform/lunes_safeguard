/**
 * 🔧 Chrome Extension Error Handler
 * 
 * Utilitário para lidar com erros específicos de extensões Chrome
 * e implementar soluções robustas para problemas de compatibilidade.
 */

export interface ExtensionError {
  type: 'web_accessible_resources' | 'dynamic_import' | 'buffer_externalized' | 'network_blocked' | 'unknown';
  message: string;
  extensionId?: string;
  solution: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ExtensionStatus {
  name: string;
  id?: string;
  available: boolean;
  error?: ExtensionError;
  lastChecked: number;
}

export interface ChromeDiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  solution: string;
  details?: string;
}

/**
 * Detecta e classifica erros de extensões Chrome
 */
export class ChromeExtensionErrorHandler {
  private static instance: ChromeExtensionErrorHandler;
  private extensionCache = new Map<string, ExtensionStatus>();
  private errorPatterns = {
    webAccessibleResources: /Denying load of chrome-extension:\/\/([^/]+)\/.*Resources must be listed in the web_accessible_resources/,
    dynamicImport: /Failed to fetch dynamically imported module: chrome-extension:\/\/([^/]+)\//,
    bufferExternalized: /Module "buffer" has been externalized for browser compatibility/,
    networkBlocked: /net::ERR_BLOCKED_BY_CLIENT/,
    extensionInvalid: /chrome-extension:\/\/invalid/
  };

  static getInstance(): ChromeExtensionErrorHandler {
    if (!ChromeExtensionErrorHandler.instance) {
      ChromeExtensionErrorHandler.instance = new ChromeExtensionErrorHandler();
    }
    return ChromeExtensionErrorHandler.instance;
  }

  /**
   * Inicializa o handler de erros
   */
  initialize(): void {
    this.setupErrorListeners();
    this.setupBufferPolyfill();
    this.detectAvailableExtensions();
  }

  /**
   * Configura listeners para capturar erros
   */
  private setupErrorListeners(): void {
    // Captura erros de console
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      this.analyzeError(message);
      originalError.apply(console, args);
    };

    // Captura erros de rede
    window.addEventListener('error', (event) => {
      if (event.error) {
        this.analyzeError(event.error.message || event.message);
      }
    });

    // Captura erros de recursos não carregados
    window.addEventListener('error', (event) => {
      if (event.target && 'src' in event.target) {
        const src = (event.target as any).src;
        if (src && src.includes('chrome-extension://')) {
          this.handleResourceError(src);
        }
      }
    }, true);
  }

  /**
   * Configura polyfill do Buffer se necessário
   */
  private setupBufferPolyfill(): void {
    try {
      if (typeof window !== 'undefined' && !(window as any).Buffer) {
        // Tenta importar buffer dinamicamente
        import('buffer').then(({ Buffer }) => {
          (window as any).Buffer = Buffer;
          (window as any).global = window;
          console.log('✅ Buffer polyfill configurado com sucesso');
        }).catch((error) => {
          console.warn('⚠️ Falha ao configurar Buffer polyfill:', error);
          this.reportError({
            type: 'buffer_externalized',
            message: 'Buffer polyfill não pôde ser configurado',
            solution: 'Verifique se a dependência buffer está instalada',
            severity: 'high'
          });
        });
      }
    } catch (error) {
      console.warn('⚠️ Erro ao configurar Buffer polyfill:', error);
    }
  }

  /**
   * Detecta extensões disponíveis
   */
  private async detectAvailableExtensions(): Promise<void> {
    const extensionsToCheck = [
      { name: 'polkadot-js', key: 'injectedWeb3' },
      { name: 'talisman', key: 'talismanEth' },
      { name: 'subwallet', key: 'SubWallet' }
    ];

    for (const ext of extensionsToCheck) {
      try {
        const available = await this.checkExtensionAvailability(ext.key);
        this.extensionCache.set(ext.name, {
          name: ext.name,
          available,
          lastChecked: Date.now()
        });
      } catch (error) {
        this.extensionCache.set(ext.name, {
          name: ext.name,
          available: false,
          error: {
            type: 'dynamic_import',
            message: `Falha ao detectar ${ext.name}`,
            solution: `Instale a extensão ${ext.name} ou verifique se está habilitada`,
            severity: 'medium'
          },
          lastChecked: Date.now()
        });
      }
    }
  }

  /**
   * Verifica disponibilidade de uma extensão
   */
  private async checkExtensionAvailability(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 1000);
      
      const checkInterval = setInterval(() => {
        if ((window as any)[key]) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
    });
  }

  /**
   * Analisa e classifica erros
   */
  private analyzeError(message: string): void {
    let error: ExtensionError | null = null;

    // Web accessible resources
    const webAccessMatch = message.match(this.errorPatterns.webAccessibleResources);
    if (webAccessMatch) {
      error = {
        type: 'web_accessible_resources',
        message: 'Recursos da extensão não são acessíveis',
        extensionId: webAccessMatch[1],
        solution: 'A extensão precisa declarar recursos como web_accessible_resources',
        severity: 'high'
      };
    }

    // Dynamic import failure
    const dynamicImportMatch = message.match(this.errorPatterns.dynamicImport);
    if (dynamicImportMatch) {
      error = {
        type: 'dynamic_import',
        message: 'Falha ao importar módulo da extensão',
        extensionId: dynamicImportMatch[1],
        solution: 'Verifique se a extensão está instalada e atualizada',
        severity: 'medium'
      };
    }

    // Buffer externalized
    if (this.errorPatterns.bufferExternalized.test(message)) {
      error = {
        type: 'buffer_externalized',
        message: 'Módulo Buffer foi externalizado',
        solution: 'Configure polyfill do Buffer no Vite',
        severity: 'critical'
      };
    }

    // Network blocked
    if (this.errorPatterns.networkBlocked.test(message)) {
      error = {
        type: 'network_blocked',
        message: 'Recurso bloqueado por ad blocker',
        solution: 'Desabilite ad blockers ou use recursos locais',
        severity: 'low'
      };
    }

    if (error) {
      this.reportError(error);
    }
  }

  /**
   * Lida com erros de recursos não carregados
   */
  private handleResourceError(src: string): void {
    const extensionIdMatch = src.match(/chrome-extension:\/\/([^/]+)/);
    if (extensionIdMatch) {
      const error: ExtensionError = {
        type: 'web_accessible_resources',
        message: `Recurso não acessível: ${src}`,
        extensionId: extensionIdMatch[1],
        solution: 'Verifique se a extensão está instalada e configurada corretamente',
        severity: 'medium'
      };
      this.reportError(error);
    }
  }

  /**
   * Reporta erro para sistema de logging
   */
  private reportError(error: ExtensionError): void {
    console.warn('🔧 Chrome Extension Error:', error);
    
    // Aqui você pode integrar com sistema de analytics/logging
    // Analytics.track('chrome_extension_error', error);
  }

  /**
   * Obtém status de todas as extensões
   */
  getExtensionStatus(): Map<string, ExtensionStatus> {
    return new Map(this.extensionCache);
  }

  /**
   * Força nova detecção de extensões
   */
  async refreshExtensions(): Promise<void> {
    this.extensionCache.clear();
    await this.detectAvailableExtensions();
  }

  /**
   * Verifica se uma extensão específica está disponível
   */
  isExtensionAvailable(name: string): boolean {
    const status = this.extensionCache.get(name);
    return status?.available || false;
  }

  /**
   * Obtém soluções para problemas detectados
   */
  getSolutions(): string[] {
    const solutions: string[] = [];
    
    this.extensionCache.forEach((status) => {
      if (status.error) {
        solutions.push(status.error.solution);
      }
    });

    return [...new Set(solutions)];
  }

  /**
   * Executa diagnóstico completo das extensões Chrome
   */
  async diagnose(): Promise<ChromeDiagnosticResult[]> {
    const results: ChromeDiagnosticResult[] = [];
    
    // Atualiza cache de extensões
    await this.refreshExtensions();
    
    // Testa Buffer polyfill
    results.push(this.testBufferPolyfill());
    
    // Testa extensões disponíveis
    results.push(...this.testExtensionAvailability());
    
    // Testa recursos web acessíveis
    results.push(this.testWebAccessibleResources());
    
    // Testa bloqueios de rede
    results.push(this.testNetworkBlocking());
    
    return results;
  }
  
  /**
   * Testa se Buffer polyfill está funcionando
   */
  private testBufferPolyfill(): ChromeDiagnosticResult {
    try {
      const hasBuffer = typeof (window as any).Buffer !== 'undefined';
      return {
        test: 'Buffer Polyfill',
        status: hasBuffer ? 'pass' : 'warning',
        message: hasBuffer ? 'Buffer polyfill configurado' : 'Buffer polyfill não encontrado',
        solution: hasBuffer ? 'Nenhuma ação necessária' : 'Configure polyfill do Buffer no Vite',
        details: hasBuffer ? 'Buffer está disponível globalmente' : 'Módulo Buffer foi externalizado'
      };
    } catch (error) {
      return {
        test: 'Buffer Polyfill',
        status: 'fail',
        message: 'Erro ao verificar Buffer polyfill',
        solution: 'Verifique configuração do Vite e dependências',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Testa disponibilidade das extensões
   */
  private testExtensionAvailability(): ChromeDiagnosticResult[] {
    const results: ChromeDiagnosticResult[] = [];
    
    this.extensionCache.forEach((status, name) => {
      results.push({
        test: `Extensão ${name}`,
        status: status.available ? 'pass' : 'warning',
        message: status.available ? `${name} detectada` : `${name} não encontrada`,
        solution: status.available ? 'Nenhuma ação necessária' : `Instale a extensão ${name}`,
        details: status.error?.message || (status.available ? 'Extensão funcionando corretamente' : 'Extensão não instalada ou desabilitada')
      });
    });
    
    return results;
  }
  
  /**
   * Testa recursos web acessíveis
   */
  private testWebAccessibleResources(): ChromeDiagnosticResult {
    // Simula teste de recursos web acessíveis
    const hasWebAccessibleErrors = Array.from(this.extensionCache.values())
      .some(status => status.error?.type === 'web_accessible_resources');
    
    return {
      test: 'Web Accessible Resources',
      status: hasWebAccessibleErrors ? 'warning' : 'pass',
      message: hasWebAccessibleErrors ? 'Recursos não acessíveis detectados' : 'Recursos acessíveis OK',
      solution: hasWebAccessibleErrors ? 'Atualize extensões ou verifique manifest' : 'Nenhuma ação necessária',
      details: hasWebAccessibleErrors ? 'Algumas extensões não declaram recursos como web_accessible_resources' : 'Todos os recursos estão acessíveis'
    };
  }
  
  /**
   * Testa bloqueios de rede
   */
  private testNetworkBlocking(): ChromeDiagnosticResult {
    // Simula teste de bloqueios de rede
    const hasNetworkBlocking = Array.from(this.extensionCache.values())
      .some(status => status.error?.type === 'network_blocked');
    
    return {
      test: 'Bloqueios de Rede',
      status: hasNetworkBlocking ? 'warning' : 'pass',
      message: hasNetworkBlocking ? 'Recursos bloqueados detectados' : 'Sem bloqueios detectados',
      solution: hasNetworkBlocking ? 'Desabilite ad blockers ou use recursos locais' : 'Nenhuma ação necessária',
      details: hasNetworkBlocking ? 'Ad blockers podem estar interferindo' : 'Conectividade normal'
    };
  }

  /**
   * Gera relatório de compatibilidade
   */
  generateCompatibilityReport(): {
    extensions: ExtensionStatus[];
    errors: ExtensionError[];
    recommendations: string[];
  } {
    const extensions = Array.from(this.extensionCache.values());
    const errors = extensions
      .filter(ext => ext.error)
      .map(ext => ext.error!);
    
    const recommendations = [
      'Mantenha suas extensões sempre atualizadas',
      'Verifique se as extensões têm permissões adequadas',
      'Desabilite ad blockers se necessário',
      'Use HTTPS para melhor compatibilidade'
    ];

    return {
      extensions,
      errors,
      recommendations
    };
  }
}

// Instância global
export const chromeExtensionErrorHandler = ChromeExtensionErrorHandler.getInstance();

// Auto-inicialização se estiver no browser
if (typeof window !== 'undefined') {
  chromeExtensionErrorHandler.initialize();
}