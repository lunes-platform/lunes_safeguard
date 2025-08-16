import { useState } from 'react';
import { useWalletStore } from '../../../web3/src/store/walletStore';
import { CreateProjectData } from '../types/project';

/**
 * Hook personalizado para gerenciar a criação de projetos
 * Integra com contratos inteligentes e gerencia estados de loading/erro
 */
export const useCreateProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account, isConnected } = useWalletStore();

  /**
   * Valida se o endereço é um endereço válido da blockchain
   */
  const validateAddress = (address: string): boolean => {
    // Validação básica para endereços Ethereum/Lunes
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
  };

  /**
   * Verifica se o contrato existe na blockchain
   */
  const verifyContract = async (contractAddress: string): Promise<boolean> => {
    try {
      if (!account) return false;
      
      // Simula verificação do contrato na blockchain
      // Em produção, isso faria uma chamada real para verificar se o contrato existe
      const response = await fetch(`https://api.lunes.io/v1/contracts/${contractAddress}`);
      return response.ok;
    } catch (error) {
      console.error('Erro ao verificar contrato:', error);
      return false;
    }
  };

  /**
   * Cria um novo projeto na blockchain
   */
  const createProject = async (projectData: CreateProjectData): Promise<{
    success: boolean;
    transactionHash?: string;
    projectId?: string;
    error?: string;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar se a carteira está conectada
      if (!isConnected || !account) {
        throw new Error('Carteira não conectada. Por favor, conecte sua carteira primeiro.');
      }

      // Validar endereços
      if (!validateAddress(projectData.contractAddress)) {
        throw new Error('Endereço do contrato inválido.');
      }

      if (!validateAddress(projectData.tokenAddress)) {
        throw new Error('Endereço do token inválido.');
      }

      // Verificar se o contrato existe
      const contractExists = await verifyContract(projectData.contractAddress);
      if (!contractExists) {
        throw new Error('Contrato não encontrado na blockchain. Verifique o endereço.');
      }

      // Simular criação do projeto na blockchain
      // Em produção, isso seria uma transação real
      const transactionData = {
        from: account,
        to: projectData.contractAddress,
        data: {
          name: projectData.name,
          description: projectData.description,
          tokenAddress: projectData.tokenAddress,
          initialGuarantee: projectData.initialGuarantee,
          website: projectData.website,
          documentation: projectData.documentation
        }
      };

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
        createdBy: account,
        status: 'active'
      };
      
      existingProjects.push(newProject);
      localStorage.setItem('lunes_projects', JSON.stringify(existingProjects));

      return {
        success: true,
        transactionHash: mockTransactionHash,
        projectId: mockProjectId
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao criar projeto';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpa o estado de erro
   */
  const clearError = () => {
    setError(null);
  };

  return {
    createProject,
    isLoading,
    error,
    clearError,
    validateAddress,
    verifyContract
  };
};