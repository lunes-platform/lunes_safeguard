import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import './utils/modulePolyfills';
import { UnifiedWalletProvider } from '@safeguard/web3';
import { extensionFallback } from './utils/extensionFallback';

// Polyfill para corrigir erro 'Dynamic require of react is not supported'
if (typeof window !== 'undefined') {
  // Definir require global para compatibilidade com bibliotecas legadas
  (window as any).require = (id: string) => {
    if (id === 'react') {
      return React;
    }
    if (id === 'react-dom') {
      return ReactDOM;
    }
    // Para outros módulos, retornar um objeto vazio para evitar erros
    console.warn(`[Polyfill] Module '${id}' not found, returning empty object`);
    return {};
  };

  // Interceptar erros globais de extensões
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    const filename = event.filename || '';
    
    // Suprimir erros conhecidos de extensões Chrome e bibliotecas problemáticas
    if (message.includes('chrome-extension://') ||
        message.includes('web_accessible_resources') ||
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Could not establish connection') ||
        message.includes('Resources must be listed in the web_accessible_resources') ||
        message.includes('net::ERR_FAILED') ||
        message.includes('ERR_BLOCKED_BY_CLIENT') ||
        message.includes('Dynamic require of') ||
        message.includes('use-sync-external-store') ||
        message.includes('Z3US') ||
        message.includes('content-script') ||
        message.includes('inpage') ||
        message.includes('adsbygoogle') ||
        filename.includes('chrome-extension://') ||
        filename.includes('use-sync-external-store')) {
      event.preventDefault();
      console.warn('[Extension Fallback] Suppressed extension/library error:', message);
      return false;
    }
  });

  // Interceptar erros de recursos rejeitados
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || event.reason || '';
    
    if (typeof reason === 'string' && (
        reason.includes('chrome-extension://') ||
        reason.includes('ERR_BLOCKED_BY_CLIENT') ||
        reason.includes('ERR_FAILED') ||
        reason.includes('web_accessible_resources') ||
        reason.includes('Dynamic require of') ||
        reason.includes('use-sync-external-store') ||
        reason.includes('Z3US') ||
        reason.includes('adsbygoogle') ||
        reason.includes('googlesyndication')
    )) {
      event.preventDefault();
      console.warn('[Extension Fallback] Suppressed blocked resource error:', reason);
    }
  });

  // Interceptar erros de console para suprimir warnings específicos
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suprimir erros específicos do React DevTools e bibliotecas
    if (message.includes('Download the React DevTools') ||
        message.includes('use-sync-external-store') ||
        message.includes('Dynamic require of') ||
        message.includes('chrome-extension://')) {
      return; // Não exibir esses erros
    }
    
    originalConsoleError.apply(console, args);
  };

  console.log('[Extension Fallback] Sistema de fallback avançado inicializado');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnifiedWalletProvider>
      <App />
    </UnifiedWalletProvider>
  </React.StrictMode>
);