import { useAuth } from '@/hooks/useAuth';
import { useFullCurriculum } from '@/hooks/useCurriculum';
import { useUserProgress } from '@/hooks/useProgress';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Shield, LogOut, BarChart3 } from 'lucide-react';
import CurriculumTree from '@/components/CurriculumTree';
import ProgressOverview from '@/components/ProgressOverview';

export default function Index() {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: curriculum, isLoading } = useFullCurriculum();
  const { data: progress } = useUserProgress();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const completedLessonIds = new Set(
    progress?.filter(p => p.completed).map(p => p.lesson_id) ?? []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">নাহু শিখি</h1>
              <p className="text-xs text-muted-foreground">আরবি ব্যাকরণ শেখার প্ল্যাটফর্ম</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/progress')}>
              <BarChart3 className="h-4 w-4 mr-1" />
              অগ্রগতি
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                <Shield className="h-4 w-4 mr-1" />
                অ্যাডমিন
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 max-w-4xl">
        <ProgressOverview
          curriculum={curriculum}
          completedLessonIds={completedLessonIds}
        />

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">📚 পাঠ্যক্রম</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : curriculum ? (
            <CurriculumTree
              modules={curriculum.modules}
              chapters={curriculum.chapters}
              lessons={curriculum.lessons}
              completedLessonIds={completedLessonIds}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              কোনো পাঠ্যক্রম পাওয়া যায়নি। অ্যাডমিন প্যানেল থেকে কন্টেন্ট যোগ করুন।
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
