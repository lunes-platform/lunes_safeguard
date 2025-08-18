# 🚀 Lunes SafeGuard - Unified Wallet Integration Guide

Este guia mostra como integrar o sistema de carteiras unificado (Ethereum + Substrate) no projeto Lunes SafeGuard.

## 📋 Carteiras Suportadas

### Substrate/Polkadot (Lunes Network)
- ✅ **Polkadot{.js} Extension** - Principal carteira do ecossistema
- ✅ **Talisman** - Multi-chain (Substrate + Ethereum)
- ✅ **SubWallet** - UX mobile otimizada
- ✅ **Nova Wallet** - iOS/Android nativo
- ✅ **Fearless Wallet** - Focada em staking

### Ethereum
- ✅ **MetaMask** - Carteira mais popular
- ✅ **WalletConnect** - Protocolo multi-wallet

## 🔧 Configuração

### 1. Dependências Instaladas
```bash
# Já instaladas no pacote @safeguard/web3:
@polkadot/api
@polkadot/extension-dapp
@polkadot/keyring
@polkadot/util
@polkadot/util-crypto
```

### 2. Configuração da Lunes Network

```typescript
// packages/web3/src/polkadot/types.ts
export const LUNES_NETWORK: LunesNetworkConfig = {
  name: 'Lunes Network',
  endpoint: 'wss://rpc.lunes.io', // ⚠️ ATUALIZAR COM ENDPOINT REAL
  ss58Format: 42, // ⚠️ VERIFICAR SS58 FORMAT CORRETO DA LUNES
  tokenSymbol: 'LUNES',
  tokenDecimals: 18,
  blockTime: 6000
};
```

## 📱 Uso nas Aplicações

### Admin Dashboard

Atualizar `/packages/admin-dashboard/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { UnifiedWalletProvider } from '@safeguard/web3';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnifiedWalletProvider>
      <App />
    </UnifiedWalletProvider>
  </React.StrictMode>
);
```

### Community Platform

Atualizar `/packages/community-platform/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { UnifiedWalletProvider } from '@safeguard/web3';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnifiedWalletProvider>
      <App />
    </UnifiedWalletProvider>
  </React.StrictMode>
);
```

## 🎨 Componentes Atualizados

### ConnectWalletButton

O componente `ConnectWalletButton` foi atualizado para suportar ambos os tipos de carteira:

```typescript
import { ConnectWalletButton } from '@safeguard/shared-ui';

// Uso permanece o mesmo
<ConnectWalletButton />
```

### Novo WalletSelector

```typescript
import { WalletSelector } from '@safeguard/shared-ui';

function MyComponent() {
  const [showWallets, setShowWallets] = useState(false);

  return (
    <>
      <button onClick={() => setShowWallets(true)}>
        Connect Wallet
      </button>
      
      <WalletSelector
        isOpen={showWallets}
        onClose={() => setShowWallets(false)}
        title="Connect to Lunes SafeGuard"
        subtitle="Choose your wallet to start securing projects"
      />
    </>
  );
}
```

## 🔗 Hooks Disponíveis

### useUnifiedWalletContext (Recomendado)

```typescript
import { useUnifiedWalletContext } from '@safeguard/web3';

function MyComponent() {
  const {
    isConnected,
    connectedWallet,
    connectedAccount,
    availableWallets,
    connect,
    disconnect,
    error
  } = useUnifiedWalletContext();

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected to: {connectedWallet?.name}</p>
          <p>Address: {connectedAccount?.address}</p>
          <p>Network: {connectedAccount?.network}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => connect('polkadot-js')}>
          Connect Polkadot.js
        </button>
      )}
    </div>
  );
}
```

### useSubstrate (Para uso específico Substrate)

```typescript
import { useSubstrate } from '@safeguard/web3';

function SubstrateComponent() {
  const {
    api,
    isApiReady,
    selectedAccount,
    signAndSend
  } = useSubstrate();

  const sendTransaction = async () => {
    if (!api || !selectedAccount) return;

    try {
      const tx = api.tx.balances.transfer(targetAddress, amount);
      const result = await signAndSend(tx);
      console.log('Transaction successful:', result);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div>
      {isApiReady ? (
        <button onClick={sendTransaction}>Send Transaction</button>
      ) : (
        <p>Connecting to Lunes Network...</p>
      )}
    </div>
  );
}
```

## 🎯 Migração de Código Existente

### Antes (apenas Ethereum)
```typescript
import { useWallet } from '@safeguard/web3';

const { connect, disconnect, isActive, account } = useWallet();
```

### Depois (Unificado)
```typescript
import { useUnifiedWalletContext } from '@safeguard/web3';

const { 
  connect, 
  disconnect, 
  isConnected, 
  connectedAccount 
} = useUnifiedWalletContext();

// Para conectar carteira específica:
await connect('polkadot-js'); // Substrate
await connect('metamask');    // Ethereum
```

## ⚠️ Configurações Pendentes

### 1. Endpoint da Lunes Network
```typescript
// Atualizar em: packages/web3/src/polkadot/types.ts
endpoint: 'wss://rpc.lunes.io' // ← SUBSTITUIR COM URL REAL
```

### 2. SS58 Format
```typescript
// Verificar com a equipe Lunes o formato correto
ss58Format: 42 // ← PODE PRECISAR SER ALTERADO
```

### 3. WalletConnect Project ID
```typescript
// Em: packages/web3/src/unified/useUnifiedWallet.ts
projectId: 'your-walletconnect-project-id' // ← ADICIONAR PROJECT ID REAL
```

## 🧪 Testando a Integração

1. **Instalar Polkadot.js Extension**: https://polkadot.js.org/extension/
2. **Criar conta de teste**
3. **Testar conexão** nas aplicações
4. **Verificar detecção** de carteiras instaladas

## 🔍 Debug e Troubleshooting

### Logs de Debug
```typescript
// Os hooks incluem logs detalhados no console:
// ✅ Connected to Lunes Network
// ✅ Connected to talisman with 2 accounts
// 🔌 Wallet disconnected
```

### Erros Comuns

1. **"API not ready"** - Aguardar conexão com a Lunes Network
2. **"No wallet extensions found"** - Usuário precisa instalar carteira
3. **"Failed to connect to Lunes Network"** - Verificar endpoint RPC

## 📚 Próximos Passos

1. ✅ **Integração criada** - Sistema híbrido funcionando
2. ⏳ **Configurar endpoint real** da Lunes Network
3. ⏳ **Testar em ambiente real**
4. ⏳ **Adicionar mais carteiras** se necessário
5. ⏳ **Implementar funcionalidades específicas** da Lunes
