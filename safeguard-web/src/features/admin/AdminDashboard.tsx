import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plus,
  Eye,
  Vote,
  FileText,
  Settings,
  List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SEOHead } from '../../components/seo/SEOHead';
import { ProjectList } from './ProjectList';
import { ProjectDashboard } from './ProjectDashboard';

/**
 * Interface para métricas do dashboard
 */
interface DashboardMetrics {
  totalProjects: number;
  pendingApproval: number;
  activeProjects: number;
  totalValueLocked: string;
  monthlyGrowth: number;
}

/**
 * Interface para projeto resumido no dashboard
 */
interface ProjectSummary {
  id: string;
  name: string;
  status: 'pending_deposit' | 'pending_approval' | 'approved' | 'rejected';
  depositAmount: string;
  submissionDate: string;
  nextAction?: string;
}

/**
 * Dados mock para demonstração
 */
const mockMetrics: DashboardMetrics = {
  totalProjects: 12,
  pendingApproval: 3,
  activeProjects: 8,
  totalValueLocked: '2.5M LUNES',
  monthlyGrowth: 15.2
};

const mockProjects: ProjectSummary[] = [
  {
    id: '1',
    name: 'DeFi Protocol Alpha',
    status: 'pending_approval',
    depositAmount: '50,000 LUNES',
    submissionDate: '2024-01-15',
    nextAction: 'Aguardando votação da comunidade'
  },
  {
    id: '2',
    name: 'NFT Marketplace Beta',
    status: 'approved',
    depositAmount: '75,000 LUNES',
    submissionDate: '2024-01-10',
    nextAction: 'Projeto ativo'
  },
  {
    id: '3',
    name: 'Gaming Platform Gamma',
    status: 'pending_deposit',
    depositAmount: '100,000 LUNES',
    submissionDate: '2024-01-20',
    nextAction: 'Aguardando depósito de garantia'
  }
];

/**
 * Função para obter cor do status
 */
const getStatusColor = (status: ProjectSummary['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending_approval':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending_deposit':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Função para obter texto do status
 */
const getStatusText = (status: ProjectSummary['status']) => {
  switch (status) {
    case 'approved':
      return 'Aprovado';
    case 'pending_approval':
      return 'Aguardando Aprovação';
    case 'pending_deposit':
      return 'Aguardando Depósito';
    case 'rejected':
      return 'Rejeitado';
    default:
      return 'Desconhecido';
  }
};

/**
 * Componente principal do dashboard administrativo
 */
export const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'project-detail'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  if (activeView === 'projects') {
    return (
      <>
        <SEOHead
          title="Gerenciar Projetos - Lunes SafeGuard"
          description="Visualize e gerencie todos os projetos cadastrados no protocolo Lunes SafeGuard."
          keywords={["projetos", "admin", "gerenciar", "SafeGuard"]}
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                    Gerenciar Projetos
                  </h1>
                  <p className="text-lg text-neutral-600">
                    Visualize e gerencie todos os projetos cadastrados
                  </p>
                </div>
                
                <Button
                  onClick={() => setActiveView('dashboard')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Voltar ao Dashboard
                </Button>
              </div>
            </motion.div>
            
            <ProjectList 
              onViewProject={(projectId: string) => {
                setSelectedProjectId(projectId);
                setActiveView('project-detail');
              }}
            />
          </div>
        </div>
      </>
    );
  }

  if (activeView === 'project-detail' && selectedProjectId) {
    return (
      <>
        <SEOHead
          title="Dashboard do Projeto - Lunes SafeGuard"
          description="Dashboard detalhado do projeto selecionado"
          keywords={["projeto", "dashboard", "admin", "SafeGuard"]}
          noIndex={true}
        />
        
        <ProjectDashboard 
          projectId={selectedProjectId}
          onBack={() => {
            setSelectedProjectId(null);
            setActiveView('projects');
          }}
        />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Dashboard Administrativo - Lunes SafeGuard"
        description="Gerencie seus projetos, visualize métricas e acompanhe o status de aprovações no protocolo Lunes SafeGuard."
        keywords={["dashboard", "admin", "projetos", "métricas", "SafeGuard"]}
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                  Dashboard Administrativo
                </h1>
                <p className="text-lg text-neutral-600">
                  Gerencie seus projetos e acompanhe métricas em tempo real
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setActiveView('projects')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <List className="w-4 h-4" />
                  Ver Todos os Projetos
                </Button>
                <Link to="/admin/onboarding">
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Projeto
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Métricas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Total de Projetos</p>
                    <p className="text-2xl font-bold text-neutral-900">{mockMetrics.totalProjects}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-lunes-purple" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Aguardando Aprovação</p>
                    <p className="text-2xl font-bold text-yellow-600">{mockMetrics.pendingApproval}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Projetos Ativos</p>
                    <p className="text-2xl font-bold text-green-600">{mockMetrics.activeProjects}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Valor Total Bloqueado</p>
                    <p className="text-2xl font-bold text-lunes-purple">{mockMetrics.totalValueLocked}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-lunes-purple" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Projetos */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Projetos Recentes</span>
                    <Link to="/projetos">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Ver Todos
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-neutral-900">{project.name}</h3>
                            <Badge className={getStatusColor(project.status)}>
                              {getStatusText(project.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-600 mb-1">
                            Depósito: {project.depositAmount}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Submetido em: {new Date(project.submissionDate).toLocaleDateString('pt-BR')}
                          </p>
                          {project.nextAction && (
                            <p className="text-xs text-lunes-purple mt-1">
                              {project.nextAction}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setActiveView('project-detail');
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Ações Rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link to="/admin/onboarding" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar Novo Projeto
                      </Button>
                    </Link>
                    
                    <Link to="/admin/depositos" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Gerenciar Depósitos
                      </Button>
                    </Link>
                    
                    <Link to="/admin/votacoes" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Vote className="w-4 h-4 mr-2" />
                        Votações & Propostas
                      </Button>
                    </Link>
                    
                    <Link to="/admin/relatorios" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Relatórios
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Alertas */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Alertas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">
                        3 projetos aguardando aprovação
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Verifique as votações pendentes
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        1 projeto aguardando depósito
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Prazo: 7 dias restantes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;