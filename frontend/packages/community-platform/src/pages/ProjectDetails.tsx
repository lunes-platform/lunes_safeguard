import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@safeguard/shared-ui';
import { ArrowLeft, Calendar, Users, Shield, ExternalLink, Github, Globe, Vote } from 'lucide-react';

/**
 * Página de detalhes de um projeto específico
 * Exibe informações completas, progresso e opções de votação
 */
export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [hasVoted, setHasVoted] = useState(false);

  // Mock data - será substituído por dados reais da API baseado no ID
  const project = {
    id: id || '1',
    title: 'DeFi Lending Protocol',
    description: 'Protocolo de empréstimos descentralizado para a blockchain Lunes que permitirá aos usuários emprestar e tomar emprestado tokens de forma segura e eficiente.',
    longDescription: `
      Este projeto visa criar um protocolo de empréstimos descentralizado robusto e seguro para o ecossistema Lunes. 
      O protocolo permitirá que os usuários depositem seus tokens como garantia e tomem empréstimos, 
      ou forneçam liquidez para ganhar juros sobre seus ativos.
      
      Principais características:
      • Sistema de garantias inteligente
      • Taxas de juros dinâmicas baseadas na oferta e demanda
      • Liquidação automática para proteger os credores
      • Interface intuitiva e fácil de usar
      • Auditoria de segurança completa
    `,
    status: 'active',
    guarantee: '50,000 LUNES',
    votes: {
      favor: 156,
      against: 23,
      total: 179
    },
    deadline: '2024-03-15',
    category: 'DeFi',
    team: {
      name: 'Lunes DeFi Team',
      members: 8,
      experience: '3+ anos em DeFi'
    },
    milestones: [
      { id: 1, title: 'Desenvolvimento do Smart Contract', completed: true, date: '2024-01-15' },
      { id: 2, title: 'Auditoria de Segurança', completed: true, date: '2024-02-01' },
      { id: 3, title: 'Interface de Usuário', completed: false, date: '2024-02-28' },
      { id: 4, title: 'Testes em Testnet', completed: false, date: '2024-03-10' },
      { id: 5, title: 'Deploy na Mainnet', completed: false, date: '2024-03-15' }
    ],
    links: {
      github: 'https://github.com/lunes-platform/defi-protocol',
      website: 'https://defi.lunes.io',
      documentation: 'https://docs.lunes.io/defi'
    }
  };

  const votePercentage = {
    favor: (project.votes.favor / project.votes.total) * 100,
    against: (project.votes.against / project.votes.total) * 100
  };

  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const progressPercentage = (completedMilestones / project.milestones.length) * 100;

  const handleVote = (voteType: 'favor' | 'against') => {
    // Implementar lógica de votação
    console.log(`Votando ${voteType} no projeto ${project.id}`);
    setHasVoted(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'voting':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/projects" className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos Projetos
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(project.status)}>Ativo</Badge>
                    <Badge variant="outline">{project.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{project.title}</CardTitle>
                  <p className="text-muted-foreground mt-2">{project.description}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {project.longDescription.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 text-muted-foreground">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Marcos do Projeto</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedMilestones}/{project.milestones.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium ${
                        milestone.completed ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {milestone.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{milestone.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={project.links.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={project.links.documentation} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentação
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Garantia:
                </span>
                <span className="font-medium">{project.guarantee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Prazo:
                </span>
                <span className="font-medium">{project.deadline}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Equipe:
                </span>
                <span className="font-medium">{project.team.members} membros</span>
              </div>
            </CardContent>
          </Card>

          {/* Voting */}
          <Card>
            <CardHeader>
              <CardTitle>Votação da Comunidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>A Favor</span>
                    <span>{project.votes.favor} votos</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${votePercentage.favor}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Contra</span>
                    <span>{project.votes.against} votos</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${votePercentage.against}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Total: {project.votes.total} votos
              </div>

              {!hasVoted ? (
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleVote('favor')} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    Votar a Favor
                  </Button>
                  <Button 
                    onClick={() => handleVote('against')} 
                    variant="outline" 
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    Votar Contra
                  </Button>
                </div>
              ) : (
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    ✓ Seu voto foi registrado!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}