import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OptimizedImage from '../OptimizedImage';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('OptimizedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders placeholder initially when lazy loading', () => {
    render(<OptimizedImage src="test.jpg" alt="Test Image" />);
    // Should verify the skeleton/placeholder is present
    // Since we don't have easy access to the internal state, we check if img is hidden or not present yet
    // In the component implementation, img is rendered but opacity-0 if not loaded
    // But `shouldLoad` depends on isInView. If lazy, isInView is false initially.
    
    // If loading='lazy', and not in view, the <img /> tag might not even be rendered if `shouldLoad` is false.
    // Let's check component code: 
    // const shouldLoad = isInView || loading === 'eager';
    // {shouldLoad && ( ... <img ... /> )}
    
    const img = screen.queryByRole('img');
    expect(img).not.toBeInTheDocument();
  });

  it('renders image immediately when loading="eager"', () => {
    render(<OptimizedImage src="test.jpg" alt="Test Image" loading="eager" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test.jpg');
    expect(img).toHaveAttribute('alt', 'Test Image');
  });

  it('handles error state correctly', () => {
    render(<OptimizedImage src="invalid.jpg" alt="Test Image" loading="eager" />);
    const img = screen.getByRole('img');
    
    // Simulate error
    fireEvent.error(img);
    
    // Should show error fallback
    const errorText = screen.getByText('Image not available');
    expect(errorText).toBeInTheDocument();
  });
});
