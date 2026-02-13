import React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import { badgeVariants } from './badge-variants'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Semantic role for the badge
   * @default 'status'
   */
  role?: 'status' | 'img' | 'note'
  /**
   * Accessible label for screen readers
   */
  'aria-label'?: string
}

function Badge({ 
  className, 
  variant, 
  role = 'status',
  'aria-label': ariaLabel,
  children,
  ...props 
}: BadgeProps) {
  return (
    <span 
      className={cn(badgeVariants({ variant }), className)} 
      role={role}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
