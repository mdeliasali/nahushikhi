import { Home, BookOpen, Timer, User, Shield, Sparkles, Languages, PenLine, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { icon: Home, label: 'হোম', path: '/', id: 'nav-home' },
    { icon: BookOpen, label: 'প্রশ্নব্যাংক', path: '/question-bank', id: 'nav-qb' },
    { icon: Languages, label: 'অনুবাদ', path: '/translation', id: 'nav-translation' },
    { icon: PenLine, label: 'তাশকিল', path: '/tashkil', id: 'nav-tashkil' },
    { icon: FileText, label: 'ইনশা', path: '/insha', id: 'nav-insha' },
    { icon: Sparkles, label: 'তারকিব', path: '/tools/tarkib', id: 'nav-tools' },
    { icon: Timer, label: 'মক টেস্ট', path: '/mock-test', id: 'nav-mock' },
    { icon: User, label: 'প্রোফাইল', path: '/progress', id: 'nav-progress' },
  ];

  if (isAdmin) {
    navItems.push({ icon: Shield, label: 'অ্যাডমিন', path: '/admin', id: 'nav-admin' });
  }

  return (
    <nav className="w-full glass-card border-t border-white/40 px-2 py-3 safe-area-bottom flex justify-start sm:justify-around items-center rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] bg-white/70 backdrop-blur-2xl overflow-x-auto no-scrollbar gap-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.id}
            id={item.id}
            onClick={() => navigate(item.path)}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 transition-all duration-300 relative px-3 py-1.5 rounded-2xl ${
              isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <span className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 animate-in zoom-in-90 duration-300"></span>
            )}
            <item.icon className={`h-5 w-5 ${isActive ? 'fill-primary/20 stroke-[2.5px]' : 'stroke-2'}`} />
            <span className={`text-[10px] font-bold tracking-tight leading-none whitespace-nowrap transition-opacity ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
