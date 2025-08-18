import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Variantes do componente Input com microinterações avançadas
 */
const inputVariants = cva(
  'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out',
  {
    variants: {
      variant: {
        default: 'border-input hover:border-primary/50 focus-visible:ring-ring',
        error: 'border-destructive focus-visible:ring-destructive bg-destructive/5 animate-shake',
        success: 'border-green-500 focus-visible:ring-green-500 bg-green-50/50',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500 bg-yellow-50/50',
        validating: 'border-blue-400 focus-visible:ring-blue-400 bg-blue-50/30',
      },
      inputSize: {
        default: 'h-10',
        sm: 'h-9 px-2 text-xs',
        lg: 'h-11 px-4',
        xl: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

/**
 * Variantes para o label flutuante
 */
const floatingLabelVariants = cva(
  'absolute left-3 transition-all duration-200 ease-in-out pointer-events-none',
  {
    variants: {
      state: {
        default: 'top-1/2 -translate-y-1/2 text-muted-foreground text-sm',
        floating: 'top-0 -translate-y-1/2 text-xs bg-background px-1 text-primary font-medium animate-float-label',
        error: 'top-0 -translate-y-1/2 text-xs bg-background px-1 text-destructive font-medium',
        success: 'top-0 -translate-y-1/2 text-xs bg-background px-1 text-green-600 font-medium',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Ícone a ser exibido antes do input
   */
  leftIcon?: React.ReactNode;
  /**
   * Ícone a ser exibido após o input
   */
  rightIcon?: React.ReactNode;
  /**
   * Texto de erro a ser exibido
   */
  error?: string | undefined;
  /**
   * Texto de ajuda a ser exibido
   */
  helperText?: string;
  /**
   * Label do input
   */
  label?: string;
  /**
   * Se o campo é obrigatório
   */
  required?: boolean;
  /**
   * Tamanho do input
   */
  size?: 'default' | 'sm' | 'lg' | 'xl';
  /**
   * Se deve usar label flutuante
   */
  floatingLabel?: boolean;
  /**
   * Se está validando (mostra spinner)
   */
  isValidating?: boolean;
  /**
   * Se o valor é válido (mostra ícone de sucesso)
   */
  isValid?: boolean;
  /**
   * Feedback visual automático baseado no estado
   */
  showValidationIcon?: boolean;
}

/**
 * Componente Input reutilizável com suporte a ícones, estados e validação
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Digite seu email"
 *   leftIcon={<MailIcon />}
 *   required
 * />
 * 
 * <Input
 *   variant="error"
 *   error="Email é obrigatório"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      type = 'text',
      leftIcon,
      rightIcon,
      error,
      helperText,
      label,
      required,
      id,
      size,
      floatingLabel = false,
      isValidating = false,
      isValid = false,
      showValidationIcon = true,
      value,
      placeholder,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(Boolean(value));
    
    const hasError = Boolean(error);
    const shouldShowSuccess = isValid && !hasError && !isValidating && hasValue;
    const shouldShowValidating = isValidating;
    
    // Determina a variante final baseada no estado
    let finalVariant: 'default' | 'error' | 'success' | 'warning' | 'validating' = variant || 'default';
    if (hasError) finalVariant = 'error';
    else if (shouldShowValidating) finalVariant = 'validating';
    else if (shouldShowSuccess) finalVariant = 'success';
    
    // Estado do label flutuante
    const shouldFloatLabel = floatingLabel && (isFocused || hasValue);
    let labelState: 'default' | 'floating' | 'error' | 'success' = 'default';
    if (shouldFloatLabel) {
      if (hasError) labelState = 'error';
      else if (shouldShowSuccess) labelState = 'success';
      else labelState = 'floating';
    }
    
    // Ícone de validação automático
    const getValidationIcon = () => {
      if (!showValidationIcon) return null;
      
      if (shouldShowValidating) {
          return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
        }
        
        if (shouldShowSuccess) {
          return <Check className="w-4 h-4 text-green-500 animate-pulse-icon" />;
        }
        
        if (hasError) {
          return <AlertCircle className="w-4 h-4 text-destructive" />;
        }
      
      return null;
    };
    
    const validationIcon = getValidationIcon();
    const hasRightContent = rightIcon || validationIcon;
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      props.onChange?.(e);
    };
    
    React.useEffect(() => {
      setHasValue(Boolean(value));
    }, [value]);

    return (
      <div className="w-full">
        {/* Label tradicional (não flutuante) */}
        {label && !floatingLabel && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        
        <div className="relative">
          {/* Label flutuante */}
          {label && floatingLabel && (
            <label
              htmlFor={inputId}
              className={cn(floatingLabelVariants({ state: labelState }))}
            >
              {label}
              {required && <span className="ml-1">*</span>}
            </label>
          )}
          
          {/* Ícone esquerdo */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
              {leftIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: finalVariant, inputSize: inputSize || size as any }),
              leftIcon && 'pl-10',
              hasRightContent && 'pr-10',
              floatingLabel && 'placeholder-transparent',
              className
            )}
            ref={ref}
            id={inputId}
            value={value}
            placeholder={floatingLabel ? ' ' : placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          
          {/* Ícones direitos */}
          {hasRightContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {validationIcon}
              {rightIcon && <rightIcon className="w-4 h-4 text-muted-foreground" />}
            </div>
          )}
        </div>
        
        {/* Mensagens de erro e ajuda */}
        {(error || helperText) && (
          <div className="mt-1 text-xs space-y-1">
            {error && (
              <p className="text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-muted-foreground">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };