import { useWalletStore } from '../../../web3/src/store/walletStore';
import { CreateProjectData } from '../types/project';
import { useState } from 'react';

// Hook useApiMutation temporário até a correção do @safeguard/shared-ui
const useApiMutation = <TData, TVariables>(config: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = async (variables: TVariables) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await config.mutationFn(variables);
      setData(result);
      config.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      config.onError?.(error, variables);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
     mutate,
     mutateAsync: mutate,
     isLoading,
     isPending: isLoading,
     error,
     data,
     isSuccess: data !== null && error === null,
     reset: () => {
       setError(null);
       setData(null);
     }
   };
 };

// Simulação de uma função da API para criar o projeto
const createProjectOnApi = async (projectData: CreateProjectData & { account: string | null }): Promise<{ transactionHash: string; projectId: string }> => {
  // Verificar se a carteira está conectada
  if (!projectData.account) {
    throw new Error('Carteira não conectada. Por favor, conecte sua carteira primeiro.');
  }

  // Validar endereços (simulação)
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(projectData.contractAddress)) {
    throw new Error('Endereço do contrato inválido.');
  }
  if (!addressRegex.test(projectData.tokenAddress)) {
    throw new Error('Endereço do token inválido.');
  }

  // Simular verificação do contrato na blockchain
  // Em um cenário real, isso seria uma chamada de API para o backend que verificaria o contrato
  const contractExists = await fetch(`https://api.lunes.io/v1/contracts/${projectData.contractAddress}`).then(res => res.ok);
  if (!contractExists) {
    throw new Error('Contrato não encontrado na blockchain. Verifique o endereço.');
  }

  // Simular delay de transação
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simular resposta da blockchain
  const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  const mockProjectId = `project_${Date.now()}`;

  // Salvar no localStorage como backup (em produção seria uma API)
  const existingProjects = JSON.parse(localStorage.getItem('lunes_projects') || '[]');
  const newProject = {
    id: mockProjectId,
    ...projectData,
    transactionHash: mockTransactionHash,
    createdAt: new Date().toISOString(),
    createdBy: projectData.account,
    status: 'active'
  };
  
  existingProjects.push(newProject);
  localStorage.setItem('lunes_projects', JSON.stringify(existingProjects));

  return {
    transactionHash: mockTransactionHash,
    projectId: mockProjectId
  };
};

/**
 * Hook personalizado para gerenciar a criação de projetos
 * Integra com a API e gerencia estados de loading/erro através do useApiMutation.
 */
export const useCreateProject = () => {
  const { account } = useWalletStore();

  const mutation = useApiMutation({
    mutationFn: (projectData: CreateProjectData) => createProjectOnApi({ ...projectData, account }),
    // Opcional: onSuccess, onError, onSettled podem ser usados aqui para feedback específico.
    // O tratamento de erro global (incluindo net::ERR_BLOCKED_BY_CLIENT) já é tratado pelo useApiMutation.
  });

  return {
    createProject: mutation.mutate,
    createProjectAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  };
};