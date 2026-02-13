import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '../../components/ui';
import { ProjectStatusManager } from '../../components/project/ProjectStatusManager';
import type { ProjectRegistrationData, ProjectStatus } from '../project-registration/types';

/**
 * Props do componente ProjectList
 */
interface ProjectListProps {
  /** Lista de projetos */
  projects?: ProjectRegistrationData[];
  /** Se está carregando */
  loading?: boolean;
  /** Função chamada ao editar projeto */
  onEdit?: (project: ProjectRegistrationData) => void;
  /** Função chamada ao excluir projeto */
  onDelete?: (projectId: number) => void;
  /** Função chamada ao visualizar projeto */
  onView?: (project: ProjectRegistrationData) => void;
  /** Função chamada ao visualizar dashboard do projeto */
  onViewProject?: (projectId: string) => void;
}

/**
 * Filtros disponíveis
 */
type FilterType = 'all' | ProjectStatus;

/**
 * Dados mockados para demonstração
 */
const mockProjects: ProjectRegistrationData[] = [
  {
    id: 1,
    name: 'DeFi Protocol',
    description: 'Protocolo descentralizado para empréstimos',
    category: 'DeFi',
    github: 'https://github.com/defi/protocol',
    website: 'https://defiprotocol.com',
    tokenContract: '0x1234567890123456789012345678901234567890',
    treasuryAddress: '0x0987654321098765432109876543210987654321',
    teamSize: 5,
    hasAudit: true,
    hasKYC: true,
    auditReport: 'https://defiprotocol.com/audit.pdf',
    kycProvider: 'Chainalysis',
    agreedToTerms: true,
    status: 'pending_approval',
    createdAt: new Date('2024-01-15'),
    estimatedScore: 85
  },
  {
    id: 2,
    name: 'NFT Marketplace',
    description: 'Marketplace para NFTs com baixas taxas',
    category: 'NFT',
    github: 'https://github.com/nft/marketplace',
    website: 'https://nftmarket.com',
    tokenContract: '0x2345678901234567890123456789012345678901',
    treasuryAddress: '0x1987654321098765432109876543210987654321',
    teamSize: 8,
    hasAudit: false,
    hasKYC: true,
    kycProvider: 'Jumio',
    agreedToTerms: true,
    status: 'approved',
    createdAt: new Date('2024-01-10'),
    estimatedScore: 92
  },
  {
    id: 3,
    name: 'Gaming Token',
    description: 'Token para ecossistema de jogos blockchain',
    category: 'Gaming',
    github: 'https://github.com/gaming/token',
    website: 'https://gamingtoken.com',
    tokenContract: '0x3456789012345678901234567890123456789012',
    treasuryAddress: '0x2987654321098765432109876543210987654321',
    teamSize: 12,
    hasAudit: true,
    hasKYC: false,
    auditReport: 'https://gamingtoken.com/audit.pdf',
    agreedToTerms: true,
    status: 'pending_deposit',
    createdAt: new Date('2024-01-05'),
    estimatedScore: 78
  }
];

/**
 * Componente de lista de projetos administrativos
 * 
 * Funcionalidades:
 * - Listagem de projetos com paginação
 * - Filtros por status
 * - Busca por nome/descrição
 * - Ações administrativas (visualizar, editar, excluir)
 * - Gerenciamento de status integrado
 */
export const ProjectList: React.FC<ProjectListProps> = ({
  projects = mockProjects,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onViewProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  // State for future modal implementation
  const selectedProjectState = useState<ProjectRegistrationData | null>(null);
  const setSelectedProject = selectedProjectState[1];

  /**
   * Projetos filtrados
   */
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  /**
   * Contadores por status
   */
  const statusCounts = useMemo(() => {
    return projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<ProjectStatus, number>);
  }, [projects]);

  /**
   * Manipula a visualização de detalhes do projeto
   */
  const handleViewProject = (project: ProjectRegistrationData) => {
    if (onViewProject) {
      onViewProject(project.id.toString());
    } else {
      setSelectedProject(project);
      onView?.(project);
    }
  };

  /**
   * Manipula a edição do projeto
   */
  const handleEditProject = (project: ProjectRegistrationData) => {
    onEdit?.(project);
  };

  /**
   * Manipula a exclusão do projeto
   */
  const handleDeleteProject = (project: ProjectRegistrationData) => {
    if (window.confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`)) {
      onDelete?.(project.id);
    }
  };

  /**
   * Exporta dados dos projetos
   */
  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredProjects, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `projetos_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Projetos Cadastrados</span>
            <Button
              onClick={handleExportData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros por status */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Todos ({projects.length})
            </Button>
            
            <Button
              variant={statusFilter === 'pending_deposit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('pending_deposit')}
            >
              Aguardando Depósito ({statusCounts.pending_deposit || 0})
            </Button>
            
            <Button
              variant={statusFilter === 'pending_approval' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('pending_approval')}
            >
              Aguardando Aprovação ({statusCounts.pending_approval || 0})
            </Button>
            
            <Button
              variant={statusFilter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('approved')}
            >
              Aprovados ({statusCounts.approved || 0})
            </Button>
            
            <Button
              variant={statusFilter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('rejected')}
            >
              Rejeitados ({statusCounts.rejected || 0})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de projetos */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhum projeto encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-lunes-dark">
                        {project.name}
                      </h3>
                      <Badge
                        variant={project.status === 'approved' ? 'success' : 
                                project.status === 'rejected' ? 'destructive' : 'default'}
                      >
                        {project.status === 'pending_deposit' && 'Aguardando Depósito'}
                        {project.status === 'pending_approval' && 'Aguardando Aprovação'}
                        {project.status === 'approved' && 'Aprovado'}
                        {project.status === 'rejected' && 'Rejeitado'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Categoria: {project.category}</span>
                      <span>•</span>
                      <span>Criado em: {project.createdAt.toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>Equipe: {project.teamSize} membro(s)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProject(project)}
                      className="text-lunes-purple hover:text-lunes-purple-dark"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Gerenciador de status integrado */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <ProjectStatusManager
                    project={{
                      id: project.id,
                      name: project.name,
                      status: project.status,
                      createdAt: project.createdAt
                    }}
                    isAdmin
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectList;