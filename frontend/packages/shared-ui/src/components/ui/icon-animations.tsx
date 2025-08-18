"use client"

import React, { ReactNode, useState, useEffect } from 'react'
import { cn } from '../../lib/utils'

export type IconAnimationType = 
  | 'pulse' 
  | 'bounce' 
  | 'shake' 
  | 'rotate' 
  | 'swing' 
  | 'heartbeat' 
  | 'flash' 
  | 'wobble'
  | 'tada'
  | 'jello'

export interface IconAnimationProps {
  children: ReactNode
  /** Tipo de animação */
  animation: IconAnimationType
  /** Se a animação deve ser executada */
  animate?: boolean
  /** Duração da animação em ms */
  duration?: number
  /** Delay antes de iniciar a animação em ms */
  delay?: number
  /** Número de iterações (infinite para infinito) */
  iterations?: number | 'infinite'
  /** Velocidade da animação */
  speed?: 'slow' | 'normal' | 'fast'
  /** Se deve pausar a animação no hover */
  pauseOnHover?: boolean
  /** Callback quando a animação termina */
  onAnimationEnd?: () => void
  /** Classe CSS adicional */
  className?: string
}

/**
 * Componente para animações de ícones
 * Oferece várias animações pré-definidas para melhorar a UX
 */
export const IconAnimation: React.FC<IconAnimationProps> = ({
  children,
  animation,
  animate = true,
  duration = 1000,
  delay = 0,
  iterations = 1,
  speed = 'normal',
  pauseOnHover = false,
  onAnimationEnd,
  className
}) => {
  const [animationKey, setAnimationKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (animate) {
      setIsAnimating(true)
      setAnimationKey(prev => prev + 1)
      
      if (iterations !== 'infinite') {
        const totalDuration = delay + (duration * (typeof iterations === 'number' ? iterations : 1))
        const timeout = setTimeout(() => {
          setIsAnimating(false)
          onAnimationEnd?.()
        }, totalDuration)
        
        return () => clearTimeout(timeout)
      }
    } else {
      setIsAnimating(false)
    }
  }, [animate, duration, delay, iterations, onAnimationEnd])

  const getSpeedMultiplier = () => {
    switch (speed) {
      case 'slow': return 1.5
      case 'fast': return 0.5
      default: return 1
    }
  }

  const getAnimationCSS = () => {
    const actualDuration = duration * getSpeedMultiplier()
    const iterationCount = iterations === 'infinite' ? 'infinite' : iterations
    
    if (!isAnimating) {
      return {
        animationName: 'none',
        animationDuration: '0s',
        animationTimingFunction: 'ease-in-out',
        animationDelay: '0s',
        animationIterationCount: '1',
        animationPlayState: 'paused'
      }
    }
    
    return {
      animationName: `icon-${animation}-${animationKey}`,
      animationDuration: `${actualDuration}ms`,
      animationTimingFunction: 'ease-in-out',
      animationDelay: `${delay}ms`,
      animationIterationCount: iterationCount.toString(),
      animationPlayState: pauseOnHover ? 'running' : 'running'
    }
  }

  const getKeyframes = () => {
    switch (animation) {
      case 'pulse':
        return {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' }
        }
      case 'bounce':
        return {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
          '40%, 43%': { transform: 'translateY(-8px)' },
          '70%': { transform: 'translateY(-4px)' },
          '90%': { transform: 'translateY(-2px)' }
        }
      case 'shake':
        return {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        }
      case 'rotate':
        return {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      case 'swing':
        return {
          '0%, 100%': { transform: 'rotate(0deg)', transformOrigin: 'center top' },
          '20%': { transform: 'rotate(15deg)' },
          '40%': { transform: 'rotate(-10deg)' },
          '60%': { transform: 'rotate(5deg)' },
          '80%': { transform: 'rotate(-5deg)' }
        }
      case 'heartbeat':
        return {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.3)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.3)' },
          '70%': { transform: 'scale(1)' }
        }
      case 'flash':
        return {
          '0%, 50%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0' }
        }
      case 'wobble':
        return {
          '0%, 100%': { transform: 'translateX(0%) rotate(0deg)' },
          '15%': { transform: 'translateX(-25%) rotate(-5deg)' },
          '30%': { transform: 'translateX(20%) rotate(3deg)' },
          '45%': { transform: 'translateX(-15%) rotate(-3deg)' },
          '60%': { transform: 'translateX(10%) rotate(2deg)' },
          '75%': { transform: 'translateX(-5%) rotate(-1deg)' }
        }
      case 'tada':
        return {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '10%, 20%': { transform: 'scale(0.9) rotate(-3deg)' },
          '30%, 50%, 70%, 90%': { transform: 'scale(1.1) rotate(3deg)' },
          '40%, 60%, 80%': { transform: 'scale(1.1) rotate(-3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' }
        }
      case 'jello':
        return {
          '0%, 100%': { transform: 'skewX(0deg) skewY(0deg)' },
          '30%': { transform: 'skewX(25deg) skewY(5deg)' },
          '40%': { transform: 'skewX(-15deg) skewY(-5deg)' },
          '50%': { transform: 'skewX(15deg) skewY(3deg)' },
          '65%': { transform: 'skewX(-5deg) skewY(-3deg)' },
          '75%': { transform: 'skewX(5deg) skewY(2deg)' }
        }
      default:
        return {}
    }
  }

  // Inject keyframes dynamically
  useEffect(() => {
    if (isAnimating) {
      const styleId = `icon-animation-${animation}-${animationKey}`
      const existingStyle = document.getElementById(styleId)
      
      if (!existingStyle) {
        const style = document.createElement('style')
        style.id = styleId
        
        const keyframes = getKeyframes()
        const keyframeString = Object.entries(keyframes)
          .map(([key, value]) => `${key} { ${Object.entries(value).map(([prop, val]) => `${prop}: ${val}`).join('; ')} }`)
          .join(' ')
        
        style.textContent = `
          @keyframes icon-${animation}-${animationKey} {
            ${keyframeString}
          }
        `
        
        document.head.appendChild(style)
        
        // Clean up after animation
        const cleanup = setTimeout(() => {
          const styleToRemove = document.getElementById(styleId)
          if (styleToRemove) {
            document.head.removeChild(styleToRemove)
          }
        }, (duration * getSpeedMultiplier()) + delay + 1000)
        
        return () => {
          clearTimeout(cleanup)
        }
      }
    }
  }, [isAnimating, animation, animationKey, duration, delay])

  return (
    <div
      className={cn(
        'inline-block',
        pauseOnHover && 'hover:[animation-play-state:paused]',
        className
      )}
      style={getAnimationCSS()}
    >
      {children}
    </div>
  )
}

