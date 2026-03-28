import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, TrendingUp } from 'lucide-react';

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
  const completed = completedLessonIds.size;
  const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

  const level = pct < 20 ? '🌱 Beginner' :
    pct < 40 ? '🌿 Elementary' :
    pct < 60 ? '🌿 Pre-Intermediate' :
    pct < 80 ? '🌳 Intermediate' : '🏆 Advanced';

  return (
    <Card className="shadow-card bg-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">আপনার অগ্রগতি</span>
          </div>
          <span className="text-sm font-medium">{level}</span>
        </div>
        <Progress value={pct} className="h-2.5 mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{completed}/{totalLessons} পাঠ সম্পন্ন</span>
          <span>{pct}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
