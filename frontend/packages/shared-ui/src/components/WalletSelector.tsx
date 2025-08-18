"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalTitle, 
  ModalBody,
  ModalOverlay,
  ModalPortal 
} from './ui/modal';
import { Badge } from './ui/badge';
import { 
  useUnifiedWalletContext, 
  WalletType, 
  type UnifiedWalletInfo 
} from '@safeguard/web3';

interface WalletSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
}

export function WalletSelector({ 
  open, 
  onOpenChange, 
  title = "Connect Wallet",
  subtitle = "Choose your preferred wallet to connect to Lunes SafeGuard"
}: WalletSelectorProps) {
  const { availableWallets, connect, isConnecting, error } = useUnifiedWalletContext();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleWalletSelect = async (walletId: string) => {
    setSelectedWallet(walletId);
    
    try {
      await connect(walletId);
      onOpenChange(false); // Close modal on successful connection
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      // Error is handled by the unified wallet context
    } finally {
      setSelectedWallet(null);
    }
  };

  // 🌐 APENAS CARTEIRAS LUNES NETWORK (Substrate)
  const lunesWallets = availableWallets.filter(w => w.type === WalletType.SUBSTRATE);
  const recommendedWallets = lunesWallets.filter(w => w.id === 'polkadot-js' || w.id === 'talisman');
  const otherWallets = lunesWallets.filter(w => w.id !== 'polkadot-js' && w.id !== 'talisman');

  const WalletButton = ({ wallet, isRecommended = false }: { wallet: UnifiedWalletInfo; isRecommended?: boolean }) => {
    const isSelected = selectedWallet === wallet.id;
    const isLoading = isConnecting && isSelected;
    const canConnect = wallet.installed && !isConnecting;

    const handleClick = () => {
      if (wallet.installed) {
        handleWalletSelect(wallet.id);
      } else {
        // Open installation link
        const installUrls: Record<string, string> = {
          'polkadot-js': 'https://polkadot.js.org/extension/',
          'talisman': 'https://talisman.xyz/download',
          'subwallet-js': 'https://subwallet.app/download.html',
          'nova': 'https://novawallet.io/',
          'fearless': 'https://fearlesswallet.io/',
          'metamask': 'https://metamask.io/download/'
        };
        
        if (installUrls[wallet.id]) {
          window.open(installUrls[wallet.id], '_blank');
        }
      }
    };

    return (
      <Button
        key={wallet.id}
        variant={wallet.installed ? "outline" : "ghost"}
        className={`w-full justify-start h-auto p-4 text-left transition-all duration-200 ${
          wallet.installed 
            ? 'hover:bg-primary/5 hover:border-primary/50' 
            : 'hover:bg-muted/50 opacity-75'
        } ${isRecommended ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}
        onClick={handleClick}
        disabled={isLoading}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="relative">
            <img 
              src={wallet.icon} 
              alt={wallet.name}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCAxMEwxMy4wOSAxNS43NEwxMiAyMkwxMC45MSAxNS43NEw0IDEwTDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IiM2MzY3N0YiLz4KPC9zdmc+Cjwvc3ZnPgo=';
              }}
            />
            {wallet.installed && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{wallet.name}</span>
              
              {isRecommended && (
                <Badge variant="default" className="text-xs bg-primary">Recomendado</Badge>
              )}
              
              {!wallet.installed ? (
                <Badge variant="secondary" className="text-xs">Instalar</Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">Instalado</Badge>
              )}
              
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Lunes Network</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              {wallet.installed ? wallet.description : `Clique para instalar ${wallet.name}`}
            </p>
          </div>
          
          <div className="flex items-center">
            {isLoading ? (
              <div className="w-5 h-5">
                <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            ) : wallet.installed ? (
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            )}
          </div>
        </div>
      </Button>
    );
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent className="w-full max-w-md">
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </ModalHeader>
          <ModalBody className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-destructive/15 border border-destructive/20">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* 🌟 Carteiras Recomendadas Lunes Network */}
          {recommendedWallets.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Carteiras Recomendadas Lunes
              </h3>
              <div className="space-y-2">
                {recommendedWallets.map(wallet => (
                  <WalletButton key={wallet.id} wallet={wallet} isRecommended />
                ))}
              </div>
            </div>
          )}

          {/* 🔧 Outras Carteiras Lunes Network */}
          {otherWallets.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Outras Carteiras Lunes Network
              </h3>
              <div className="space-y-2">
                {otherWallets.map(wallet => (
                  <WalletButton key={wallet.id} wallet={wallet} />
                ))}
              </div>
            </div>
          )}

          {/* No wallets found */}
          {availableWallets.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-muted-foreground mb-3">
                Nenhuma carteira detectada
              </p>
              <p className="text-sm text-muted-foreground">
                Instale uma extensão de carteira para continuar
              </p>
            </div>
          )}

          {/* Network Status */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Conectado à Lunes Network</span>
              <Badge variant="outline" className="text-xs ml-auto">wss://ws.lunes.io</Badge>
            </div>
          </div>

          {/* Help section */}
          <div className="text-center pt-4 border-t space-y-2">
            <p className="text-xs text-muted-foreground">
              Primeira vez usando carteiras na Lunes Network?
            </p>
            <div className="flex justify-center gap-4 text-xs">
              <a 
                href="https://polkadot.js.org/extension/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Guia Polkadot.js
              </a>
              <a 
                href="https://talisman.xyz/download" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Guia Talisman
              </a>
            </div>
          </div>
          </ModalBody>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
