import { describe, it, expect } from 'vitest';
import { 
  formatNumber, 
  formatCurrency, 
  formatCompactNumber, 
  formatAddress, 
  truncateText 
} from '../formatters';

describe('formatters', () => {
  describe('formatNumber', () => {
    it('formats number with default locale (pt-BR)', () => {
      expect(formatNumber(1234.56)).toBe('1.234,56');
    });

    it('formats number with custom locale (en-US)', () => {
      expect(formatNumber(1234.56, 'en-US')).toBe('1,234.56');
    });
  });

  describe('formatCurrency', () => {
    it('formats custom LUNES currency', () => {
      expect(formatCurrency(1000, 'pt-BR', 'LUNES')).toBe('1.000 LUNES');
    });

    it('formats custom LUSDT currency', () => {
      expect(formatCurrency(1000, 'pt-BR', 'LUSDT')).toBe('1.000 $');
    });

    it('formats standard USD currency', () => {
      // Note: exact output depends on node implementation of Intl, but usually includes symbol
      const result = formatCurrency(1000, 'en-US', 'USD');
      expect(result).toContain('$');
      expect(result).toContain('1,000.00');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats thousands', () => {
      // pt-BR uses 'mil' or 'k' depending on implementation, usually 'mil' or 'K'
      // Checking roughly for compact format
      const result = formatCompactNumber(1500, 'en-US');
      expect(result).toBe('1.5K');
    });

    it('formats millions', () => {
      const result = formatCompactNumber(1500000, 'en-US');
      expect(result).toBe('1.5M');
    });
  });

  describe('formatAddress', () => {
    it('truncates long address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(formatAddress(address)).toBe('0x1234...5678');
    });

    it('returns short address as is', () => {
      const address = '0x123';
      expect(formatAddress(address)).toBe('0x123');
    });
  });

  describe('truncateText', () => {
    it('truncates text longer than max length', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello...');
    });

    it('returns text shorter than max length as is', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });
  });
});
