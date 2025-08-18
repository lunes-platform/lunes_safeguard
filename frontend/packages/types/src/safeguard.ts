import type { Address, Amount, Hash, LoadingState } from './common';
import type { Project, ProjectStatus } from './project';
import type { GuaranteeBreakdown } from './guarantee';
import type { VotingData, VotingStatus } from './voting';
import type { UserProfile } from './user';

/**
 * Configuração principal do SafeGuard
 */
export interface SafeGuardConfig {
  // Informações da rede
  network: {
    chainId: number;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
  };
  
  // Contratos
  contracts: {
    safeguard: Address;
    lunesToken: Address;
    lustdToken: Address;
    governance: Address;
    treasury: Address;
  };
  
  // Configurações de governança
  governance: {
    votingPeriod: number; // dias
    quorumThreshold: number; // porcentagem
    approvalThreshold: number; // porcentagem
    proposalDelay: number; // blocos
    executionDelay: number; // blocos
  };
  
  // Configurações de garantias
  guarantees: {
    minAmount: Amount;
    maxAmount: Amount;
    supportedTokens: Address[];
    lockPeriod: number; // dias
    penaltyRate: number; // porcentagem
  };
  
  // Taxas da plataforma
  fees: {
    platformFee: number; // porcentagem
    guaranteeFee: number; // porcentagem
    withdrawalFee: number; // porcentagem
    votingFee: Amount; // valor fixo
  };
}

/**
 * Estado global da aplicação SafeGuard
 */
export interface SafeGuardState {
  // Estado de inicialização
  isInitialized: boolean;
  isLoading: boolean;
  error?: string;
  
  // Configuração
  config?: SafeGuardConfig;
  
  // Usuário atual
  currentUser?: {
    profile: UserProfile;
    isConnected: boolean;
    address: Address;
    balance: Amount;
  };
  
  // Dados da plataforma
  platform: {
    totalProjects: number;
    totalGuarantees: Amount;
    totalUsers: number;
    totalVotings: number;
    
    // Estatísticas em tempo real
    stats: {
      activeProjects: number;
      pendingVotings: number;
      totalValueLocked: Amount;
      successRate: number;
    };
  };
  
  // Cache de dados
  cache: {
    projects: Map<string, Project>;
    votings: Map<string, VotingData>;
    users: Map<Address, UserProfile>;
    guarantees: Map<string, GuaranteeBreakdown>;
    
    // Timestamps de última atualização
    lastUpdated: {
      projects: number;
      votings: number;
      users: number;
      guarantees: number;
    };
  };
}

/**
 * Ações disponíveis no SafeGuard
 */
export interface SafeGuardActions {
  // Inicialização
  initialize: (config: SafeGuardConfig) => Promise<void>;
  reset: () => void;
  
  // Usuário
  connectWallet: (address: Address) => Promise<void>;
  disconnectWallet: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // Projetos
  loadProjects: (filters?: any) => Promise<Project[]>;
  loadProject: (id: string) => Promise<Project>;
  createProject: (data: any) => Promise<Project>;
  updateProject: (id: string, data: any) => Promise<Project>;
  
  // Garantias
  loadGuarantees: (projectId: string) => Promise<GuaranteeBreakdown>;
  addGuarantee: (projectId: string, amount: Amount, token: Address) => Promise<void>;
  withdrawGuarantee: (projectId: string, amount: Amount, token: Address) => Promise<void>;
  
  // Votações
  loadVotings: (projectId?: string) => Promise<VotingData[]>;
  loadVoting: (votingId: string) => Promise<VotingData>;
  createVoting: (projectId: string, data: any) => Promise<VotingData>;
  submitVote: (votingId: string, option: string) => Promise<void>;
  
  // Cache
  invalidateCache: (type?: 'projects' | 'votings' | 'users' | 'guarantees') => void;
  refreshData: () => Promise<void>;
}

/**
 * Contexto do SafeGuard para React
 */
export interface SafeGuardContext {
  state: SafeGuardState;
  actions: SafeGuardActions;
  
  // Estados de loading específicos
  loading: {
    projects: LoadingState;
    votings: LoadingState;
    guarantees: LoadingState;
    transactions: LoadingState;
  };
  
  // Erros específicos
  errors: {
    projects?: string;
    votings?: string;
    guarantees?: string;
    transactions?: string;
  };
}

/**
 * Eventos do SafeGuard
 */
