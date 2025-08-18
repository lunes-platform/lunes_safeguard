import React from 'react';
import { useWalletStore } from '@safeguard/web3';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';

export interface ConnectWalletProps {
  className?: string;
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

/**
 * Componente para conectar carteira Web3
 * Integrado com Zustand store para gerenciamento de estado
 */
export const ConnectWallet: React.FC<ConnectWalletProps> = ({
  className,
  onConnect,
  onDisconnect,
}) => {
  const {
    isConnecting,
    isConnected,
    account,
    walletType,
    error,
    connectWallet,
    disconnectWallet,
  } = useWalletStore();

  const handleConnect = async (type: 'metamask' | 'walletconnect' | 'lunes' = 'metamask') => {
    try {
      await connectWallet(type);
      if (account) {
        onConnect?.(account);
      }
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onDisconnect?.();
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Erro:</strong> {error}
          </p>
        </div>
      )}
      
      {!isConnected ? (
        <div className="space-y-2">
          <Button
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Conectando...
              </>
            ) : (
              'Conectar MetaMask'
            )}
          </Button>
          
          <Button
            onClick={() => handleConnect('lunes')}
            disabled={isConnecting}
            variant="outline"
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Conectando...
              </>
            ) : (
              'Conectar Lunes Wallet'
            )}
          </Button>
          
          <Button
            onClick={() => handleConnect('walletconnect')}
            disabled={isConnecting}
            variant="outline"
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Conectando...
              </>
            ) : (
              'Conectar WalletConnect'
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Conectado via {walletType}:</strong>
            </p>
            <p className="text-sm text-green-700 font-mono">
              {account}
            </p>
          </div>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full"
          >
            Desconectar
          </Button>
        </div>
      )}
    </div>
  );
};