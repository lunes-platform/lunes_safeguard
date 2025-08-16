import React from 'react';
import { X, ExternalLink, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { useUnifiedWalletContext } from '@safeguard/web3';

interface Web3WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Web3WalletModal({ isOpen, onClose }: Web3WalletModalProps) {
  const { availableWallets, connect, isConnecting, error } = useUnifiedWalletContext();

  if (!isOpen) return null;

  const renderWalletIcon = (iconUrl: string, walletName: string) => {
    return (
      <img 
        src={iconUrl} 
        alt={`${walletName} icon`}
        className="w-8 h-8 rounded-lg"
        onError={(e) => {
          // Fallback para ícone padrão se a imagem não carregar
          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzM3NDE0OSIvPgo8cGF0aCBkPSJNMTYgOEMxMS41ODE3IDggOCAxMS41ODE3IDggMTZDOCAyMC40MTgzIDExLjU4MTcgMjQgMTYgMjRDMjAuNDE4MyAyNCAyNCAyMC40MTgzIDI0IDE2QzI0IDExLjU4MTcgMjAuNDE4MyA4IDE2IDhaIiBmaWxsPSIjNjM2NjZCIi8+CjwvcmVnPgo=';
        }}
      />
    );
  };

  const handleWalletConnect = async (walletId: string) => {
    try {
      await connect(walletId);
      onClose();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  // URLs de instalação para carteiras
  const installationUrls: Record<string, string> = {
    'polkadot-js': 'https://polkadot.js.org/extension/',
    'talisman': 'https://talisman.xyz/download',
    'subwallet-js': 'https://subwallet.app/download.html',
    'metamask': 'https://metamask.io/download/',
    'nova': 'https://novawallet.io/',
    'fearless': 'https://fearlesswallet.io/'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-[5px] shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Conectar Carteira
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info */}
          <div className="mb-6 p-4 bg-primary/10 rounded-[5px] border border-primary/20">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary">
                  Lunes Network - Carteiras Substrate
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Conecte uma carteira compatível com Substrate para acessar o SafeGuard Admin.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-[5px]">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Wallet List */}
          <div className="space-y-3">
            {availableWallets
              .filter(wallet => wallet.type === 'substrate')
              .map((wallet) => (
                <div
                  key={wallet.id}
                  className={`border rounded-[5px] p-4 transition-all ${
                    wallet.installed
                      ? 'border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                      : 'border-border bg-muted/50'
                  }`}
                  onClick={() => wallet.installed && handleWalletConnect(wallet.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {renderWalletIcon(wallet.icon, wallet.name)}
                        <Wallet className="h-8 w-8 text-primary hidden" />
                      </div>
                      <div>
                        <h3 className="font-medium text-card-foreground">{wallet.name}</h3>
                        <p className="text-xs text-muted-foreground">{wallet.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {wallet.installed ? (
                        <>  
                          {isConnecting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </>
                      ) : (
                        <a
                          href={installationUrls[wallet.id] || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Instalar</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Suas chaves privadas permanecem seguras em sua carteira.
              <br />
              O SafeGuard nunca tem acesso às suas chaves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Web3WalletModal;