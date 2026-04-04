import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, RefreshCw } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function SmartPracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 pb-24 lg:pb-8 animate-in-fade">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-2xl hover:bg-black/5">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              স্মার্ট প্র্যাকটিস (Smart Practice)
            </h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Spaced Repetition System
            </p>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 md:p-8 space-y-8 shadow-elevated border-white/60">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">বর্তমান সেশন</span>
              <div className="text-sm font-bold text-primary">৩ / ১০ টি প্রশ্ন</div>
            </div>
            <div className="w-1/2">
              <Progress value={30} className="h-2" />
            </div>
          </div>

          <div className="text-center space-y-6 py-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/20 text-warning mb-2 shadow-inner">
              <RefreshCw className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">দুর্বল পয়েন্টগুলো ঝালাই করুন</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              আগের কুইজগুলোর আপনার ভুল করা উত্তরগুলোর উপর ভিত্তি করে এআই নতুন প্রশ্ন তৈরি করেছে।
            </p>

            <div className="bg-white/50 rounded-3xl p-8 border border-white mt-8 shadow-sm">
              <p className="text-base font-semibold mb-6">নিচের শব্দটির ধরন কী?</p>
              <p className="arabic-text text-4xl mb-8">يَكْتُبُ</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button variant="outline" className="h-14 rounded-2xl text-lg font-bold hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
                  ইসম
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl text-lg font-bold hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all bg-primary/5 border-primary/20 text-primary">
                  ফেল
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl text-lg font-bold hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
                  হরফ
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
