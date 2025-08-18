import { useState, useEffect, useCallback } from 'react';
import { ApiPromise } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import type { InjectedAccount } from '@polkadot/extension-inject/types';

import { useApiQuery } from '@safeguard/shared-ui';
import { 
  SubstrateWallet, 
  SubstrateAccount, 
  SupportedWallets, 
  WALLET_METADATA,
  LUNES_NETWORK
} from './types';
import { useWebSocketConnection } from './useWebSocketConnection';

export const useSubstrateWallet = () => {
  // Enhanced WebSocket connection with automatic reconnection
  const wsConnection = useWebSocketConnection({
    endpoints: [LUNES_NETWORK.endpoint, ...(LUNES_NETWORK.fallbackEndpoints || [])],
    maxReconnectAttempts: 5,
    reconnectDelay: 3000,
  });

  const { 
    data: api, 
    isLoading: isApiLoading, 
    error: apiError,
    isSuccess: isApiReady,
  } = useApiQuery({
    queryKey: ['polkadotApi'],
    queryFn: async () => {
      if (!wsConnection.wsProvider) throw new Error('WebSocket provider not available');
      const apiPromise = new ApiPromise({ provider: wsConnection.wsProvider });
      await apiPromise.isReady;
      return apiPromise;
    },
    enabled: wsConnection.isConnected && !!wsConnection.wsProvider,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const [selectedAccount, setSelectedAccount] = useState<SubstrateAccount | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<SubstrateWallet | null>(null);
  const [availableWallets, setAvailableWallets] = useState<SubstrateWallet[]>([]);
  const [accounts, setAccounts] = useState<SubstrateAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Polkadot API using the enhanced WebSocket connection
  useEffect(() => {
    let isMounted = true;
    let api: ApiPromise | null = null;

    const initializeApi = async () => {
       if (!wsConnection.wsProvider || !wsConnection.isConnected) {
         return;
       }

       try {
         setIsConnecting(true);
         setError(null);
         
         api = await ApiPromise.create({ provider: wsConnection.wsProvider });
         
         if (isMounted) {
           // API será gerenciada pelo useApiQuery
           setIsConnecting(false);
           console.log('🚀 Polkadot API initialized successfully');
         }
       } catch (error) {
         console.error('❌ Failed to initialize Polkadot API:', error);
         if (isMounted) {
           setError('Failed to initialize Polkadot API');
           setIsConnecting(false);
         }
       }
     };

     if (wsConnection.isConnected && wsConnection.wsProvider) {
       initializeApi();
     } else if (wsConnection.error) {
       setError(wsConnection.error);
       setIsConnecting(false);
     } else if (wsConnection.isConnecting || wsConnection.isReconnecting) {
       setIsConnecting(true);
       setError(null);
     }

    return () => {
      isMounted = false;
      if (api) {
        api.disconnect();
      }
    };
  }, [wsConnection.isConnected, wsConnection.wsProvider, wsConnection.error, wsConnection.isConnecting, wsConnection.isReconnecting]);

  // Detect available wallets with enhanced detection and retry logic
  useEffect(() => {
    let detectionTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const detectWallets = async () => {
      try {
        // Wait for DOM to be fully loaded
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve(void 0);
            } else {
              window.addEventListener('load', () => resolve(void 0), { once: true });
            }
          });
        }

        // Additional delay to ensure extensions are loaded
        await new Promise(resolve => setTimeout(resolve, 500));

        const wallets: SubstrateWallet[] = Object.values(SupportedWallets).map(walletName => {
          const metadata = WALLET_METADATA[walletName];
          const installed = checkWalletInstalled(walletName);

          return {
            ...metadata,
            installed,
            extension: undefined
          };
        });

        setAvailableWallets(wallets);
        
        // Log detection results for debugging
        const installedWallets = wallets.filter(w => w.installed);
        console.log('🔍 Wallet Detection Results:', {
          total: wallets.length,
          installed: installedWallets.length,
          wallets: installedWallets.map(w => w.name)
        });
        
      } catch (error) {
        console.error('❌ Error detecting wallets:', error);
        
        // Retry detection if failed and retries available
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`🔄 Retrying wallet detection (${retryCount}/${maxRetries})...`);
          detectionTimeout = setTimeout(detectWallets, retryDelay * retryCount);
        }
      }
    };

    // Start detection
    detectWallets();

    // Cleanup timeout on unmount
    return () => {
      if (detectionTimeout) {
        clearTimeout(detectionTimeout);
      }
    };
  }, []);

  // Enhanced wallet detection with multiple fallback methods
  const checkWalletInstalled = (walletName: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const win = window as any;
      
      switch (walletName) {
        case SupportedWallets.POLKADOT_JS:
          return !!(
            win.injectedWeb3?.['polkadot-js'] ||
            win.polkadotExtension ||
            (win.chrome?.runtime?.getManifest && 
             win.chrome.runtime.getManifest()?.name?.includes('Polkadot'))
          );
          
        case SupportedWallets.TALISMAN:
          return !!(
            win.talisman ||
            win.injectedWeb3?.talisman ||
            (win.chrome?.runtime?.getManifest && 
             win.chrome.runtime.getManifest()?.name?.includes('Talisman'))
          );
          
        case SupportedWallets.SUBWALLET:
          return !!(
            win.injectedWeb3?.['subwallet-js'] ||
            win.SubWallet ||
            (win.chrome?.runtime?.getManifest && 
             win.chrome.runtime.getManifest()?.name?.includes('SubWallet'))
          );
          
        case SupportedWallets.NOVA:
          return !!(
            win.walletExtension?.isNovaWallet ||
            win.novaWallet ||
            (win.chrome?.runtime?.getManifest && 
             win.chrome.runtime.getManifest()?.name?.includes('Nova'))
          );
          
        case SupportedWallets.FEARLESS:
          return !!(
            win.fearlessWallet ||
            win.injectedWeb3?.fearless ||
            (win.chrome?.runtime?.getManifest && 
             win.chrome.runtime.getManifest()?.name?.includes('Fearless'))
          );
          
        case SupportedWallets.ENKRYPT:
          return !!(
            win.enkrypt ||
            win.injectedWeb3?.enkrypt ||
            (win.chrome?.runtime?.getManifest && 
             win.chrome.runtime.getManifest()?.name?.includes('Enkrypt'))
          );
          
        case SupportedWallets.MATH_WALLET:
          return !!(
            win.mathwallet ||
            win.injectedWeb3?.mathwallet ||
            (win.chrome?.runtime?.getManifest && 
             win.chrome.runtime.getManifest()?.name?.includes('Math'))
          );
          
        default:
          return false;
      }
    } catch (error) {
       // Silently handle chrome-extension access errors
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       console.debug(`🔍 Wallet detection for ${walletName}:`, errorMessage);
       return false;
     }
  };

  // Enhanced extension validation with detailed error handling
  const validateExtensionAvailability = async (walletName: string): Promise<boolean> => {
    try {
      // Check if wallet is detected as installed
      if (!checkWalletInstalled(walletName)) {
        throw new Error(`${walletName} extension is not installed or not detected`);
      }

      // Try to enable extensions with timeout
      const enablePromise = web3Enable('Lunes SafeGuard');
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Extension enable timeout')), 5000);
      });

      const extensions = await Promise.race([enablePromise, timeoutPromise]);
      
      if (extensions.length === 0) {
        throw new Error('No wallet extensions responded to enable request');
      }

      // Verify specific extension is available
      const extension = extensions.find(ext => ext.name === walletName);
      if (!extension) {
        throw new Error(`${walletName} extension did not respond to enable request`);
      }

      // Test if extension can provide accounts
      try {
        const accounts = await web3Accounts();
        console.log(`✅ ${walletName} validation successful - ${accounts.length} accounts available`);
        return true;
      } catch (accountError) {
        throw new Error(`${walletName} extension cannot provide accounts: ${accountError instanceof Error ? accountError.message : 'Unknown error'}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      console.warn(`❌ ${walletName} validation failed:`, errorMessage);
      throw new Error(`Extension validation failed: ${errorMessage}`);
    }
  };

  // Connect to wallet with enhanced validation
  const connectWallet = useCallback(async (walletName: string) => {
    if (!isApiReady) {
      setError('API não está pronta. Aguarde...');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Validate extension availability first
      console.log(`🔍 Validating ${walletName} extension availability...`);
      await validateExtensionAvailability(walletName);

      // Enable extension (should work since validation passed)
      const extensions = await web3Enable('Lunes SafeGuard');
      
      // Find specific wallet extension
      const extension = extensions.find(ext => ext.name === walletName);
      if (!extension) {
        throw new Error(`${walletName} extension not found after validation`);
      }

      // Get accounts from the wallet
      const allAccounts: InjectedAccount[] = await web3Accounts();
      const walletAccounts = allAccounts.filter(account => 
        (account as any).meta?.source === walletName
      );

      if (walletAccounts.length === 0) {
        throw new Error(`No accounts found in ${walletName}`);
      }

      // Update state
      const substrateAccounts: SubstrateAccount[] = walletAccounts.map(account => ({
        address: account.address,
        name: (account as any).meta?.name,
        type: account.type,
        genesisHash: (account as any).meta?.genesisHash
      }));

      setAccounts(substrateAccounts);
      setSelectedAccount(substrateAccounts[0]);
      
      const wallet = availableWallets.find(w => w.name === walletName);
      if (wallet) {
        setConnectedWallet({ ...wallet, extension });
      }

      console.log(`✅ Connected to ${walletName} with ${substrateAccounts.length} accounts`);

    } catch (err) {
      console.error('❌ Failed to connect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [isApiReady, availableWallets]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setConnectedWallet(null);
    setAccounts([]);
    setSelectedAccount(null);
    setError(null);
    console.log('🔌 Wallet disconnected');
  }, []);

  // Select account
  const selectAccount = useCallback((account: SubstrateAccount) => {
    setSelectedAccount(account);
    console.log('👤 Account selected:', account.address);
  }, []);

  // Sign and send transaction (utility method)
  const signAndSend = useCallback(async (
    extrinsic: any,
    options?: { tip?: string; era?: number }
  ) => {
    if (!selectedAccount || !connectedWallet?.extension || !api) {
      throw new Error('Wallet not connected or API not ready');
    }

    try {
      const injector = await web3FromAddress(selectedAccount.address);
      
      return new Promise((resolve, reject) => {
        extrinsic.signAndSend(
          selectedAccount.address,
          { signer: injector.signer, ...options },
          ({ status, events, dispatchError }: any) => {
            if (status.isInBlock) {
              console.log(`✅ Transaction in block: ${status.asInBlock}`);
            }
            
            if (status.isFinalized) {
              console.log(`✅ Transaction finalized: ${status.asFinalized}`);
              
              if (dispatchError) {
                reject(new Error(`Transaction failed: ${dispatchError.toString()}`));
              } else {
                resolve({ blockHash: status.asFinalized, events });
              }
            }
          }
        ).catch(reject);
      });
    } catch (err) {
      console.error('❌ Failed to sign and send transaction:', err);
      throw err;
    }
  }, [selectedAccount, connectedWallet, api]);

  return {
    // API state
    api,
    isApiReady,
    apiError: apiError || wsConnection.error,
    isApiLoading,
    
    // Wallet state
    wallets: availableWallets,
    selectedWallet: connectedWallet,
    accounts,
    selectedAccount,
    
    // Connection state
    isConnected: !!connectedWallet && !!selectedAccount,
    connect: connectWallet,
    disconnect: disconnectWallet,
    selectAccount,
    isConnecting,
    
    // Transaction methods
    signAndSend,
    
    // Error state
    error: error,
  };
};
