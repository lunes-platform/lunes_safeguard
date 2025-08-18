/**
 * Module Polyfills for Chrome Extension Compatibility
 * 
 * Este arquivo fornece polyfills para módulos CommonJS que podem ser
 * requeridos dinamicamente por extensões do Chrome ou bibliotecas externas.
 */

// Polyfill para require global
if (typeof window !== 'undefined' && !window.require) {
  (window as any).require = function(id: string) {
    switch (id) {
      case 'react':
        return window.React || require('react');
      case 'react-dom':
        return window.ReactDOM || require('react-dom');
      case 'use-sync-external-store':
        // Fallback para use-sync-external-store
        try {
          return require('use-sync-external-store');
        } catch {
          // Polyfill básico se o módulo não estiver disponível
          return {
            useSyncExternalStore: (subscribe: any, getSnapshot: any, getServerSnapshot?: any) => {
              // Implementação básica usando React hooks
              const [state, setState] = window.React?.useState(getSnapshot());
              
              window.React?.useEffect(() => {
                const unsubscribe = subscribe(() => {
                  setState(getSnapshot());
                });
                return unsubscribe;
              }, [subscribe, getSnapshot]);
              
              return state;
            }
          };
        }
      default:
        console.warn(`Module '${id}' not found in polyfill registry`);
        return {};
    }
  };
}

// Polyfill para módulos específicos que podem causar problemas
if (typeof window !== 'undefined') {
  // Garantir que React esteja disponível globalmente
  if (!window.React && typeof require !== 'undefined') {
    try {
      window.React = require('react');
    } catch (e) {
      console.warn('React não pôde ser carregado globalmente:', e);
    }
  }
  
  // Garantir que ReactDOM esteja disponível globalmente
  if (!window.ReactDOM && typeof require !== 'undefined') {
    try {
      window.ReactDOM = require('react-dom');
    } catch (e) {
      console.warn('ReactDOM não pôde ser carregado globalmente:', e);
    }
  }
}

// Interceptar erros de módulos não encontrados
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Suprimir erros específicos de módulos
  if (
    message.includes('Dynamic require of') ||
    message.includes('use-sync-external-store') ||
    message.includes('Module not found') ||
    message.includes('chrome-extension://')
  ) {
    console.warn('Erro de módulo suprimido:', message);
    return;
  }
  
  originalConsoleError.apply(console, args);
};

export {};