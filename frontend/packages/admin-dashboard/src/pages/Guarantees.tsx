import React, { useState } from 'react';
import { Card, Button, Badge } from '@safeguard/shared-ui';
import { Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { AddBalanceModal } from '../components/AddBalanceModal';

/**
 * Página de Gestão de Garantias
 * 
 * Funcionalidades:
 * - Visualização de garantias ativas
 * - Histórico de liberações
 * - Métricas de garantias
 * - Gestão de bloqueios/desbloqueios
 * - Adição de saldo ao cofre de garantias
 */
export function Guarantees() {
  // Estado para controlar o modal de adicionar saldo
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    name: string;
    currentBalance: { lunes: number; lustd: number };
  } | null>(null);

  // Dados mockados dos projetos (em produção, viriam de uma API)
  const projects = [
    {
      id: '001',
      name: 'DeFi Exchange',
      currentBalance: { lunes: 50000, lustd: 25000 },
      status: 'Ativo',
      lockedDays: 10,
    },
    {
      id: '002',
      name: 'NFT Marketplace',
      currentBalance: { lunes: 75000, lustd: 40000 },
      status: 'Em Análise',
      lockedDays: 5,
    },
    {
      id: '003',
      name: 'GameFi Platform',
      currentBalance: { lunes: 100000, lustd: 60000 },
      status: 'Ativo',
      lockedDays: 2,
    },
  ];

  // Função para abrir o modal de adicionar saldo
  const handleManageProject = (project: typeof projects[0]) => {
    setSelectedProject({
      id: project.id,
      name: project.name,
      currentBalance: project.currentBalance,
    });
    setIsAddBalanceModalOpen(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setIsAddBalanceModalOpen(false);
    setSelectedProject(null);
  };

  // Função para processar o depósito (em produção, faria chamada para API)
  const handleAddBalance = (data: { tokenType: 'LUNES' | 'LUSTD'; amount: string }) => {
    console.log('Adicionando saldo:', data);
    // Aqui seria feita a integração com a blockchain/API
    // Por enquanto, apenas simula o sucesso
    handleCloseModal();
  };
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Garantias</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as garantias dos projetos SafeGuard
        </p>
      </div>

      {/* Métricas de Garantias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Bloqueado
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                1.2M LUNES
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Liberado Este Mês
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                350K LUNES
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Garantias Ativas
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                24
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Garantias */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Garantias Ativas
        </h2>
        <div className="space-y-4">
          {/* Lista de Garantias */}
          {projects.map((project, index) => {
            const isActive = project.status === 'Ativo';
            const IconComponent = isActive ? Shield : AlertCircle;
            const iconColor = isActive ? 'text-primary' : 'text-yellow-500';
            const iconBg = isActive ? 'bg-primary/10' : 'bg-yellow-500/10';
            const badgeVariant = isActive ? 'default' : 'secondary';
            
            return (
              <div key={project.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 ${iconBg} rounded-full`}>
                    <IconComponent className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: #{project.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {project.currentBalance.lunes.toLocaleString('pt-BR')} LUNES
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bloqueado há {project.lockedDays} dias
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={badgeVariant as 'default' | 'secondary'}>
                    {project.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleManageProject(project)}
                  >
                    Gerenciar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Histórico Recente */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Histórico Recente
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-foreground">
                Garantia liberada - Web3 Social Network
              </span>
            </div>
            <span className="text-sm text-muted-foreground">Há 2 horas</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-foreground">
                Nova garantia bloqueada - GameFi Platform
              </span>
            </div>
            <span className="text-sm text-muted-foreground">Há 2 dias</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-foreground">
                Garantia em análise - NFT Marketplace
              </span>
            </div>
            <span className="text-sm text-muted-foreground">Há 5 dias</span>
          </div>
        </div>
      </Card>

      {/* Modal de Adicionar Saldo */}
       {selectedProject && (
         <AddBalanceModal
           isOpen={isAddBalanceModalOpen}
           onClose={handleCloseModal}
           onSubmit={handleAddBalance}
           projectName={selectedProject.name}
           projectId={selectedProject.id}
           currentBalance={selectedProject.currentBalance}
         />
       )}
    </div>
  );
}