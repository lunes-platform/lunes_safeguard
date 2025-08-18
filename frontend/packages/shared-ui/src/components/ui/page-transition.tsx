"use client"

import React, { ReactNode, useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

export interface PageTransitionProps {
  children: ReactNode
  /** Tipo de transição */
  type?: 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'scale' | 'rotate'
  /** Duração da animação em ms */
  duration?: number
  /** Delay antes da animação iniciar em ms */
  delay?: number
  /** Função de easing CSS */
  easing?: string
  /** Se deve animar na entrada */
  animateIn?: boolean
  /** Se deve animar na saída */
  animateOut?: boolean
  /** Callback quando a animação de entrada termina */
  onEnterComplete?: () => void
  /** Callback quando a animação de saída termina */
  onExitComplete?: () => void
  /** Classe CSS adicional */
  className?: string
}

/**
 * Componente para transições suaves entre páginas
 * Suporta múltiplos tipos de animação: fade, slide, scale, rotate
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  animateIn = true,
  animateOut = false,
  onEnterComplete,
  onExitComplete,
  className
}) => {
  const [isVisible, setIsVisible] = useState(!animateIn)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (animateIn) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [animateIn, delay])

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target === e.currentTarget) {
      if (isExiting && onExitComplete) {
        onExitComplete()
      } else if (isVisible && onEnterComplete) {
        onEnterComplete()
      }
    }
  }

  const getTransitionStyles = () => {
    const baseStyles = {
      transition: `all ${duration}ms ${easing}`,
      transitionDelay: `${delay}ms`
    }

    if (!isVisible && !isExiting) {
      switch (type) {
        case 'fade':
          return {
            ...baseStyles,
            opacity: 0
          }
        case 'slide-left':
          return {
            ...baseStyles,
            transform: 'translateX(-100%)',
            opacity: 0
          }
        case 'slide-right':
          return {
            ...baseStyles,
            transform: 'translateX(100%)',
            opacity: 0
          }
        case 'slide-up':
          return {
            ...baseStyles,
            transform: 'translateY(-100%)',
            opacity: 0
          }
        case 'slide-down':
          return {
            ...baseStyles,
            transform: 'translateY(100%)',
            opacity: 0
          }
        case 'scale':
          return {
            ...baseStyles,
            transform: 'scale(0.8)',
            opacity: 0
          }
        case 'rotate':
          return {
            ...baseStyles,
            transform: 'rotate(-10deg) scale(0.8)',
            opacity: 0
          }
        default:
          return {
            ...baseStyles,
            opacity: 0
          }
      }
    }

    return {
      ...baseStyles,
      opacity: 1,
      transform: 'translateX(0) translateY(0) scale(1) rotate(0deg)'
    }
  }

  const exitTransition = () => {
    if (animateOut) {
      setIsExiting(true)
      setIsVisible(false)
    }
  }

  return (
    <div
      className={cn('w-full', className)}
      style={getTransitionStyles()}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  )
}

/**
 * Hook para controlar transições de página programaticamente
 */
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionType, setTransitionType] = useState<PageTransitionProps['type']>('fade')

  const startTransition = (type: PageTransitionProps['type'] = 'fade') => {
    setTransitionType(type)
    setIsTransitioning(true)
  }

  const endTransition = () => {
    setIsTransitioning(false)
  }

  return {
    isTransitioning,
    transitionType,
    startTransition,
    endTransition
  }
}

/**
 * Componente wrapper para transições automáticas baseadas em rotas
 */
export interface RouteTransitionProps {
  children: ReactNode
  /** Chave única para identificar mudanças de rota */
  routeKey: string
  /** Tipo de transição */
  type?: PageTransitionProps['type']
  /** Duração da animação */
  duration?: number
  /** Classe CSS adicional */
  className?: string
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  routeKey,
  type = 'fade',
  duration = 300,
  className
}) => {
  const [currentKey, setCurrentKey] = useState(routeKey)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (routeKey !== currentKey) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setCurrentKey(routeKey)
        setIsAnimating(false)
      }, duration / 2)
      return () => clearTimeout(timer)
    }
  }, [routeKey, currentKey, duration])

  return (
    <PageTransition
      type={type}
      duration={duration}
      animateIn={!isAnimating}
      className={className || ''}
    >
      {children}
    </PageTransition>
  )
}

export default PageTransition