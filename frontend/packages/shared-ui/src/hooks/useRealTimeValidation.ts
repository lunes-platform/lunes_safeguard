import { useState, useCallback, useEffect } from 'react';

/**
 * Tipos de validação disponíveis
 */
export type ValidationType = 
  | 'email'
  | 'password'
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'numeric'
  | 'alphanumeric'
  | 'phone'
  | 'url'
  | 'custom';

/**
 * Regra de validação
 */
export interface ValidationRule {
  type: ValidationType;
  message: string;
  value?: number | string | RegExp;
  validator?: (value: string) => boolean;
}

/**
 * Estado de validação
 */
export interface ValidationState {
  isValid: boolean;
  error: string | null;
  isValidating: boolean;
  hasBeenTouched: boolean;
}

/**
 * Opções do hook de validação
 */
export interface UseRealTimeValidationOptions {
  rules: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  showErrorOnlyAfterTouch?: boolean;
}

/**
 * Validadores pré-definidos
 */
const validators = {
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  password: (value: string) => {
    // Mínimo 8 caracteres, pelo menos 1 letra e 1 número
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(value);
  },
  
  required: (value: string) => {
    return value.trim().length > 0;
  },
  
  numeric: (value: string) => {
    return /^\d+$/.test(value);
  },
  
  alphanumeric: (value: string) => {
    return /^[a-zA-Z0-9]+$/.test(value);
  },
  
  phone: (value: string) => {
    // Formato brasileiro: (11) 99999-9999 ou 11999999999
    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },
  
  url: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Hook para validação em tempo real de campos de formulário
 * 
 * @param options - Configurações de validação
 * @returns Estado e funções de validação
 * 
 * @example
 * ```tsx
 * const emailValidation = useRealTimeValidation({
 *   rules: [
 *     { type: 'required', message: 'Email é obrigatório' },
 *     { type: 'email', message: 'Email inválido' }
 *   ],
 *   validateOnChange: true,
 *   debounceMs: 300
 * });
 * 
 * <Input
 *   value={email}
 *   onChange={emailValidation.handleChange}
 *   onBlur={emailValidation.handleBlur}
 *   variant={emailValidation.state.error ? 'error' : 'success'}
 *   error={emailValidation.state.error}
 * />
 * ```
 */
export function useRealTimeValidation(options: UseRealTimeValidationOptions) {
  const {
    rules,
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    showErrorOnlyAfterTouch = true
  } = options;

  const [state, setState] = useState<ValidationState>({
    isValid: false,
    error: null,
    isValidating: false,
    hasBeenTouched: false
  });

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  /**
   * Executa a validação de um valor
   */
  const validateValue = useCallback((value: string): { isValid: boolean; error: string | null } => {
    if (!value && rules.some(rule => rule.type === 'required')) {
      const requiredRule = rules.find(rule => rule.type === 'required');
      return { isValid: false, error: requiredRule?.message || 'Campo obrigatório' };
    }

    if (!value) {
      return { isValid: true, error: null };
    }

    for (const rule of rules) {
      let isValid = false;

      switch (rule.type) {
        case 'minLength':
          isValid = value.length >= (rule.value as number);
          break;
        case 'maxLength':
          isValid = value.length <= (rule.value as number);
          break;
        case 'custom':
          isValid = rule.validator ? rule.validator(value) : true;
          break;
        default:
          if (validators[rule.type]) {
            isValid = validators[rule.type](value);
          }
      }

      if (!isValid) {
        return { isValid: false, error: rule.message };
      }
    }

    return { isValid: true, error: null };
  }, [rules]);

  /**
   * Executa validação com debounce
   */
  const debouncedValidate = useCallback((value: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    setState(prev => ({ ...prev, isValidating: true }));

    const timer = setTimeout(() => {
      const result = validateValue(value);
      setState(prev => ({
        ...prev,
        isValid: result.isValid,
        error: (showErrorOnlyAfterTouch && !prev.hasBeenTouched) ? null : result.error,
        isValidating: false
      }));
    }, debounceMs);

    setDebounceTimer(timer);
  }, [validateValue, debounceMs, debounceTimer, showErrorOnlyAfterTouch]);

  /**
   * Valida imediatamente (sem debounce)
   */
  const validateImmediate = useCallback((value: string) => {
    const result = validateValue(value);
    setState(prev => ({
      ...prev,
      isValid: result.isValid,
      error: result.error,
      isValidating: false,
      hasBeenTouched: true
    }));
  }, [validateValue]);

  /**
   * Handler para mudança de valor
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (validateOnChange) {
      debouncedValidate(value);
    }
  }, [validateOnChange, debouncedValidate]);

  /**
   * Handler para blur (perda de foco)
   */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    setState(prev => ({ ...prev, hasBeenTouched: true }));
    
    if (validateOnBlur) {
      validateImmediate(value);
    }
  }, [validateOnBlur, validateImmediate]);

  /**
   * Valida um valor específico
   */
  const validate = useCallback((value: string) => {
    return validateImmediate(value);
  }, [validateImmediate]);

  /**
   * Reseta o estado de validação
   */
  const reset = useCallback(() => {
    setState({
      isValid: false,
      error: null,
      isValidating: false,
      hasBeenTouched: false
    });
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [debounceTimer]);

  // Cleanup do timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    state,
    handleChange,
    handleBlur,
    validate,
    reset,
    validateValue
  };
}

/**
 * Hook simplificado para validação de email
 */
export function useEmailValidation(options?: Partial<UseRealTimeValidationOptions>) {
  return useRealTimeValidation({
    rules: [
      { type: 'required', message: 'Email é obrigatório' },
      { type: 'email', message: 'Digite um email válido' }
    ],
    ...options
  });
}

/**
 * Hook simplificado para validação de senha
 */
export function usePasswordValidation(options?: Partial<UseRealTimeValidationOptions>) {
  return useRealTimeValidation({
    rules: [
      { type: 'required', message: 'Senha é obrigatória' },
      { type: 'password', message: 'Senha deve ter pelo menos 8 caracteres, 1 letra e 1 número' }
    ],
    ...options
  });
}

/**
 * Hook simplificado para validação de campo obrigatório
 */
export function useRequiredValidation(message = 'Campo obrigatório', options?: Partial<UseRealTimeValidationOptions>) {
  return useRealTimeValidation({
    rules: [
      { type: 'required', message }
    ],
    ...options
  });
}