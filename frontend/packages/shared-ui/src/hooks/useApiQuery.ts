import { useQuery, useMutation, UseQueryResult, UseMutationResult, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useErrorModalStore } from '../stores/useErrorModalStore';

const isBlockedByClient = (error: unknown): boolean => {
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return true;
  }
  return false;
};

export const useApiQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  options: UseQueryOptions<TQueryFnData, TError, TData>
): UseQueryResult<TData, TError> => {
  const showErrorModal = useErrorModalStore((state) => state.showErrorModal);

  const originalOnError = options.onError;

  const handleError = (error: TError) => {
    if (isBlockedByClient(error)) {
      showErrorModal(
        'Falha na Conexão',
        'Não foi possível buscar os dados. Verifique se um bloqueador de anúncios ou uma extensão de navegador está impedindo a comunicação com nossos servidores.'
      );
    } else if (originalOnError) {
      originalOnError(error);
    }
  };

  return useQuery({ ...options, onError: handleError });
};

export const useApiMutation = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> => {
  const showErrorModal = useErrorModalStore((state) => state.showErrorModal);
  const originalOnError = options.onError;

  const handleError = (error: TError, variables: TVariables, context: TContext | undefined) => {
    if (isBlockedByClient(error)) {
      showErrorModal(
        'Falha na Operação',
        'Não foi possível completar a ação. Verifique se um bloqueador de anúncios ou uma extensão de navegador está impedindo a comunicação com nossos servidores.'
      );
    } else if (originalOnError) {
      originalOnError(error, variables, context);
    }
  };

  return useMutation({ ...options, onError: handleError });
};