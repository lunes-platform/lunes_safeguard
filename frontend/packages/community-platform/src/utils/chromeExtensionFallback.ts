/**
 * 🔧 Sistema de Fallback para Extensões Chrome
 * 
 * Este módulo implementa fallbacks robustos para problemas comuns
 * com extensões Chrome, incluindo web_accessible_resources e
 * importações dinâmicas falhadas.
 */

// Tipos para diferentes tipos de erros de extensão
export interface ExtensionError {
  type: 'web_accessible_resources' | 'dynamic_import' | 'network_blocked' | 'extension_unavailable';
  extensionId: string;
  resource?: string;
  message: string;
  timestamp: number;
}

export interface Extension {
  id: string;
  name: string;
  detectionFlag: string;
}

// Cache de extensões detectadas
const extensionCache = new Map<string, boolean>();
const errorLog: ExtensionError[] = [];

/**
 * 🛡️ Detecta uma extensão específica de forma segura.
 * Verifica a injeção do provedor da API no objeto window.
 * @param extension - O objeto da extensão a ser detectada.
 * @returns Promise<boolean> - Resolve para true se a extensão for detectada.
 */
export async function detectExtension(extension: Extension): Promise<boolean> {
  // Verifica cache primeiro
  if (extensionCache.has(extension.id)) {
    return Promise.resolve(extensionCache.get(extension.id)!);
  }

  return new Promise((resolve) => {
    // A detecção moderna de carteiras se baseia na presença de EIP-1193, que usa window.ethereum
    // Verificamos a propriedade específica da extensão para diferenciar.
    const isDetected = !!(window.ethereum && window.ethereum[extension.detectionFlag]) || !!window[extension.detectionFlag];
    extensionCache.set(extension.id, isDetected);
    resolve(isDetected);
  });
}

/**
 * 🛡️ Wrapper seguro para importações dinâmicas de extensões com retentativas
 */
export async function safeExtensionImport<T = any>(
  extensionId: string,
  resourcePath: string,
  options: { retries?: number; delay?: number } = {}
): Promise<T | null> {
  const { retries = 3, delay = 1000 } = options;

  for (let i = 0; i < retries; i++) {
    try {
      // @ts-ignore
      const module = await import(/* @vite-ignore */ `chrome-extension://${extensionId}/${resourcePath}`);
      return module;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isBlockedByClient = errorMessage.includes('net::ERR_BLOCKED_BY_CLIENT');

      const errorType = isBlockedByClient ? 'network_blocked' : 'dynamic_import';
      const isLastAttempt = i === retries - 1;
      const currentDelay = delay * Math.pow(2, i);

      const extensionError: ExtensionError = {
        type: errorType,
        extensionId,
        resource: resourcePath,
        message: `Attempt ${i + 1}/${retries} failed. ${errorMessage}`,
        timestamp: Date.now()
      };
      errorLog.push(extensionError);

      if (isBlockedByClient) {
        console.error(
          `[SafeGuard] Acesso à extensão ${extensionId} bloqueado pelo cliente (net::ERR_BLOCKED_BY_CLIENT). Verifique se há um bloqueador de anúncios ou outra extensão interferindo.`
        );
        // Se for bloqueado pelo cliente, não adianta tentar novamente.
        break;
      }

      console.warn(
        `[SafeGuard] Falha ao importar ${resourcePath} da extensão ${extensionId} (tentativa ${i + 1}/${retries}).`,
        error
      );

      if (!isLastAttempt) {
        console.log(`[SafeGuard] Tentando novamente em ${currentDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      } else {
        console.error(`[SafeGuard] Todas as ${retries} tentativas de importar ${resourcePath} falharam.`);
      }
    }
  }

  return null;
}

/**
 * 🔄 Monitora e tenta reconectar com extensões
 */
export class ExtensionMonitor {
  private intervals = new Map<string, NodeJS.Timeout>();
  private callbacks = new Map<string, (available: boolean) => void>();

  /**
   * Monitora uma extensão específica
   */
  monitor(extension: Extension, callback: (available: boolean) => void, intervalMs = 5000) {
    // Limpa monitor anterior se existir
    this.stopMonitoring(extension.id);
    
    this.callbacks.set(extension.id, callback);
    
    const interval = setInterval(async () => {
      const wasAvailable = extensionCache.get(extension.id) || false;
      const isAvailable = await detectExtension(extension);
      
      if (wasAvailable !== isAvailable) {
        callback(isAvailable);
        
        if (isAvailable) {
          console.info(`[SafeGuard] Extensão ${extension.name} reconectada`);
        } else {
          console.warn(`[SafeGuard] Extensão ${extension.name} desconectada`);
        }
      }
    }, intervalMs);
    
    this.intervals.set(extension.id, interval);
  }

  /**
   * Para de monitorar uma extensão
   */
  stopMonitoring(extensionId: string) {
    const interval = this.intervals.get(extensionId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(extensionId);
      this.callbacks.delete(extensionId);
    }
  }

  /**
   * Para todos os monitoramentos
   */
  stopAll() {
    for (const [extensionId] of this.intervals) {
      this.stopMonitoring(extensionId);
    }
  }
}

const commonExtensions: Extension[] = [
    { id: 'nkbihfbeogaeaoehlefnkodbefgpgknn', name: 'metamask', detectionFlag: 'isMetaMask' },
    { id: 'mopnmbcafieddcagagdcbnhejhlodfdd', name: 'polkadot', detectionFlag: 'isPolkadot' },
    { id: 'onhogfjeacnfoofkfgppdlbmlmnplgbn', name: 'subwallet', detectionFlag: 'isSubWallet' },
    { id: 'fijngjgcjhjmmpcmkeiomlglpeiijkld', name: 'talisman', detectionFlag: 'isTalisman' },
];

/**
 * 🎯 Detecta extensões Web3 comuns
 */
export async function detectWeb3Extensions() {
  const results: Record<string, boolean> = {};
  
  for (const extension of commonExtensions) {
    results[extension.name] = await detectExtension(extension);
  }
  
  return results;
}

/**
 * 📊 Obtém estatísticas de erros
 */
export function getExtensionErrorStats() {
  const stats = {
    total: errorLog.length,
    byType: {} as Record<string, number>,
    byExtension: {} as Record<string, number>,
    recent: errorLog.filter(e => Date.now() - e.timestamp < 60000) // Últimos 60s
  };
  
  for (const error of errorLog) {
    stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    stats.byExtension[error.extensionId] = (stats.byExtension[error.extensionId] || 0) + 1;
  }
  
  return stats;
}

/**
 * 🧹 Limpa logs antigos (mantém apenas últimas 100 entradas)
 */
export function cleanupErrorLog() {
  if (errorLog.length > 100) {
    errorLog.splice(0, errorLog.length - 100);
  }
}

// Instância global do monitor
export const extensionMonitor = new ExtensionMonitor();

// Limpeza automática a cada 5 minutos
setInterval(cleanupErrorLog, 5 * 60 * 1000);

// Detecta extensões Web3 na inicialização
if (typeof window !== 'undefined') {
  detectWeb3Extensions().then(extensions => {
    console.info('[SafeGuard] Extensões Web3 detectadas:', extensions);
  });
}