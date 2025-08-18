import React, { useState, useMemo } from 'react';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { ProjectDetailsModal } from '../components/ProjectDetailsModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { useCreateProject } from '../hooks/useCreateProject';
import { CreateProjectData } from '../types/project';
import { Filter, Search, TrendingUp, Shield, Clock, AlertCircle, ChevronLeft, ChevronRight, Eye, Edit, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

// Componentes UI temporários até a correção do @safeguard/shared-ui
const LoadingPage: React.FC<{ variant?: string }> = ({ variant }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }> = ({ 
  children, className = '', variant = 'default', size = 'default', ...props 
}) => (
  <button 
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === 'outline' ? 'border border-border bg-background hover:bg-accent text-foreground' : 
      variant === 'ghost' ? 'hover:bg-accent text-foreground' :
      'bg-primary text-primary-foreground hover:bg-primary/90'
    } ${className}`} 
    {...props}
  >
    {children}
  </button>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: string; className?: string }> = ({ 
  children, variant = 'default', className = '' 
}) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    variant === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
    variant === 'warning' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
    variant === 'danger' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
    'bg-muted text-muted-foreground border border-border'
  } ${className}`}>
    {children}
  </span>
);

const useLoadingDelay = (delay: number = 1500) => {
  const [isLoading, setIsLoading] = useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return isLoading;
};

// Interface local para os dados do projeto
interface ProjectData {
  name: string;
  description: string;
  contractAddress: string;
  tokenAddress?: string | undefined;
  website?: string | undefined;
  documentation?: string | undefined;
  initialGuarantee: {
    lunesAmount: string;
    lustdAmount: string;
  };
  logo?: File | undefined;
}

// Interface para projeto com status
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Ativo' | 'Em Votação' | 'Pendente' | 'Rejeitado' | 'Pausado';
  guarantee: string;
  timeRemaining: string;
  icon: string;
  createdAt: string; // Data de criação do projeto
}

// Dados mockados dos projetos
const mockProjects: Project[] = [
  {
    id: '#001',
    name: 'DeFi Protocol',
    description: 'Protocolo descentralizado para empréstimos e yield farming com pools de liquidez automatizados',
    status: 'Ativo',
    guarantee: '50,000 LUNES',
    timeRemaining: '15 dias',
    icon: 'lightning',
    createdAt: '2024-01-15'
  },
  {
    id: '#002',
    name: 'NFT Marketplace',
    description: 'Marketplace para criação e comercialização de NFTs',
    status: 'Em Votação',
    guarantee: '75,000 LUNES',
    timeRemaining: '30 dias',
    icon: 'image',
    createdAt: '2024-01-10'
  },
  {
    id: '#003',
    name: 'Cross-Chain Bridge',
    description: 'Ponte para transferências entre diferentes blockchains',
    status: 'Pendente',
    guarantee: '120,000 LUNES',
    timeRemaining: '45 dias',
    icon: 'bridge',
    createdAt: '2024-01-05'
  },
  {
    id: '#004',
    name: 'Gaming Platform',
    description: 'Plataforma de jogos blockchain com economia de tokens',
    status: 'Ativo',
    guarantee: '90,000 LUNES',
    timeRemaining: '8 dias',
    icon: 'gamepad',
    createdAt: '2024-01-20'
  },
  {
    id: '#005',
    name: 'Staking Platform',
    description: 'Plataforma de staking com recompensas automáticas e pools flexíveis',
    status: 'Em Votação',
    guarantee: '85,000 LUNES',
    timeRemaining: '22 dias',
    icon: 'chart',
    createdAt: '2024-01-12'
  },
  {
    id: '#006',
    name: 'DAO Governance',
    description: 'Sistema de governança descentralizada com votação ponderada por tokens',
    status: 'Rejeitado',
    guarantee: '60,000 LUNES',
    timeRemaining: '0 dias',
    icon: 'users',
    createdAt: '2024-01-08'
  }
];

