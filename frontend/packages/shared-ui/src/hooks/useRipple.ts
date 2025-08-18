import { useCallback, useState } from 'react';

/**
 * Interface para definir as propriedades de um ripple
 */
interface RippleItem {
  id: number;
  x: number;
  y: number;
  size: number;
}

/**
 * Hook personalizado para criar efeito ripple em botões
 * Implementa microinteração de feedback visual ao clicar
 * 
 * @returns Objeto contendo ripples ativos e função para criar novo ripple
 */
export const useRipple = () => {
  const [ripples, setRipples] = useState<RippleItem[]>([]);

  /**
   * Cria um novo ripple baseado na posição do clique
   * @param event - Evento de clique do mouse
   */
  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    // Calcula a posição relativa do clique dentro do elemento
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calcula o tamanho do ripple baseado na distância até o canto mais distante
    const size = Math.max(
      Math.sqrt((x - 0) ** 2 + (y - 0) ** 2),
      Math.sqrt((x - rect.width) ** 2 + (y - 0) ** 2),
      Math.sqrt((x - 0) ** 2 + (y - rect.height) ** 2),
      Math.sqrt((x - rect.width) ** 2 + (y - rect.height) ** 2)
    ) * 2;

    const newRipple: RippleItem = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove o ripple após a animação (600ms)
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  /**
   * Limpa todos os ripples ativos
   */
  const clearRipples = useCallback(() => {
    setRipples([]);
  }, []);

  return {
    ripples,
    createRipple,
    clearRipples,
  };
};