export type SafeGuardEventType = 
  | 'project_created'
  | 'project_updated'
  | 'guarantee_added'
  | 'guarantee_withdrawn'
  | 'voting_created'
  | 'vote_cast'
  | 'voting_ended'
  | 'user_connected'
  | 'user_disconnected'
  | 'error_occurred';

export interface SafeGuardEvent {
  type: SafeGuardEventType;
  data: Record<string, unknown>;
  timestamp: number;
  source: 'user' | 'contract' | 'api' | 'system';
}

/**
 * Listener de eventos do SafeGuard
 */
export type SafeGuardEventListener = (event: SafeGuardEvent) => void;

/**
 * Métricas de performance do SafeGuard
 */
export interface SafeGuardMetrics {
  // Performance da aplicação
  performance: {
    loadTime: number;
    renderTime: number;
    apiResponseTime: number;
    contractCallTime: number;
  };
  
  // Uso da aplicação
  usage: {
    activeUsers: number;
    sessionsToday: number;
    transactionsToday: number;
    errorsToday: number;
  };
  
  // Métricas de negócio
  business: {
    projectsCreated: number;
    guaranteesAdded: Amount;
    votesSubmitted: number;
    successfulProjects: number;
  };
  
  // Saúde do sistema
  health: {
    apiStatus: 'healthy' | 'degraded' | 'down';
    contractStatus: 'healthy' | 'degraded' | 'down';
    databaseStatus: 'healthy' | 'degraded' | 'down';
    overallScore: number; // 0-100
  };
}

/**
 * Configurações de desenvolvimento
 */
export interface SafeGuardDevConfig {
  // Debug
  debug: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    showPerformance: boolean;
    showNetworkCalls: boolean;
  };
  
  // Mock data
  mock: {
    enabled: boolean;
    useLocalStorage: boolean;
    generateRandomData: boolean;
  };
  
  // Testing
  testing: {
    skipAnimations: boolean;
    fastTransactions: boolean;
    mockWallet: boolean;
  };
}

/**
 * Utilitários do SafeGuard
 */
export interface SafeGuardUtils {
  // Formatação
  format: {
    amount: (amount: Amount, decimals?: number) => string;
    address: (address: Address, length?: number) => string;
    date: (date: string | Date, format?: string) => string;
    duration: (seconds: number) => string;
  };
  
  // Validação
  validate: {
    address: (address: string) => boolean;
    amount: (amount: string) => boolean;
    email: (email: string) => boolean;
    url: (url: string) => boolean;
  };
  
  // Conversão
  convert: {
    toWei: (amount: string, decimals?: number) => string;
    fromWei: (amount: string, decimals?: number) => string;
    toUSD: (amount: Amount, tokenPrice: number) => number;
  };
  
  // Criptografia
  crypto: {
    hash: (data: string) => string;
    sign: (message: string, privateKey: string) => string;
    verify: (message: string, signature: string, publicKey: string) => boolean;
  };
}

/**
 * Hooks personalizados do SafeGuard
 */
export interface SafeGuardHooks {
  // Estado global
  useSafeGuard: () => SafeGuardContext;
  useSafeGuardConfig: () => SafeGuardConfig | undefined;
  
  // Projetos
  useProjects: (filters?: any) => {
    projects: Project[];
    loading: LoadingState;
    error?: string;
    refetch: () => Promise<void>;
  };
  
  useProject: (id: string) => {
    project?: Project;
    loading: LoadingState;
    error?: string;
    refetch: () => Promise<void>;
  };
  
  // Votações
  useVotings: (projectId?: string) => {
    votings: VotingData[];
    loading: LoadingState;
    error?: string;
    refetch: () => Promise<void>;
  };
  
  useVoting: (votingId: string) => {
    voting?: VotingData;
    loading: LoadingState;
    error?: string;
    refetch: () => Promise<void>;
  };
  
  // Usuário
  useUser: (address?: Address) => {
    user?: UserProfile;
    loading: LoadingState;
    error?: string;
    refetch: () => Promise<void>;
  };
  
  // Carteira
  useWallet: () => {
    isConnected: boolean;
    address?: Address;
    balance?: Amount;
    connect: () => Promise<void>;
    disconnect: () => void;
  };
  
  // Transações
  useTransaction: () => {
    submit: (tx: any) => Promise<Hash>;
    loading: boolean;
    error?: string;
  };
}

/**
 * Tipos exportados principais
 */
export type {
  Project,
  ProjectStatus,
  GuaranteeBreakdown,
  VotingData,
  VotingStatus,
  UserProfile,
  Address,
  Amount,
  Hash,
  LoadingState
};