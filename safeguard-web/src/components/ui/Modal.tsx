import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';

/**
 * Props do componente Modal
 */
export interface ModalProps {
  /** Se o modal está aberto */
  isOpen: boolean;
  /** Função chamada ao fechar o modal */
  onClose: () => void;
  /** Título do modal */
  title?: string;
  /** Conteúdo do modal */
  children: React.ReactNode;
  /** Tamanho do modal */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Se deve mostrar o botão de fechar */
  showCloseButton?: boolean;
  /** Se deve fechar ao clicar no overlay */
  closeOnOverlayClick?: boolean;
  /** Variante visual do modal */
  variant?: 'default' | 'glass';
  /** Classes CSS adicionais */
  className?: string;
  /** Props adicionais para o container */
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * Mapeamento de tamanhos para classes CSS
 */
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl'
};

/**
 * Componente Modal reutilizável
 * 
 * Funcionalidades:
 * - Overlay com backdrop blur
 * - Animações de entrada e saída
 * - Diferentes tamanhos
 * - Acessibilidade (ARIA, foco)
 * - Fechamento por ESC ou clique no overlay
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  containerProps = {}
}) => {
  /**
   * Manipula o fechamento do modal
   */
  const handleClose = () => {
    onClose();
  };

  /**
   * Manipula clique no overlay
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  /**
   * Manipula teclas pressionadas
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  /**
   * Effect para gerenciar o foco e scroll
   */
  React.useEffect(() => {
    if (isOpen) {
      // Previne scroll do body
      document.body.style.overflow = 'hidden';

      // Adiciona listener para ESC
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleEscKey);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          onKeyDown={handleKeyDown}
          {...containerProps}
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-lunes-dark/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden transition-all duration-300 ${variant === 'glass'
                ? 'bg-white/5 backdrop-blur-2xl border border-white/10'
                : 'bg-white'
              } ${className}`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-lunes-purple/20">
                {title && (
                  <h2 id="modal-title" className={`text-xl font-bold ${variant === 'glass' ? 'text-white' : 'text-lunes-dark'}`}>
                    {title}
                  </h2>
                )}

                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-lunes-purple hover:text-lunes-purple-dark transition-colors p-2 h-auto"
                    aria-label="Fechar modal"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;