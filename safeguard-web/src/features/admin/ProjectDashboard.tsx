import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  DollarSign,
  Vote,
  FileText,
  ExternalLink,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../components/ui';
import { ProjectStatusManager } from '../../components/project/ProjectStatusManager';
import { SEOHead } from '../../components/seo/SEOHead';
import type { ProjectRegistrationData } from '../project-registration/types';

/**
 * Interface para dados de depósitos
 */
interface DepositData {
  id: string;
  amount: number;
  token: string;
  depositor: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
}

/**
 * Interface para dados de votações
 */
interface VoteData {
  id: string;
  proposalId: string;
  proposalTitle: string;
  voter: string;
  vote: 'approve' | 'reject' | 'abstain';
  timestamp: Date;
  weight: number;
}

/**
 * Interface para dados de propostas
 */
interface ProposalData {
  id: string;
  title: string;
  description: string;
  type: 'funding' | 'governance' | 'technical';
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'executed';
  createdAt: Date;
  endDate: Date;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
}

/**
 * Dados mockados para demonstração
 */
const mockProjectData: ProjectRegistrationData = {
  id: 1,
  name: 'DeFi Protocol X',
  description: 'Um protocolo DeFi inovador para empréstimos descentralizados',
  category: 'DeFi',
  website: 'https://defiprotocolx.com',
  github: 'https://github.com/defiprotocolx',
  twitter: 'https://twitter.com/defiprotocolx',
  telegram: 'https://t.me/defiprotocolx',
  tokenContract: '0x1234567890123456789012345678901234567890',
  treasuryAddress: '0x0987654321098765432109876543210987654321',
  teamSize: 8,
  hasAudit: true,
  hasKYC: true,
  auditReport: 'https://audits.com/defiprotocolx-report.pdf',
  kycProvider: 'CertiK',
  agreedToTerms: true,
  status: 'approved',
  createdAt: new Date('2024-01-15'),
  estimatedScore: 85
};

const mockDeposits: DepositData[] = [
  {
    id: '1',
    amount: 10000,
    token: 'USDC',
    depositor: '0xabc123...def456',
    timestamp: new Date('2024-01-16T10:30:00'),
    status: 'confirmed',
    transactionHash: '0x123abc...789def'
  },
  {
    id: '2',
    amount: 5000,
    token: 'USDT',
    depositor: '0x789xyz...123abc',
    timestamp: new Date('2024-01-17T14:20:00'),
    status: 'confirmed',
    transactionHash: '0x456def...012ghi'
  },
  {
    id: '3',
    amount: 2500,
    token: 'DAI',
    depositor: '0x456def...789xyz',
    timestamp: new Date('2024-01-18T09:15:00'),
    status: 'pending'
  }
];

const mockVotes: VoteData[] = [
  {
    id: '1',
    proposalId: 'prop-001',
    proposalTitle: 'Aprovação de Funding Inicial',
    voter: '0xabc123...def456',
    vote: 'approve',
    timestamp: new Date('2024-01-19T11:00:00'),
    weight: 1000
  },
  {
    id: '2',
    proposalId: 'prop-001',
    proposalTitle: 'Aprovação de Funding Inicial',
    voter: '0x789xyz...123abc',
    vote: 'approve',
    timestamp: new Date('2024-01-19T11:30:00'),
    weight: 750
  },
  {
    id: '3',
    proposalId: 'prop-002',
    proposalTitle: 'Mudança de Parâmetros de Governança',
    voter: '0x456def...789xyz',
    vote: 'reject',
    timestamp: new Date('2024-01-20T16:45:00'),
    weight: 500
  }
];

const mockProposals: ProposalData[] = [
  {
    id: 'prop-001',
    title: 'Aprovação de Funding Inicial',
    description: 'Proposta para aprovação do funding inicial de $50,000 para desenvolvimento da fase 1',
    type: 'funding',
    status: 'passed',
    createdAt: new Date('2024-01-18T08:00:00'),
    endDate: new Date('2024-01-25T23:59:59'),
    votesFor: 1750,
    votesAgainst: 250,
    totalVotes: 2000,
    quorum: 1500
  },
  {
    id: 'prop-002',
    title: 'Mudança de Parâmetros de Governança',
    description: 'Proposta para alterar o quorum mínimo de 75% para 60%',
    type: 'governance',
    status: 'active',
    createdAt: new Date('2024-01-20T10:00:00'),
    endDate: new Date('2024-01-27T23:59:59'),
    votesFor: 800,
    votesAgainst: 500,
    totalVotes: 1300,
    quorum: 1500
  }
];

/**
 * Componente para exibir estatísticas resumidas
 */
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}> = ({ title, value, icon, trend, trendUp }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
              <TrendingUp className={`w-3 h-3 ${!trendUp ? 'rotate-180' : ''}`} />
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Componente para exibir badge de status
 */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      case 'passed':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'active':
        return { color: 'bg-blue-100 text-blue-800', icon: Activity };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  );
};

/**
 * Dashboard específico do projeto
 */
