import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@safeguard/shared-ui';
import { Vote as VoteIcon, Calendar, Users, Clock, TrendingUp, Filter } from 'lucide-react';

/**
 * Página de votação da comunidade
 * Exibe votações ativas e históricas
 */
export function Vote() {
  const [selectedFilter, setSelectedFilter] = useState('active');

  // Mock data - será substituído por dados reais da API
  const votes = [
    {
      id: '1',
      title: 'Aprovação do Protocolo DeFi Lending',
      description: 'Votação para aprovar o desenvolvimento do protocolo de empréstimos descentralizado',
      status: 'active',
      endDate: '2024-03-15',
      totalVotes: 1247,
      results: {
        favor: 892,
        against: 355
      },
      quorum: 1000,
      projectId: '1'
    },
    {
      id: '2',
      title: 'Alocação de Fundos para NFT Marketplace',
      description: 'Definir orçamento para desenvolvimento do marketplace de NFTs',
      status: 'active',
      endDate: '2024-02-28',
      totalVotes: 856,
      results: {
        favor: 623,
        against: 233
      },
      quorum: 800,
      projectId: '2'
    },
    {
      id: '3',
      title: 'Implementação da Cross-Chain Bridge',
      description: 'Aprovação para desenvolvimento da ponte entre blockchains',
      status: 'completed',
      endDate: '2024-01-20',
      totalVotes: 1456,
      results: {
        favor: 1123,
        against: 333
      },
      quorum: 1200,
      projectId: '3'
    },
    {
      id: '4',
      title: 'Atualização do Protocolo de Governança',
      description: 'Proposta de melhorias no sistema de votação da plataforma',
      status: 'pending',
      endDate: '2024-04-01',
      totalVotes: 0,
      results: {
        favor: 0,
        against: 0
      },
      quorum: 1500,
      projectId: null
    }
  ];

  const filters = [
    { id: 'active', label: 'Ativas' },
    { id: 'pending', label: 'Pendentes' },
    { id: 'completed', label: 'Concluídas' },
    { id: 'all', label: 'Todas' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluída';
      default:
        return status;
    }
  };

  const calculatePercentage = (votes: number, total: number) => {
    return total > 0 ? (votes / total) * 100 : 0;
  };

  const filteredVotes = votes.filter(vote => {
    if (selectedFilter === 'all') return true;
    return vote.status === selectedFilter;
  });

  const activeVotes = votes.filter(vote => vote.status === 'active').length;
  const totalParticipants = votes.reduce((acc, vote) => acc + vote.totalVotes, 0);
  const avgParticipation = votes.length > 0 ? Math.round(totalParticipants / votes.length) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Votações da Comunidade</h1>
        <p className="text-muted-foreground">
          Participe das decisões importantes da plataforma SafeGuard.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Votações Ativas</p>
                <p className="text-2xl font-bold">{activeVotes}</p>
              </div>
              <VoteIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Votos</p>
                <p className="text-2xl font-bold">{totalParticipants.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participação Média</p>
                <p className="text-2xl font-bold">{avgParticipation}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={selectedFilter === filter.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Votes List */}
      <div className="space-y-6">
        {filteredVotes.map((vote) => {
          const favorPercentage = calculatePercentage(vote.results.favor, vote.totalVotes);
          const againstPercentage = calculatePercentage(vote.results.against, vote.totalVotes);
          const quorumReached = vote.totalVotes >= vote.quorum;

          return (
            <Card key={vote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(vote.status)}>
                        {getStatusLabel(vote.status)}
                      </Badge>
                      {quorumReached && (
                        <Badge variant="success">Quórum Atingido</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{vote.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{vote.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Termina em {vote.endDate}
                    </div>
                    {vote.projectId && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${vote.projectId}`}>
                          Ver Projeto
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Voting Results */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                          A Favor
                        </span>
                        <span>{vote.results.favor} votos ({favorPercentage.toFixed(1)}%)</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${favorPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                          Contra
                        </span>
                        <span>{vote.results.against} votos ({againstPercentage.toFixed(1)}%)</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${againstPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vote Stats */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {vote.totalVotes} votos totais
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Quórum: {vote.quorum}
                    </div>
                    {vote.status === 'active' && (
                      <div className="flex items-center text-green-600">
                        <VoteIcon className="h-4 w-4 mr-1" />
                        Votação em andamento
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {vote.status === 'active' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        <VoteIcon className="h-4 w-4 mr-2" />
                        Votar a Favor
                      </Button>
                      <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                        <VoteIcon className="h-4 w-4 mr-2" />
                        Votar Contra
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVotes.length === 0 && (
        <div className="text-center py-12">
          <VoteIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhuma votação encontrada com o filtro selecionado.
          </p>
        </div>
      )}
    </div>
  );
}