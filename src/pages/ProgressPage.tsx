import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress, useQuizAttempts, useWeakTopics } from '@/hooks/useProgress';
import { useFullCurriculum } from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Trophy, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ProgressPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: progress } = useUserProgress();
  const { data: curriculum } = useFullCurriculum();
  const { data: attempts } = useQuizAttempts();
  const { data: weakTopics } = useWeakTopics();

  const totalLessons = curriculum?.lessons.length ?? 0;
  const completedLessons = progress?.filter(p => p.completed).length ?? 0;
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const avgScore = attempts && attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + (a.score / a.total_questions) * 100, 0) / attempts.length)
    : 0;

  const level = overallProgress < 20 ? 'Beginner' :
    overallProgress < 40 ? 'Elementary' :
    overallProgress < 60 ? 'Pre-Intermediate' :
    overallProgress < 80 ? 'Intermediate' : 'Advanced';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-semibold">📊 অগ্রগতি ও পরিসংখ্যান</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-3xl space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-3xl font-bold">{completedLessons}/{totalLessons}</p>
              <p className="text-xs text-muted-foreground">সম্পন্ন পাঠ</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 mx-auto text-accent mb-2" />
              <p className="text-3xl font-bold">{avgScore}%</p>
              <p className="text-xs text-muted-foreground">গড় কুইজ স্কোর</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              সামগ্রিক অগ্রগতি
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-3 mb-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{Math.round(overallProgress)}% সম্পন্ন</span>
              <span className="font-medium text-primary">🏅 {level}</span>
            </div>
          </CardContent>
        </Card>

        {/* Weak Topics */}
        {weakTopics && weakTopics.length > 0 && (
          <Card className="shadow-card border-warning/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                দুর্বল বিষয়সমূহ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weakTopics.slice(0, 10).map(wt => (
                  <div key={wt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{wt.topic}</span>
                    <span className="text-xs text-destructive font-medium">{wt.incorrect_count}x ভুল</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz History */}
        {attempts && attempts.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">📋 কুইজ ইতিহাস</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attempts.slice(0, 10).map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{new Date(a.completed_at).toLocaleDateString('bn-BD')}</span>
                    <span className={`text-sm font-medium ${a.score / a.total_questions >= 0.7 ? 'text-success' : 'text-destructive'}`}>
                      {a.score}/{a.total_questions}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
