import { render, waitFor } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DepositModal } from '../DepositModal';
import type { DepositModalProps } from '../DepositModal';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Wallet: () => <div data-testid="wallet-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Loader2: () => <div data-testid="loader-icon" />
}));

// Mock UI components
vi.mock('../ui', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
  Input: ({ ...props }: React.ComponentProps<'input'>) => <input {...props} />
}));

describe('DepositModal', () => {
  const defaultProps: DepositModalProps = {
    isOpen: true,
    onClose: vi.fn(),
    projectId: 1,
    projectName: 'Test Project',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<DepositModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('modals.deposit.title')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<DepositModal {...defaultProps} />);
    expect(screen.getByText('modals.deposit.title')).toBeInTheDocument();
  });

  it('should display project name', () => {
    render(<DepositModal {...defaultProps} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<DepositModal {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByTestId('x-icon').closest('button');
    fireEvent.click(closeButton!);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display deposit form elements', () => {
    render(<DepositModal {...defaultProps} />);
    
    expect(screen.getByText('modals.deposit.amount')).toBeInTheDocument();
    expect(screen.getByText('common.next')).toBeInTheDocument();
  });

  it('should handle amount input changes', async () => {
    render(<DepositModal {...defaultProps} />);
    
    // Find input by placeholder text
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '100' } });
    
    expect(amountInput).toHaveValue('100');
  });

  it('should validate minimum deposit amount', async () => {
    render(<DepositModal {...defaultProps} />);
    
    const amountInput = screen.getByPlaceholderText('0.00');
    const nextButton = screen.getByText('common.next');
    
    fireEvent.change(amountInput, { target: { value: '0' } });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('modals.deposit.errors.invalidAmount')).toBeInTheDocument();
    });
  });

  it('should handle successful deposit', async () => {
    render(<DepositModal {...defaultProps} />);
    
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '100' } });
    
    // Click next to go to confirm step
    const nextButton = screen.getByText('common.next');
    fireEvent.click(nextButton);
    
    // Now find and click the confirm button
    await waitFor(() => {
      const confirmButton = screen.getByText('modals.deposit.confirm');
      fireEvent.click(confirmButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('modals.deposit.success.title')).toBeInTheDocument();
    });
  });

  it('should handle deposit errors', async () => {
    render(<DepositModal {...defaultProps} />);
    
    const amountInput = screen.getByPlaceholderText('0.00');
    const nextButton = screen.getByText('common.next');
    
    // Simulate error by entering invalid amount
    fireEvent.change(amountInput, { target: { value: '-1' } });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('modals.deposit.errors.invalidAmount')).toBeInTheDocument();
    });
  });

  it('should close modal on successful deposit', async () => {
    const mockOnClose = vi.fn();
    render(<DepositModal {...defaultProps} onClose={mockOnClose} />);
    
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '100' } });
    
    // Click next to go to confirm step
    const nextButton = screen.getByText('common.next');
    fireEvent.click(nextButton);
    
    // Now find and click the confirm button
    await waitFor(() => {
      const confirmButton = screen.getByText('modals.deposit.confirm');
      fireEvent.click(confirmButton);
    });
    
    // Wait for success and close
    await waitFor(() => {
      const closeButton = screen.getByText('common.close');
      fireEvent.click(closeButton);
    });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display loading state during deposit', async () => {
    render(<DepositModal {...defaultProps} />);
    
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '100' } });
    
    // Click next to go to confirm step
    const nextButton = screen.getByText('common.next');
    fireEvent.click(nextButton);
    
    // Now find and click the confirm button
    await waitFor(() => {
      const confirmButton = screen.getByText('modals.deposit.confirm');
      fireEvent.click(confirmButton);
    });
    
    expect(screen.getByText('modals.deposit.processing.title')).toBeInTheDocument();
  });
});
