import React from 'react'
import { cn } from '../../utils/cn'

interface SliderProps {
  /**
   * Valor atual do slider
   */
  value: number | number[]
  /**
   * Função chamada quando o valor muda
   */
  onValueChange: (value: number) => void
  /**
   * Valor mínimo
   * @default 0
   */
  min?: number
  /**
   * Valor máximo
   * @default 100
   */
  max?: number
  /**
   * Incremento do valor
   * @default 1
   */
  step?: number
  /**
   * Se o slider está desabilitado
   * @default false
   */
  disabled?: boolean
  /**
   * Classes CSS adicionais
   */
  className?: string
  /**
   * ID do elemento para acessibilidade
   */
  id?: string
  /**
   * Nome do campo para formulários
   */
  name?: string
  /**
   * Aria label para acessibilidade
   */
  'aria-label'?: string
}

/**
 * Componente Slider customizado seguindo o design system Lunes
 * 
 * @example
 * ```tsx
 * <Slider
 *   value={50}
 *   onValueChange={(value) => setValue(value)}
 *   min={0}
 *   max={100}
 *   step={1}
 * />
 * ```
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
  id,
  name,
  'aria-label': ariaLabel,
  ...props
}) => {
  const currentValue = Array.isArray(value) ? value[0] : value
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    onValueChange(newValue)
  }

  // Calcula a porcentagem para o preenchimento visual
  const percentage = ((currentValue - min) / (max - min)) * 100

  return (
    <div className={cn('relative w-full', className)}>
      {/* Track background */}
      <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
        {/* Progress fill */}
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-200 ease-out"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Native range input */}
        <input
          type="range"
          id={id}
          name={name}
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            // Reset default styles
            'absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer',
            // Focus styles
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            // Disabled styles
            disabled && 'cursor-not-allowed opacity-50',
            // Webkit thumb styles
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-5',
            '[&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:border-2',
            '[&::-webkit-slider-thumb]:border-primary-500',
            '[&::-webkit-slider-thumb]:shadow-lg',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-all',
            '[&::-webkit-slider-thumb]:duration-200',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-webkit-slider-thumb]:hover:shadow-xl',
            '[&::-webkit-slider-thumb]:active:scale-95',
            // Firefox thumb styles
            '[&::-moz-range-thumb]:appearance-none',
            '[&::-moz-range-thumb]:w-5',
            '[&::-moz-range-thumb]:h-5',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:border-2',
            '[&::-moz-range-thumb]:border-primary-500',
            '[&::-moz-range-thumb]:shadow-lg',
            '[&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:transition-all',
            '[&::-moz-range-thumb]:duration-200',
            // Firefox track styles
            '[&::-moz-range-track]:bg-transparent',
            '[&::-moz-range-track]:border-none'
          )}
          {...props}
        />
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-full pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200">
        <div className="absolute inset-0 bg-primary-500/5 rounded-full" />
      </div>
    </div>
  )
}

export default Slider