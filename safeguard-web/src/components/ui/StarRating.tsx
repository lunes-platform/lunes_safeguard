import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StarRatingProps {
  score: number;
  maxScore?: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showScore?: boolean;
}

/**
 * StarRating component displays a star-based rating visualization
 * 
 * @param score - The numerical score to represent (0-100)
 * @param maxScore - The maximum possible score (default: 100)
 * @param maxStars - The maximum number of stars to display (default: 5)
 * @param size - Size of the stars (sm, md, lg)
 * @param className - Additional CSS classes
 * @param showScore - Whether to show the numerical score alongside stars
 */
export const StarRating: React.FC<StarRatingProps> = ({
  score,
  maxScore = 100,
  maxStars = 5,
  size = 'md',
  className,
  showScore = true,
}) => {
  // Calculate stars based on score
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const starsValue = (normalizedScore / maxScore) * maxStars;
  
  // Size classes for stars
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  // Container classes based on size
  const containerClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  };
  
  // Score text size classes
  const scoreTextClasses = {
    sm: 'text-xs ml-2',
    md: 'text-sm ml-2',
    lg: 'text-base ml-3',
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className={cn('flex', containerClasses[size])}>
        {[...Array(maxStars)].map((_, i) => {
          const starFill = Math.min(Math.max(starsValue - i, 0), 1);
          return (
            <div key={i} className="relative">
              {/* Background star (empty) */}
              <Star 
                className={cn(
                  sizeClasses[size], 
                  'text-neutral-200'
                )} 
                fill="currentColor"
              />
              
              {/* Foreground star (filled) with clip-path based on fill percentage */}
              {starFill > 0 && (
                <div 
                  className="absolute inset-0 overflow-hidden" 
                  style={{ width: `${starFill * 100}%` }}
                >
                  <Star 
                    className={cn(
                      sizeClasses[size], 
                      'text-warning-500'
                    )} 
                    fill="currentColor"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {showScore && (
        <span className={cn(
          'font-medium text-neutral-500', 
          scoreTextClasses[size]
        )}>
          {score}/{maxScore}
        </span>
      )}
    </div>
  );
};