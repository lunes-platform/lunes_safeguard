import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Badge,
  ProjectRating,
  ProjectScoreDetails,
  Input
} from '@safeguard/shared-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@safeguard/shared-ui';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Shield,
  Search,
  Filter,
  ArrowUpDown,
  Crown,
  Star
} from 'lucide-react';

/**
 * Página de ranking de projetos da plataforma comunitária
 * Exibe ranking detalhado dos projetos baseado em scores e garantias
 */
export function Ranking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [filterBy, setFilterBy] = useState('all');

  // Mock data - será substituído por dados reais da API
  const projects = [
    {
      id: '3',
      title: 'Cross-Chain Bridge',
      description: 'Ponte para interoperabilidade entre Lunes e outras blockchains',
      status: 'completed',
      guarantee: '300,000 LUNES + 150,000 LUSDT',
      guaranteeScore: 95,
      votes: 234,
      category: 'Infrastructure',
      assets: 4,
      vestingTime: '3.5 anos',
      rank: 1,
      totalValue: 450000,
      riskLevel: 'Muito Baixo',
      completionRate: 98
    },
    {
      id: '1',
      title: 'DeFi Lending Protocol',
      description: 'Protocolo de empréstimos descentralizado para a blockchain Lunes',
      status: 'active',
      guarantee: '150,000 LUNES + 75,000 LUSDT',
      guaranteeScore: 87,
      votes: 156,
      category: 'DeFi',
      assets: 3,
      vestingTime: '4.2 anos',
      rank: 2,
      totalValue: 225000,
      riskLevel: 'Baixo',
      completionRate: 75
    },
    {
      id: '4',
      title: 'Gaming Platform',
      description: 'Plataforma de jogos blockchain com NFTs e tokens',
      status: 'active',
      guarantee: '120,000 LUNES + 60,000 LUSDT',
      guaranteeScore: 78,
      votes: 98,
      category: 'Gaming',
      assets: 2,
      vestingTime: '4.5 anos',
      rank: 3,
      totalValue: 180000,
      riskLevel: 'Médio',
      completionRate: 60
    },
    {
      id: '2',
      title: 'NFT Marketplace',
      description: 'Marketplace para criação e comercialização de NFTs',
      status: 'voting',
      guarantee: '80,000 LUNES + 40,000 LUSDT',
      guaranteeScore: 72,
      votes: 89,
      category: 'NFT',
      assets: 2,
      vestingTime: '4.8 anos',
      rank: 4,
      totalValue: 120000,
      riskLevel: 'Médio',
      completionRate: 45
    },
    {
      id: '5',
      title: 'Social Trading Platform',
      description: 'Plataforma de trading social com copy trading',
      status: 'active',
      guarantee: '60,000 LUNES + 30,000 LUSDT',
      guaranteeScore: 65,
      votes: 67,
      category: 'Trading',
      assets: 2,
      vestingTime: '5.0 anos',
      rank: 5,
      totalValue: 90000,
      riskLevel: 'Alto',
      completionRate: 30
    }
  ];

  const sortOptions = [
    { value: 'score', label: 'Melhor Score' },
    { value: 'guarantee', label: 'Maior Garantia' },
    { value: 'votes', label: 'Mais Votados' },
    { value: 'completion', label: 'Maior Progresso' }
  ];

  const filterOptions = [
    { value: 'all', label: 'Todos os Projetos' },
    { value: 'excellent', label: 'Excelente (90+)' },
    { value: 'very-good', label: 'Muito Bom (75-89)' },
    { value: 'good', label: 'Bom (60-74)' },
    { value: 'regular', label: 'Regular (40-59)' }
  ];

  // Função para filtrar projetos
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'excellent':
          matchesFilter = project.guaranteeScore >= 90;
          break;
        case 'very-good':
          matchesFilter = project.guaranteeScore >= 75 && project.guaranteeScore < 90;
          break;
        case 'good':
          matchesFilter = project.guaranteeScore >= 60 && project.guaranteeScore < 75;
          break;
        case 'regular':
          matchesFilter = project.guaranteeScore >= 40 && project.guaranteeScore < 60;
          break;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  // Função para ordenar projetos
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.guaranteeScore - a.guaranteeScore;
      case 'guarantee':
        return b.totalValue - a.totalValue;
      case 'votes':
        return b.votes - a.votes;
      case 'completion':
        return b.completionRate - a.completionRate;
      default:
        return a.rank - b.rank;
    }
  });

  // Função para obter ícone do ranking
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Função para obter cor do ranking
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Ranking de Projetos
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Descubra os projetos mais bem avaliados da plataforma SafeGuard, 
          classificados por score de garantia, valor total e confiabilidade.
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
          <Star className="h-6 w-6 text-yellow-500" />
          Top 3 Projetos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((project, index) => {
            const position = index + 1;
            return (
              <Card key={project.id} className={`relative overflow-hidden border-2 ${
                position === 1 ? 'border-yellow-400 shadow-yellow-100' :
                position === 2 ? 'border-gray-400 shadow-gray-100' :
                'border-amber-400 shadow-amber-100'
              } shadow-lg`}>
                {/* Rank Badge */}
                <div className={`absolute top-0 right-0 w-16 h-16 ${getRankColor(position)} 
                  flex items-center justify-center rounded-bl-2xl`}>
                  <span className="text-white font-bold text-lg">#{position}</span>
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    {getRankIcon(position)}
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        <Link 
                          to={`/projects/${project.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {project.title}
                        </Link>
                      </CardTitle>
                      <ProjectRating score={project.guaranteeScore} size="sm" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                  
                  <ProjectScoreDetails
                    score={project.guaranteeScore}
                    guarantee={project.guarantee}
                    assets={project.assets}
                    vestingTime={project.vestingTime}
                  />
                  
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{project.category}</Badge>
                    <span className="text-muted-foreground">
                      {project.votes} votos
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">
            Ranking Completo ({sortedProjects.length} projetos)
          </h2>
        </div>
        
        {sortedProjects.map((project, index) => {
          const currentRank = index + 1;
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Rank Number */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full ${getRankColor(currentRank)} 
                      flex items-center justify-center text-white font-bold text-lg`}>
                      #{currentRank}
                    </div>
                  </div>
                  
                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Left Column */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">
                              <Link 
                                to={`/projects/${project.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {project.title}
                              </Link>
                            </h3>
                            <ProjectRating score={project.guaranteeScore} size="sm" />
                          </div>
                          <Badge 
                            variant={project.status === 'completed' ? 'success' : 
                                   project.status === 'active' ? 'default' : 'warning'}
                          >
                            {project.status === 'completed' ? 'Concluído' :
                             project.status === 'active' ? 'Ativo' : 'Em Votação'}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{project.category}</Badge>
                          <Badge variant="outline">Risco: {project.riskLevel}</Badge>
                          <Badge variant="outline">{project.votes} votos</Badge>
                        </div>
                      </div>
                      
                      {/* Right Column - Metrics */}
                      <div className="lg:w-80">
                        <ProjectScoreDetails
                          score={project.guaranteeScore}
                          guarantee={project.guarantee}
                          assets={project.assets}
                          vestingTime={project.vestingTime}
                        />
                        
                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">{project.completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.completionRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Empty State */}
      {sortedProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou termo de busca para encontrar projetos.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterBy('all');
              }}
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}