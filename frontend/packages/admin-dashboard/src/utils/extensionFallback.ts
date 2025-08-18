/**
 * Sistema de detecção e fallback para extensões Chrome e recursos bloqueados
 * 
 * Este utilitário detecta problemas comuns com extensões de carteira e recursos
 * bloqueados por AdBlockers, fornecendo fallbacks apropriados.
 */

// Interface para configuração de fallback
interface ExtensionFallbackConfig {
  retryAttempts?: number;
  retryDelay?: number;
  enableLogging?: boolean;
}

// Estado global das extensões detectadas
interface ExtensionState {
  polkadot: boolean;
  metamask: boolean;
  z3us: boolean;
  other: string[];
}

class ExtensionFallbackManager {
  private config: Required<ExtensionFallbackConfig>;
  private extensionState: ExtensionState;
  private blockedResources: Set<string>;

  constructor(config: ExtensionFallbackConfig = {}) {
    this.config = {
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      enableLogging: config.enableLogging ?? true
    };

    this.extensionState = {
      polkadot: false,
      metamask: false,
      z3us: false,
      other: []
    };

    this.blockedResources = new Set();
    this.initializeDetection();
  }

  /**
   * Inicializa a detecção de extensões e recursos bloqueados
   */
  private initializeDetection(): void {
    // Detectar extensões de carteira
    this.detectWalletExtensions();
    
    // Interceptar erros de recursos bloqueados
    this.interceptBlockedResources();
    
    // Detectar mudanças no DOM para extensões injetadas
    this.observeExtensionInjection();
  }

  /**
   * Detecta extensões de carteira disponíveis
   */
  private detectWalletExtensions(): void {
    // Polkadot.js
    if (typeof window !== 'undefined' && (window as any).injectedWeb3) {
      this.extensionState.polkadot = true;
      this.log('Polkadot.js extension detected');
    }

    // MetaMask
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.extensionState.metamask = true;
      this.log('MetaMask extension detected');
    }

    // Z3US (Radix)
    if (typeof window !== 'undefined' && (window as any).radixToolkit) {
      this.extensionState.z3us = true;
      this.log('Z3US extension detected');
    }
  }

  /**
   * Intercepta erros de recursos bloqueados
   */
  private interceptBlockedResources(): void {
    // Interceptar erros de fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        return await originalFetch(...args);
      } catch (error) {
        const url = args[0]?.toString() || 'unknown';
        if (this.isBlockedResourceError(error)) {
          this.blockedResources.add(url);
          this.log(`Blocked resource detected: ${url}`);
          return this.createFallbackResponse(url);
        }
        throw error;
      }
    };

    // Interceptar erros de importação dinâmica
    window.addEventListener('error', (event) => {
      if (event.message?.includes('Failed to fetch dynamically imported module')) {
        const url = this.extractUrlFromError(event.message);
        if (url) {
          this.blockedResources.add(url);
          this.log(`Blocked dynamic import detected: ${url}`);
        }
      }
    });
  }

  /**
   * Observa injeção de extensões no DOM
   */
  private observeExtensionInjection(): void {
    if (typeof window === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'SCRIPT' && 
                  element.getAttribute('src')?.includes('chrome-extension://')) {
                this.handleExtensionScript(element.getAttribute('src')!);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Tenta carregar um módulo com fallback
   */
  async loadModuleWithFallback<T>(moduleLoader: () => Promise<T>): Promise<T | null> {
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await moduleLoader();
      } catch (error) {
        this.log(`Module load attempt ${attempt} failed:`, error);
        
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay);
        }
      }
    }
    
    this.log('All module load attempts failed, returning null');
    return null;
  }

  /**
   * Verifica se um erro é de recurso bloqueado
   */
  private isBlockedResourceError(error: any): boolean {
    const errorMessage = error?.message || error?.toString() || '';
    return errorMessage.includes('ERR_BLOCKED_BY_CLIENT') ||
           errorMessage.includes('ERR_FAILED') ||
           errorMessage.includes('net::ERR_');
  }

  /**
   * Cria uma resposta de fallback para recursos bloqueados
   */
  private createFallbackResponse(url: string): Response {
    const fallbackData = {
      error: 'Resource blocked by client',
      url,
      fallback: true,
      timestamp: Date.now()
    };

    return new Response(JSON.stringify(fallbackData), {
      status: 200,
      statusText: 'OK (Fallback)',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Extrai URL de mensagem de erro
   */
  private extractUrlFromError(message: string): string | null {
    const match = message.match(/chrome-extension:\/\/[^\s]+/);
    return match ? match[0] : null;
  }

  /**
   * Manipula scripts de extensão detectados
   */
  private handleExtensionScript(src: string): void {
    this.log(`Extension script detected: ${src}`);
    
    // Adicionar à lista de extensões detectadas
    if (!this.extensionState.other.includes(src)) {
      this.extensionState.other.push(src);
    }
  }

  /**
   * Utilitário de delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log condicional
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[ExtensionFallback] ${message}`, ...args);
    }
  }

  /**
   * Obtém o estado atual das extensões
   */
  getExtensionState(): ExtensionState {
    return { ...this.extensionState };
  }

  /**
   * Obtém a lista de recursos bloqueados
   */
  getBlockedResources(): string[] {
    return Array.from(this.blockedResources);
  }

  /**
   * Verifica se uma extensão específica está disponível
   */
  isExtensionAvailable(extension: keyof ExtensionState): boolean {
    return this.extensionState[extension] as boolean;
  }

  /**
   * Limpa o cache de recursos bloqueados
   */
  clearBlockedResources(): void {
    this.blockedResources.clear();
  }
}

// Instância global do gerenciador
export const extensionFallback = new ExtensionFallbackManager({
  retryAttempts: 3,
  retryDelay: 1000,
  enableLogging: process.env.NODE_ENV === 'development'
});

// Exportar tipos para uso externo
export type { ExtensionFallbackConfig, ExtensionState };
export { ExtensionFallbackManager };