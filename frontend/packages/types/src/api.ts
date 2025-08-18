import type { Address, Amount, Hash, PaginationParams, FilterParams, SortConfig } from './common';
import type { Project, ProjectFilters, ProjectSort } from './project';
import type { GuaranteeBreakdown } from './guarantee';
import type { VotingData, VotingHistory, Vote } from './voting';
import type { UserProfile, UserStats, UserActivity } from './user';

/**
 * Resposta padrão da API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

/**
 * Resposta paginada da API
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Parâmetros de requisição com paginação
 */
export interface PaginatedRequest extends PaginationParams {
  search?: string;
  filters?: FilterParams;
  sort?: SortConfig;
}

/**
 * Endpoints da API REST
 */
export interface ApiEndpoints {
  // Projetos
  projects: {
    list: (params?: PaginatedRequest & { filters?: ProjectFilters; sort?: ProjectSort }) => Promise<PaginatedResponse<Project>>;
    get: (id: string) => Promise<ApiResponse<Project>>;
    create: (data: FormData) => Promise<ApiResponse<Project>>;
    update: (id: string, data: Partial<Project>) => Promise<ApiResponse<Project>>;
    delete: (id: string) => Promise<ApiResponse<void>>;
    
    // Garantias
    guarantees: {
      get: (projectId: string) => Promise<ApiResponse<GuaranteeBreakdown>>;
      add: (projectId: string, data: { amount: Amount; token: string }) => Promise<ApiResponse<void>>;
      withdraw: (projectId: string, data: { amount: Amount; token: string }) => Promise<ApiResponse<void>>;
    };
    
    // Votações
    votings: {
      list: (projectId: string) => Promise<ApiResponse<VotingHistory>>;
      get: (projectId: string, votingId: string) => Promise<ApiResponse<VotingData>>;
      create: (projectId: string, data: any) => Promise<ApiResponse<VotingData>>;
      vote: (votingId: string, data: { option: string; signature: string }) => Promise<ApiResponse<Vote>>;
    };
  };
  
  // Usuários
  users: {
    profile: {
      get: (address?: Address) => Promise<ApiResponse<UserProfile>>;
      update: (data: Partial<UserProfile>) => Promise<ApiResponse<UserProfile>>;
    };
    stats: {
      get: (address: Address) => Promise<ApiResponse<UserStats>>;
    };
    activity: {
      list: (address: Address, params?: PaginatedRequest) => Promise<PaginatedResponse<UserActivity>>;
    };
  };
  
  // Autenticação
  auth: {
    nonce: (address: Address) => Promise<ApiResponse<{ nonce: string }>>;
    verify: (address: Address, signature: string, nonce: string) => Promise<ApiResponse<{ token: string; user: UserProfile }>>;
    refresh: (refreshToken: string) => Promise<ApiResponse<{ token: string }>>;
    logout: () => Promise<ApiResponse<void>>;
  };
  
  // Estatísticas gerais
  stats: {
    platform: () => Promise<ApiResponse<PlatformStats>>;
    projects: () => Promise<ApiResponse<ProjectsStats>>;
    voting: () => Promise<ApiResponse<PlatformVotingStats>>;
  };
}

/**
 * Estatísticas da plataforma
 */
export interface PlatformStats {
  // Usuários
  users: {
    total: number;
    active: number;
    verified: number;
    growth: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  
  // Projetos
  projects: {
    total: number;
    active: number;
    completed: number;
    failed: number;
  };
  
  // Volume financeiro
  volume: {
    totalGuarantees: Amount;
    totalDistributed: Amount;
    totalLocked: Amount;
    
    // Por token
    byToken: {
      symbol: string;
      amount: Amount;
      value: Amount; // em USD
    }[];
  };
  
  // Votações
  voting: {
    totalVotings: number;
    activeVotings: number;
    averageParticipation: number;
    averageApproval: number;
  };
}

/**
 * Estatísticas de projetos
 */
export interface ProjectsStats {
  // Distribuição por status
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  
  // Distribuição por categoria
  byCategory: {
    category: string;
    count: number;
    totalGuarantees: Amount;
  }[];
  
  // Performance
  performance: {
    successRate: number;
    averageLifetime: number; // em dias
    averageGuarantee: Amount;
    topPerformers: {
      projectId: string;
      name: string;
      score: number;
    }[];
  };
  
  // Tendências
  trends: {
    creationTrend: 'increasing' | 'decreasing' | 'stable';
    guaranteeTrend: 'increasing' | 'decreasing' | 'stable';
    successTrend: 'improving' | 'declining' | 'stable';
  };
}

/**
 * Estatísticas de votação da plataforma
 */
export interface PlatformVotingStats {  // Participação
  participation: {
    average: number;
    median: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    
    // Por período
    byPeriod: {
      period: string;
      rate: number;
    }[];
  };
  
  // Resultados
  results: {
    approvalRate: number;
    rejectionRate: number;
    
    // Distribuição
    distribution: {
      range: string; // ex: "0-10%", "10-20%", etc.
      count: number;
    }[];
  };
  
  // Governança
  governance: {
    healthScore: number;
    decentralizationIndex: number;
    controversyLevel: number;
  };
}

/**
 * Configuração de rede blockchain
 */
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  
  // Tokens nativos
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  
  // Contratos
  contracts: {
    safeguard: Address;
    lunesToken: Address;
    lustdToken: Address;
    governance: Address;
    treasury: Address;
  };
  
