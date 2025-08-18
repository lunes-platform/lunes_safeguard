import React, { createContext, useContext, ReactNode } from 'react';
import { useSubstrateWallet } from './useSubstrateWallet';
import type { SubstrateWalletContextType } from './types';

const SubstrateContext = createContext<SubstrateWalletContextType | null>(null);

interface SubstrateProviderProps {
  children: ReactNode;
}

export function SubstrateProvider({ children }: SubstrateProviderProps) {
  const substrateWallet = useSubstrateWallet();

  return (
    <SubstrateContext.Provider value={substrateWallet}>
      {children}
    </SubstrateContext.Provider>
  );
}

export function useSubstrate() {
  const context = useContext(SubstrateContext);
  if (!context) {
    throw new Error('useSubstrate must be used within a SubstrateProvider');
  }
  return context;
}

// Re-export for convenience
export { useSubstrateWallet } from './useSubstrateWallet';
export * from './types';
