export enum WalletType {
  ETHEREUM = 'ethereum',
  SUBSTRATE = 'substrate'
}

export interface UnifiedWalletInfo {
  id: string;
  name: string;
  type: WalletType;
  icon: string;
  installed: boolean;
  description: string;
}

export interface UnifiedAccount {
  address: string;
  name?: string;
  type: WalletType;
  network: string;
}

export interface UnifiedWalletState {
  // Connection State
  isConnected: boolean;
  isConnecting: boolean;
  
  // Available Wallets
  availableWallets: UnifiedWalletInfo[];
  
  // Connected Wallet
  connectedWallet: UnifiedWalletInfo | null;
  connectedAccount: UnifiedAccount | null;
  
  // Methods
  connect: (walletId: string) => Promise<void>;
  disconnect: () => void;
  
  // Errors
  error: string | null;
}

// Mapeamento de carteiras por ID para facilitar o acesso
export const UNIFIED_WALLETS: Record<string, Omit<UnifiedWalletInfo, 'installed'>> = {
  // 🌟 CARTEIRAS ETHEREUM
  'metamask': {
    id: 'metamask',
    name: 'MetaMask',
    type: WalletType.ETHEREUM,
    icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
    description: 'Carteira Ethereum mais popular'
  },
  'walletconnect': {
    id: 'walletconnect',
    name: 'WalletConnect',
    type: WalletType.ETHEREUM,
    icon: 'https://walletconnect.com/walletconnect-logo.svg',
    description: 'Conecte com qualquer carteira compatível'
  },

  // 🌟 CARTEIRAS SUBSTRATE RECOMENDADAS PARA LUNES NETWORK
  'polkadot-js': {
    id: 'polkadot-js',
    name: 'Polkadot{.js}',
    type: WalletType.SUBSTRATE,
    icon: 'https://polkadot.js.org/extension/icon-128.png',
    description: 'Carteira oficial para Lunes Network - Mais compatível'
  },
  'talisman': {
    id: 'talisman',
    name: 'Talisman',
    type: WalletType.SUBSTRATE,
    icon: 'https://talisman.xyz/favicon-32x32.png',
    description: 'Carteira multi-chain com excelente UX para Lunes'
  },
  
  // 🔧 OUTRAS CARTEIRAS LUNES NETWORK
  'subwallet-js': {
    id: 'subwallet-js',
    name: 'SubWallet',
    type: WalletType.SUBSTRATE,
    icon: 'https://docs.subwallet.app/img/logo.png',
    description: 'Carteira completa para ecossistema Substrate'
  },
  'nova': {
    id: 'nova',
    name: 'Nova Wallet',
    type: WalletType.SUBSTRATE,
    icon: 'https://novawallet.io/logo192.png',
    description: 'Carteira mobile nativa para iOS/Android'
  },
  'fearless': {
    id: 'fearless',
    name: 'Fearless Wallet',
    type: WalletType.SUBSTRATE,
    icon: 'https://fearlesswallet.io/images/fearless-logo.svg',
    description: 'Carteira DeFi especializada em staking'
  }
};

// Array de carteiras para facilitar iteração
export const UNIFIED_WALLETS_LIST: UnifiedWalletInfo[] = Object.values(UNIFIED_WALLETS).map(wallet => ({
  ...wallet,
  installed: false // Será determinado dinamicamente
}));
