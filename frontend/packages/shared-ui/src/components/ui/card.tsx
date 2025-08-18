import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Componente Card base
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * Variante visual do card
     */
    variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
    /**
     * Tamanho do padding interno
     */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /**
     * Se o card é clicável
     */
    clickable?: boolean;
  }
>(({ className, variant = 'default', padding = 'md', clickable = false, ...props }, ref) => {
  const variantClasses = {
    default: 'bg-card text-card-foreground border',
    outlined: 'bg-transparent border-2 border-border',
    elevated: 'bg-card text-card-foreground shadow-lg border-0',
    ghost: 'bg-transparent border-0',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg transition-colors',
        variantClasses[variant],
        paddingClasses[padding],
        clickable && 'cursor-pointer hover:bg-accent/50 transition-colors',
        className
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

/**
 * Cabeçalho do Card
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * Espaçamento do cabeçalho
     */
    spacing?: 'sm' | 'md' | 'lg';
  }
>(({ className, spacing = 'md', ...props }, ref) => {
  const spacingClasses = {
    sm: 'space-y-1',
    md: 'space-y-1.5',
    lg: 'space-y-2',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col',
        spacingClasses[spacing],
        className
      )}
      {...props}
    />
  );
});
CardHeader.displayName = 'CardHeader';

/**
 * Título do Card
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    /**
     * Tamanho do título
     */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /**
     * Elemento HTML a ser renderizado
     */
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }
>(({ className, size = 'md', as: Component = 'h3', ...props }, ref) => {
  const sizeClasses = {
    sm: 'text-sm font-medium',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-semibold',
    xl: 'text-2xl font-bold',
  };

  return (
    <Component
      ref={ref}
      className={cn(
        'leading-none tracking-tight',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
CardTitle.displayName = 'CardTitle';

/**
 * Descrição do Card
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    /**
     * Tamanho da descrição
     */
    size?: 'xs' | 'sm' | 'md';
  }
>(({ className, size = 'sm', ...props }, ref) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
  };

  return (
    <p
      ref={ref}
      className={cn(
        'text-muted-foreground',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
CardDescription.displayName = 'CardDescription';

/**
 * Conteúdo do Card
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * Espaçamento do conteúdo
     */
    spacing?: 'none' | 'sm' | 'md' | 'lg';
  }
>(({ className, spacing = 'md', ...props }, ref) => {
  const spacingClasses = {
    none: 'pt-0',
    sm: 'pt-3',
    md: 'pt-6',
    lg: 'pt-8',
  };

  return (
    <div
      ref={ref}
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  );
});
CardContent.displayName = 'CardContent';

/**
 * Rodapé do Card
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * Alinhamento dos itens
     */
    align?: 'start' | 'center' | 'end' | 'between' | 'around';
    /**
     * Espaçamento do rodapé
     */
    spacing?: 'none' | 'sm' | 'md' | 'lg';
  }
>(({ className, align = 'start', spacing = 'md', ...props }, ref) => {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const spacingClasses = {
    none: 'pt-0',
    sm: 'pt-3',
    md: 'pt-6',
    lg: 'pt-8',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center',
        alignClasses[align],
        spacingClasses[spacing],
        className
      )}
      {...props}
    />
  );
});
CardFooter.displayName = 'CardFooter';

/**
 * Card com estado de loading
 */
export interface LoadingCardProps {
  /**
   * Número de linhas de skeleton
   */
  lines?: number;
  /**
   * Se deve mostrar o avatar
   */
  showAvatar?: boolean;
  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Card de loading com skeleton
 * 
 * @example
 * ```tsx
 * <LoadingCard lines={3} showAvatar />
 * ```
 */
const LoadingCard: React.FC<LoadingCardProps> = ({
  lines = 2,
  showAvatar = false,
  className,
}) => {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader>
        <div className="flex items-center space-x-4">
          {showAvatar && (
            <div className="h-10 w-10 rounded-full bg-muted" />
          )}
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-3 bg-muted rounded',
                i === lines - 1 ? 'w-2/3' : 'w-full'
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  LoadingCard,
};