import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Suppress console.error in tests since ErrorBoundary calls it
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

function ThrowingComponent({ message }: { message: string }): any {
  throw new Error(message);
}

function SafeComponent() {
  return <div data-testid="safe-child">সবকিছু ঠিক আছে</div>;
}

describe('ErrorBoundary', () => {
  afterEach(() => consoleSpy.mockClear());

  it('স্বাভাবিক অবস্থায় children রেন্ডার করে', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('safe-child')).toBeInTheDocument();
    expect(screen.getByText('সবকিছু ঠিক আছে')).toBeInTheDocument();
  });

  it('এরর হলে বাংলা ফলব্যাক UI দেখায়', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Test error" />
      </ErrorBoundary>
    );
    expect(screen.getByText('ওহ! কিছু সমস্যা হয়েছে')).toBeInTheDocument();
    expect(screen.getByText(/পুনরায় চেষ্টা করুন/)).toBeInTheDocument();
  });

  it('এরর হলে children রেন্ডার করে না', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Crash" />
      </ErrorBoundary>
    );
    expect(screen.queryByTestId('safe-child')).not.toBeInTheDocument();
  });
});
