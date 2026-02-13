import React from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Semantic element to render as
   * @default 'article'
   */
  as?: 'article' | 'section' | 'div'
  /**
   * Accessible label for the card
   */
  'aria-label'?: string
}

const Card = React.forwardRef<
  HTMLElement,
  CardProps
>(({ className, as: Component = 'article', ...props }, ref) => (
  <Component
    ref={ref as any}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { as?: 'header' | 'div' }
>(({ className, as: Component = 'header', ...props }, ref) => (
  <Component ref={ref as any} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    /**
     * Heading level for semantic hierarchy
     * @default 'h3'
     */
    level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }
>(({ className, level = 'h3', ...props }, ref) => {
  const Component = level
  return (
    <Component
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { as?: 'section' | 'div' }
>(({ className, as: Component = 'section', ...props }, ref) => (
  <Component ref={ref as any} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { as?: 'footer' | 'div' }
>(({ className, as: Component = 'footer', ...props }, ref) => (
  <Component ref={ref as any} className={cn('flex items-center p-6 pt-0', className)} {...props} />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, type CardProps }
