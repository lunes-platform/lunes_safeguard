import React, { useState } from 'react';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { useCreateProject } from '../hooks/useCreateProject';
import { CreateProjectData } from '../types/project';

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

const Projects: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { createProject, isLoading, error } = useCreateProject();

  const handleCreateProject = async (data: ProjectData) => {
    try {
      // Converter os dados do formulário para o formato esperado
      const projectData: CreateProjectData = {
        name: data.name,
        description: data.description,
        contractAddress: data.contractAddress,
        tokenAddress: data.tokenAddress || '',
        website: data.website,
        documentation: data.documentation,
        initialGuarantee: parseFloat(data.initialGuarantee.lunesAmount) || 0
      };

      const result = await createProject(projectData);
      
      if (result.success) {
        alert(`Projeto criado com sucesso! Hash: ${result.transactionHash}`);
        setIsCreateModalOpen(false);
      } else {
        alert(`Erro ao criar projeto: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro inesperado ao criar projeto.');
    }
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Projetos</h1>
          <p className="text-muted-foreground">Gerencie seus projetos SafeGuard</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Projeto 1 */}
        <div className="card-modern p-6 group hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-[5px] flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">DeFi Protocol</h3>
                <p className="text-sm text-muted-foreground">ID: #001</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
              Ativo
            </span>
          </div>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Protocolo descentralizado para empréstimos e yield farming
          </p>
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              50,000 LUNES
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              15 dias
            </div>
          </div>
        </div>

        {/* Projeto 2 */}
        <div className="card-modern p-6 group hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-[5px] flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">NFT Marketplace</h3>
                <p className="text-sm text-muted-foreground">ID: #002</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/20">
              Em Votação
            </span>
          </div>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Marketplace para criação e comercialização de NFTs
          </p>
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              75,000 LUNES
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              30 dias
            </div>
          </div>
        </div>

        {/* Projeto 3 */}
        <div className="card-modern p-6 group hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-[5px] flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">GameFi Platform</h3>
                <p className="text-sm text-muted-foreground">ID: #003</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full border border-border">
              Pendente
            </span>
          </div>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Plataforma de jogos blockchain com economia tokenizada
          </p>
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              100,000 LUNES
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              45 dias
            </div>
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export { Projects };
export default Projects;