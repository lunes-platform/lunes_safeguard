"use client";

import React, { useState } from 'react';
import { useUnifiedWalletContext } from '@safeguard/web3';
import { Button } from './ui/button';
import { WalletSelector } from './WalletSelector';
import { truncateAddress } from '../../../utils/src';

export function ConnectWalletButton() {
  const { isConnected, connectedAccount, connectedWallet, disconnect } = useUnifiedWalletContext();
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const handleConnect = () => {
    setShowWalletSelector(true);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isConnected && connectedAccount && connectedWallet) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="relative">
            <img 
              src={connectedWallet.icon} 
              alt={connectedWallet.name}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-green-800">
              {truncateAddress(connectedAccount.address)}
            </span>
            <span className="text-xs text-green-600">
              {connectedWallet.name} • {connectedAccount.network}
            </span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDisconnect}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Desconectar
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button 
        onClick={handleConnect}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
        size="default"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Conectar Carteira
      </Button>
      
      <WalletSelector
        open={showWalletSelector}
        onOpenChange={setShowWalletSelector}
        title="Conectar ao Lunes SafeGuard"
        subtitle="Escolha sua carteira para começar a proteger projetos na Lunes Network"
      />
    </>
  );
}