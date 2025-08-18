import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface WalletStore {
  // Estado da carteira
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  chainId: number | null;
  balance: string | null;
  walletType: 'metamask' | 'walletconnect' | 'lunes' | null;
  error: string | null;

  // Ações
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  setAccount: (account: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setBalance: (balance: string | null) => void;
  setWalletType: (walletType: 'metamask' | 'walletconnect' | 'lunes' | null) => void;
  setError: (error: string | null) => void;
  
  // Métodos de conexão
  connectWallet: (walletType: 'metamask' | 'walletconnect' | 'lunes') => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  
  // Reset do estado
  reset: () => void;
}

const initialState = {
  isConnected: false,
  isConnecting: false,
  account: null,
  chainId: null,
  balance: null,
  walletType: null,
  error: null,
};

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
        ...initialState,

        // Setters básicos
        setConnecting: (connecting: boolean) => set({ isConnecting: connecting }),
        setConnected: (connected: boolean) => set({ isConnected: connected }),
        setAccount: (account: string | null) => set({ account }),
        setChainId: (chainId: number | null) => set({ chainId }),
        setBalance: (balance: string | null) => set({ balance }),
        setWalletType: (walletType: 'metamask' | 'walletconnect' | 'lunes' | null) => set({ walletType }),
        setError: (error: string | null) => set({ error }),

        // Método de conexão da carteira
        connectWallet: async (walletType: 'metamask' | 'walletconnect' | 'lunes') => {
          const state = get();
          
          if (state.isConnecting) {
            return;
          }

          set({ isConnecting: true, error: null });

          try {
            switch (walletType) {
              case 'metamask':
                await connectMetaMask();
                break;
              case 'walletconnect':
                await connectWalletConnect();
                break;
              case 'lunes':
                await connectLunes();
                break;
              default:
                throw new Error('Tipo de carteira não suportado');
            }
          } catch (error) {
            console.error('Erro ao conectar carteira:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erro desconhecido',
              isConnecting: false 
            });
          }
        },

        // Método de desconexão
        disconnectWallet: () => {
          set({
            ...initialState,
          });
          
          // Limpar dados do localStorage se necessário
          if (typeof window !== 'undefined') {
            localStorage.removeItem('wallet-storage');
          }
        },

        // Método para trocar de rede
        switchNetwork: async (chainId: number) => {
          const state = get();
          
          if (!state.isConnected || !window.ethereum) {
            throw new Error('Carteira não conectada');
          }

          try {
            await (window.ethereum as any).request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
            
            set({ chainId });
          } catch (error) {
            console.error('Erro ao trocar rede:', error);
            set({ error: 'Erro ao trocar de rede' });
            throw error;
          }
        },

        // Reset completo do estado
        reset: () => set(initialState),
      }),
      {
        name: 'wallet-storage',
        partialize: (state) => ({
          account: state.account,
          chainId: state.chainId,
          walletType: state.walletType,
          isConnected: state.isConnected,
        }),
      }
    )
  );

// Funções auxiliares de conexão
async function connectMetaMask() {
  if (!window.ethereum) {
    throw new Error('MetaMask não está instalado');
  }

  try {
    const accounts = await (window.ethereum as any).request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length === 0) {
      throw new Error('Nenhuma conta encontrada');
    }

    const chainId = await (window.ethereum as any).request({
      method: 'eth_chainId',
    });

    useWalletStore.getState().setAccount(accounts[0]);
    useWalletStore.getState().setChainId(parseInt(chainId, 16));
    useWalletStore.getState().setWalletType('metamask');
    useWalletStore.getState().setConnected(true);
    useWalletStore.getState().setConnecting(false);

    // Listener para mudanças de conta
    (window.ethereum as any).on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        useWalletStore.getState().disconnectWallet();
      } else {
        useWalletStore.getState().setAccount(accounts[0]);
      }
    });

    // Listener para mudanças de rede
    (window.ethereum as any).on('chainChanged', (chainId: string) => {
      useWalletStore.getState().setChainId(parseInt(chainId, 16));
    });

  } catch (error) {
    useWalletStore.getState().setConnecting(false);
    throw error;
  }
}

async function connectWalletConnect() {
  // Implementação futura para WalletConnect
  throw new Error('WalletConnect ainda não implementado');
}

async function connectLunes() {
  // Implementação futura para carteira Lunes
  throw new Error('Carteira Lunes ainda não implementada');
}

// Declaração global simples para window.ethereum
declare const window: any;

export type { WalletStore };