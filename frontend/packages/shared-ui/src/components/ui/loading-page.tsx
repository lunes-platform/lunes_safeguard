import React from 'react';
import { Skeleton, SkeletonCard, SkeletonList, SkeletonTable } from './skeleton';
import { cn } from '../../lib/utils';

/**
 * Interface para as propriedades do componente LoadingPage
 */
interface LoadingPageProps {
  /**
   * Tipo de layout para o skeleton
   */
  variant?: 'dashboard' | 'list' | 'table' | 'cards' | 'profile' | 'custom';
  /**
   * Classes CSS adicionais
   */
  className?: string;
  /**
   * Conteúdo customizado para variant='custom'
   */
  children?: React.ReactNode;
}

/**
 * Componente LoadingPage para simular carregamento de páginas inteiras
 * Implementa skeleton screens para melhorar a percepção de performance
 * 
 * @param variant - Tipo de layout (dashboard, list, table, cards, profile, custom)
 * @param className - Classes CSS adicionais
 * @param children - Conteúdo customizado
 */
export const LoadingPage: React.FC<LoadingPageProps> = ({
  variant = 'dashboard',
  className,
  children,
}) => {
  const renderContent = () => {
    switch (variant) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <Skeleton variant="text" height={32} className="w-64" />
                <Skeleton variant="text" height={16} className="w-96" />
              </div>
              <Skeleton variant="rectangular" height={40} width={120} className="rounded-md" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-6 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" height={12} width={60} />
                  </div>
                  <Skeleton variant="text" height={24} className="w-20" />
                  <Skeleton variant="text" height={14} className="w-32" />
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SkeletonCard />
              </div>
              <div>
                <SkeletonList items={6} />
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Skeleton variant="text" height={28} className="w-48" />
              <div className="flex gap-2">
                <Skeleton variant="rectangular" height={36} width={100} />
                <Skeleton variant="rectangular" height={36} width={80} />
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton variant="rectangular" height={40} className="flex-1" />
              <Skeleton variant="rectangular" height={40} width={120} />
            </div>

            {/* List Items */}
            <SkeletonList items={8} />
          </div>
        );

      case 'table':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Skeleton variant="text" height={28} className="w-48" />
              <Skeleton variant="rectangular" height={36} width={100} />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Skeleton variant="rectangular" height={36} width={200} />
              <Skeleton variant="rectangular" height={36} width={120} />
              <Skeleton variant="rectangular" height={36} width={100} />
            </div>

            {/* Table */}
            <div className="border rounded-lg p-4">
              <SkeletonTable rows={10} columns={5} />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <Skeleton variant="text" height={14} width={120} />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={32} width={32} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'cards':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Skeleton variant="text" height={28} className="w-48" />
              <div className="flex gap-2">
                <Skeleton variant="rectangular" height={36} width={80} />
                <Skeleton variant="rectangular" height={36} width={100} />
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Skeleton variant="circular" width={120} height={120} />
              <div className="flex-1 space-y-4">
                <Skeleton variant="text" height={32} className="w-64" />
                <Skeleton variant="text" height={16} lines={2} />
                <div className="flex gap-2">
                  <Skeleton variant="rectangular" height={36} width={100} />
                  <Skeleton variant="rectangular" height={36} width={80} />
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <Skeleton variant="text" height={20} className="w-32 mb-4" />
                  <SkeletonList items={4} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'custom':
        return children;

      default:
        return (
          <div className="space-y-4">
            <Skeleton variant="text" height={24} className="w-48" />
            <Skeleton variant="rectangular" height={200} className="w-full" />
            <Skeleton variant="text" lines={3} />
          </div>
        );
    }
  };

  return (
    <div className={cn('animate-pulse', className)}>
      {renderContent()}
    </div>
  );
};

/**
 * Hook para simular carregamento com delay
 */
export const useLoadingDelay = (delay: number = 1000) => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isLoading;
};