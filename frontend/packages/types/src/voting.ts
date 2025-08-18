import type { Address, Amount, Hash } from './common';

/**
 * Status possíveis de uma votação
 */
export type VotingStatus = 
  | 'pending'     // Aguardando início
  | 'active'      // Em andamento
  | 'ended'       // Finalizada
  | 'executed'    // Resultado executado
  | 'cancelled';  // Cancelada

/**
 * Tipos de votação no SafeGuard
 */
export type VotingType = 
  | 'annual_review'        // Revisão anual obrigatória
  | 'improvement_proposal' // Proposta de melhoria após falha
  | 'emergency'           // Votação de emergência
  | 'governance';         // Votação de governança geral

/**
 * Opções de voto
 */
export type VoteOption = 'approve' | 'reject' | 'abstain';

/**
 * Resultado de uma votação
 */
export type VotingResult = 'approved' | 'rejected' | 'tie' | 'quorum_not_met';

/**
 * Dados de um voto individual
 */
export interface Vote {
  id: string;
  votingId: string;
  voter: Address;
  option: VoteOption;
  weight: Amount; // Quantidade de tokens do votante
  timestamp: string;
  transactionHash: Hash;
  blockNumber: number;
}

/**
 * Estatísticas de uma votação
 */
export interface VotingStats {
  totalVotes: number;
  totalWeight: Amount;
  
  // Distribuição por opção
  approve: {
    votes: number;
    weight: Amount;
    percentage: number;
  };
  reject: {
    votes: number;
    weight: Amount;
    percentage: number;
  };
  abstain: {
    votes: number;
    weight: Amount;
    percentage: number;
  };
  
  // Participação
  participation: {
    eligibleVoters: number;
    totalEligibleWeight: Amount;
    participationRate: number;
    quorumReached: boolean;
  };
  
  // Tendências
  trends: {
    hourly: { timestamp: string; approveRate: number }[];
    daily: { date: string; approveRate: number }[];
  };
}

/**
 * Dados completos de uma votação
 */
export interface VotingData {
  id: string;
  projectId: string;
  type: VotingType;
  status: VotingStatus;
  
  // Timing
  createdAt: string;
  startDate: string;
  endDate: string;
  executedAt?: string;
  
  // Configurações
  config: {
    title: string;
    description: string;
    quorumRequired: number; // Porcentagem mínima de participação
    approvalThreshold: number; // Porcentagem mínima para aprovação (70%)
    votingPeriod: number; // Duração em dias
    allowAbstention: boolean;
    requiresExecution: boolean;
  };
  
  // Critérios de elegibilidade
  eligibility: {
    snapshotBlock: number;
    snapshotDate: string;
    minTokenBalance: Amount;
    minHoldingPeriod: number; // em dias
    blacklistedAddresses: Address[];
  };
  
  // Resultados
  stats: VotingStats;
  result?: VotingResult;
  
  // Votos
  votes: Vote[];
  
  // Proposta de melhoria (se aplicável)
  improvementProposal?: {
    title: string;
    description: string;
    milestones: {
      title: string;
      description: string;
      targetDate: string;
      deliverables: string[];
    }[];
    budget?: {
      amount: Amount;
      currency: string;
      breakdown: {
        category: string;
        amount: Amount;
        description: string;
      }[];
    };
    timeline: {
      phase: string;
      startDate: string;
      endDate: string;
      deliverables: string[];
    }[];
  };
}

/**
 * Dados para criar uma nova votação
 */
export interface CreateVotingData {
  projectId: string;
  type: VotingType;
  title: string;
  description: string;
  startDate: string;
  votingPeriod: number; // em dias
  quorumRequired?: number;
  approvalThreshold?: number;
  improvementProposal?: VotingData['improvementProposal'];
}

/**
 * Dados para submeter um voto
 */
export interface SubmitVoteData {
  votingId: string;
  option: VoteOption;
  signature?: string; // Para verificação off-chain
}

/**
 * Histórico de votações de um projeto
 */
export interface VotingHistory {
  projectId: string;
  votings: VotingData[];
  
  // Estatísticas históricas
  stats: {
    totalVotings: number;
    approvedVotings: number;
    rejectedVotings: number;
    averageParticipation: number;
    averageApprovalRate: number;
    lastVotingDate?: string;
    nextVotingDate?: string;
  };
  
