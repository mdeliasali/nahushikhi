import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  curriculum?: {
    modules: any[];
    chapters: any[];
    lessons: any[];
  } | null;
  completedLessonIds: Set<string>;
}

export default function ProgressOverview({ curriculum, completedLessonIds }: Props) {
  const totalLessons = curriculum?.lessons.length ?? 0;
  const completedCount = completedLessonIds.size;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

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
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{pct}%</span>
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