/**
 * Hook para controlar animações de ícones programaticamente
 */
export const useIconAnimation = () => {
  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set())

  const startAnimation = (id: string) => {
    setActiveAnimations(prev => new Set([...prev, id]))
  }

  const stopAnimation = (id: string) => {
    setActiveAnimations(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const isAnimating = (id: string) => activeAnimations.has(id)

  const toggleAnimation = (id: string) => {
    if (isAnimating(id)) {
      stopAnimation(id)
    } else {
      startAnimation(id)
    }
  }

  return {
    startAnimation,
    stopAnimation,
    isAnimating,
    toggleAnimation,
    activeAnimations: Array.from(activeAnimations)
  }
}

/**
 * Componente de ícone animado pré-configurado
 */
export interface AnimatedIconProps {
  /** Tipo de ícone (emoji ou componente) */
  icon: ReactNode
  /** Tipo de animação */
  animation: IconAnimationType
  /** Tamanho do ícone */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Cor do ícone */
  color?: string
  /** Se deve animar automaticamente */
  autoAnimate?: boolean
  /** Se deve animar no hover */
  animateOnHover?: boolean
  /** Se deve animar no clique */
  animateOnClick?: boolean
  /** Callback quando clicado */
  onClick?: () => void
  /** Classe CSS adicional */
  className?: string
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon,
  animation,
  size = 'md',
  color,
  autoAnimate = false,
  animateOnHover = false,
  animateOnClick = false,
  onClick,
  className
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(autoAnimate)
  const [clickCount, setClickCount] = useState(0)

  const sizeClasses = {
    sm: 'text-sm w-4 h-4',
    md: 'text-base w-6 h-6',
    lg: 'text-lg w-8 h-8',
    xl: 'text-xl w-10 h-10'
  }

  const handleClick = () => {
    if (animateOnClick) {
      setShouldAnimate(true)
      setClickCount(prev => prev + 1)
      setTimeout(() => setShouldAnimate(false), 50)
    }
    onClick?.()
  }

  const handleMouseEnter = () => {
    if (animateOnHover) {
      setShouldAnimate(true)
    }
  }

  const handleMouseLeave = () => {
    if (animateOnHover) {
      setShouldAnimate(false)
    }
  }

  return (
    <div
      className={cn(
        'cursor-pointer select-none flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      style={{ color }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <IconAnimation
        animation={animation}
        animate={shouldAnimate}
      >
        {icon}
      </IconAnimation>
    </div>
  )
}

/**
 * Componente para notificações animadas
 */
export interface AnimatedNotificationProps {
  /** Ícone da notificação */
  icon: ReactNode
  /** Texto da notificação */
  text?: string
  /** Tipo de notificação */
  type?: 'success' | 'error' | 'warning' | 'info'
  /** Se deve mostrar a notificação */
  show: boolean
  /** Callback quando a notificação é fechada */
  onClose?: () => void
}

export const AnimatedNotification: React.FC<AnimatedNotificationProps> = ({
  icon,
  text,
  type = 'info',
  show,
  onClose
}) => {
  const typeConfig = {
    success: { animation: 'bounce' as const, color: 'text-green-600', bg: 'bg-green-50' },
    error: { animation: 'shake' as const, color: 'text-red-600', bg: 'bg-red-50' },
    warning: { animation: 'swing' as const, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    info: { animation: 'pulse' as const, color: 'text-blue-600', bg: 'bg-blue-50' }
  }

  const config = typeConfig[type]

  if (!show) return null

  return (
    <div className={cn(
      'fixed top-4 right-4 p-4 rounded-lg shadow-lg border flex items-center gap-3 z-50',
      config.bg
    )}>
      <IconAnimation
        animation={config.animation}
        animate={show}
        iterations="infinite"
        duration={1500}
        className={config.color}
      >
        {icon}
      </IconAnimation>
      {text && (
        <span className="text-sm font-medium">{text}</span>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default IconAnimation