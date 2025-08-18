import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

/**
 * Posições disponíveis para o tooltip
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/**
 * Variantes visuais do tooltip
 */
export type TooltipVariant = 'default' | 'dark' | 'light' | 'success' | 'warning' | 'error';

/**
 * Interface para as propriedades do Tooltip
 */
export interface TooltipProps {
  /**
   * Conteúdo do tooltip
   */
  content: React.ReactNode;
  /**
   * Elemento que ativa o tooltip
   */
  children: React.ReactNode;
  /**
   * Posição do tooltip
   */
  position?: TooltipPosition;
  /**
   * Variante visual
   */
  variant?: TooltipVariant;
  /**
   * Delay para mostrar o tooltip (ms)
   */
  showDelay?: number;
  /**
   * Delay para esconder o tooltip (ms)
   */
  hideDelay?: number;
  /**
   * Se o tooltip deve ser desabilitado
   */
  disabled?: boolean;
  /**
   * Classes CSS adicionais
   */
  className?: string;
  /**
   * Classes CSS para o conteúdo do tooltip
   */
  contentClassName?: string;
  /**
   * Se o tooltip deve seguir o cursor
   */
  followCursor?: boolean;
  /**
   * Offset do tooltip em pixels
   */
  offset?: number;
}

/**
 * Hook para calcular a posição do tooltip
 */
function useTooltipPosition(
  triggerRef: React.RefObject<HTMLElement>,
  tooltipRef: React.RefObject<HTMLDivElement>,
  position: TooltipPosition,
  offset: number,
  followCursor: boolean,
  mousePosition: { x: number; y: number }
) {
  const [calculatedPosition, setCalculatedPosition] = useState<{
    top: number;
    left: number;
    position: Exclude<TooltipPosition, 'auto'>;
  }>({ top: 0, left: 0, position: 'top' });

  useEffect(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let finalPosition = position === 'auto' ? 'top' : position;
    let top = 0;
    let left = 0;

    if (followCursor) {
      // Posicionar próximo ao cursor
      top = mousePosition.y + offset;
      left = mousePosition.x + offset;
      
      // Ajustar se sair da viewport
      if (left + tooltipRect.width > viewportWidth) {
        left = mousePosition.x - tooltipRect.width - offset;
      }
      if (top + tooltipRect.height > viewportHeight) {
        top = mousePosition.y - tooltipRect.height - offset;
      }
    } else {
      // Calcular posição baseada no elemento trigger
      const positions = {
        top: {
          top: triggerRect.top - tooltipRect.height - offset,
          left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
        },
        bottom: {
          top: triggerRect.bottom + offset,
          left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
        },
        left: {
          top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
          left: triggerRect.left - tooltipRect.width - offset,
        },
        right: {
          top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
          left: triggerRect.right + offset,
        },
      };

      // Auto-posicionamento: escolher a melhor posição
      if (position === 'auto') {
        const spaceTop = triggerRect.top;
        const spaceBottom = viewportHeight - triggerRect.bottom;
        const spaceLeft = triggerRect.left;
        const spaceRight = viewportWidth - triggerRect.right;

        const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
        
        if (maxSpace === spaceTop && spaceTop >= tooltipRect.height + offset) {
          finalPosition = 'top';
        } else if (maxSpace === spaceBottom && spaceBottom >= tooltipRect.height + offset) {
          finalPosition = 'bottom';
        } else if (maxSpace === spaceLeft && spaceLeft >= tooltipRect.width + offset) {
          finalPosition = 'left';
        } else {
          finalPosition = 'right';
        }
      }

      const pos = positions[finalPosition as keyof typeof positions];
      top = pos.top;
      left = pos.left;

      // Ajustar se sair da viewport
      if (left < 0) left = 8;
      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - 8;
      }
      if (top < 0) top = 8;
      if (top + tooltipRect.height > viewportHeight) {
        top = viewportHeight - tooltipRect.height - 8;
      }
    }

    setCalculatedPosition({
      top: top + window.scrollY,
      left: left + window.scrollX,
      position: finalPosition as Exclude<TooltipPosition, 'auto'>,
    });
  }, [triggerRef, tooltipRef, position, offset, followCursor, mousePosition]);

  return calculatedPosition;
}

/**
 * Componente Tooltip com posicionamento automático e animações
 * 
 * @example
 * ```tsx
 * <Tooltip content="Clique para salvar" position="top">
 *   <Button>Salvar</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'auto',
  variant = 'default',
  showDelay = 500,
  hideDelay = 0,
  disabled = false,
  className,
  contentClassName,
  followCursor = false,
  offset = 8,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const calculatedPosition = useTooltipPosition(
    triggerRef,
    tooltipRef,
    position,
    offset,
    followCursor,
    mousePosition
  );

  const showTooltip = () => {
    if (disabled) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
  };

  const hideTooltip = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (followCursor) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const variantStyles = {
    default: 'bg-gray-900 text-white border-gray-700',
    dark: 'bg-black text-white border-gray-800',
    light: 'bg-white text-gray-900 border-gray-200 shadow-lg',
    success: 'bg-green-600 text-white border-green-500',
    warning: 'bg-yellow-500 text-white border-yellow-400',
    error: 'bg-red-600 text-white border-red-500',
  };

  const arrowStyles = {
    default: 'border-gray-900',
    dark: 'border-black',
    light: 'border-white',
    success: 'border-green-600',
    warning: 'border-yellow-500',
    error: 'border-red-600',
  };

  const getArrowClasses = (pos: string) => {
    const base = 'absolute w-0 h-0 border-4 border-solid';
    const arrowColor = arrowStyles[variant];
    
    switch (pos) {
      case 'top':
        return `${base} ${arrowColor} border-t-transparent border-l-transparent border-r-transparent top-full left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${base} ${arrowColor} border-b-transparent border-l-transparent border-r-transparent bottom-full left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${base} ${arrowColor} border-l-transparent border-t-transparent border-b-transparent left-full top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${base} ${arrowColor} border-r-transparent border-t-transparent border-b-transparent right-full top-1/2 transform -translate-y-1/2`;
      default:
        return '';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={cn('inline-block', className)}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onMouseMove={handleMouseMove}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      
      {isVisible && !disabled && createPortal(
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-50 px-3 py-2 text-sm font-medium rounded-md border',
            'transition-all duration-200 ease-out',
            'animate-in fade-in-0 zoom-in-95',
            variantStyles[variant],
            contentClassName
          )}
          style={{
            top: calculatedPosition.top,
            left: calculatedPosition.left,
          }}
          role="tooltip"
        >
          {content}
          {!followCursor && (
            <div className={getArrowClasses(calculatedPosition.position)} />
          )}
        </div>,
        document.body
      )}
    </>
  );
};

/**
 * Hook para controlar tooltips programaticamente
 */
export const useTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState<React.ReactNode>('');
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const show = (newContent: React.ReactNode, x: number, y: number) => {
    setContent(newContent);
    setPosition({ x, y });
    setIsVisible(true);
  };

  const hide = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    content,
    position,
    show,
    hide,
  };
};

export default Tooltip;