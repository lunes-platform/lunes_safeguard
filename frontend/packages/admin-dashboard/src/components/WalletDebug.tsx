import React, { useEffect } from 'react';
import { useUnifiedWalletContext } from '@safeguard/web3';

export const WalletDebug: React.FC = () => {
  const {
    availableWallets,
    isConnected,
    connectedWallet,
    connectedAccount,
    error,
    isConnecting
  } = useUnifiedWalletContext();

  useEffect(() => {
    console.log('🔍 WalletDebug - Estado atual:');
    console.log('availableWallets:', availableWallets);
    console.log('isConnected:', isConnected);
    console.log('connectedWallet:', connectedWallet);
    console.log('connectedAccount:', connectedAccount);
    console.log('error:', error);
    console.log('isConnecting:', isConnecting);
    
    // Debug das extensões instaladas
    if (typeof window !== 'undefined') {
      console.log('🔍 Extensões detectadas:');
      console.log('window.injectedWeb3:', (window as any).injectedWeb3);
      console.log('window.talisman:', (window as any).talisman);
      console.log('window.fearlessWallet:', (window as any).fearlessWallet);
      console.log('window.enkrypt:', (window as any).enkrypt);
      console.log('window.mathwallet:', (window as any).mathwallet);
    }
  }, [availableWallets, isConnected, connectedWallet, connectedAccount, error, isConnecting]);

  return (
    <div className="p-4 bg-card border border-border rounded-[5px] m-4">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">🔍 Wallet Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Total de carteiras disponíveis:</strong> {availableWallets.length}
        </div>
        
        <div>
          <strong>Conectado:</strong> {isConnected ? 'Sim' : 'Não'}
        </div>
        
        <div>
          <strong>Conectando:</strong> {isConnecting ? 'Sim' : 'Não'}
        </div>
        
        {error && (
          <div className="text-destructive">
            <strong>Erro:</strong> {error}
          </div>
        )}
        
        {connectedWallet && (
          <div>
            <strong>Carteira conectada:</strong> {connectedWallet.name}
          </div>
        )}
        
        {connectedAccount && (
          <div>
            <strong>Conta conectada:</strong> {connectedAccount.address}
          </div>
        )}
        
        <div className="mt-4">
          <strong>Carteiras disponíveis:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {availableWallets.map((wallet) => (
              <li key={wallet.id} className={wallet.installed ? 'text-primary' : 'text-muted-foreground'}>
                {wallet.name} ({wallet.type}) - {wallet.installed ? '✅ Instalada' : '❌ Não instalada'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletDebug;