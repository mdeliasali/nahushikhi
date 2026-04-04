import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import SideNav from './SideNav';
import OfflineBanner from './OfflineBanner';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar — hidden on mobile/tablet */}
      {showNav && <SideNav />}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        <OfflineBanner />
        <main className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar ${showNav ? 'pb-[76px] lg:pb-0' : ''}`}>
          {children}
        </main>

        {/* Mobile/Tablet bottom nav — hidden on desktop */}
        {showNav && (
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
}
