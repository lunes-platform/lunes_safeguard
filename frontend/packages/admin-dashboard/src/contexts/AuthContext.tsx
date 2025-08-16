import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUnifiedWalletContext } from '@safeguard/web3';

interface User {
  address: string;
  name?: string;
  walletType: 'substrate' | 'ethereum';
  network: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const {
    isConnected,
    isConnecting,
    connectedAccount,
    connectedWallet,
    disconnect,
    error: walletError
  } = useUnifiedWalletContext();

  // Sincronizar estado da carteira com o contexto de autenticação
  useEffect(() => {
    if (isConnected && connectedAccount && connectedWallet) {
      const userData: User = {
        address: connectedAccount.address,
        name: connectedAccount.name || `${connectedWallet.name} User`,
        walletType: connectedAccount.type as 'substrate' | 'ethereum',
        network: connectedAccount.network
      };
      
      setUser(userData);
      localStorage.setItem('connectedWallet', JSON.stringify({
        address: connectedAccount.address,
        walletId: connectedWallet.id,
        walletName: connectedWallet.name
      }));
      setError(null);
    } else {
      setUser(null);
      localStorage.removeItem('connectedWallet');
    }
    
    setIsLoading(isConnecting);
  }, [isConnected, connectedAccount, connectedWallet, isConnecting]);

  // Sincronizar erros da carteira
  useEffect(() => {
    if (walletError) {
      setError(walletError);
    }
  }, [walletError]);

  // Verificar se há uma carteira conectada anteriormente ao inicializar
  useEffect(() => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet && !isConnected) {
      try {
        const walletData = JSON.parse(savedWallet);
        // A reconexão automática será tratada pelo UnifiedWalletProvider
        console.log('Carteira salva encontrada:', walletData.walletName);
      } catch (error) {
        console.error('Erro ao carregar carteira do localStorage:', error);
        localStorage.removeItem('connectedWallet');
      }
    }
    setIsLoading(false);
  }, [isConnected]);

  const connectWallet = async (): Promise<void> => {
    setShowWalletModal(true);
    setError(null);
  };

  const disconnectWallet = () => {
    disconnect();
    setUser(null);
    localStorage.removeItem('connectedWallet');
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && isConnected,
    connectWallet,
    disconnectWallet,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};