const Projects: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 projetos por página
  const [sortBy, setSortBy] = useState<'name' | 'guarantee' | 'timeRemaining' | 'status' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { createProject, isLoading, error } = useCreateProject();

  const handleCreateProject = async (data: ProjectData) => {
    try {
      const projectData: CreateProjectData = {
        name: data.name,
        description: data.description,
        contractAddress: data.contractAddress,
        tokenAddress: data.tokenAddress || '',
        website: data.website,
        documentation: data.documentation,
        initialGuarantee: parseFloat(data.initialGuarantee.lunesAmount) || 0
      };

      await createProject(projectData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    }
  };

  // Calcular estatísticas dos projetos
  const projectStats = useMemo(() => {
    const totalProjects = mockProjects.length;
    const activeProjects = mockProjects.filter(p => p.status === 'Ativo').length;
    const votingProjects = mockProjects.filter(p => p.status === 'Em Votação').length;
    const pendingProjects = mockProjects.filter(p => p.status === 'Pendente').length;
    
    // Calcular valor total garantido (remover formatação e somar)
    const totalGuarantee = mockProjects.reduce((sum, project) => {
      const value = parseFloat(project.guarantee.replace(/[^0-9,]/g, '').replace(',', '.'));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    return {
      totalProjects,
      activeProjects,
      votingProjects,
      pendingProjects,
      totalGuarantee: totalGuarantee.toLocaleString('pt-BR')
    };
  }, []);
  
  // Função para alternar ordenação
  const handleSort = (field: 'name' | 'guarantee' | 'timeRemaining' | 'status' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Simula carregamento inicial da página (substituir por React Query)
  const isPageLoading = useLoadingDelay(1500);

  // Opções de filtro por status
  const statusOptions = ['Todos', 'Ativo', 'Em Votação', 'Pendente', 'Rejeitado', 'Pausado'];

  // Filtrar e ordenar projetos
  const filteredProjects = useMemo(() => {
    let filtered = mockProjects.filter(project => {
      const matchesStatus = selectedStatus === 'Todos' || project.status === selectedStatus;
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'guarantee':
          aValue = parseFloat(a.guarantee.replace(/[^0-9,]/g, '').replace(',', '.'));
          bValue = parseFloat(b.guarantee.replace(/[^0-9,]/g, '').replace(',', '.'));
          break;
        case 'timeRemaining':
          aValue = parseInt(a.timeRemaining.replace(/[^0-9]/g, '')) || 0;
          bValue = parseInt(b.timeRemaining.replace(/[^0-9]/g, '')) || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [selectedStatus, searchTerm, sortBy, sortOrder]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchTerm]);

  // Funções de navegação da paginação
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Funções para ações dos cards
  const handleViewDetails = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setIsDetailsModalOpen(true);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProject(null);
  };

  const handleEditProject = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProject(null);
  };

  // Função para submeter a edição do projeto
  const handleEditSubmit = async (data: any) => {
    if (!selectedProject) return;
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar o projeto na lista (usando estado local para demonstração)
      console.log('Projeto editado com sucesso:', {
        id: selectedProject.id,
        ...data
      });
      
      // Em uma implementação real, você atualizaria o estado ou refaria a query
      // setProjects(prevProjects => 
      //   prevProjects.map(project => 
      //     project.id === selectedProject.id 
      //       ? { ...project, ...data }
      //       : project
      //   )
      // );
      
    } catch (error) {
      console.error('Erro ao editar projeto:', error);
      throw error;
    }
  };



  // Função para obter a cor do badge baseado no status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Em Votação':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Pendente':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Rejeitado':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Pausado':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // Função para obter o ícone baseado no tipo
  const getProjectIcon = (iconType: string) => {
    switch (iconType) {
      case 'lightning':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />;
      case 'image':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />;
      case 'bridge':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />;
      case 'gamepad':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />;
      case 'chart':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
      case 'users':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />;
      default:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />;
    }
  };

  // Função handleCreateProject implementada acima

  // Exibe skeleton durante carregamento inicial
  if (isPageLoading) {
    return <LoadingPage variant="cards" />;
  }

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Projetos
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie e monitore todos os projetos de garantia
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total de Projetos */}
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total de Projetos</p>
              <p className="text-2xl font-bold text-foreground">{projectStats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Projetos Ativos */}
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Projetos Ativos</p>
              <p className="text-2xl font-bold text-green-400">{projectStats.activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Em Votação */}
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Em Votação</p>
              <p className="text-2xl font-bold text-yellow-400">{projectStats.votingProjects}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Valor Total Garantido */}
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Valor Total Garantido</p>
              <p className="text-xl font-bold text-foreground">{projectStats.totalGuarantee} LUNES</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="mb-6 space-y-4 sm:space-y-6">
        {/* Barra de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Buscar projetos por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-card border border-border rounded-lg text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filtros por status */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Filtrar por status:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Ordenação */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
            <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Ordenar por:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => handleSort('name')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                sortBy === 'name'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Nome
              {sortBy === 'name' && (
                sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>
            <button
              onClick={() => handleSort('guarantee')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                sortBy === 'guarantee'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Garantia
              {sortBy === 'guarantee' && (
                sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>
            <button
              onClick={() => handleSort('timeRemaining')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                sortBy === 'timeRemaining'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="hidden sm:inline">Tempo Restante</span>
              <span className="sm:hidden">Tempo</span>
              {sortBy === 'timeRemaining' && (
                sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>
            <button
              onClick={() => handleSort('status')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                sortBy === 'status'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Status
              {sortBy === 'status' && (
                sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>
            <button
              onClick={() => handleSort('createdAt')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                sortBy === 'createdAt'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="hidden sm:inline">Data de Criação</span>
              <span className="sm:hidden">Data</span>
              {sortBy === 'createdAt' && (
                sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-muted-foreground">
          {filteredProjects.length === 0
            ? 'Nenhum projeto encontrado'
            : totalPages > 1
            ? `Mostrando ${startIndex + 1}-${Math.min(endIndex, filteredProjects.length)} de ${filteredProjects.length} projetos`
            : `Mostrando ${filteredProjects.length} projeto${filteredProjects.length !== 1 ? 's' : ''}`
          }
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum projeto encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? `Não foram encontrados projetos que correspondam à busca "${searchTerm}"`
              : selectedStatus !== 'Todos'
              ? `Não há projetos com status "${selectedStatus}"`
              : 'Nenhum projeto disponível no momento'
            }
          </p>
          <Button 
            onClick={() => {
              setSelectedStatus('Todos');
              setSearchTerm('');
            }}
            className="btn-secondary"
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {currentProjects.map((project) => (
              <div key={project.id} className="card-modern p-4 md:p-6 group hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-[5px] flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {getProjectIcon(project.icon)}
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {project.id}</p>
                    </div>
                  </div>
                  <Badge className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(project.status)}`}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                     </svg>
                     {project.guarantee}
                   </div>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     {project.timeRemaining}
                   </div>
                 </div>
                 
                 {/* Ações do Card */}
                 <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                   <div className="flex items-center gap-2">
                     <Button
                       onClick={() => handleViewDetails(project.id)}
                       className="btn-secondary flex items-center gap-2 text-xs px-3 py-1.5 h-auto"
                     >
                       <Eye className="h-3 w-3" />
                       Ver detalhes
                     </Button>
                   </div>
                   <div className="flex items-center gap-1">
                     <Button
                       onClick={() => handleEditProject(project.id)}
                       className="btn-secondary p-1.5 h-auto w-auto"
                       title="Editar projeto"
                     >
                       <Edit className="h-3 w-3" />
                     </Button>
                   </div>
                 </div>
              </div>
            ))}
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                {/* Números das páginas */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Mostrar sempre a primeira, última e páginas próximas à atual
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => {
                      // Adicionar "..." se há lacuna
                      const prevPage = array[index - 1];
                      const showEllipsis = index > 0 && prevPage && page - prevPage > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            onClick={() => goToPage(page)}
                            className={`w-8 h-8 p-0 ${
                              currentPage === page ? 'btn-primary' : 'btn-secondary'
                            }`}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      );
                    })
                  }
                </div>
                
                <Button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="btn-secondary flex items-center gap-2"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
      
      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        project={selectedProject}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        project={selectedProject}
      />
    </div>
  );
};

export { Projects };
export default Projects;