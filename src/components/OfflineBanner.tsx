import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="sticky top-0 z-[100] w-full bg-amber-400 text-amber-950 px-4 py-2 flex items-center justify-center gap-2 shadow-sm font-medium animate-in slide-in-from-top-full">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm">⚠️ ইন্টারনেট সংযোগ নেই। অফলাইন মোডে আছেন।</span>
    </div>
  );
}
