import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/cn'

interface TooltipProps {
  /**
   * O conteúdo do tooltip
   */
  content: React.ReactNode
  /**
   * Posição do tooltip em relação ao elemento
   * @default 'top'
   */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * Atraso para mostrar o tooltip (em ms)
   * @default 200
   */
  delay?: number
  /**
   * Classe CSS adicional para o tooltip
   */
  className?: string
  /**
   * Elemento filho que acionará o tooltip
   */
  children: React.ReactNode
  /**
   * Largura máxima do tooltip
   * @default '250px'
   */
  maxWidth?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 200,
  className,
  children,
  maxWidth = '250px',
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Posicionamento do tooltip
  const getPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return {}
    
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    
    switch (position) {
      case 'top':
        return {
          top: `-${tooltipRect.height + 8}px`,
          left: `${(triggerRect.width - tooltipRect.width) / 2}px`,
        }
      case 'bottom':
        return {
          top: `${triggerRect.height + 8}px`,
          left: `${(triggerRect.width - tooltipRect.width) / 2}px`,
        }
      case 'left':
        return {
          top: `${(triggerRect.height - tooltipRect.height) / 2}px`,
          left: `-${tooltipRect.width + 8}px`,
        }
      case 'right':
        return {
          top: `${(triggerRect.height - tooltipRect.height) / 2}px`,
          left: `${triggerRect.width + 8}px`,
        }
      default:
        return {
          top: `-${tooltipRect.height + 8}px`,
          left: `${(triggerRect.width - tooltipRect.width) / 2}px`,
        }
    }
  }

  // Animações baseadas na posição
  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    }
    
    switch (position) {
      case 'top':
        return {
          hidden: { ...baseVariants.hidden, y: 10 },
          visible: { ...baseVariants.visible, y: 0 },
        }
      case 'bottom':
        return {
          hidden: { ...baseVariants.hidden, y: -10 },
          visible: { ...baseVariants.visible, y: 0 },
        }
      case 'left':
        return {
          hidden: { ...baseVariants.hidden, x: 10 },
          visible: { ...baseVariants.visible, x: 0 },
        }
      case 'right':
        return {
          hidden: { ...baseVariants.hidden, x: -10 },
          visible: { ...baseVariants.visible, x: 0 },
        }
      default:
        return baseVariants
    }
  }

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsVisible(true)
      setIsMounted(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsVisible(false)
  }

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Efeito para atualizar o estado isMounted após a animação de saída
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        setIsMounted(false)
      }, 200) // Tempo da animação de saída
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  return (
    <div 
      className="relative inline-flex"
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isMounted && (
          <motion.div
            ref={tooltipRef}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-neutral-800 rounded-md shadow-md',
              className
            )}
            style={{
              ...getPosition(),
              maxWidth,
            }}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            exit="hidden"
            variants={getAnimationVariants()}
            transition={{ duration: 0.2 }}
            role="tooltip"
          >
            {content}
            <div 
              className={cn(
                'absolute w-2 h-2 bg-neutral-800 transform rotate-45',
                position === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1',
                position === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1',
                position === 'left' && 'right-0 top-1/2 translate-x-1 -translate-y-1/2',
                position === 'right' && 'left-0 top-1/2 -translate-x-1 -translate-y-1/2'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}