  // Tendências
  trends: {
    participationTrend: 'increasing' | 'decreasing' | 'stable';
    approvalTrend: 'increasing' | 'decreasing' | 'stable';
    communityGrowth: 'growing' | 'shrinking' | 'stable';
  };
}

/**
 * Perfil de votante
 */
export interface VoterProfile {
  address: Address;
  
  // Estatísticas de participação
  stats: {
    totalVotings: number;
    participatedVotings: number;
    participationRate: number;
    totalWeight: Amount;
    averageWeight: Amount;
  };
  
  // Histórico de votos
  votingHistory: {
    votingId: string;
    projectId: string;
    option: VoteOption;
    weight: Amount;
    timestamp: string;
  }[];
  
  // Padrões de voto
  patterns: {
    approvalRate: number;
    rejectionRate: number;
    abstentionRate: number;
    consistencyScore: number; // Quão consistente são os votos
    influenceScore: number;   // Peso médio dos votos
  };
}

/**
 * Configurações de votação para um projeto
 */
export interface VotingSettings {
  projectId: string;
  
  // Configurações gerais
  isVotingEnabled: boolean;
  votingInterval: number; // Intervalo entre votações em meses (padrão: 12)
  
  // Configurações de quorum e aprovação
  defaultQuorum: number;
  defaultApprovalThreshold: number;
  defaultVotingPeriod: number;
  
  // Configurações de elegibilidade
  minTokenBalance: Amount;
  minHoldingPeriod: number;
  snapshotAdvanceNotice: number; // dias de antecedência para snapshot
  
  // Configurações de proposta de melhoria
  improvementPeriod: number; // dias para submeter proposta (padrão: 90)
  allowMultipleProposals: boolean;
  requiresBudget: boolean;
  
  // Notificações
  notifyVotingStart: boolean;
  notifyVotingEnd: boolean;
  notifyResults: boolean;
}

/**
 * Cronograma de votações
 */
export interface VotingSchedule {
  projectId: string;
  
  // Próximas votações
  upcoming: {
    type: VotingType;
    scheduledDate: string;
    estimatedStartDate: string;
    estimatedEndDate: string;
    isAutomatic: boolean;
  }[];
  
  // Votações em andamento
  active: VotingData[];
  
  // Histórico recente
  recent: VotingData[];
  
  // Configurações de agendamento
  settings: {
    autoScheduleAnnualReview: boolean;
    annualReviewMonth: number; // 1-12
    reminderDays: number[];
  };
}

/**
 * Delegação de voto (funcionalidade futura)
 */
export interface VoteDelegation {
  id: string;
  delegator: Address;
  delegate: Address;
  projectId?: string; // Se específico para um projeto
  startDate: string;
  endDate?: string;
  isActive: boolean;
  transactionHash: Hash;
}

/**
 * Eventos relacionados a votações
 */
export type VotingEventType = 
  | 'voting_created'
  | 'voting_started'
  | 'vote_cast'
  | 'voting_ended'
  | 'result_executed'
  | 'quorum_reached'
  | 'proposal_submitted';

export interface VotingEvent {
  id: string;
  votingId: string;
  projectId: string;
  type: VotingEventType;
  data: Record<string, unknown>;
  timestamp: string;
  transactionHash?: Hash;
  blockNumber?: number;
}

/**
 * Análise de governança
 */
export interface GovernanceAnalysis {
  projectId: string;
  
  // Saúde da governança
  healthScore: number; // 0-100
  
  // Métricas de participação
  participation: {
    averageRate: number;
    trend: 'improving' | 'declining' | 'stable';
    topVoters: {
      address: Address;
      participationRate: number;
      totalWeight: Amount;
    }[];
  };
  
  // Distribuição de poder
  powerDistribution: {
    giniCoefficient: number; // Medida de desigualdade
    top10Concentration: number; // % de poder dos top 10 holders
    whaleInfluence: number; // Influência de grandes holders
  };
  
  // Qualidade das decisões
  decisionQuality: {
    consistencyScore: number;
    controversyLevel: number;
    implementationSuccess: number;
  };
  
  // Recomendações
  recommendations: {
    type: 'participation' | 'distribution' | 'process';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionItems: string[];
  }[];
}