import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Variantes do Spinner usando CVA
 */
const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary',
        muted: 'text-muted-foreground',
        white: 'text-white',

      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Texto de acessibilidade
   */
  'aria-label'?: string;
}

/**
 * Componente Spinner para estados de loading
 * 
 * @example
 * ```tsx
 * <Spinner size="lg" variant="lunes" />
 * <Spinner className="mx-auto" aria-label="Carregando dados" />
 * ```
 */
const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label={ariaLabel || 'Loading'}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

/**
 * Props do LoadingOverlay
 */
export interface LoadingOverlayProps {
  /**
   * Se o overlay está visível
   */
  visible: boolean;
  /**
   * Texto de loading
   */
  text?: string;
  /**
   * Tamanho do spinner
   */
  spinnerSize?: VariantProps<typeof spinnerVariants>['size'];
  /**
   * Variante do spinner
   */
  spinnerVariant?: VariantProps<typeof spinnerVariants>['variant'];
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Se deve mostrar backdrop
   */
  backdrop?: boolean;
}

/**
 * Overlay de loading que cobre toda a área
 * 
 * @example
 * ```tsx
 * <LoadingOverlay 
 *   visible={isLoading} 
 *   text="Processando transação..." 
 *   spinnerSize="lg"
 * />
 * ```
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text,
  spinnerSize = 'lg',
  spinnerVariant = 'default',
  className,
  backdrop = true,
}) => {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-black/50',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4 rounded-lg bg-background p-6 shadow-lg">
        <Spinner size={spinnerSize} variant={spinnerVariant} />
        {text && (
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Props do LoadingButton
 */
export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Se está em estado de loading
   */
  loading?: boolean;
  /**
   * Texto durante o loading
   */
  loadingText?: string;
  /**
   * Tamanho do spinner
   */
  spinnerSize?: VariantProps<typeof spinnerVariants>['size'];
  /**
   * Posição do spinner
   */
  spinnerPosition?: 'left' | 'right' | 'center';
}

/**
 * Botão com estado de loading integrado
 * 
 * @example
 * ```tsx
 * <LoadingButton 
 *   loading={isSubmitting} 
 *   loadingText="Salvando..."
 *   onClick={handleSubmit}
 * >
 *   Salvar
 * </LoadingButton>
 * ```
 */
const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  spinnerSize = 'sm',
  spinnerPosition = 'left',
  children,
  disabled,
  className,
  ...props
}) => {
  const displayText = loading && loadingText ? loadingText : children;
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && spinnerPosition === 'left' && (
        <Spinner size={spinnerSize} variant="white" />
      )}
      
      {spinnerPosition === 'center' && loading ? (
        <Spinner size={spinnerSize} variant="white" />
      ) : (
        <span>{displayText}</span>
      )}
      
      {loading && spinnerPosition === 'right' && (
        <Spinner size={spinnerSize} variant="white" />
      )}
    </button>
  );
};

/**
 * Props do LoadingDots
 */
export interface LoadingDotsProps {
  /**
   * Tamanho dos dots
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Cor dos dots
   */
  color?: string;
  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Animação de loading com pontos
 * 
 * @example
 * ```tsx
 * <LoadingDots size="lg" />
 * ```
 */
const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'currentColor',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const dotClass = cn(
    'rounded-full animate-pulse',
    sizeClasses[size]
  );

  return (
    <div className={cn('flex space-x-1', className)}>
      <div 
        className={dotClass} 
        style={{ backgroundColor: color, animationDelay: '0ms' }}
      />
      <div 
        className={dotClass} 
        style={{ backgroundColor: color, animationDelay: '150ms' }}
      />
      <div 
        className={dotClass} 
        style={{ backgroundColor: color, animationDelay: '300ms' }}
      />
    </div>
  );
};

export {
  Spinner,
  LoadingOverlay,
  LoadingButton,
  LoadingDots,
  spinnerVariants,
};