interface ProjectDashboardProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projectId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'deposits' | 'votes' | 'proposals'>('overview');
  const [project, setProject] = useState<ProjectRegistrationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const loadProject = async () => {
      setLoading(true);
      // Em uma implementação real, aqui faria a chamada para a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProject(mockProjectData);
      setLoading(false);
    };

    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Projeto não encontrado</h2>
          <p className="text-gray-600 mb-6">O projeto solicitado não foi encontrado ou não existe.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const totalDeposits = mockDeposits.reduce((sum, deposit) =>
    deposit.status === 'confirmed' ? sum + deposit.amount : sum, 0
  );
  const totalVotes = mockVotes.length;
  const activeProposals = mockProposals.filter(p => p.status === 'active').length;

  return (
    <>
      <SEOHead
        title={`${project.name} - Dashboard Admin - Lunes SafeGuard`}
        description={`Dashboard administrativo do projeto ${project.name}. Visualize depósitos, votações e propostas.`}
        keywords={["projeto", "admin", "dashboard", project.name, "SafeGuard"]}
        noIndex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>

              <div className="flex-1">
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                  {project.name}
                </h1>
                <p className="text-lg text-neutral-600">
                  {project.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={project.status} />
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" />
                  Ver Público
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Visão Geral', icon: Activity },
                  { id: 'deposits', label: 'Depósitos', icon: DollarSign },
                  { id: 'votes', label: 'Votações', icon: Vote },
                  { id: 'proposals', label: 'Propostas', icon: FileText }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    title="Total Depositado"
                    value={`$${totalDeposits.toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6 text-blue-600" />}
                    trend="+12.5%"
                    trendUp={true}
                  />
                  <StatsCard
                    title="Total de Votos"
                    value={totalVotes}
                    icon={<Vote className="w-6 h-6 text-green-600" />}
                    trend="+8.2%"
                    trendUp={true}
                  />
                  <StatsCard
                    title="Propostas Ativas"
                    value={activeProposals}
                    icon={<FileText className="w-6 h-6 text-orange-600" />}
                  />
                  <StatsCard
                    title="Membros da Equipe"
                    value={project.teamSize}
                    icon={<Users className="w-6 h-6 text-purple-600" />}
                  />
                </div>

                {/* Project Info & Status Manager */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Project Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Informações do Projeto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Categoria:</span>
                          <p className="text-gray-900">{project.category}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Token Contract:</span>
                          <p className="text-gray-900 font-mono text-xs">{project.tokenContract}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Treasury:</span>
                          <p className="text-gray-900 font-mono text-xs">{project.treasuryAddress}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Auditoria:</span>
                          <p className="text-gray-900">{project.hasAudit ? 'Sim' : 'Não'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">KYC:</span>
                          <p className="text-gray-900">{project.hasKYC ? project.kycProvider : 'Não'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Criado em:</span>
                          <p className="text-gray-900">{project.createdAt.toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex flex-wrap gap-2">
                          {project.website && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(project.website, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Website
                            </Button>
                          )}
                          {project.github && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(project.github, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                              GitHub
                            </Button>
                          )}
                          {project.auditReport && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(project.auditReport, '_blank')}
                            >
                              <Download className="w-3 h-3" />
                              Auditoria
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Manager */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Gerenciamento de Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProjectStatusManager
                        project={{
                          id: project.id,
                          name: project.name,
                          status: project.status,
                          createdAt: project.createdAt
                        }}
                        isAdmin
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'deposits' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Histórico de Depósitos
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                      Exportar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Data</th>
                          <th className="text-left py-3 px-4">Valor</th>
                          <th className="text-left py-3 px-4">Token</th>
                          <th className="text-left py-3 px-4">Depositante</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockDeposits.map(deposit => (
                          <tr key={deposit.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              {deposit.timestamp.toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              ${deposit.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">{deposit.token}</td>
                            <td className="py-3 px-4 font-mono text-xs">
                              {deposit.depositor}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={deposit.status} />
                            </td>
                            <td className="py-3 px-4">
                              {deposit.transactionHash && (
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="w-3 h-3" />
                                  Ver TX
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'votes' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Vote className="w-5 h-5" />
                      Histórico de Votações
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                      Exportar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Data</th>
                          <th className="text-left py-3 px-4">Proposta</th>
                          <th className="text-left py-3 px-4">Votante</th>
                          <th className="text-left py-3 px-4">Voto</th>
                          <th className="text-left py-3 px-4">Peso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockVotes.map(vote => (
                          <tr key={vote.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              {vote.timestamp.toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{vote.proposalTitle}</p>
                                <p className="text-xs text-gray-500">ID: {vote.proposalId}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs">
                              {vote.voter}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`${vote.vote === 'approve' ? 'bg-green-100 text-green-800' :
                                  vote.vote === 'reject' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {vote.vote === 'approve' ? 'Aprovar' :
                                  vote.vote === 'reject' ? 'Rejeitar' : 'Abstenção'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {vote.weight.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'proposals' && (
              <div className="space-y-6">
                {mockProposals.map(proposal => (
                  <Card key={proposal.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <FileText className="w-5 h-5" />
                            {proposal.title}
                          </CardTitle>
                          <p className="text-gray-600 text-sm mb-3">
                            {proposal.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Tipo: {proposal.type}</span>
                            <span>•</span>
                            <span>Criada em: {proposal.createdAt.toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span>Termina em: {proposal.endDate.toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <StatusBadge status={proposal.status} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {proposal.votesFor.toLocaleString()}
                          </p>
                          <p className="text-sm text-green-700">Votos Favoráveis</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">
                            {proposal.votesAgainst.toLocaleString()}
                          </p>
                          <p className="text-sm text-red-700">Votos Contrários</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {Math.round((proposal.totalVotes / proposal.quorum) * 100)}%
                          </p>
                          <p className="text-sm text-blue-700">Quorum Atingido</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progresso da Votação</span>
                          <span>{proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()} votos</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((proposal.totalVotes / proposal.quorum) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};