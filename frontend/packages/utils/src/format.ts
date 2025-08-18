/**
 * Formata um endereço de carteira para exibição, truncando-o.
 * ex: 0x1234...5678
 * @param address - O endereço da carteira.
 * @returns O endereço truncado.
 */
export const truncateAddress = (address: string | undefined): string => {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Formata um número como moeda, usando o padrão BRL (Real Brasileiro)
 * @param value - O número a ser formatado
 * @returns O número formatado como string no formato R$ 1.234,56
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata uma data para uma representação curta (dd/mm/yyyy)
 * @param date - O objeto Date ou string de data a ser formatada
 * @returns A data formatada como string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(d);
};

/**
 * Formata um número grande de forma abreviada (ex: 1.2k, 3M)
 * @param value - O número a ser formatado
 * @returns O número formatado de forma abreviada
 */
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
};