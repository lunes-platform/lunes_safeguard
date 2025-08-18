import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Interface para as propriedades do componente Skeleton
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Largura do skeleton (pode ser string CSS ou número para pixels)
   */
  width?: string | number;
  /**
   * Altura do skeleton (pode ser string CSS ou número para pixels)
   */
  height?: string | number;
  /**
   * Variante do skeleton para diferentes tipos de conteúdo
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /**
   * Número de linhas para skeleton de texto
   */
  lines?: number;
  /**
   * Se deve animar o shimmer effect
   */
  animate?: boolean;
}

/**
 * Componente Skeleton para simular carregamento de conteúdo
 * Implementa microinteração de feedback visual durante estados de loading
 * 
 * @param width - Largura do skeleton
 * @param height - Altura do skeleton
 * @param variant - Tipo de skeleton (text, circular, rectangular, rounded)
 * @param lines - Número de linhas para texto
 * @param animate - Se deve animar
 * @param className - Classes CSS adicionais
 * @param props - Outras propriedades HTML
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'rectangular',
  lines = 1,
  animate = true,
  className,
  style,
  ...props
}) => {
  const baseClasses = cn(
    'bg-muted',
    animate && 'animate-pulse',
    {
      'rounded-full': variant === 'circular',
      'rounded-md': variant === 'rounded',
      'rounded-sm': variant === 'rectangular',
      'rounded': variant === 'text',
    },
    className
  );

  const skeletonStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  // Para skeleton de texto com múltiplas linhas
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              'h-4',
              // Última linha é menor para simular texto real
              index === lines - 1 && 'w-3/4'
            )}
            style={{
              width: index === lines - 1 ? '75%' : width,
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={skeletonStyle}
      {...props}
    />
  );
};

/**
 * Skeleton pré-configurado para cards
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 space-y-4', className)}>
    <Skeleton variant="rectangular" height={200} className="w-full" />
    <div className="space-y-2">
      <Skeleton variant="text" height={20} className="w-3/4" />
      <Skeleton variant="text" height={16} lines={2} />
    </div>
    <div className="flex space-x-2">
      <Skeleton variant="rectangular" height={32} width={80} />
      <Skeleton variant="rectangular" height={32} width={60} />
    </div>
  </div>
);

/**
 * Skeleton pré-configurado para lista de itens
 */
export const SkeletonList: React.FC<{ 
  items?: number; 
  className?: string; 
}> = ({ items = 5, className }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={16} className="w-1/2" />
          <Skeleton variant="text" height={14} className="w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton pré-configurado para tabela
 */
export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string; 
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('space-y-3', className)}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={`header-${index}`} variant="text" height={16} className="w-3/4" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" height={14} />
        ))}
      </div>
    ))}
  </div>
);