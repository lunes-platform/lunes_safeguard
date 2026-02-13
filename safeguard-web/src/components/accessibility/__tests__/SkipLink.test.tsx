import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkipLink } from '../SkipLink';

describe('SkipLink Component', () => {
  it('renders skip link with correct text', () => {
    render(<SkipLink />);
    const skipLink = screen.getByText('Pular para o conteúdo principal');
    expect(skipLink).toBeInTheDocument();
  });

  it('has correct href attribute', () => {
    render(<SkipLink />);
    const skipLink = screen.getByRole('link');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('is initially hidden but becomes visible on focus', () => {
    render(<SkipLink />);
    const skipLink = screen.getByRole('link');
    
    // Initially positioned off-screen
    expect(skipLink).toHaveClass('-translate-y-full');
    
    // Becomes visible on focus
    fireEvent.focus(skipLink);
    expect(skipLink).toHaveClass('translate-y-0');
  });

  it('has proper accessibility attributes', () => {
    render(<SkipLink />);
    const skipLink = screen.getByRole('link');
    
    expect(skipLink).toHaveClass('sr-only', 'focus:not-sr-only');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('has proper styling for visibility', () => {
    render(<SkipLink />);
    const skipLink = screen.getByRole('link');
    
    expect(skipLink).toHaveClass(
      'absolute',
      'top-0',
      'left-0',
      'z-50',
      'bg-primary-600',
      'text-white',
      'px-4',
      'py-2',
      'rounded-br-md',
      'font-medium',
      'transition-transform',
      'duration-200'
    );
  });
});
