import type { Address, Amount, Hash } from './common';
import type { ProjectStatus } from './project';
import type { VoteOption } from './voting';

/**
 * Tipos de usuário no SafeGuard
 */
export type UserRole = 
  | 'admin'           // Administrador da plataforma
  | 'project_owner'   // Dono de projeto
  | 'developer'       // Desenvolvedor de projeto
  | 'community'       // Membro da comunidade
  | 'investor'        // Investidor/Holder de tokens
  | 'validator';      // Validador da rede

/**
 * Status de verificação do usuário
 */
export type VerificationStatus = 
  | 'unverified'      // Não verificado
  | 'pending'         // Verificação pendente
  | 'verified'        // Verificado
  | 'rejected'        // Verificação rejeitada
  | 'suspended';      // Suspenso

/**
 * Nível de reputação do usuário
 */
export type ReputationLevel = 
  | 'newcomer'        // 0-100 pontos
  | 'contributor'     // 101-500 pontos
  | 'trusted'         // 501-1000 pontos
  | 'expert'          // 1001-2500 pontos
  | 'guardian';       // 2500+ pontos

/**
 * Perfil básico do usuário
 */
export interface UserProfile {
  id: string;
  address: Address;
  
  // Informações básicas
  username?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  
  // Links sociais
  social: {
    website?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
    telegram?: string;
    discord?: string;
  };
  
  // Status e verificação
  role: UserRole;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  
  // Configurações
  preferences: UserPreferences;
}

/**
 * Preferências do usuário
 */
export interface UserPreferences {
  // Notificações
  notifications: {
    email: boolean;
    push: boolean;
    voting: boolean;
    projects: boolean;
    security: boolean;
    marketing: boolean;
  };
  
  // Interface
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  currency: string;
  
  // Privacidade
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
    showHoldings: boolean;
    allowMessages: boolean;
  };
  
  // Trading/Investimento
  trading: {
    defaultSlippage: number;
    autoApprove: boolean;
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
  };
}

/**
 * Estatísticas do usuário
 */
export interface UserStats {
  address: Address;
  
  // Atividade geral
  activity: {
    totalTransactions: number;
    totalVolume: Amount;
    firstTransaction: string;
    lastTransaction: string;
    activeDays: number;
  };
  
  // Projetos
  projects: {
    owned: number;
    contributed: number;
    following: number;
    totalInvested: Amount;
  };
  
  // Votações
  voting: {
    totalVotes: number;
    participationRate: number;
    approvalRate: number;
    totalWeight: Amount;
    streak: number; // Votações consecutivas
  };
  
  // Garantias
  guarantees: {
    totalProvided: Amount;
    activeGuarantees: number;
    totalReturns: Amount;
    successRate: number;
  };
  
  // Reputação
  reputation: {
    score: number;
    level: ReputationLevel;
    badges: UserBadge[];
    ranking: number;
  };
}

/**
 * Badge/Conquista do usuário
 */
export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
  
  // Critérios para obter o badge
  criteria: {
    type: 'voting' | 'guarantee' | 'project' | 'community' | 'special';
    requirement: string;
    value: number;
  };
}

/**
 * Holdings de tokens do usuário
 */
export interface UserHoldings {
  address: Address;
  
  // Tokens nativos
  native: {
    lunes: Amount;
    lustd: Amount;
  };
  
  // Tokens de projetos
  projectTokens: {
    projectId: string;
    tokenAddress: Address;
    symbol: string;
    balance: Amount;
    value: Amount; // Valor em USD
    percentage: number; // % do supply total
    
    // Histórico
    acquisitionDate: string;
    averageCost: Amount;
    totalInvested: Amount;
    unrealizedPnL: Amount;
  }[];
  
  // NFTs
  nfts: {
    contractAddress: Address;
    tokenId: string;
    name: string;
    image: string;
    collection: string;
    value?: Amount;
    acquisitionDate: string;
  }[];
  
  // Resumo
  summary: {
    totalValue: Amount;
    totalInvested: Amount;
    totalPnL: Amount;
    diversificationScore: number;
  };
}

/**
 * Atividade do usuário
 */
export interface UserActivity {
  id: string;
  userId: string;
  address: Address;
  
  // Tipo de atividade
  type: 'vote' | 'guarantee' | 'project' | 'transaction' | 'social';
  action: string;
  
