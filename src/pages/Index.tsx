import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, User, Target, Shield, Settings, Timer, ListChecks, Copy, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { Progress } from "@/components/ui/progress";
import { useUserProfile, getDaysUntilExam } from '@/hooks/useUserProfile';
import { useMockTestSessions } from '@/hooks/useExamPrep';

export default function Index() {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();
  const { data: sessions } = useMockTestSessions();

  const daysLeft = getDaysUntilExam(profile?.target_exam_date);

  const allWeakTopics = sessions?.flatMap(s => s.weak_topics || []) || [];
  const topicCounts = allWeakTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const weakTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(entry => entry[0]);

  const totalTests = sessions?.length || 0;
  const todaysGoal = {
    total: 10,
    completed: Math.min(10, totalTests),
    currentStreak: profile?.streak_count || 0,
  };
  
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

  const goalProgress = (todaysGoal.completed / todaysGoal.total) * 100;

  return (
    <Layout>
      <div className="min-h-full bg-background pb-10">
        {/* Header - Transparent Glassmorphism */}
        <header className="sticky top-0 z-40 glass-morphism w-full border-b border-white/20">
          <div className="container mx-auto max-w-5xl flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-sm ring-1 ring-white/20 lg:hidden">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="lg:hidden">
                <h1 className="text-lg font-extrabold tracking-tight leading-tight">নাহু শিখি</h1>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">এক্সাম ড্যাশবোর্ড</p>
              </div>
              <h1 className="hidden lg:block text-lg font-extrabold tracking-tight">ড্যাশবোর্ড</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/40" onClick={() => navigate('/progress')}>
                <User className="h-5 w-5 text-foreground/80" />
              </Button>
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-red-50 text-destructive/80" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-6 space-y-6 animate-in-fade">
          
          {/* Hero section with Today's Target */}
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 sm:p-8 text-primary-foreground shadow-elevated ring-1 ring-white/10">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Target className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">আসসালামু আলাইকুম!</h2>
                <p className="text-sm sm:text-base opacity-90 mt-1">আপনার দাখিল/আলিম পরীক্ষার প্রস্তুতি শুরু করুন।</p>
              </div>
              
              {daysLeft !== null && (
                <div className="bg-white/15 rounded-2xl px-4 py-3 flex items-center justify-between border border-white/20 max-w-xs">
                  <div>
                    <div className="text-3xl font-black">{daysLeft}</div>
                    <div className="text-xs opacity-80 font-medium">দিন বাকি</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {profile?.exam_class === 'alim' ? 'আলিম' : 'দাখিল'} পরীক্ষা
                    </div>
                    <div className="text-xs opacity-70">
                      {profile?.target_exam_date
                        ? new Date(profile.target_exam_date).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })
                        : ''}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-sm border border-white/20 max-w-md mt-2">
                <div className="flex items-center justify-between mb-3 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 bg-white/20 rounded-md p-0.5" />
                    <span>আজকের লক্ষ্য</span>
                  </div>
                  <span className="font-bold bg-white/20 px-2 py-1 rounded-full">{todaysGoal.completed} / {todaysGoal.total} MCQ</span>
                </div>
                <Progress value={goalProgress} className="h-2.5 bg-white/10" />
                <p className="text-xs mt-3 opacity-90 font-medium flex items-center gap-1.5">
                  <span className="text-amber-300">🔥</span> {todaysGoal.currentStreak} দিনের নিয়মিত অধ্যয়ন স্ট্রাইক চলছে!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold tracking-tight">🚀 দ্রুত শুরু করুন</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <div 
                  onClick={() => navigate('/mock-test')}
                  className="glass-card p-5 sm:p-6 rounded-[2rem] border border-indigo-100 cursor-pointer hover:scale-[1.02] hover:bg-white/90 transition-all duration-300 shadow-sm flex flex-col gap-3 sm:gap-4 group"
                >
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors border border-indigo-100">
                    <Timer className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">মডেল টেস্ট</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium line-clamp-1">৩০ মার্কের পরীক্ষা</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/question-bank')}
                  className="glass-card p-5 sm:p-6 rounded-[2rem] border border-blue-100 cursor-pointer hover:scale-[1.02] hover:bg-white/90 transition-all duration-300 shadow-sm flex flex-col gap-3 sm:gap-4 group"
                >
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors border border-blue-100">
                    <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">বোর্ড প্রশ্ন</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium line-clamp-1">বিগত সালের প্রশ্ন</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/revision')}
                  className="glass-card p-5 sm:p-6 rounded-[2rem] border border-amber-100 cursor-pointer hover:scale-[1.02] hover:bg-white/90 transition-all duration-300 shadow-sm flex flex-col gap-3 sm:gap-4 group"
                >
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors border border-amber-100">
                    <Copy className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">রিভিশন কার্ড</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium line-clamp-1">নিয়ম ও সংজ্ঞা</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/short-questions')}
                  className="glass-card p-5 sm:p-6 rounded-[2rem] border border-rose-100 cursor-pointer hover:scale-[1.02] hover:bg-white/90 transition-all duration-300 shadow-sm flex flex-col gap-3 sm:gap-4 group"
                >
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors border border-rose-100">
                    <ListChecks className="h-6 w-6 sm:h-7 sm:w-7 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">সংক্ষিপ্ত প্রশ্ন</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium line-clamp-1">মডেল উত্তরসহ</p>
                  </div>
                </div>
              </div>
              
              {weakTopics.length > 0 && (
                <div className="space-y-3 mt-8">
                  <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    দুর্বল টপিক
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {weakTopics.map((topic) => (
                      <div
                        key={topic}
                        onClick={() => navigate(`/question-bank`)}
                        className="glass-card p-4 rounded-2xl border border-red-100 cursor-pointer hover:bg-red-50/50 transition-colors"
                      >
                        <div className="text-sm font-bold text-gray-900 truncate">{topic}</div>
                        <div className="text-xs text-red-500 font-medium mt-1">অনুশীলন প্রয়োজন →</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Side Shortcuts */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold tracking-tight mb-4 hidden lg:block">⚙️ শর্টকাট</h2>
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-14 rounded-[1.25rem] border-dashed hover:bg-muted/50"
                  onClick={() => navigate('/tools')}
                >
                  <Settings className="mr-3 h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-[15px]">অন্যান্য টুলস (AI)</span>
                </Button>
                
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-14 rounded-[1.25rem] border-dashed bg-rose-50/30 text-rose-700 hover:text-rose-800 hover:bg-rose-50"
                    onClick={() => navigate('/admin')}
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    <span className="font-semibold text-[15px]">অ্যাডমিন প্যানেল</span>
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
