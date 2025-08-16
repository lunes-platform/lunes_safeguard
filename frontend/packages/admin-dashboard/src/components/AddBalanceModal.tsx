import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Wallet } from 'lucide-react';
import { Toast, useCurrencyFormat } from '@safeguard/shared-ui';

/**
 * Schema de validação para adicionar saldo ao cofre
 */
const addBalanceSchema = z.object({
  tokenType: z.enum(['LUNES', 'LUSTD'], {
    required_error: 'Selecione o tipo de token',
  }),
  amount: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Valor deve ser um número positivo'),
});

type AddBalanceFormData = z.infer<typeof addBalanceSchema>;

interface AddBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddBalanceFormData) => void;
  projectName: string;
  projectId: string;
  currentBalance: {
    lunes: number;
    lustd: number;
  };
}

/**
 * Modal para adicionar saldo ao cofre de garantias
 * Permite que usuários depositem LUNES ou LUSTD para aumentar a garantia do projeto
 */
export const AddBalanceModal: React.FC<AddBalanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectName,
  projectId,
  currentBalance,
}) => {
  // Estados para controlar a validação visual dos campos monetários
  const [amountError, setAmountError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<AddBalanceFormData>({
    resolver: zodResolver(addBalanceSchema),
    defaultValues: {
      tokenType: 'LUNES',
      amount: '',
    },
  });

  const selectedTokenType = watch('tokenType');
  const amountValue = watch('amount');

  // Hook de formatação de moeda
  const { formatForDisplay, parseValue, createInputHandlers, isValidNumber } = useCurrencyFormat(1000000);

  // Handlers para formatação do campo de valor
  const amountHandlers = createInputHandlers((value: string) => {
    const numericValue = parseValue(value);
    setValue('amount', numericValue);
    
    // Validação em tempo real
    if (value && !isValidNumber(numericValue)) {
      setAmountError('Valor inválido');
    } else {
      setAmountError('');
    }
  });

  const handleFormSubmit = async (data: AddBalanceFormData) => {
    try {
      await onSubmit(data);
      console.log('Saldo adicionado com sucesso!', `${formatForDisplay(data.amount)} ${data.tokenType} foi adicionado ao cofre do projeto ${projectName}.`);
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar saldo:', error);
    }
  };

  const handleClose = () => {
    reset();
    setAmountError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Adicionar Saldo ao Cofre
              </h2>
              <p className="text-sm text-muted-foreground">
                {projectName} (ID: {projectId})
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Saldo Atual */}
        <div className="p-6 bg-muted/30">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            Saldo Atual do Cofre
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-background rounded-lg border">
              <p className="text-xs text-muted-foreground">LUNES</p>
              <p className="text-lg font-semibold text-foreground">
                {formatForDisplay(currentBalance.lunes.toString())}
              </p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg border">
              <p className="text-xs text-muted-foreground">LUSTD</p>
              <p className="text-lg font-semibold text-foreground">
                {formatForDisplay(currentBalance.lustd.toString())}
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Seleção do Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tipo de Token *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="LUNES"
                  {...register('tokenType')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">LUNES</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="LUSTD"
                  {...register('tokenType')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">LUSTD</span>
              </label>
            </div>
            {errors.tokenType && (
              <p className="text-sm text-destructive">{errors.tokenType.message}</p>
            )}
          </div>

          {/* Valor a Depositar */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Valor a Depositar ({selectedTokenType}) *
            </label>
            <input
              type="text"
              placeholder="0,00"
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.amount || amountError
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input'
              }`}
              {...amountHandlers}
            />
            {(errors.amount || amountError) && (
              <p className="text-sm text-destructive">
                {errors.amount?.message || amountError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Valor será adicionado ao saldo atual do cofre
            </p>
          </div>

          {/* Resumo da Transação */}
          {amountValue && isValidNumber(parseValue(amountValue)) && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">
                Resumo da Transação
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor a depositar:</span>
                  <span className="font-medium text-foreground">
                    {formatForDisplay(parseValue(amountValue))} {selectedTokenType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo atual:</span>
                  <span className="text-foreground">
                    {formatForDisplay(
                      (selectedTokenType === 'LUNES' ? currentBalance.lunes : currentBalance.lustd).toString()
                    )} {selectedTokenType}
                  </span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t border-border">
                  <span className="text-foreground">Novo saldo:</span>
                  <span className="text-primary">
                    {formatForDisplay(
                      (
                        (selectedTokenType === 'LUNES' ? currentBalance.lunes : currentBalance.lustd) +
                        Number(parseValue(amountValue))
                      ).toString()
                    )} {selectedTokenType}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-input bg-background hover:bg-accent text-foreground rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!amountError || !amountValue}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processando...' : 'Adicionar Saldo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};