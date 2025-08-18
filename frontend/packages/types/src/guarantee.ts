import type { Address, Amount, Hash } from './common';

/**
 * Tipos de ativos suportados como garantia
 */
export type AssetType = 'PSP22' | 'PSP34' | 'NATIVE';

/**
 * Métodos de avaliação para NFTs
 */
export type NFTValuationMethod = 'floor_price' | 'last_sale' | 'fixed_value' | 'oracle';

/**
 * Informações de um token PSP22
 */
export interface TokenInfo {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: Amount;
  isSupported: boolean;
  priceUSD?: number;
  logoUrl?: string;
}

/**
 * Informações de uma coleção NFT PSP34
 */
export interface NFTCollectionInfo {
  address: Address;
  name: string;
  symbol: string;
  totalSupply: number;
  floorPrice?: Amount;
  valuationMethod: NFTValuationMethod;
  fixedValue?: Amount;
  isSupported: boolean;
  logoUrl?: string;
  description?: string;
}

/**
 * Informações de um NFT específico
 */
export interface NFTInfo {
  tokenId: string;
  collectionAddress: Address;
  name?: string;
  description?: string;
  imageUrl?: string;
  attributes?: {
    trait_type: string;
    value: string | number;
  }[];
  rarity?: {
    rank: number;
    score: number;
  };
  lastSalePrice?: Amount;
  currentValue: Amount;
}

/**
 * Garantia individual de token PSP22
 */
export interface TokenGuarantee {
  id: string;
  projectId: string;
  tokenAddress: Address;
  tokenInfo: TokenInfo;
  amount: Amount;
  valueUSD: number;
  depositor: Address;
  depositedAt: string;
  transactionHash: Hash;
  isLocked: boolean;
  unlockDate?: string;
}

/**
 * Garantia individual de NFT PSP34
 */
export interface NFTGuarantee {
  id: string;
  projectId: string;
  collectionAddress: Address;
  tokenId: string;
  nftInfo: NFTInfo;
  collectionInfo: NFTCollectionInfo;
  valueUSD: number;
  depositor: Address;
  depositedAt: string;
  transactionHash: Hash;
  isLocked: boolean;
  unlockDate?: string;
}

/**
 * Breakdown detalhado das garantias de um projeto
 */
export interface GuaranteeBreakdown {
  // Valores totais
  totalValueUSD: number;
  totalValueLUSTD: Amount;
  
  // Garantias por tipo
  tokenGuarantees: TokenGuarantee[];
  nftGuarantees: NFTGuarantee[];
  
  // Estatísticas
  stats: {
    totalTokens: number;
    totalNFTs: number;
    uniqueDepositors: number;
    averageDepositValue: number;
    largestDeposit: number;
    oldestDeposit: string;
    newestDeposit: string;
  };
  
  // Distribuição por ativo
  assetDistribution: {
    address: Address;
    symbol: string;
    name: string;
    type: AssetType;
    amount: Amount;
    valueUSD: number;
    percentage: number;
  }[];
  
  // Distribuição por depositante
  depositorDistribution: {
    address: Address;
    totalDeposits: number;
    totalValueUSD: number;
    percentage: number;
    firstDeposit: string;
    lastDeposit: string;
  }[];
}

/**
 * Cálculo de score baseado nas garantias
 */
export interface GuaranteeScoring {
  // Score total (0-100)
  totalScore: number;
  
  // Componentes do score
  valueBasedScore: number;      // Até 70 pontos
  assetDiversityScore: number;  // Até 15 pontos
  vestingTimeScore: number;     // Até 15 pontos
  
  // Detalhes do cálculo
  calculation: {
    // Score baseado em valor
    valueScore: {
      lustdValue: Amount;
      maxPoints: number;
      earnedPoints: number;
      formula: string;
    };
    
    // Score de diversidade
    diversityScore: {
      hasPSP22: boolean;
      hasNFT: boolean;
      multipleTokens: boolean;
      multipleCollections: boolean;
      earnedPoints: number;
      breakdown: {
        psp22Bonus: number;
        nftBonus: number;
        multiTokenBonus: number;
        multiCollectionBonus: number;
      };
    };
    
    // Score de tempo de vesting
    vestingScore: {
      projectAgeMonths: number;
      maxAgeForBonus: number;
      earnedPoints: number;
      formula: string;
    };
  };
  
  // Histórico de mudanças no score
  history: {
    date: string;
    score: number;
    reason: string;
    transactionHash?: Hash;
  }[];
}

/**
 * Dados para adicionar uma nova garantia de token
 */
export interface AddTokenGuaranteeData {
  projectId: string;
  tokenAddress: Address;
  amount: Amount;
  vestingPeriod?: number; // em dias
}

/**
 * Dados para adicionar uma nova garantia de NFT
 */
export interface AddNFTGuaranteeData {
  projectId: string;
  collectionAddress: Address;
  tokenId: string;
  vestingPeriod?: number; // em dias
}

/**
 * Dados para retirada de garantia
 */
export interface WithdrawGuaranteeData {
  guaranteeId: string;
  amount?: Amount; // Para retirada parcial de tokens
  reason?: string;
}

/**
 * Solicitação de liberação de garantia
 */
export interface GuaranteeReleaseRequest {
  id: string;
  projectId: string;
  requestedBy: Address;
  requestedAt: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  approvedBy?: Address;
  approvedAt?: string;
  executedAt?: string;
  transactionHash?: Hash;
  guarantees: {
    type: 'token' | 'nft';
    guaranteeId: string;
    amount?: Amount;
  }[];
}

/**
 * Histórico de transações de garantia
 */
export interface GuaranteeTransaction {
  id: string;
  projectId: string;
  type: 'deposit' | 'withdraw' | 'release' | 'lock' | 'unlock';
  assetType: AssetType;
  assetAddress: Address;
  tokenId?: string;
  amount?: Amount;
  valueUSD: number;
  from: Address;
  to?: Address;
  timestamp: string;
  transactionHash: Hash;
  blockNumber: number;
  gasUsed: Amount;
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * Estatísticas globais de garantias
 */
export interface GlobalGuaranteeStats {
  totalProjects: number;
  totalValueLocked: Amount;
  totalValueUSD: number;
  totalTokenGuarantees: number;
  totalNFTGuarantees: number;
  averageProjectScore: number;
  topProjects: {
    projectId: string;
    name: string;
    score: number;
    valueUSD: number;
  }[];
  recentActivity: GuaranteeTransaction[];
}

/**
 * Configurações de garantia para um projeto
 */
export interface GuaranteeSettings {
  projectId: string;
  minGuaranteeValue: Amount;
  maxGuaranteeValue?: Amount;
  allowedTokens: Address[];
  allowedNFTCollections: Address[];
  vestingEnabled: boolean;
  defaultVestingPeriod: number; // em dias
  autoReleaseEnabled: boolean;
  requiresApproval: boolean;
  emergencyWithdrawEnabled: boolean;
}

/**
 * Eventos relacionados a garantias
 */
export type GuaranteeEventType = 
  | 'guarantee_added'
  | 'guarantee_withdrawn'
  | 'guarantee_released'
  | 'score_updated'
  | 'token_supported'
  | 'nft_collection_supported'
  | 'vesting_completed';

export interface GuaranteeEvent {
  id: string;
  projectId: string;
  type: GuaranteeEventType;
  data: Record<string, unknown>;
  timestamp: string;
  transactionHash: Hash;
  blockNumber: number;
}