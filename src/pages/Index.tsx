import { useAuth } from '@/hooks/useAuth';
import { useFullCurriculum } from '@/hooks/useCurriculum';
import { useUserProgress } from '@/hooks/useProgress';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Shield, LogOut, User } from 'lucide-react';
import CurriculumTree from '@/components/CurriculumTree';
import ProgressOverview from '@/components/ProgressOverview';
import Layout from '@/components/Layout';

export default function Index() {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: curriculum, isLoading } = useFullCurriculum();
  const { data: progress } = useUserProgress();

  if (authLoading) {
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

  const completedLessonIds = new Set<string>(
    progress?.filter(p => p.completed).map(p => p.lesson_id as string) ?? []
  );

  return (
    <Layout>
      <div className="min-h-full bg-background pb-10">
        {/* Header - Transparent Glassmorphism */}
        <header className="sticky top-0 z-40 glass-morphism w-full border-b border-white/20">
          <div className="container mx-auto max-w-5xl flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Hide brand in header on desktop since sidebar shows it */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-sm ring-1 ring-white/20 lg:hidden">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="lg:hidden">
                <h1 className="text-lg font-extrabold tracking-tight leading-tight">নাহু শিখি</h1>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">আরবি ব্যাকরণ</p>
              </div>
              <h1 className="hidden lg:block text-lg font-extrabold tracking-tight">ড্যাশবোর্ড</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 rounded-full hover:bg-white/40"
                onClick={() => navigate('/progress')}
              >
                <User className="h-5 w-5 text-foreground/80" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="w-10 h-10 rounded-full hover:bg-red-50 text-destructive/80"
                onClick={signOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-6 space-y-6 animate-in-fade">
          {/* Hero section */}
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 sm:p-8 text-primary-foreground shadow-elevated ring-1 ring-white/10">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <BookOpen className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <h2 className="text-2xl sm:text-3xl font-bold">আসসালামু আলাইকুম!</h2>
              <p className="text-sm sm:text-base opacity-90">আপনার আজকের পাঠ শুরু করুন।</p>
            </div>
          </div>

          {/* Two-column layout on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content (curriculum) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold tracking-tight">📚 পাঠ্যক্রম</h2>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {curriculum?.lessons?.length || 0} টি পাঠ
                  </span>
                </div>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 rounded-2xl bg-muted/60 animate-pulse border border-white/20 shadow-sm" />
                    ))}
                  </div>
                ) : curriculum ? (
                  <div className="animate-in-fade">
                    <CurriculumTree
                      modules={curriculum.modules}
                      chapters={curriculum.chapters}
                      lessons={curriculum.lessons}
                      completedLessonIds={completedLessonIds}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 glass-card rounded-3xl">
                    <p className="text-muted-foreground font-medium mb-4">কোনো পাঠ্যক্রম পাওয়া যায়নি।</p>
                    {isAdmin && (
                      <Button variant="outline" onClick={() => navigate('/admin')} className="rounded-xl">
                        <Shield className="mr-2 h-4 w-4" /> অ্যাডমিন প্যানেল
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar content (progress overview) — on desktop it's a sidebar, on mobile it's above curriculum */}
            <div className="order-first lg:order-last space-y-6">
              <ProgressOverview
                curriculum={curriculum}
                completedLessonIds={completedLessonIds}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
