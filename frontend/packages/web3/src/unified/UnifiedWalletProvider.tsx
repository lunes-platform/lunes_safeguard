import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubstrateProvider } from '../polkadot/SubstrateProvider';
import { config } from '../provider'; // Import existing Wagmi config
import { useUnifiedWallet } from './useUnifiedWallet';
import type { UnifiedWalletState } from './types';

// Create context for unified wallet
const UnifiedWalletContext = createContext<UnifiedWalletState | null>(null);

// Query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

interface UnifiedWalletProviderProps {
  children: ReactNode;
}

// Internal component that uses both contexts
function UnifiedWalletManager({ children }: UnifiedWalletProviderProps) {
  const unifiedWallet = useUnifiedWallet();

  return (
    <UnifiedWalletContext.Provider value={unifiedWallet}>
      {children}
    </UnifiedWalletContext.Provider>
  );
}

// Main provider that wraps everything
export function UnifiedWalletProvider({ children }: UnifiedWalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SubstrateProvider>
          <UnifiedWalletManager>
            {children}
          </UnifiedWalletManager>
        </SubstrateProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Hook to use the unified wallet context
export function useUnifiedWalletContext() {
  const context = useContext(UnifiedWalletContext);
  if (!context) {
    throw new Error('useUnifiedWalletContext must be used within a UnifiedWalletProvider');
  }
  return context;
}

// Export the hook for external use
export { useUnifiedWallet };
