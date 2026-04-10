import { Home, BookOpen, Timer, Copy, User, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { icon: Home, label: 'হোম', path: '/', id: 'sidenav-home' },
    { icon: BookOpen, label: 'প্রশ্নব্যাংক', path: '/question-bank', id: 'sidenav-qb' },
    { icon: Timer, label: 'মক টেস্ট', path: '/mock-test', id: 'sidenav-mock' },
    { icon: Copy, label: 'রিভিশন', path: '/revision', id: 'sidenav-rev' },
    { icon: User, label: 'প্রোফাইল', path: '/progress', id: 'sidenav-progress' },
  ];

  if (isAdmin) {
    navItems.push({ icon: Shield, label: 'অ্যাডমিন', path: '/admin', id: 'sidenav-admin' });
  }

  return (
    <aside className="hidden lg:flex flex-col w-[260px] xl:w-[280px] h-screen sticky top-0 border-r border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-border/50">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-sm ring-1 ring-white/20">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight leading-tight">নাহু শিখি</h1>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">আরবি ব্যাকরণ শেখা</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              id={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left group ${
                isActive
                  ? 'bg-primary/10 text-primary font-bold shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-sm font-semibold">{item.label}</span>
              {isActive && (
                <span className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-border/50">
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
          © {new Date().getFullYear()} নাহু শিখি
        </p>
      </div>
    </aside>
  );
}
