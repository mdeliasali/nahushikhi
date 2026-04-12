import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, BookOpen, Layers, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    users: 0,
    boardQuestions: 0,
    revisionCards: 0,
    mockTests: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentTests, setRecentTests] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [
          { count: usersCount },
          { count: boardQCount },
          { count: cardsCount },
          { data: mockSessions }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('board_questions').select('*', { count: 'exact', head: true }),
          supabase.from('revision_cards').select('*', { count: 'exact', head: true }),
          supabase.from('mock_test_sessions').select('id, user_id, score_percent, created_at, profiles(display_name)').order('created_at', { ascending: false }).limit(20)
        ]);

        const sessions = mockSessions || [];
        const avg = sessions.length > 0 
          ? sessions.reduce((acc, curr) => acc + (curr.score_percent || 0), 0) / sessions.length 
          : 0;

        setStats({
          users: usersCount || 0,
          boardQuestions: boardQCount || 0,
          revisionCards: cardsCount || 0,
          mockTests: sessions.length,
          avgScore: Math.round(avg)
        });

        setRecentTests(sessions);
      } catch (e) {
        console.error('Failed to load stats', e);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-blue-600">📊 ইউজার পরিসংখ্যান ও ড্যাশবোর্ড</h2>
        <p className="text-xs text-muted-foreground mt-1">প্ল্যাটফর্মের সামগ্রিক পারফরম্যান্স</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl shadow-sm border">ডেটা লোড হচ্ছে...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-100">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Users className="h-6 w-6 text-indigo-500 mb-2" />
                <h3 className="text-2xl font-bold text-slate-800">{stats.users}</h3>
                <p className="text-xs text-slate-500 font-medium">নিবন্ধিত শিক্ষার্থী</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-100">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <BookOpen className="h-6 w-6 text-amber-500 mb-2" />
                <h3 className="text-2xl font-bold text-slate-800">{stats.boardQuestions}</h3>
                <p className="text-xs text-slate-500 font-medium">বোর্ড প্রশ্ন</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-100">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <HelpCircle className="h-6 w-6 text-emerald-500 mb-2" />
                <h3 className="text-2xl font-bold text-slate-800">{stats.revisionCards}</h3>
                <p className="text-xs text-slate-500 font-medium">রিভিশন কার্ড</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-6 w-6 text-rose-500 mb-2" />
                <div className="flex items-baseline gap-1">
                  <h3 className="text-2xl font-bold text-slate-800">{stats.mockTests}</h3>
                  <span className="text-sm font-medium text-slate-400">পরীক্ষা</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">গড় স্কোর: {stats.avgScore}%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                সাম্প্রতিক মক টেস্ট সেশন
              </CardTitle>
              <CardDescription className="text-xs">
                শিক্ষার্থীদের দেওয়া সর্বশেষ ২০টি মক টেস্টের ফলাফল
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentTests.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">এখনো কোনো পরীক্ষা দেওয়া হয়নি</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b">
                      <tr>
                        <th className="px-4 py-3">শিক্ষার্থী</th>
                        <th className="px-4 py-3">স্কোর</th>
                        <th className="px-4 py-3 text-right">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentTests.map((test) => (
                        <tr key={test.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-700">
                            {test.profiles?.display_name || 'অজ্ঞাত ইউজার'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              test.score_percent >= 80 ? 'bg-emerald-100 text-emerald-800' : 
                              test.score_percent >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {Math.round(test.score_percent || 0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-slate-500">
                            {format(new Date(test.created_at), 'dd MMM yyyy, hh:mm a')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
