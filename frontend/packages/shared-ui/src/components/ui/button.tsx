import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { useRipple } from '../../hooks/useRipple';
import { Ripple } from './ripple';

/**
 * Variantes do componente Button usando CVA (Class Variance Authority)
 * Inclui microinterações avançadas: hover states com escala, sombra e transições suaves
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:shadow-primary/25',
        destructive: 'bg-danger-500 text-white hover:bg-danger-600 hover:scale-105 hover:shadow-lg hover:shadow-danger-500/25',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-md hover:border-primary/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 hover:shadow-md',
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:scale-105',
        link: 'text-primary underline-offset-4 hover:underline hover:scale-105',
        success: 'bg-success-500 text-white hover:bg-success-600 hover:scale-105 hover:shadow-lg hover:shadow-success-500/25',
        warning: 'bg-warning-500 text-white hover:bg-warning-600 hover:scale-105 hover:shadow-lg hover:shadow-warning-500/25',

      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Se true, renderiza como Slot para composição
   */
  asChild?: boolean;
  /**
   * Estado de loading do botão
   */
  loading?: boolean;
  /**
   * Ícone a ser exibido antes do texto
   */
  leftIcon?: React.ReactNode;
  /**
   * Ícone a ser exibido após o texto
   */
  rightIcon?: React.ReactNode;
  /**
   * Habilita o efeito ripple no clique
   */
  enableRipple?: boolean;
}

/**
 * Componente Button reutilizável com múltiplas variantes e estados
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" loading={isLoading}>
 *   Salvar Projeto
 * </Button>
 * 
 * <Button variant="outline" leftIcon={<PlusIcon />}>
 *   Adicionar Item
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      enableRipple = true,
      onClick,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    const { ripples, createRipple } = useRipple();

    // Handler para clique com ripple effect
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (enableRipple && !loading && !disabled) {
        createRipple(event);
      }
      onClick?.(event);
    };

    const content = (
      <>
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex items-center">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2 flex items-center">{rightIcon}</span>
        )}
        {enableRipple && <Ripple ripples={ripples} />}
      </>
    );

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }), 'relative overflow-hidden')}
          ref={ref}
          {...props}
        >
          {content}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), 'relative overflow-hidden')}
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export type { VariantProps };