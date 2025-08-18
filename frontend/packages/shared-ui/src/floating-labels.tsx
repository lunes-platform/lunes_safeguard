import React, { useState, useEffect, useRef } from 'react';
import { cn } from './lib/utils';

/**
 * Hook para gerenciar o estado do label flutuante
 */
export const useFloatingLabel = (value: string, focused: boolean) => {
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    setIsFloating(focused || value.length > 0);
  }, [value, focused]);

  return { isFloating, setIsFloating };
};

/**
 * Componente container para os campos com floating labels
 */
interface FloatingContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  focused?: boolean;
  disabled?: boolean;
}

const FloatingContainer: React.FC<FloatingContainerProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  error = false,
  focused = false,
  disabled = false
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const variantClasses = {
    default: 'border border-gray-300 rounded-md bg-white',
    outlined: 'border-2 border-gray-300 rounded-md bg-transparent',
    filled: 'border-0 border-b-2 border-gray-300 rounded-t-md bg-gray-50',
    underlined: 'border-0 border-b-2 border-gray-300 bg-transparent'
  };

  const stateClasses = cn({
    'border-blue-500': focused && !error,
    'border-red-500': error,
    'border-gray-200 bg-gray-50': disabled
  });

  return (
    <div className={cn(
      'relative group',
      variantClasses[variant],
      sizeClasses[size],
      stateClasses,
      className
    )}>
      {children}
    </div>
  );
};

/**
 * Componente do label flutuante
 */
interface FloatingLabelProps {
  label: string;
  required?: boolean;
  isFloating: boolean;
  focused: boolean;
  error?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outlined' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  className?: string | undefined;
  htmlFor?: string;
}

const FloatingLabel: React.FC<FloatingLabelProps> = ({
  label,
  required = false,
  isFloating,
  focused,
  error = false,
  disabled = false,
  variant = 'default',
  size = 'md',
  className,
  htmlFor
}) => {
  const sizeClasses = {
    sm: {
      floating: 'text-xs px-1 -top-2',
      normal: 'text-sm top-2'
    },
    md: {
      floating: 'text-sm px-1 -top-2.5',
      normal: 'text-base top-3'
    },
    lg: {
      floating: 'text-base px-1 -top-3',
      normal: 'text-lg top-4'
    }
  };

  const positionClasses = isFloating
    ? `${sizeClasses[size].floating} left-2`
    : `${sizeClasses[size].normal} left-3`;

  const backgroundClasses = {
    default: isFloating ? 'bg-white' : '',
    outlined: isFloating ? 'bg-white' : '',
    filled: isFloating ? 'bg-gray-50' : '',
    underlined: ''
  };

  const stateClasses = cn({
    'text-blue-500': focused && !error && isFloating,
    'text-red-500': error,
    'text-gray-400': disabled
  });

  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'absolute pointer-events-none transition-all duration-200 ease-in-out transform origin-left',
        positionClasses,
        backgroundClasses[variant],
        stateClasses,
        className
      )}
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

/**
 * Componente para mensagens de erro e ajuda
 */
interface FieldMessageProps {
  error?: boolean;
  errorMessage?: string | undefined;
  helpText?: string | undefined;
  size?: 'sm' | 'md' | 'lg';
}

const FieldMessage: React.FC<FieldMessageProps> = ({
  error = false,
  errorMessage,
  helpText,
  size = 'md'
}) => {
  const message = error ? errorMessage : helpText;
  if (!message) return null;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <p className={cn(
      'mt-1 px-3',
      sizeClasses[size],
      error ? 'text-red-500' : 'text-gray-500'
    )}>
      {message}
    </p>
  );
};

/**
 * Componente FloatingInput
 */
export interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outlined' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  errorMessage?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  labelClassName?: string;
  onValueChange?: (value: string) => void;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>((
  {
    label,
    required = false,
    error = false,
    disabled = false,
    variant = 'default',
    size = 'md',
    errorMessage,
    helpText,
    leftIcon,
    rightIcon,
    labelClassName,
    className,
    value,
    onFocus,
    onBlur,
    onValueChange,
    onChange,
    id,
    ...props
  },
  ref
) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || `floating-input-${Math.random().toString(36).substr(2, 9)}`;

  const { isFloating } = useFloatingLabel(
    value ? String(value) : '',
    focused
  );

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-3 text-base',
    lg: 'px-4 py-4 text-lg'
  };

  const paddingClasses = {
    sm: leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '',
    md: leftIcon ? 'pl-12' : rightIcon ? 'pr-12' : '',
    lg: leftIcon ? 'pl-14' : rightIcon ? 'pr-14' : ''
  };

  return (
    <div className="w-full">
      <FloatingContainer
        variant={variant}
        size={size}
        error={error}
        focused={focused}
        disabled={disabled}
        className={cn('relative', className)}
      >
        {/* Ícone esquerdo */}
        {leftIcon && (
          <div className={cn(
            'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
            'group-focus-within:text-blue-500',
            { 'text-red-500': error }
          )}>
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          value={value}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            'w-full bg-transparent border-0 outline-none placeholder-transparent',
            sizeClasses[size],
            paddingClasses[size],
            { 'cursor-not-allowed': disabled }
          )}
          {...props}
        />

        {/* Label flutuante */}
        <FloatingLabel
          htmlFor={inputId}
          label={label}
          required={required}
          isFloating={isFloating}
          focused={focused}
          error={error}
          disabled={disabled}
          variant={variant}
          size={size}
          className={labelClassName || undefined}
        />

        {/* Ícone direito */}
        {rightIcon && (
          <div className={cn(
            'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400',
            'group-focus-within:text-blue-500',
            { 'text-red-500': error }
          )}>
            {rightIcon}
          </div>
        )}
      </FloatingContainer>

      {/* Mensagem de erro/ajuda */}
      <FieldMessage
        error={error}
        errorMessage={errorMessage || undefined}
        helpText={helpText || undefined}
        size={size}
      />
    </div>
  );
});

