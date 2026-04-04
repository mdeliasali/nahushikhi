import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/auth" element={<div data-testid="auth-page">Auth Page</div>} />
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<div data-testid="admin-page">Admin Panel</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('লোডিং অবস্থায় স্পিনার দেখায়', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: true });
    renderWithRouter('/admin');
    expect(screen.getByText('লোড হচ্ছে...')).toBeInTheDocument();
  });

  it('লগইন ছাড়া /auth পেজে রিডাইরেক্ট করে', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: false });
    renderWithRouter('/admin');
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
  });

  it('নন-অ্যাডমিন ইউজারকে "প্রবেশ নিষেধ" মেসেজ দেখায়', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@test.com' },
      isAdmin: false,
      loading: false,
    });
    renderWithRouter('/admin');
    expect(screen.getByText('প্রবেশ নিষেধ')).toBeInTheDocument();
    expect(screen.getByText('হোমে ফিরে যান')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
  });

  it('অ্যাডমিন ইউজারকে অ্যাডমিন পেজ দেখায়', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'admin@test.com' },
      isAdmin: true,
      loading: false,
    });
    renderWithRouter('/admin');
    expect(screen.getByTestId('admin-page')).toBeInTheDocument();
    expect(screen.queryByText('প্রবেশ নিষেধ')).not.toBeInTheDocument();
  });
});
