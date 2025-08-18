"use client";

import React from 'react';
import { Star, StarHalf, Shield, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface ProjectRatingProps {
  score: number; // 0-100
  className?: string;
  showScore?: boolean;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProjectRating({ 
  score, 
  className, 
  showScore = true, 
  showBadge = true,
  size = 'md' 
}: ProjectRatingProps) {
  // Convert score (0-100) to stars (0-5)
  const stars = Math.min(5, Math.max(0, score / 20));
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Size configurations
  const sizeConfig = {
    sm: {
      star: 'w-3 h-3',
      text: 'text-xs',
      badge: 'text-xs px-1.5 py-0.5'
    },
    md: {
      star: 'w-4 h-4',
      text: 'text-sm',
      badge: 'text-xs px-2 py-1'
    },
    lg: {
      star: 'w-5 h-5',
      text: 'text-base',
      badge: 'text-sm px-2.5 py-1'
    }
  };

  const config = sizeConfig[size];

  // Get rating category
  const getRatingInfo = (score: number) => {
    if (score >= 90) return { label: 'Excelente', color: 'bg-green-500', variant: 'default' as const };
    if (score >= 75) return { label: 'Muito Bom', color: 'bg-blue-500', variant: 'default' as const };
    if (score >= 60) return { label: 'Bom', color: 'bg-yellow-500', variant: 'secondary' as const };
    if (score >= 40) return { label: 'Regular', color: 'bg-orange-500', variant: 'outline' as const };
    if (score >= 20) return { label: 'Baixo', color: 'bg-red-400', variant: 'destructive' as const };
    return { label: 'Muito Baixo', color: 'bg-red-600', variant: 'destructive' as const };
  };

  const ratingInfo = getRatingInfo(score);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star 
            key={`full-${i}`} 
            className={cn(config.star, 'text-yellow-400 fill-yellow-400')} 
          />
        ))}
        
        {hasHalfStar && (
          <StarHalf className={cn(config.star, 'text-yellow-400 fill-yellow-400')} />
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            className={cn(config.star, 'text-muted-foreground/30')} 
          />
        ))}
      </div>

      {/* Score */}
      {showScore && (
        <span className={cn('font-medium text-muted-foreground', config.text)}>
          {score}/100
        </span>
      )}

      {/* Rating Badge */}
      {showBadge && (
        <Badge 
          variant={ratingInfo.variant}
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
          leftIcon={
            score >= 75 ? (
              <Shield className="w-3 h-3" />
            ) : score >= 40 ? (
              <TrendingUp className="w-3 h-3" />
            ) : undefined
          }
          className={cn(
            'whitespace-nowrap',
            score >= 75 ? 'text-white' : ''
          )}
        >
          <span className="truncate">{ratingInfo.label}</span>
        </Badge>
      )}
    </div>
  );
}

// Componente para mostrar detalhes do score
interface ProjectScoreDetailsProps {
  score: number;
  guaranteeValue?: string;
  assets?: number;
  vestingTime?: string;
  className?: string;
}

export function ProjectScoreDetails({
  score,
  guaranteeValue,
  assets,
  vestingTime,
  className
}: ProjectScoreDetailsProps) {
  return (
    <div className={cn('bg-muted/50 rounded-lg p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Classificação de Segurança</h4>
        <ProjectRating score={score} size="sm" showBadge={false} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-muted-foreground">Valor Garantido:</span>
          <p className="font-semibold">{guaranteeValue || 'N/A'}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Ativos:</span>
          <p className="font-semibold">{assets || 0} tipo(s)</p>
        </div>
        <div>
          <span className="text-muted-foreground">Vesting:</span>
          <p className="font-semibold">{vestingTime || 'N/A'}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Score:</span>
          <p className="font-semibold text-primary">{score}/100</p>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p>
          <strong>Score baseado em:</strong> Valor das garantias (70%), 
          diversidade de ativos (15%), tempo de vesting (15%)
        </p>
      </div>
    </div>
  );
}
