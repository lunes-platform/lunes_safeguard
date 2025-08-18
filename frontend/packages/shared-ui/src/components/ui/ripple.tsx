import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Interface para as propriedades do componente Ripple
 */
interface RippleProps {
  ripples: Array<{
    id: number;
    x: number;
    y: number;
    size: number;
  }>;
  color?: string;
}

/**
 * Componente Ripple para criar efeito de ondas em botões
 * Implementa microinteração de feedback visual Material Design
 * 
 * @param ripples - Array de ripples ativos para renderizar
 * @param color - Cor do efeito ripple (padrão: branco com opacidade)
 */
export const Ripple: React.FC<RippleProps> = ({ 
  ripples, 
  color = 'rgba(255, 255, 255, 0.6)' 
}) => {
  return (
    <>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={cn(
            'absolute rounded-full pointer-events-none',
            'animate-ripple'
          )}
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            transform: 'scale(0)',
            animation: 'ripple 600ms linear',
          }}
        />
      ))}
    </>
  );
};

// Adicionar as animações CSS ao arquivo de estilos globais
// @keyframes ripple {
//   to {
//     transform: scale(4);
//     opacity: 0;
//   }
// }