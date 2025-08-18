import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, ProjectRating, ProjectScoreDetails } from '@safeguard/shared-ui';
import { Search, Filter, Calendar, Users, TrendingUp, Star, Shield, Award } from 'lucide-react';

/**
 * Página de listagem de projetos da plataforma comunitária
 * Exibe projetos disponíveis com filtros e busca
 */
export function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  // Mock data - será substituído por dados reais da API
  const projects = [
    {
      id: '1',
      title: 'DeFi Lending Protocol',
      description: 'Protocolo de empréstimos descentralizado para a blockchain Lunes',
      status: 'active',
      guarantee: '150,000 LUNES + 75,000 LUSDT',
      guaranteeScore: 87,
      votes: 156,
      deadline: '2024-03-15',
      category: 'DeFi',
      assets: 3,
      vestingTime: '4.2 anos',
    },
    {
      id: '2',
      title: 'NFT Marketplace',
      description: 'Marketplace para criação e comercialização de NFTs',
      status: 'voting',
      guarantee: '80,000 LUNES + 40,000 LUSDT',
      guaranteeScore: 72,
      votes: 89,
      deadline: '2024-02-28',
      category: 'NFT',
      assets: 2,
      vestingTime: '4.8 anos',
    },
    {
      id: '3',
      title: 'Cross-Chain Bridge',
      description: 'Ponte para interoperabilidade entre Lunes e outras blockchains',
      status: 'completed',
      guarantee: '300,000 LUNES + 150,000 LUSDT',
      guaranteeScore: 95,
      votes: 234,
      deadline: '2024-01-20',
      category: 'Infrastructure',
      assets: 4,
      vestingTime: '3.5 anos',
    },
    {
      id: '4',
      title: 'GameFi Platform',
      description: 'Plataforma de jogos com economia tokenizada',
      status: 'active',
      guarantee: '45,000 LUNES',
      guaranteeScore: 58,
      votes: 78,
      deadline: '2024-04-10',
      category: 'Gaming',
      assets: 1,
      vestingTime: '4.9 anos',
    },
    {
      id: '5',
      title: 'Staking Pool',
      description: 'Pool de staking com recompensas automáticas',
      status: 'active',
      guarantee: '25,000 LUNES + 10,000 LUSDT',
      guaranteeScore: 43,
      votes: 45,
      deadline: '2024-05-20',
      category: 'DeFi',
      assets: 2,
      vestingTime: '4.7 anos',
    },
    {
      id: '6',
      title: 'Privacy Coin',
      description: 'Criptomoeda com foco em privacidade e anonimato',
      status: 'under_review',
      guarantee: '12,000 LUNES',
      guaranteeScore: 28,
      votes: 23,
      deadline: '2024-02-15',
      category: 'Privacy',
      assets: 1,
      vestingTime: '4.1 anos',
    },
  ];

  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'active', label: 'Ativos' },
    { id: 'voting', label: 'Em Votação' },
    { id: 'completed', label: 'Concluídos' },
    { id: 'excellent', label: 'Excelente (90+)' },
    { id: 'very-good', label: 'Muito Bom (75-89)' },
    { id: 'good', label: 'Bom (60-74)' },
    { id: 'regular', label: 'Regular (40-59)' },
    { id: 'low', label: 'Baixo (<40)' },
  ];

  const sortOptions = [
    { id: 'score', label: 'Melhor Classificação' },
    { id: 'guarantee', label: 'Maior Garantia' },
    { id: 'recent', label: 'Mais Recentes' },
    { id: 'votes', label: 'Mais Votados' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'voting':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'under_review':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'voting':
        return 'Em Votação';
      case 'completed':
        return 'Concluído';
      case 'under_review':
        return 'Em Revisão';
      default:
        return 'Pendente';
    }
  };

  const filteredAndSortedProjects = projects
    .filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      switch (selectedFilter) {
        case 'all':
          matchesFilter = true;
          break;
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
        case 'low':
          matchesFilter = project.guaranteeScore < 40;
          break;
        default:
          matchesFilter = project.status === selectedFilter;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.guaranteeScore - a.guaranteeScore;
        case 'guarantee':
          return b.votes - a.votes; // Usando votes como proxy para guarantee value
        case 'votes':
          return b.votes - a.votes;
        case 'recent':
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Projetos</h1>
        <p className="text-muted-foreground mb-6">
          Explore projetos inovadores na blockchain Lunes classificados por segurança das garantias.
        </p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Excelente (90+)</p>
                  <p className="text-2xl font-bold text-green-800">
                    {projects.filter(p => p.guaranteeScore >= 90).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Muito Bom (75-89)</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {projects.filter(p => p.guaranteeScore >= 75 && p.guaranteeScore < 90).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Em Votação</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {projects.filter(p => p.status === 'voting').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Total Projetos</p>
                  <p className="text-2xl font-bold text-yellow-800">{projects.length}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-w-[200px]"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Melhores Garantias Section */}
      {selectedFilter === 'all' && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Melhores Garantias</h2>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Score 75+
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects
              .filter(p => p.guaranteeScore >= 75)
              .sort((a, b) => b.guaranteeScore - a.guaranteeScore)
              .slice(0, 6)
              .map((project) => (
                <Card key={`top-${project.id}`} className="hover:shadow-lg transition-shadow border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      <Badge variant="outline">{project.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
              
              <div className="space-y-3">
                <ProjectRating score={project.guaranteeScore} size="md" />
                
                <ProjectScoreDetails 
                  score={project.guaranteeScore}
                  guaranteeValue={project.guarantee}
                  assets={project.assets}
                  vestingTime={project.vestingTime}
                  className="mb-2"
                />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Garantia:</span>
                        <span className="font-medium">{project.totalGuarantee}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Votos:</span>
                        <span className="font-medium">{project.votes}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prazo:</span>
                        <span className="font-medium">{project.deadline}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Link to={`/projects/${project.id}`}>
                        <Button className="w-full" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </div>
          
          {projects.filter(p => p.guaranteeScore >= 75).length > 6 && (
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFilter('very-good')}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Ver Todos os Projetos com Alta Garantia
              </Button>
            </div>
          )}
        </div>
      )}

      {/* All Projects Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedFilter === 'all' ? 'Todos os Projetos' : 'Projetos Filtrados'}
        </h2>
        <p className="text-muted-foreground">
          {filteredAndSortedProjects.length} projeto(s) encontrado(s)
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                <Badge variant="outline">{project.category}</Badge>
              </div>
              <CardTitle className="text-lg">{project.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
              
              {/* Project Rating */}
              <div className="mb-4">
                <ProjectRating 
                  score={project.guaranteeScore} 
                  size="sm" 
                  className="justify-center"
                />
              </div>
              
              <ProjectScoreDetails 
                score={project.guaranteeScore}
                guaranteeValue={project.guarantee}
                assets={project.assets}
                vestingTime={project.vestingTime}
                className="mb-4"
              />
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Garantia:</span>
                  <span className="font-medium">{project.guarantee}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Votos:
                  </span>
                  <span className="font-medium">{project.votes}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Prazo:
                  </span>
                  <span className="font-medium">{project.deadline}</span>
                </div>
              </div>

              <Button asChild className="w-full" variant="lunes">
                <Link to={`/projects/${project.id}`}>
                  Ver Detalhes
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum projeto encontrado com os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  );
}