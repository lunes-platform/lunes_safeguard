import React from 'react'
import { cn } from '../../utils/cn'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Conteúdo do label
   */
  children: React.ReactNode
  /**
   * Classes CSS adicionais
   */
  className?: string
  /**
   * Se o label é obrigatório (adiciona asterisco)
   */
  required?: boolean
  /**
   * Tamanho do label
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Componente Label customizado seguindo o design system Lunes
 * 
 * @example
 * ```tsx
 * <Label htmlFor="email" required>
 *   Email
 * </Label>
 * ```
 */
export const Label: React.FC<LabelProps> = ({
  children,
  className,
  required = false,
  size = 'md',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <label
      className={cn(
        // Base styles
        'block font-medium text-neutral-700 transition-colors duration-200',
        // Size variants
        sizeClasses[size],
        // Hover and focus styles
        'hover:text-neutral-900',
        // Custom classes
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-critical-500" aria-label="obrigatório">
          *
        </span>
      )}
    </label>
  )
}

export default Label