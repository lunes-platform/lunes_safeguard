import React from 'react';
import { Card, Button, Badge } from '@safeguard/shared-ui';
import { Vote, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * Página de Gestão de Votações
 * 
 * Funcionalidades:
 * - Visualização de votações ativas
 * - Histórico de votações
 * - Métricas de participação
 * - Gestão de resultados
 */
export function Voting() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Votações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as votações da comunidade SafeGuard
        </p>
      </div>

      {/* Métricas de Votação */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Votações Ativas
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                7
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Vote className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Participação Média
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                68%
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Aprovadas
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                15
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Rejeitadas
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                3
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-full">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Votações Ativas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Votações Ativas
        </h2>
        <div className="space-y-4">
          {/* Votação 1 */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-foreground">GameFi Platform</h3>
                <p className="text-sm text-muted-foreground">ID: #003</p>
              </div>
              <Badge variant="default">Ativa</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Votação para aprovação do projeto de plataforma de jogos blockchain
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">142</p>
                <p className="text-sm text-muted-foreground">Votos Favoráveis</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">38</p>
                <p className="text-sm text-muted-foreground">Votos Contrários</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">78.9%</p>
                <p className="text-sm text-muted-foreground">Aprovação</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Termina em 2 dias</span>
              </div>
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </div>
          </div>

          {/* Votação 2 */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-foreground">Web3 Analytics</h3>
                <p className="text-sm text-muted-foreground">ID: #004</p>
              </div>
              <Badge variant="secondary">Ativa</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Proposta para ferramenta de análise de dados Web3
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">89</p>
                <p className="text-sm text-muted-foreground">Votos Favoráveis</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">67</p>
                <p className="text-sm text-muted-foreground">Votos Contrários</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">57.1%</p>
                <p className="text-sm text-muted-foreground">Aprovação</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Termina em 5 dias</span>
              </div>
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Histórico de Votações */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Histórico Recente
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <span className="text-sm font-medium text-foreground">
                  Web3 Social Network
                </span>
                <p className="text-xs text-muted-foreground">
                  Aprovado com 85% dos votos
                </p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Há 2 horas</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <span className="text-sm font-medium text-foreground">
                  Crypto Exchange
                </span>
                <p className="text-xs text-muted-foreground">
                  Rejeitado com 32% dos votos
                </p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Há 1 dia</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <span className="text-sm font-medium text-foreground">
                  DeFi Lending Protocol
                </span>
                <p className="text-xs text-muted-foreground">
                  Aprovado com 92% dos votos
                </p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Há 3 dias</span>
          </div>
        </div>
      </Card>
    </div>
  );
}