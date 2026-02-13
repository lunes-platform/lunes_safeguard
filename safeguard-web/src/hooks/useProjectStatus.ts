import { useState, useCallback } from 'react';
import type { ProjectStatus } from '../features/project-registration/types';

/**
 * Interface para o resultado de uma transição de status
 */
interface StatusTransitionResult {
  success: boolean;
  newStatus?: ProjectStatus;
  error?: string;
  transactionHash?: string;
}

/**
 * Interface para as opções de transição
 */
interface TransitionOptions {
  projectId: string | number;
  reason?: string;
  adminNotes?: string;
}

/**
 * Hook personalizado para gerenciar transições de status de projetos
 * 
 * Este hook implementa a máquina de estados para projetos:
 * pending_deposit → pending_approval → approved/rejected
 */
export const useProjectStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valida se uma transição de status é permitida
   */
  const isValidTransition = useCallback((from: ProjectStatus, to: ProjectStatus): boolean => {
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      'pending_deposit': ['pending_approval'],
      'pending_approval': ['approved', 'rejected'],
      'approved': [], // Status final
      'rejected': ['pending_approval'] // Pode ser resubmetido
    };

    return validTransitions[from]?.includes(to) ?? false;
  }, []);

  /**
   * Transiciona um projeto de pending_deposit para pending_approval
   * Chamado após o depósito de garantia ser realizado com sucesso
   */
  const submitForApproval = useCallback(async (
    _options: TransitionOptions
  ): Promise<StatusTransitionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Integrar com API real
      // const response = await api.post(`/projects/${options.projectId}/submit-for-approval`, {
      //   reason: options.reason,
      //   adminNotes: options.adminNotes
      // });

      // Simulação da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result: StatusTransitionResult = {
        success: true,
        newStatus: 'pending_approval'
      };

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao submeter projeto para aprovação';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Aprova um projeto (pending_approval → approved)
   * Apenas administradores podem executar esta ação
   */
  const approveProject = useCallback(async (
    _options: TransitionOptions
  ): Promise<StatusTransitionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Integrar com API real
      // const response = await api.post(`/projects/${options.projectId}/approve`, {
      //   reason: options.reason,
      //   adminNotes: options.adminNotes
      // });

      // Simulação da API
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result: StatusTransitionResult = {
        success: true,
        newStatus: 'approved'
      };

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aprovar projeto';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Rejeita um projeto (pending_approval → rejected)
   * Apenas administradores podem executar esta ação
   */
  const rejectProject = useCallback(async (
    _options: TransitionOptions & { reason: string }
  ): Promise<StatusTransitionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Integrar com API real
      // const response = await api.post(`/projects/${options.projectId}/reject`, {
      //   reason: options.reason,
      //   adminNotes: options.adminNotes
      // });

      // Simulação da API
      await new Promise(resolve => setTimeout(resolve, 1200));

      const result: StatusTransitionResult = {
        success: true,
        newStatus: 'rejected'
      };

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao rejeitar projeto';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Resubmete um projeto rejeitado (rejected → pending_approval)
   * Permite que projetos rejeitados sejam resubmetidos após correções
   */
  const resubmitProject = useCallback(async (
    _options: TransitionOptions
  ): Promise<StatusTransitionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Integrar with API real
      // const response = await api.post(`/projects/${options.projectId}/resubmit`, {
      //   reason: options.reason,
      //   adminNotes: options.adminNotes
      // });

      // Simulação da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result: StatusTransitionResult = {
        success: true,
        newStatus: 'pending_approval'
      };

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resubmeter projeto';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Limpa o estado de erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Obtém as ações disponíveis para um status específico
   */
  const getAvailableActions = useCallback((status: ProjectStatus): string[] => {
    const actions: Record<ProjectStatus, string[]> = {
      'pending_deposit': [], // Nenhuma ação manual disponível
      'pending_approval': ['approve', 'reject'],
      'approved': [], // Status final
      'rejected': ['resubmit']
    };

    return actions[status] || [];
  }, []);

  /**
   * Obtém a descrição de um status
   */
  const getStatusDescription = useCallback((status: ProjectStatus): string => {
    const descriptions: Record<ProjectStatus, string> = {
      'pending_deposit': 'Aguardando depósito de garantia',
      'pending_approval': 'Aguardando aprovação administrativa',
      'approved': 'Projeto aprovado e ativo',
      'rejected': 'Projeto rejeitado'
    };

    return descriptions[status] || 'Status desconhecido';
  }, []);

  /**
   * Obtém a cor do badge para um status
   */
  const getStatusColor = useCallback((status: ProjectStatus): string => {
    const colors: Record<ProjectStatus, string> = {
      'pending_deposit': 'bg-yellow-100 text-yellow-800',
      'pending_approval': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };

    return colors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  return {
    // Estado
    isLoading,
    error,
    
    // Ações de transição
    submitForApproval,
    approveProject,
    rejectProject,
    resubmitProject,
    
    // Utilitários
    isValidTransition,
    getAvailableActions,
    getStatusDescription,
    getStatusColor,
    clearError
  };
};