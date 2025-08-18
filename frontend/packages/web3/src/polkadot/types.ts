// Types for Substrate wallet functionality
import type { InjectedExtension } from '@polkadot/extension-inject/types';

export interface SubstrateWallet {
  name: string;
  title: string;
  logo: string;
  installed: boolean;
  extension?: InjectedExtension;
}

export interface SubstrateAccount {
  address: string;
  name?: string;
  type?: string;
  genesisHash?: string;
}

// Usando ReturnType para inferir automaticamente o tipo do hook
// Isso garante que o tipo sempre esteja sincronizado com a implementação
export type SubstrateWalletContextType = ReturnType<typeof import('./useSubstrateWallet').useSubstrateWallet>;

export enum SupportedWallets {
  POLKADOT_JS = 'polkadot-js',
  TALISMAN = 'talisman', 
  SUBWALLET = 'subwallet-js',
  NOVA = 'nova',
  FEARLESS = 'fearless',
  ENKRYPT = 'enkrypt',
  MATH_WALLET = 'mathwallet'
}

export const WALLET_METADATA: Record<SupportedWallets, Omit<SubstrateWallet, 'installed' | 'extension'>> = {
  [SupportedWallets.POLKADOT_JS]: {
    name: SupportedWallets.POLKADOT_JS,
    title: 'Polkadot{.js} Extension',
    logo: 'https://polkadot.js.org/extension/icon-128.png'
  },
  [SupportedWallets.TALISMAN]: {
    name: SupportedWallets.TALISMAN,
    title: 'Talisman',
    logo: 'https://talisman.xyz/favicon.svg'
  },
  [SupportedWallets.SUBWALLET]: {
    name: SupportedWallets.SUBWALLET,
    title: 'SubWallet',
    logo: 'https://docs.subwallet.app/img/logo.png'
  },
  [SupportedWallets.NOVA]: {
    name: SupportedWallets.NOVA,
    title: 'Nova Wallet',
    logo: 'https://novawallet.io/logo192.png'
  },
  [SupportedWallets.FEARLESS]: {
    name: SupportedWallets.FEARLESS,
    title: 'Fearless Wallet',
    logo: 'https://fearlesswallet.io/images/fearless-logo.svg'
  },
  [SupportedWallets.ENKRYPT]: {
    name: SupportedWallets.ENKRYPT,
    title: 'Enkrypt',
    logo: 'https://www.enkrypt.com/assets/images/icon-128.png'
  },
  [SupportedWallets.MATH_WALLET]: {
    name: SupportedWallets.MATH_WALLET,
    title: 'Math Wallet',
    logo: 'https://mathwallet.org/images/wallet/mathwallet_logo.png'
  }
};

// Lunes Network Configuration
export interface LunesNetworkConfig {
  name: string;
  endpoint: string;
  fallbackEndpoints?: string[];
  ss58Format: number;
  tokenSymbol: string;
  tokenDecimals: number;
  blockTime: number;
}

export const LUNES_NETWORK: LunesNetworkConfig = {
  name: 'Lunes Network',
  endpoint: 'wss://ws.lunes.io', // Endpoint principal de produção
  fallbackEndpoints: [
    'wss://ws-lunes-main-01.lunes.io',
    'wss://ws-lunes-main-02.lunes.io',
    'wss://rpc.lunes.io' // Endpoint alternativo
  ],
  ss58Format: 42, // SS58 format da Lunes - verificar o correto
  tokenSymbol: 'LUNES',
  tokenDecimals: 18,
  blockTime: 6000 // 6 segundos
};

// Configurações adicionais para diferentes ambientes
export const LUNES_ENDPOINTS = {
  test: 'wss://ws-test.lunes.io',
  production: {
    main: 'wss://ws.lunes.io',
    node01: 'wss://ws-lunes-main-01.lunes.io',
    node02: 'wss://ws-lunes-main-02.lunes.io',
    archive: 'wss://ws-archive.lunes.io'
  }
};
