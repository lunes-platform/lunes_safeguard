import React from 'react';
import { X, ExternalLink, Calendar, Shield, Clock, Users, TrendingUp, AlertCircle, Code, Vote } from 'lucide-react';
import { Button, Badge } from '@safeguard/shared-ui';

// Interface para os dados do projeto
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Ativo' | 'Em Votação' | 'Pendente' | 'Rejeitado' | 'Pausado';
  guarantee: string;
  timeRemaining: string;
  icon: string;
}

// Interface para dados detalhados do projeto (expandida)
interface ProjectDetails extends Project {
  contractAddress: string;
  tokenAddress?: string;
  website?: string;
  documentation?: string;
  createdAt: string;
  totalVotes: number;
  votesInFavor: number;
  votesAgainst: number;
  minimumGuarantee: string;
  currentGuarantee: string;
  participants: number;
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  category: string;
  tags: string[];
}

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

/**
 * Modal para exibir detalhes completos de um projeto
 * Inclui informações técnicas, de votação e métricas de risco
 */
export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  if (!isOpen || !project) return null;

  // Simular dados detalhados do projeto (em produção, viria de uma API)
  const projectDetails: ProjectDetails = {
    ...project,
    contractAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
    tokenAddress: '0x123d35Cc6634C0532925a3b8D4C9db96C4b4d123',
    website: 'https://defiprotocol.com',
    documentation: 'https://docs.defiprotocol.com',
    createdAt: '15 de Janeiro, 2024',
    totalVotes: 1250,
    votesInFavor: 892,
    votesAgainst: 358,
    minimumGuarantee: '25,000 LUNES',
    currentGuarantee: project.guarantee,
    participants: 156,
    riskLevel: project.status === 'Ativo' ? 'Baixo' : project.status === 'Em Votação' ? 'Médio' : 'Alto',
    category: 'DeFi',
    tags: ['DeFi', 'Yield Farming', 'Liquidity Pool', 'Smart Contract']
  };

  // Função para obter cor do badge de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Em Votação': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rejeitado': return 'bg-red-100 text-red-800 border-red-200';
      case 'Pausado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para obter cor do nível de risco
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Alto': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calcular porcentagem de votos favoráveis
  const favorablePercentage = Math.round((projectDetails.votesInFavor / projectDetails.totalVotes) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground truncate">{projectDetails.name}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{projectDetails.id}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Status e Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge className={getStatusColor(projectDetails.status)}>
              {projectDetails.status}
            </Badge>
            <Badge className={getRiskColor(projectDetails.riskLevel)}>
              Risco {projectDetails.riskLevel}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              {projectDetails.category}
            </Badge>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Descrição</h3>
            <p className="text-muted-foreground leading-relaxed">{projectDetails.description}</p>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {projectDetails.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="card-modern p-4 sm:p-6 space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Estatísticas</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="card-modern text-center p-3 sm:p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-green-500 break-words">{projectDetails.currentGuarantee}</div>
                <div className="text-xs text-muted-foreground">Garantia Atual</div>
              </div>
              
              <div className="card-modern text-center p-3 sm:p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-blue-500">{projectDetails.timeRemaining}</div>
                <div className="text-xs text-muted-foreground">Tempo Restante</div>
              </div>
              
              <div className="card-modern text-center p-3 sm:p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-primary">{projectDetails.participants}</div>
                <div className="text-xs text-muted-foreground">Participantes</div>
              </div>
              
              <div className="card-modern text-center p-3 sm:p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    projectDetails.riskLevel === 'Baixo' ? 'text-green-500' :
                    projectDetails.riskLevel === 'Médio' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
                <div className={`text-lg sm:text-2xl font-bold ${
                  projectDetails.riskLevel === 'Baixo' ? 'text-green-500' :
                  projectDetails.riskLevel === 'Médio' ? 'text-yellow-500' : 'text-red-500'
                }`}>{projectDetails.riskLevel}</div>
                <div className="text-xs text-muted-foreground">Nível de Risco</div>
              </div>
            </div>
          </div>

          {/* Seção de Votação */}
          {projectDetails.status === 'Em Votação' && (
            <div className="card-modern p-4 sm:p-6 space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Sistema de Votação
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="card-modern p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-500">{projectDetails.votesInFavor}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Votos Favoráveis</div>
                  </div>
                  
                  <div className="card-modern p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-red-500">{projectDetails.votesAgainst}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Votos Contrários</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary/80 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${favorablePercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-base sm:text-lg font-semibold text-foreground">
                      {favorablePercentage}%
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground ml-1">de aprovação</span>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Total: {projectDetails.totalVotes} votos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informações Técnicas */}
          <div className="card-modern p-4 sm:p-6 space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Informações Técnicas</h3>
            <div className="space-y-4">
              <div className="card-modern p-3 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <span className="text-muted-foreground font-medium text-sm sm:text-base">Endereço do Contrato</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs sm:text-sm bg-muted px-2 sm:px-3 py-1 rounded-md font-mono text-foreground border break-all">
                      {projectDetails.contractAddress}
                    </code>
                    <button className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0">
                      <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                </div>
                
                {projectDetails.tokenAddress && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <span className="text-muted-foreground font-medium text-sm sm:text-base">Endereço do Token</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs sm:text-sm bg-muted px-2 sm:px-3 py-1 rounded-md font-mono text-foreground border break-all">
                        {projectDetails.tokenAddress}
                      </code>
                      <button className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0">
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t border-border">
                  <span className="text-muted-foreground font-medium text-sm sm:text-base">Data de Criação</span>
                  <span className="font-semibold text-foreground text-sm sm:text-base">{projectDetails.createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Links Externos */}
          <div className="card-modern p-4 sm:p-6 space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Links</h3>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <ExternalLink className="w-4 h-4" />
                Website
              </Button>
              
              <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <ExternalLink className="w-4 h-4" />
                Documentação
              </Button>
            </div>
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Fechar
          </Button>
          <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto order-1 sm:order-2">
            Editar Projeto
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;