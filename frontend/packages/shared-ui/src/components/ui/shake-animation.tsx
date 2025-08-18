"use client"

import React, { ReactNode, useEffect, useState, useRef } from 'react'
import { cn } from '../../lib/utils'

export interface ShakeAnimationProps {
  children: ReactNode
  /** Se deve executar a animação de shake */
  trigger: boolean
  /** Intensidade do shake (1-5) */
  intensity?: 1 | 2 | 3 | 4 | 5
  /** Duração da animação em ms */
  duration?: number
  /** Direção do shake */
  direction?: 'horizontal' | 'vertical' | 'both'
  /** Número de repetições do shake */
  iterations?: number
  /** Callback quando a animação termina */
  onAnimationEnd?: () => void
  /** Classe CSS adicional */
  className?: string
  /** Se deve resetar automaticamente o trigger após a animação */
  autoReset?: boolean
}

/**
 * Componente para animação de shake em campos inválidos
 * Útil para feedback visual quando há erros de validação
 */
export const ShakeAnimation: React.FC<ShakeAnimationProps> = ({
  children,
  trigger,
  intensity = 3,
  duration = 500,
  direction = 'horizontal',
  iterations = 3,
  onAnimationEnd,
  className,
  autoReset = true
}) => {
  const [isShaking, setIsShaking] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (trigger && !isShaking) {
      setIsShaking(true)
      setAnimationKey(prev => prev + 1)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsShaking(false)
        onAnimationEnd?.()
      }, duration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [trigger, duration, onAnimationEnd, isShaking])

  const getShakeDistance = () => {
    switch (intensity) {
      case 1: return 2
      case 2: return 4
      case 3: return 6
      case 4: return 8
      case 5: return 10
      default: return 6
    }
  }

  const getKeyframes = () => {
    const distance = getShakeDistance()
    
    switch (direction) {
      case 'horizontal':
        return {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: `translateX(-${distance}px)` },
          '20%, 40%, 60%, 80%': { transform: `translateX(${distance}px)` }
        }
      case 'vertical':
        return {
          '0%, 100%': { transform: 'translateY(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: `translateY(-${distance}px)` },
          '20%, 40%, 60%, 80%': { transform: `translateY(${distance}px)` }
        }
      case 'both':
        return {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: `translate(-${distance}px, -${distance/2}px)` },
          '20%, 40%, 60%, 80%': { transform: `translate(${distance}px, ${distance/2}px)` }
        }
      default:
        return {}
    }
  }

  const animationStyle = isShaking ? {
    animation: `shake-${direction}-${intensity}-${animationKey} ${duration}ms ease-in-out ${iterations}`
  } : {}

  // Inject keyframes dynamically
  useEffect(() => {
    if (isShaking) {
      const styleId = `shake-keyframes-${animationKey}`
      const existingStyle = document.getElementById(styleId)
      
      if (!existingStyle) {
        const style = document.createElement('style')
        style.id = styleId
        
        const keyframes = getKeyframes()
        const keyframeString = Object.entries(keyframes)
          .map(([key, value]) => `${key} { ${Object.entries(value).map(([prop, val]) => `${prop}: ${val}`).join('; ')} }`)
          .join(' ')
        
        style.textContent = `
          @keyframes shake-${direction}-${intensity}-${animationKey} {
            ${keyframeString}
          }
        `
        
        document.head.appendChild(style)
        
        // Clean up after animation
        setTimeout(() => {
          const styleToRemove = document.getElementById(styleId)
          if (styleToRemove) {
            document.head.removeChild(styleToRemove)
          }
        }, duration + 100)
      }
    }
  }, [isShaking, direction, intensity, animationKey, duration])

  return (
    <div
      className={cn('inline-block', className)}
      style={animationStyle}
    >
      {children}
    </div>
  )
}

/**
 * Hook para controlar shake animation programaticamente
 */
export const useShakeAnimation = () => {
  const [shouldShake, setShouldShake] = useState(false)
  const [shakeCount, setShakeCount] = useState(0)

  const triggerShake = () => {
    setShouldShake(true)
    setShakeCount(prev => prev + 1)
    
    // Auto reset after a short delay
    setTimeout(() => {
      setShouldShake(false)
    }, 50)
  }

  const resetShake = () => {
    setShouldShake(false)
  }

  return {
    shouldShake,
    shakeCount,
    triggerShake,
    resetShake
  }
}

/**
 * Componente wrapper para inputs com shake animation automática
 */
export interface ShakeInputProps {
  children: ReactNode
  /** Se há erro no campo */
  hasError: boolean
  /** Mensagem de erro (opcional) */
  errorMessage?: string
  /** Intensidade do shake quando há erro */
  shakeIntensity?: ShakeAnimationProps['intensity']
  /** Classe CSS adicional */
  className?: string
}

export const ShakeInput: React.FC<ShakeInputProps> = ({
  children,
  hasError,
  errorMessage,
  shakeIntensity = 2,
  className
}) => {
  const [prevError, setPrevError] = useState(hasError)
  const [shouldTrigger, setShouldTrigger] = useState(false)

  useEffect(() => {
    // Trigger shake only when error state changes from false to true
    if (hasError && !prevError) {
      setShouldTrigger(true)
      setTimeout(() => setShouldTrigger(false), 50)
    }
    setPrevError(hasError)
  }, [hasError, prevError])

  return (
    <div className={cn('w-full', className)}>
      <ShakeAnimation
        trigger={shouldTrigger}
        intensity={shakeIntensity}
        direction="horizontal"
        duration={400}
      >
        {children}
      </ShakeAnimation>
      {hasError && errorMessage && (
        <p className="mt-1 text-sm text-red-600 animate-fade-in">
          {errorMessage}
        </p>
      )}
    </div>
  )
}

/**
 * Componente de demonstração para diferentes tipos de shake
 */
export interface ShakeDemoProps {
  /** Tipo de demonstração */
  type: 'input' | 'button' | 'card'
  /** Se deve mostrar o shake */
  active: boolean
  /** Callback quando clicado */
  onClick?: () => void
}

export const ShakeDemo: React.FC<ShakeDemoProps> = ({
  type,
  active,
  onClick
}) => {
  const content = {
    input: (
      <input
        type="text"
        placeholder="Campo com erro"
        className={cn(
          'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
          active 
            ? 'border-red-500 focus:ring-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-blue-500'
        )}
        onClick={onClick}
      />
    ),
    button: (
      <button
        className={cn(
          'px-4 py-2 rounded-md font-medium transition-colors',
          active
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        )}
        onClick={onClick}
      >
        {active ? 'Erro!' : 'Clique para erro'}
      </button>
    ),
    card: (
      <div
        className={cn(
          'p-4 border rounded-lg cursor-pointer transition-colors',
          active
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 bg-white hover:bg-gray-50'
        )}
        onClick={onClick}
      >
        <h3 className="font-semibold">{active ? '❌ Erro no cartão' : '📋 Cartão normal'}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {active ? 'Algo deu errado aqui!' : 'Clique para simular erro'}
        </p>
      </div>
    )
  }

  return (
    <ShakeAnimation
      trigger={active}
      intensity={3}
      direction="horizontal"
      duration={500}
    >
      {content[type]}
    </ShakeAnimation>
  )
}

export default ShakeAnimation