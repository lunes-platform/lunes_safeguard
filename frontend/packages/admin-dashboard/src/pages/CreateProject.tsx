import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, AlertCircle } from 'lucide-react';
import { Card, Button, Badge } from '@safeguard/shared-ui';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { useCreateProject } from '../hooks/useCreateProject';
import { CreateProjectData } from '../types/project';

/**
 * Página de Criação de Projeto
 * 
 * Funcionalidades:
 * - Formulário completo para criação de projetos
 * - Upload de logo
 * - Validação de dados
 * - Integração com contratos inteligentes
 */
export function CreateProject() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { createProject, isLoading, error } = useCreateProject();

  const handleCreateProject = async (data: CreateProjectData) => {
    try {
      await createProject(data);
      setShowModal(false);
      navigate('/projects');
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Criar Novo Projeto</h1>
            <p className="text-muted-foreground mt-2">
              Configure um novo projeto para o ecossistema SafeGuard
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de Início Rápido */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Início Rápido
                </h2>
                <p className="text-muted-foreground">
                  Crie um projeto rapidamente com as configurações essenciais
                </p>
              </div>
              <Button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
                Criar Projeto
              </Button>
            </div>

            {/* Erro */}
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive mb-1">
                    Erro ao criar projeto
                  </p>
                  <p className="text-sm text-destructive/80">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Passos */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Informações Básicas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Nome, descrição e detalhes do projeto
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Configuração de Contratos
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Endereços dos contratos inteligentes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Garantia Inicial
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Valores em LUNES e LUSTD para garantia
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar com Informações */}
        <div className="space-y-6">
          {/* Requisitos */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Requisitos
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-muted-foreground">
                  Carteira conectada
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm text-muted-foreground">
                  Saldo suficiente para garantia
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-muted-foreground">
                  Contratos implantados
                </span>
              </div>
            </div>
          </Card>

          {/* Ajuda */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Precisa de Ajuda?
            </h3>
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Guia de Upload
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <AlertCircle className="w-4 h-4 mr-2" />
                FAQ
              </Button>
            </div>
          </Card>

          {/* Status */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Status da Rede
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mainnet</span>
                <Badge variant="default">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Price</span>
                <span className="text-sm font-medium">~15 Gwei</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <CreateProjectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateProject}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}