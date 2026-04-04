import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full gradient-primary animate-bounce shadow-elevated" />
          <span className="font-medium">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="glass-card rounded-3xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="h-16 w-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="h-8 w-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">প্রবেশ নিষেধ</h2>
          <p className="text-sm text-muted-foreground">এই পেজটি দেখার জন্য আপনার অ্যাডমিন অনুমতি নেই।</p>
          <a href="/" className="inline-block mt-4 px-6 py-2 rounded-xl gradient-primary text-white font-bold">
            হোমে ফিরে যান
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
