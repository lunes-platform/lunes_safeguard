import type { Address, Amount, Hash, LoadingState } from './common';

/**
 * Status possíveis de um projeto no SafeGuard
 */
export type ProjectStatus = 
  | 'active'        // Projeto ativo e funcionando
  | 'voting'        // Em período de votação
  | 'under_review'  // Sob revisão após votação negativa
  | 'improvement'   // Período de melhoria (90 dias)
  | 'terminated'    // Projeto encerrado
  | 'pending'       // Aguardando aprovação inicial
  | 'suspended';    // Temporariamente suspenso

/**
 * Informações básicas de um projeto
 */
export interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  documentation?: string;
  github?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
}

/**
 * Dados técnicos do projeto
 */
export interface ProjectTechnical {
  contractAddress: Address;
  tokenAddress?: Address;
  tokenSymbol?: string;
  tokenDecimals?: number;
  networkId: number;
  deploymentBlock?: number;
  lastAuditDate?: string;
  auditReport?: string;
}

/**
 * Métricas de um projeto
 */
export interface ProjectMetrics {
  totalHolders: number;
  totalSupply: Amount;
  marketCap?: Amount;
  volume24h?: Amount;
  priceChange24h?: number;
  liquidityLocked?: Amount;
  vestingProgress: number; // 0-100
  communityScore: number; // 0-100
}

/**
 * Cronograma e marcos do projeto
 */
export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  evidence?: string[];
}

export interface ProjectRoadmap {
  milestones: ProjectMilestone[];
  lastUpdated: string;
  nextMilestone?: ProjectMilestone;
}

/**
 * Equipe do projeto
 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  verified: boolean;
}

export interface ProjectTeam {
  members: TeamMember[];
  advisors?: TeamMember[];
  totalMembers: number;
}

/**
 * Dados completos de um projeto
 */
export interface Project {
  // Identificação
  id: string;
  owner: Address;
  
  // Informações básicas
  info: ProjectInfo;
  
  // Dados técnicos
  technical: ProjectTechnical;
  
  // Status e timing
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  launchDate?: string;
  
  // Métricas
  metrics: ProjectMetrics;
  
  // Garantias (será detalhado em guarantee.ts)
  guaranteeScore: number; // 0-100
  totalGuaranteeValue: Amount;
  
  // Votação (será detalhado em voting.ts)
  currentVoting?: {
    id: string;
    endDate: string;
    approvalRate: number;
  };
  
  // Equipe e roadmap
  team?: ProjectTeam;
  roadmap?: ProjectRoadmap;
  
  // Flags
  isVerified: boolean;
  isFeatured: boolean;
  hasActiveVoting: boolean;
  canReceiveDonations: boolean;
}

/**
 * Dados para criação de um novo projeto
 */
export interface CreateProjectData {
  name: string;
  description: string;
  logo?: File | string;
  contractAddress: Address;
  tokenAddress?: Address;
  website?: string;
  documentation?: string;
  initialGuarantee: {
    lunesAmount: Amount;
    lustdAmount: Amount;
  };
}

/**
 * Dados para atualização de um projeto
 */
export interface UpdateProjectData {
  info?: Partial<ProjectInfo>;
  technical?: Partial<ProjectTechnical>;
  team?: Partial<ProjectTeam>;
  roadmap?: Partial<ProjectRoadmap>;
}

/**
 * Filtros para busca de projetos
 */
export interface ProjectFilters {
  status?: ProjectStatus[];
  minScore?: number;
  maxScore?: number;
  hasVoting?: boolean;
  isVerified?: boolean;
  category?: string[];
  network?: number[];
  search?: string;
}

/**
 * Ordenação de projetos
 */
export type ProjectSortField = 
  | 'name'
  | 'createdAt'
  | 'guaranteeScore'
  | 'totalGuaranteeValue'
  | 'totalHolders'
  | 'marketCap'
  | 'communityScore';

export interface ProjectSort {
  field: ProjectSortField;
  direction: 'asc' | 'desc';
}

/**
 * Estado de carregamento de projetos
 */
export interface ProjectsState {
  projects: Project[];
  selectedProject?: Project;
  loading: LoadingState;
  error?: string;
  filters: ProjectFilters;
  sort: ProjectSort;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Ações relacionadas a projetos
 */
export interface ProjectActions {
  create: (data: CreateProjectData) => Promise<Project>;
  update: (id: string, data: UpdateProjectData) => Promise<Project>;
  delete: (id: string) => Promise<void>;
  get: (id: string) => Promise<Project>;
  list: (filters?: ProjectFilters, sort?: ProjectSort) => Promise<Project[]>;
  addToFavorites: (id: string) => Promise<void>;
  removeFromFavorites: (id: string) => Promise<void>;
}

/**
 * Eventos de projeto
 */
export type ProjectEventType = 
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'voting_started'
  | 'voting_ended'
  | 'guarantee_added'
  | 'milestone_completed';

export interface ProjectEvent {
  id: string;
  projectId: string;
  type: ProjectEventType;
  data: Record<string, unknown>;
  timestamp: string;
  blockNumber?: number;
  transactionHash?: Hash;
}