  // Dados da atividade
  data: {
    projectId?: string;
    votingId?: string;
    amount?: Amount;
    token?: string;
    recipient?: Address;
    transactionHash?: Hash;
    [key: string]: unknown;
  };
  
  // Metadata
  timestamp: string;
  blockNumber?: number;
  gasUsed?: Amount;
  
  // Visibilidade
  isPublic: boolean;
  isHighlighted: boolean;
}

/**
 * Notificação do usuário
 */
export interface UserNotification {
  id: string;
  userId: string;
  
  // Conteúdo
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'voting' | 'project' | 'guarantee' | 'security' | 'system';
  title: string;
  message: string;
  
  // Ação (opcional)
  action?: {
    label: string;
    url: string;
    type: 'internal' | 'external';
  };
  
  // Status
  isRead: boolean;
  isArchived: boolean;
  
  // Timing
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  
  // Dados relacionados
  relatedData?: {
    projectId?: string;
    votingId?: string;
    transactionHash?: Hash;
  };
}

/**
 * Configurações de segurança do usuário
 */
export interface UserSecurity {
  address: Address;
  
  // Autenticação
  auth: {
    lastLogin: string;
    loginAttempts: number;
    isLocked: boolean;
    lockUntil?: string;
    
    // Sessões ativas
    activeSessions: {
      id: string;
      device: string;
      browser: string;
      ip: string;
      location: string;
      createdAt: string;
      lastActivity: string;
    }[];
  };
  
  // Carteira
  wallet: {
    connectedWallets: {
      address: Address;
      type: 'metamask' | 'walletconnect' | 'lunes' | 'other';
      name: string;
      isVerified: boolean;
      connectedAt: string;
      lastUsed: string;
    }[];
    
    // Configurações de segurança
    requireConfirmation: boolean;
    maxTransactionAmount: Amount;
    trustedAddresses: Address[];
  };
  
  // Logs de segurança
  securityLogs: {
    id: string;
    type: 'login' | 'logout' | 'transaction' | 'settings_change' | 'suspicious_activity';
    description: string;
    ip: string;
    userAgent: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

/**
 * Dados para criar/atualizar perfil
 */
export interface UpdateUserProfileData {
  username?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  social?: Partial<UserProfile['social']>;
  preferences?: Partial<UserPreferences>;
}

/**
 * Dados de verificação do usuário
 */
export interface UserVerificationData {
  address: Address;
  
  // Documentos
  documents: {
    type: 'id' | 'passport' | 'license' | 'utility_bill' | 'bank_statement';
    file: string; // Base64 ou URL
    status: 'pending' | 'approved' | 'rejected';
    uploadedAt: string;
    reviewedAt?: string;
    notes?: string;
  }[];
  
  // Verificação social
  social: {
    twitter?: {
      username: string;
      verified: boolean;
      followers: number;
    };
    github?: {
      username: string;
      verified: boolean;
      repositories: number;
      contributions: number;
    };
  };
  
  // Status geral
  overallStatus: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

/**
 * Ranking de usuários
 */
export interface UserRanking {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  category: 'reputation' | 'voting' | 'guarantees' | 'projects' | 'volume';
  
  rankings: {
    rank: number;
    address: Address;
    username?: string;
    avatar?: string;
    score: number;
    change: number; // Mudança de posição
    
    // Métricas específicas
    metrics: {
      [key: string]: number | string;
    };
  }[];
  
  // Metadata
  totalUsers: number;
  lastUpdated: string;
}

/**
 * Relacionamentos entre usuários
 */
export interface UserRelationship {
  id: string;
  fromUser: Address;
  toUser: Address;
  
  type: 'follow' | 'block' | 'trust' | 'delegate';
  status: 'active' | 'pending' | 'rejected';
  
  createdAt: string;
  updatedAt: string;
  
  // Dados específicos do relacionamento
  data?: {
    delegationAmount?: Amount;
    trustScore?: number;
    notes?: string;
  };
}

/**
 * Eventos do usuário
 */
export type UserEventType = 
  | 'profile_created'
  | 'profile_updated'
  | 'verification_submitted'
  | 'verification_approved'
  | 'badge_earned'
  | 'reputation_changed'
  | 'security_alert';

export interface UserEvent {
  id: string;
  userId: string;
  type: UserEventType;
  data: Record<string, unknown>;
  timestamp: string;
  isPublic: boolean;
}