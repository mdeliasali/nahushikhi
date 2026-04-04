import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, TrendingUp, Sparkles, Flame } from 'lucide-react';
import { useUserProgress } from '@/hooks/useProgress';

export interface Module {
  id: string;
  title: string;
  [key: string]: any;
}

export interface Chapter {
  id: string;
  title: string;
  module_id: string;
  [key: string]: any;
}

export interface Lesson {
  id: string;
  title: string;
  chapter_id: string;
  [key: string]: any;
}

interface Props {
  curriculum?: {
    modules: Module[];
    chapters: Chapter[];
    lessons: Lesson[];
  } | null;
  completedLessonIds: Set<string>;
}

export default function ProgressOverview({ curriculum, completedLessonIds }: Props) {
  const totalLessons = curriculum?.lessons.length ?? 0;
  const completedCount = completedLessonIds.size;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const { data: progress } = useUserProgress();
  let streakCount = 0;
  if (progress && progress.length > 0) {
    const dates = progress
      .filter(p => p.completed && p.completed_at)
      .map(p => new Date(p.completed_at!).toISOString().split('T')[0])
      .sort((a, b) => b.localeCompare(a));
    
    const uniqueDates = [...new Set(dates)];
    
    if (uniqueDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let currentDateIndex = 0;
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        let expectedDate = uniqueDates[0];
        while (currentDateIndex < uniqueDates.length && uniqueDates[currentDateIndex] === expectedDate) {
          streakCount++;
          currentDateIndex++;
          const prevDay = new Date(new Date(expectedDate).getTime() - 86400000);
          expectedDate = prevDay.toISOString().split('T')[0];
        }
      }
    }
  }

  const level = pct < 20 ? '🌱 নতুন শুরু' :
    pct < 40 ? '🌿 প্রাথমিক' :
    pct < 60 ? '🌿 মাঝামাঝি' :
    pct < 80 ? '🌳 উন্নত' : '🏆 বিশেষজ্ঞ';

  return (
    <div className="animate-in-fade">
      <div className="glass-card rounded-3xl p-6 shadow-card relative overflow-hidden ring-1 ring-white/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">আপনার অগ্রগতি</span>
                <span className="text-base font-extrabold text-foreground">{level}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-2xl font-black text-primary leading-none">{pct}%</span>
              {streakCount > 0 && (
                <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full ring-1 ring-orange-100">
                  <Flame className="h-3 w-3 fill-orange-500" />
                  <span className="text-[10px] font-black">{streakCount} দিনের ধারা</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Progress value={pct} className="h-3 bg-primary/5" />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {completedCount} / {totalLessons} পাঠ সম্পন্ন
                </span>
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