FloatingInput.displayName = 'FloatingInput';

/**
 * Componente FloatingTextarea
 */
export interface FloatingTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outlined' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  errorMessage?: string;
  helpText?: string;
  rows?: number;
  labelClassName?: string;
}

export const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>((
  {
    label,
    required = false,
    error = false,
    disabled = false,
    variant = 'default',
    size = 'md',
    errorMessage,
    helpText,
    rows = 4,
    labelClassName,
    className,
    value,
    onFocus,
    onBlur,
    id,
    ...props
  },
  ref
) => {
  const [focused, setFocused] = useState(false);
  const textareaId = id || `floating-textarea-${Math.random().toString(36).substr(2, 9)}`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isFloating } = useFloatingLabel(
    value ? String(value) : '',
    focused
  );

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  // Auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  // Combine refs
  useEffect(() => {
    if (ref && textareaRef.current) {
      if (typeof ref === 'function') {
        ref(textareaRef.current);
      } else {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = textareaRef.current;
      }
    }
  }, [ref]);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-3 text-base',
    lg: 'px-4 py-4 text-lg'
  };

  return (
    <div className="w-full">
      <FloatingContainer
        variant={variant}
        size={size}
        error={error}
        focused={focused}
        disabled={disabled}
        className={cn('relative', className)}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id={textareaId}
          value={value}
          disabled={disabled}
          rows={rows}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            'w-full bg-transparent border-0 outline-none placeholder-transparent resize-none',
            sizeClasses[size],
            { 'cursor-not-allowed': disabled }
          )}
          {...props}
        />

        {/* Label flutuante */}
        <FloatingLabel
          htmlFor={textareaId}
          label={label}
          required={required}
          isFloating={isFloating}
          focused={focused}
          error={error}
          disabled={disabled}
          variant={variant}
          size={size}
          className={labelClassName}
        />
      </FloatingContainer>

      {/* Mensagem de erro/ajuda */}
      <FieldMessage
        error={error}
        errorMessage={errorMessage}
        helpText={helpText}
        size={size}
      />
    </div>
  );
});

FloatingTextarea.displayName = 'FloatingTextarea';

/**
 * Componente FloatingSelect
 */
export interface FloatingSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outlined' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  errorMessage?: string;
  helpText?: string;
  children: React.ReactNode;
  labelClassName?: string;
}

export const FloatingSelect = React.forwardRef<HTMLSelectElement, FloatingSelectProps>((
  {
    label,
    required = false,
    error = false,
    disabled = false,
    variant = 'default',
    size = 'md',
    errorMessage,
    helpText,
    children,
    labelClassName,
    className,
    value,
    onFocus,
    onBlur,
    id,
    ...props
  },
  ref
) => {
  const [focused, setFocused] = useState(false);
  const selectId = id || `floating-select-${Math.random().toString(36).substr(2, 9)}`;

  const { isFloating } = useFloatingLabel(
    value ? String(value) : '',
    focused
  );

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 pr-8 text-sm',
    md: 'px-3 py-3 pr-10 text-base',
    lg: 'px-4 py-4 pr-12 text-lg'
  };

  return (
    <div className="w-full">
      <FloatingContainer
        variant={variant}
        size={size}
        error={error}
        focused={focused}
        disabled={disabled}
        className={cn('relative', className)}
      >
        {/* Select */}
        <select
          ref={ref}
          id={selectId}
          value={value}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            'w-full bg-transparent border-0 outline-none appearance-none',
            sizeClasses[size],
            { 'cursor-not-allowed': disabled }
          )}
          {...props}
        >
          {children}
        </select>

        {/* Label flutuante */}
        <FloatingLabel
          htmlFor={selectId}
          label={label}
          required={required}
          isFloating={isFloating}
          focused={focused}
          error={error}
          disabled={disabled}
          variant={variant}
          size={size}
          className={labelClassName}
        />

        {/* Ícone de seta */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className={cn(
              'w-4 h-4 text-gray-400',
              { 'text-red-500': error }
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </FloatingContainer>

      {/* Mensagem de erro/ajuda */}
      <FieldMessage
        error={error}
        errorMessage={errorMessage}
        helpText={helpText}
        size={size}
      />
    </div>
  );
});

FloatingSelect.displayName = 'FloatingSelect';

/**
 * Componente de formulário para floating labels
 */
export interface FloatingFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const FloatingForm = React.forwardRef<HTMLFormElement, FloatingFormProps>((
  { children, onSubmit, className, ...props },
  ref
) => {
  return (
    <form
      ref={ref}
      onSubmit={onSubmit}
      className={cn('space-y-6', className)}
      {...props}
    >
      {children}
    </form>
  );
});

FloatingForm.displayName = 'FloatingForm';

/**
 * Componente de grupo de campos para organizar formulários
 */
export interface FloatingFieldGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const FloatingFieldGroup: React.FC<FloatingFieldGroupProps> = ({
  children,
  title,
  description,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h4 className="text-sm font-medium text-gray-900">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Exportações adicionais
export { FloatingContainer, FloatingLabel, FieldMessage };