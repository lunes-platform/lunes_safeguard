import { useState, useCallback } from 'react';

/**
 * Hook para formatação de números monetários em inputs
 * Fornece formatação visual com separadores de milhares e controle de casas decimais
 */
export const useNumberFormat = (options?: {
  decimals?: number;
  allowNegative?: boolean;
  maxValue?: number;
}) => {
  const { decimals = 2, allowNegative = false, maxValue } = options || {};

  /**
   * Formata um número para exibição com separadores de milhares
   * @param value - Valor numérico ou string
   * @returns String formatada para exibição
   */
  const formatForDisplay = useCallback((value: string | number): string => {
    if (!value && value !== 0) return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return '';
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(numValue);
  }, [decimals]);

  /**
   * Remove formatação para obter valor numérico puro
   * @param formattedValue - Valor formatado
   * @returns String com valor numérico puro
   */
  const parseValue = useCallback((formattedValue: string): string => {
    if (!formattedValue) return '';
    
    // Remove todos os caracteres que não são dígitos, vírgula ou ponto
    let cleaned = formattedValue.replace(/[^\d,.\-]/g, '');
    
    // Substitui vírgula por ponto para padronização
    cleaned = cleaned.replace(',', '.');
    
    // Remove sinais negativos se não permitido
    if (!allowNegative) {
      cleaned = cleaned.replace('-', '');
    }
    
    // Garante apenas um ponto decimal
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limita casas decimais
    if (parts.length === 2 && parts[1] && parts[1].length > decimals) {
      cleaned = parts[0] + '.' + parts[1].substring(0, decimals);
    }
    
    // Verifica valor máximo
    if (maxValue && parseFloat(cleaned) > maxValue) {
      return maxValue.toString();
    }
    
    return cleaned;
  }, [decimals, allowNegative, maxValue]);

  /**
   * Manipula mudanças no input com formatação automática
   * @param value - Valor do input
   * @param onChange - Callback para atualizar o valor
   * @returns Objeto com handlers para o input
   */
  const createInputHandlers = useCallback((onChange: (value: string) => void) => {
    return {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const cleanValue = parseValue(rawValue);
        
        // Valida se o valor está dentro dos limites
        if (cleanValue && maxValue && parseFloat(cleanValue) > maxValue) {
          return; // Não permite valores acima do máximo
        }
        
        onChange(cleanValue);
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value && !isNaN(parseFloat(value))) {
          // Formata o valor quando perde o foco
          const numValue = parseFloat(value);
          const formattedValue = numValue.toFixed(decimals);
          onChange(formattedValue);
          // Atualiza o valor visual no input
          e.target.value = formatForDisplay(formattedValue);
        } else if (!value) {
          // Limpa o campo se estiver vazio
          onChange('');
          e.target.value = '';
        }
      },
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
        // Remove formatação quando ganha foco para facilitar edição
        const value = e.target.value;
        if (value) {
          const cleanValue = parseValue(value);
          e.target.value = cleanValue;
        }
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Permite apenas números, vírgula, ponto, backspace, delete, tab, enter, setas
        const allowedKeys = [
          'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 
          'ArrowUp', 'ArrowDown', 'Home', 'End'
        ];
        
        const isNumber = /^[0-9]$/.test(e.key);
        const isDecimalSeparator = (e.key === ',' || e.key === '.') && decimals > 0;
        const isNegativeSign = e.key === '-' && allowNegative;
        
        if (!isNumber && !isDecimalSeparator && !isNegativeSign && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
        }
      }
    };
  }, [parseValue, decimals, maxValue, allowNegative, formatForDisplay]);

  /**
   * Valida se um valor é um número válido
   * @param value - Valor a ser validado
   * @returns true se válido, false caso contrário
   */
  const isValidNumber = useCallback((value: string): boolean => {
    if (!value) return true; // Campo vazio é considerado válido
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) return false;
    if (!allowNegative && numValue < 0) return false;
    if (maxValue && numValue > maxValue) return false;
    
    return true;
  }, [allowNegative, maxValue]);

  /**
   * Formata um valor para ser exibido no input
   * @param value - Valor a ser formatado
   * @returns Valor formatado para exibição
   */
  const getDisplayValue = useCallback((value: string): string => {
    if (!value) return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return formatForDisplay(numValue);
  }, [formatForDisplay]);

  return {
    formatForDisplay,
    parseValue,
    createInputHandlers,
    isValidNumber,
    getDisplayValue
  };
};

/**
 * Hook específico para valores monetários (LUNES/LUSTD)
 * Pré-configurado com 2 casas decimais e validações apropriadas
 */
export const useCurrencyFormat = (maxValue?: number) => {
  const options: Parameters<typeof useNumberFormat>[0] = {
    decimals: 2,
    allowNegative: false,
  };
  
  if (maxValue !== undefined) {
    options.maxValue = maxValue;
  }
  
  return useNumberFormat(options);
};