import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Variantes do Badge usando CVA
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning:
          'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        info:
          'border-transparent bg-blue-500 text-white hover:bg-blue-600',

      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
        xl: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Ícone à esquerda do texto
   */
  leftIcon?: React.ReactNode;
  /**
   * Ícone à direita do texto
   */
  rightIcon?: React.ReactNode;
  /**
   * Se o badge é removível
   */
  removable?: boolean;
  /**
   * Callback quando o badge é removido
   */
  onRemove?: () => void;
  /**
   * Se o badge tem animação de pulso
   */
  pulse?: boolean;
}

/**
 * Componente Badge para exibir status, categorias ou informações destacadas
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Ativo</Badge>
 * <Badge variant="warning" leftIcon={<AlertIcon />}>Pendente</Badge>
 * <Badge variant="destructive" removable onRemove={() => console.log('removed')}>Erro</Badge>
 * ```
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      leftIcon,
      rightIcon,
      removable,
      onRemove,
      pulse,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          badgeVariants({ variant, size }),
          pulse && 'animate-pulse',
          className
        )}
        ref={ref}
        {...props}
      >
        {leftIcon && (
          <span className="mr-1 flex-shrink-0">{leftIcon}</span>
        )}
        
        <span className="truncate">{children}</span>
        
        {rightIcon && (
          <span className="ml-1 flex-shrink-0">{rightIcon}</span>
        )}
        
        {removable && (
          <button
            type="button"
            className="ml-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-white"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            aria-label="Remove badge"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
Badge.displayName = 'Badge';

/**
 * Badge de status pré-configurado
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  /**
   * Status a ser exibido
   */
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning';
}

/**
 * Badge de status com variantes pré-definidas
 * 
 * @example
 * ```tsx
 * <StatusBadge status="active">Ativo</StatusBadge>
 * <StatusBadge status="pending">Aguardando</StatusBadge>
 * ```
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const statusVariants = {
    active: 'success' as const,
    inactive: 'secondary' as const,
    pending: 'warning' as const,
    error: 'destructive' as const,
    success: 'success' as const,
    warning: 'warning' as const,
  };

  return <Badge variant={statusVariants[status]} {...props} />;
};

/**
 * Badge de contagem
 */
export interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  /**
   * Número a ser exibido
   */
  count: number;
  /**
   * Número máximo antes de mostrar "+"
   */
  max?: number;
  /**
   * Se deve mostrar zero
   */
  showZero?: boolean;
}

/**
 * Badge para exibir contadores
 * 
 * @example
 * ```tsx
 * <CountBadge count={5} />
 * <CountBadge count={100} max={99} /> // Mostra "99+"
 * <CountBadge count={0} showZero /> // Mostra "0"
 * ```
 */
const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 999,
  showZero = false,
  ...props
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge variant="destructive" size="sm" {...props}>
      {displayCount}
    </Badge>
  );
};

/**
 * Badge dot - apenas um ponto colorido
 */
export interface DotBadgeProps extends Omit<BadgeProps, 'children' | 'size'> {
  /**
   * Tamanho do dot
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge em formato de ponto
 * 
 * @example
 * ```tsx
 * <DotBadge variant="success" />
 * <DotBadge variant="warning" size="lg" />
 * ```
 */
const DotBadge: React.FC<DotBadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div
      className={cn(
        'rounded-full',
        badgeVariants({ variant }),
        sizeClasses[size],
        'p-0 border-0',
        className
      )}
      {...props}
    />
  );
};

export { Badge, StatusBadge, CountBadge, DotBadge, badgeVariants };