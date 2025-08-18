/**
 * Dynamic Import Fallback for Chrome Extensions
 * 
 * Este arquivo fornece fallbacks para importações dinâmicas que falham
 * devido a extensões do Chrome ou recursos bloqueados.
 */

// Interceptar importações dinâmicas falhadas
const originalImport = window.import || ((specifier: string) => import(specifier));

// Polyfill para import() se não existir
if (!window.import) {
  (window as any).import = originalImport;
}

// Wrapper para importações dinâmicas com fallback
export async function safeImport(specifier: string, fallback?: any): Promise<any> {
  try {
    return await originalImport(specifier);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Verificar se é um erro de extensão do Chrome
    if (
      errorMessage.includes('chrome-extension://') ||
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('net::ERR_FAILED') ||
      errorMessage.includes('net::ERR_BLOCKED_BY_CLIENT')
    ) {
      console.warn(`Importação dinâmica falhada (extensão): ${specifier}`, error);
      
      // Retornar fallback se fornecido
      if (fallback !== undefined) {
        return fallback;
      }
      
      // Fallback padrão - objeto vazio
      return {};
    }
    
    // Re-lançar outros tipos de erro
    throw error;
  }
}

// Interceptar erros de Promise não tratadas relacionadas a importações
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.message : String(reason);
  
  if (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('chrome-extension://') ||
    message.includes('content.ts.') ||
    message.includes('content-script-loader')
  ) {
    console.warn('Erro de importação dinâmica suprimido:', message);
    event.preventDefault();
  }
});

// Interceptar erros de script loading
window.addEventListener('error', (event) => {
  const { message, filename, error } = event;
  
  if (
    message.includes('chrome-extension://') ||
    filename?.includes('chrome-extension://') ||
    message.includes('Failed to fetch') ||
    message.includes('net::ERR_FAILED')
  ) {
    console.warn('Erro de carregamento de script suprimido:', { message, filename });
    event.preventDefault();
  }
});

// Polyfill para fetch com fallback para recursos bloqueados
const originalFetch = window.fetch;
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await originalFetch(input, init);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : 'unknown';
    
    // Verificar se é um recurso bloqueado (AdBlocker, etc.)
    if (
      errorMessage.includes('ERR_BLOCKED_BY_CLIENT') ||
      errorMessage.includes('ERR_FAILED') ||
      url.includes('googlesyndication.com') ||
      url.includes('adsbygoogle')
    ) {
      console.warn(`Recurso bloqueado (provavelmente AdBlocker): ${url}`);
      
      // Retornar uma resposta vazia para não quebrar a aplicação
      return new Response('', {
        status: 204,
        statusText: 'No Content (Blocked)'
      });
    }
    
    // Re-lançar outros tipos de erro
    throw error;
  }
};

export {};