  // Configurações
  blockTime: number; // em segundos
  confirmations: number;
  gasPrice: {
    slow: string;
    standard: string;
    fast: string;
  };
}

/**
 * Métodos do contrato SafeGuard
 */
export interface SafeGuardContract {
  // Leitura
  read: {
    // Projetos
    getProject: (projectId: string) => Promise<any>;
    getProjectGuarantees: (projectId: string) => Promise<GuaranteeBreakdown>;
    getProjectScore: (projectId: string) => Promise<number>;
    
    // Votações
    getVoting: (votingId: string) => Promise<VotingData>;
    getVoterWeight: (votingId: string, voter: Address) => Promise<Amount>;
    hasVoted: (votingId: string, voter: Address) => Promise<boolean>;
    
    // Usuários
    getUserProjects: (user: Address) => Promise<string[]>;
    getUserVotes: (user: Address) => Promise<Vote[]>;
    
    // Estatísticas
    getTotalProjects: () => Promise<number>;
    getTotalGuarantees: () => Promise<Amount>;
    getPlatformFee: () => Promise<number>;
  };
  
  // Escrita
  write: {
    // Projetos
    createProject: (data: {
      name: string;
      description: string;
      tokenAddress: Address;
      initialGuarantee: Amount;
    }) => Promise<Hash>;
    
    updateProject: (projectId: string, data: {
      description?: string;
      website?: string;
      github?: string;
    }) => Promise<Hash>;
    
    // Garantias
    addGuarantee: (projectId: string, amount: Amount, token: Address) => Promise<Hash>;
    withdrawGuarantee: (projectId: string, amount: Amount, token: Address) => Promise<Hash>;
    
    // Votações
    createVoting: (projectId: string, data: {
      title: string;
      description: string;
      duration: number;
      quorum: number;
      threshold: number;
    }) => Promise<Hash>;
    
    vote: (votingId: string, option: number) => Promise<Hash>;
    executeVoting: (votingId: string) => Promise<Hash>;
    
    // Governança
    submitImprovement: (projectId: string, proposal: string) => Promise<Hash>;
    distributeGuarantees: (projectId: string) => Promise<Hash>;
  };
  
  // Eventos
  events: {
    ProjectCreated: (filter?: { creator?: Address; projectId?: string }) => Promise<any[]>;
    GuaranteeAdded: (filter?: { projectId?: string; contributor?: Address }) => Promise<any[]>;
    VotingCreated: (filter?: { projectId?: string; votingId?: string }) => Promise<any[]>;
    VoteCast: (filter?: { votingId?: string; voter?: Address }) => Promise<any[]>;
    GuaranteesDistributed: (filter?: { projectId?: string }) => Promise<any[]>;
  };
}

/**
 * Configuração de carteira
 */
export interface WalletConfig {
  // Provedores suportados
  providers: {
    metamask: boolean;
    walletconnect: boolean;
    lunes: boolean;
    coinbase: boolean;
  };
  
  // Configurações de conexão
  connection: {
    autoConnect: boolean;
    timeout: number;
    retries: number;
  };
  
  // Configurações de transação
  transaction: {
    defaultGasLimit: string;
    maxGasPrice: string;
    confirmations: number;
    timeout: number;
  };
}

/**
 * Estado da conexão com carteira
 */
export interface WalletState {
  // Status
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
  
  // Informações da carteira
  address?: Address;
  chainId?: number;
  balance?: Amount;
  
  // Provedor
  provider?: any;
  providerType?: 'metamask' | 'walletconnect' | 'lunes' | 'coinbase';
  
  // Capacidades
  capabilities: {
    signMessage: boolean;
    signTransaction: boolean;
    switchChain: boolean;
    addChain: boolean;
  };
}

/**
 * Dados de transação
 */
export interface TransactionData {
  hash: Hash;
  from: Address;
  to: Address;
  value: Amount;
  gasLimit: string;
  gasPrice: string;
  nonce: number;
  data?: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  blockNumber?: number;
  blockHash?: Hash;
  
  // Metadata
  timestamp: string;
  gasUsed?: string;
  effectiveGasPrice?: string;
  
  // Contexto SafeGuard
  context?: {
    type: 'create_project' | 'add_guarantee' | 'vote' | 'withdraw' | 'distribute';
    projectId?: string;
    votingId?: string;
    amount?: Amount;
    token?: string;
  };
}

/**
 * Configuração de cache
 */
export interface CacheConfig {
  // TTL por tipo de dados (em segundos)
  ttl: {
    projects: number;
    users: number;
    voting: number;
    stats: number;
    blockchain: number;
  };
  
  // Estratégias de invalidação
  invalidation: {
    onTransaction: boolean;
    onVote: boolean;
    onUpdate: boolean;
    manual: boolean;
  };
  
  // Configurações de storage
  storage: {
    type: 'memory' | 'localStorage' | 'indexedDB';
    maxSize: number; // em MB
    compression: boolean;
  };
}

/**
 * Configuração de monitoramento
 */
export interface MonitoringConfig {
  // Analytics
  analytics: {
    enabled: boolean;
    provider: 'google' | 'mixpanel' | 'amplitude';
    trackingId: string;
  };
  
  // Error tracking
  errorTracking: {
    enabled: boolean;
    provider: 'sentry' | 'bugsnag' | 'rollbar';
    dsn: string;
  };
  
  // Performance
  performance: {
    enabled: boolean;
    sampleRate: number;
    vitals: boolean;
  };
  
  // Logs
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    console: boolean;
    remote: boolean;
    endpoint?: string;
  };
}