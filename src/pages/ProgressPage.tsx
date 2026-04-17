import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import Layout from '@/components/Layout';
import { useMockTestSessions } from '@/hooks/useExamPrep';
import { Trophy, Target, History, BookOpen, AlertCircle, TrendingUp, BarChart3, User } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Navigate } from 'react-router-dom';

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: sessions, isLoading: sessionsLoading } = useMockTestSessions();

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

  // Calculate Metrics from sessions
  const totalTests = sessions?.length || 0;
  const highestScore = totalTests > 0 
    ? Math.max(...(sessions!.map(s => Number(s.score_percent) || 0))) 
    : 0;
  const averageScore = totalTests > 0
    ? (sessions!.reduce((acc, curr) => acc + (Number(curr.score_percent) || 0), 0) / totalTests).toFixed(1)
    : 0;

  // Aggregate Weak Topics across recent sessions
  const allWeakTopics = sessions?.flatMap(s => s.weak_topics || []) || [];
  const topicCounts = allWeakTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedWeakTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Top 5 weak topics
    .map(entry => entry[0]);

  // Overall Preparation Metric (mocked formula for now based on test counts and average)
  const preparationLevel = Math.min(100, Math.round((Number(averageScore) * 0.7) + (totalTests * 1.5)));

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 animate-in-fade pb-24">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-elevated mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 scale-150 rotate-12 transform -translate-y-10 translate-x-10">
            <Trophy className="w-64 h-64" />
          </div>
          
          <div className="h-24 w-24 rounded-[1.5rem] bg-white/20 backdrop-blur-md p-2 flex items-center justify-center shrink-0 border border-white/30 z-10">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-[1rem] object-cover" />
            ) : (
              <User className="h-12 w-12 text-white/90" />
            )}
          </div>
          <div className="text-center sm:text-left z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
              {user.user_metadata?.full_name || user.email?.split('@')[0] || "শিক্ষার্থী"}
            </h1>
            <p className="text-indigo-100 font-medium opacity-90 flex items-center justify-center sm:justify-start gap-1">
              <BookOpen className="w-4 h-4" /> {profile?.exam_class === 'alim' ? 'আলিম' : 'দাখিল'} পরীক্ষার্থী
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main KPI Stats */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-6 sm:p-8 rounded-[2rem] border border-black/5 shadow-sm">
              <h2 className="text-xl font-extrabold tracking-tight mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" /> পরীক্ষার প্রস্তুতি
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                      strokeDasharray={`${preparationLevel}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">{preparationLevel}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <div className="text-sm text-slate-500 font-semibold mb-1">মোট মক টেস্ট</div>
                    <div className="text-2xl font-black text-blue-700">{totalTests}</div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <div className="text-sm text-slate-500 font-semibold mb-1">সর্বোচ্চ স্কোর</div>
                    <div className="text-2xl font-black text-amber-600">{Number(highestScore).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Mock Tests */}
            <div className="glass-card p-6 sm:p-8 rounded-[2rem] border border-black/5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" /> বিগত মক টেস্ট
                </h2>
              </div>
              
              <div className="space-y-4">
                {sessionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />)}
                  </div>
                ) : !sessions || sessions.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">আপনি এখনও কোনো মক টেস্ট দেননি।</p>
                  </div>
                ) : (
                  sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${Number(session.score_percent) >= 80 ? 'bg-emerald-100 text-emerald-700' : Number(session.score_percent) >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {Number(session.score_percent).toFixed(0)}%
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">মডেল টেস্ট - {session.exam_class === 'alim' ? 'আলিম' : 'দাখিল'}</div>
                          <div className="text-xs font-semibold text-slate-400 mt-0.5">
                            {new Date(session.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric'})}
                          </div>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-slate-700">{session.correct_count} / {session.total_questions} সঠিক</div>
                        <div className="text-xs font-medium text-slate-400">{Math.floor((session.duration_seconds || 0) / 60)} মিনিট সময় লেগেছে</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Weak Topics & Leaderboard */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-[2rem] border border-black/5 shadow-sm bg-rose-50/30">
              <h2 className="text-lg font-extrabold tracking-tight mb-5 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" /> দুর্বল বিষয়সমূহ
              </h2>
              
              {sortedWeakTopics.length > 0 ? (
                <div className="space-y-3">
                  {sortedWeakTopics.map((topic, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded-xl border border-rose-100">
                      <span className="font-semibold text-slate-700 text-sm">{topic}</span>
                      <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded-md">পুনরালোচনা প্রয়োজন</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-white rounded-xl border border-rose-50">
                  <p className="text-sm text-slate-500 font-medium">কোনো দুর্বল বিষয় পাওয়া যায়নি!</p>
                </div>
              )}
            </div>
            
            <div className="glass-card p-6 rounded-[2rem] border border-black/5 shadow-sm">
              <h2 className="text-lg font-extrabold tracking-tight mb-5 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" /> লিডারবোর্ড র‍্যাঙ্ক
              </h2>
              
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                 <Trophy className="w-12 h-12 text-slate-300 mb-2" />
                 <h3 className="text-2xl font-black text-slate-800">#--</h3>
                 <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-widest text-center">আরও মক টেস্ট দিয়ে<br/>র‍্যাঙ্ক আনলক করুন</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
