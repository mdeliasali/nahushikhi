import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress, useQuizAttempts, useWeakTopics } from '@/hooks/useProgress';
import { useFullCurriculum } from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Trophy, AlertTriangle, TrendingUp, Calendar, Zap } from 'lucide-react';
import Layout from '@/components/Layout';

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

  const level = overallProgress < 20 ? 'নতুন শুরু' :
    overallProgress < 40 ? 'প্রাথমিক' :
    overallProgress < 60 ? 'মাঝামাঝি' :
    overallProgress < 80 ? 'উন্নত' : 'বিশেষজ্ঞ';

  return (
    <Layout>
      <div className="min-h-full bg-[#FDFCFB] pb-10">
        <header className="sticky top-0 z-50 glass-morphism w-full">
          <div className="container mx-auto max-w-5xl flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-black/5"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-sm font-extrabold tracking-tight">📊 অগ্রগতি ও পরিসংখ্যান</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8 animate-in-fade">
          {/* Dashboard Summary */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card rounded-[2rem] p-6 shadow-card ring-1 ring-white/40 flex flex-col items-center text-center group active:scale-95 transition-transform">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/20">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-black text-foreground leading-none">{completedLessons}/{totalLessons}</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-2">পাঠ সম্পন্ন</p>
            </div>
            
            <div className="glass-card rounded-[2rem] p-6 shadow-card ring-1 ring-white/40 flex flex-col items-center text-center group active:scale-95 transition-transform">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4 transition-colors group-hover:bg-amber-200">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-foreground leading-none">{avgScore}%</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-2">কুইজ স্কোর</p>
            </div>
          </section>

          {/* Overall Progress Section */}
          <section className="glass-card rounded-[2.5rem] p-8 shadow-elevated relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
               <TrendingUp className="w-24 h-24" />
             </div>
             
             <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black text-primary tracking-widest">সামগ্রিক দক্ষতা</span>
                    <h2 className="text-2xl font-black text-foreground leading-none tracking-tight">{level}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-primary leading-none">{Math.round(overallProgress)}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                   <Progress value={overallProgress} className="h-4 bg-primary/5 rounded-full" />
                   <div className="flex items-center gap-1.5 justify-end">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {totalLessons - completedLessons} পাঠ বাকি
                      </span>
                   </div>
                </div>
             </div>
          </section>

          {/* Weak Topics with refined styling */}
          {weakTopics && weakTopics.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 ml-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">দুর্বল বিষয়সমূহ</h3>
              </div>
              
              <div className="glass-card rounded-[2rem] p-6 shadow-card space-y-2">
                {weakTopics.slice(0, 5).map(wt => (
                  <div key={wt.id} className="flex items-center justify-between py-4 border-b border-black/5 last:border-0 group">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{wt.topic}</span>
                      <span className="text-[10px] font-medium text-muted-foreground">অধিক অনুশীলনের প্রয়োজন</span>
                    </div>
                    <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider ring-1 ring-red-100">
                      {wt.incorrect_count} বার ভুল
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* History / Recent Activity */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">সাম্প্রতিক কুইজ</h3>
            </div>
            
            <div className="space-y-3">
              {attempts && attempts.length > 0 ? (
                attempts.slice(0, 5).map(a => (
                  <div key={a.id} className="glass-card rounded-2xl p-4 shadow-sm flex items-center justify-between ring-1 ring-black/5 hover:ring-primary/20 transition-all active:scale-98">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">কুইজ সেশন</span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {new Date(a.completed_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                      a.score / a.total_questions >= 0.7 
                      ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' 
                      : 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'
                    }`}>
                      {a.score} / {a.total_questions}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 glass-card rounded-3xl opacity-50">
                  <p className="text-sm font-bold">এখনো কুইজ দেয়া হয়নি</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
