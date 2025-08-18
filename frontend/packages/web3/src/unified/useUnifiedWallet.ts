import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { useSubstrate } from '../polkadot/SubstrateProvider';
import { 
  WalletType, 
  UnifiedWalletInfo, 
  UnifiedAccount, 
  UnifiedWalletState,
  UNIFIED_WALLETS 
} from './types';

export function useUnifiedWallet(): UnifiedWalletState {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Ethereum (Wagmi) hooks
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { connect: ethConnect } = useConnect();
  const { disconnect: ethDisconnect } = useDisconnect();

  // Substrate hooks
  const {
    selectedWallet: substrateWallet,
    selectedAccount: substrateAccount,
    wallets: substrateWallets, // Renamed from availableWallets
    connect: substrateConnect, // Renamed from connectWallet
    disconnect: substrateDisconnect, // Renamed from disconnectWallet
    isConnecting: substrateConnecting,
    apiError: substrateError, // Renamed from error
  } = useSubstrate();

  // Detect available wallets
  const availableWallets = useMemo((): UnifiedWalletInfo[] => {
    const wallets: UnifiedWalletInfo[] = [];

    // Ethereum wallets
    wallets.push({
      ...UNIFIED_WALLETS.metamask,
      installed: typeof window !== 'undefined' && !!(window as any).ethereum
    });

    wallets.push({
      ...UNIFIED_WALLETS.walletconnect,
      installed: true // WalletConnect is always available
    });

    // Substrate wallets
    substrateWallets.forEach(wallet => {
      const config = UNIFIED_WALLETS[wallet.name];
      if (config) {
        wallets.push({
          ...config,
          installed: wallet.installed
        });
      }
    });

    return wallets;
  }, [substrateWallets]);

  // Determine connected wallet and account
  const { connectedWallet, connectedAccount } = useMemo(() => {
    // Check Ethereum connection
    if (ethConnected && ethAddress) {
      return {
        connectedWallet: availableWallets.find(w => w.id === 'metamask') || null,
        connectedAccount: {
          address: ethAddress,
          type: WalletType.ETHEREUM,
          network: 'Ethereum'
        } as UnifiedAccount
      };
    }

    // Check Substrate connection
    if (substrateWallet && substrateAccount) {
      return {
        connectedWallet: availableWallets.find(w => w.id === substrateWallet.name) || null,
        connectedAccount: {
          address: substrateAccount.address,
          name: substrateAccount.name,
          type: WalletType.SUBSTRATE,
          network: 'Lunes Network'
        } as UnifiedAccount
      };
    }

    return {
      connectedWallet: null,
      connectedAccount: null
    };
  }, [ethConnected, ethAddress, substrateWallet, substrateAccount, availableWallets]);

  // Unified connect function
  const connect = useCallback(async (walletId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const wallet = availableWallets.find(w => w.id === walletId);
      if (!wallet) {
        throw new Error(`Wallet ${walletId} not found`);
      }

      if (!wallet.installed) {
        throw new Error(`${wallet.name} is not installed. Please install the wallet extension.`);
      }

      if (wallet.type === WalletType.ETHEREUM) {
        // Connect Ethereum wallet
        switch (walletId) {
          case 'metamask':
            ethConnect({ connector: injected() });
            break;
          case 'walletconnect':
            ethConnect({ 
              connector: walletConnect({
                projectId: 'your-walletconnect-project-id' // Replace with actual project ID
              })
            });
            break;
          default:
            throw new Error(`Ethereum wallet ${walletId} not supported`);
        }
      } else if (wallet.type === WalletType.SUBSTRATE) {
        // Connect Substrate wallet
        await substrateConnect(walletId as any);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('❌ Unified wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [availableWallets, ethConnect, substrateConnect]);

  // Unified disconnect function
  const disconnect = useCallback(() => {
    setError(null);
    
    // Disconnect both types to ensure clean state
    ethDisconnect();
    substrateDisconnect();
    
    console.log('🔌 All wallets disconnected');
  }, [ethDisconnect, substrateDisconnect]);

  // Handle substrate errors
  useEffect(() => {
    if (substrateError) {
      setError(substrateError);
    }
  }, [substrateError]);

  // Update connecting state
  const finalIsConnecting = isConnecting || substrateConnecting;

  return {
    isConnected: !!(connectedWallet && connectedAccount),
    isConnecting: finalIsConnecting,
    availableWallets,
    connectedWallet,
    connectedAccount,
    connect,
    disconnect,
    error
  };
}
