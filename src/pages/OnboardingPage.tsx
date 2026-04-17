import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [examClass, setExamClass] = useState<'dakhil' | 'alim'>('dakhil');
  const [examYear, setExamYear] = useState(new Date().getFullYear() + 1);
  const [examMonth, setExamMonth] = useState(4); // এপ্রিল ডিফল্ট
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    // পরীক্ষার তারিখ তৈরি করো (মাসের ১ তারিখ)
    const targetDate = new Date(examYear, examMonth - 1, 1).toISOString().split('T')[0];

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        exam_class: examClass,
        target_exam_date: targetDate,
        onboarding_completed: true,
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error('সংরক্ষণে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
      setLoading(false);
      return;
    }

    toast.success('প্রোফাইল সেট হয়েছে!');
    navigate('/');
  };

  const months = [
    { value: 1, label: 'জানুয়ারি' }, { value: 2, label: 'ফেব্রুয়ারি' },
    { value: 3, label: 'মার্চ' }, { value: 4, label: 'এপ্রিল' },
    { value: 5, label: 'মে' }, { value: 6, label: 'জুন' },
    { value: 7, label: 'জুলাই' }, { value: 8, label: 'আগস্ট' },
    { value: 9, label: 'সেপ্টেম্বর' }, { value: 10, label: 'অক্টোবর' },
    { value: 11, label: 'নভেম্বর' }, { value: 12, label: 'ডিসেম্বর' },
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* লোগো */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2.5rem] gradient-primary shadow-elevated">
            <BookOpen className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">স্বাগতম!</h1>
          <p className="text-muted-foreground font-medium">
            শুরু করার আগে কয়েকটি তথ্য দাও
          </p>
        </div>

        {/* ফর্ম */}
        <div className="glass-card rounded-[2.5rem] p-8 shadow-elevated space-y-6">

          {/* শ্রেণি নির্বাচন */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" /> তোমার পরীক্ষা
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExamClass('dakhil')}
                className={`p-4 rounded-2xl border-2 font-bold text-center transition-all ${
                  examClass === 'dakhil'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary/30 text-muted-foreground'
                }`}
              >
                <div className="text-lg">دخل</div>
                <div className="text-sm mt-1">দাখিল</div>
              </button>
              <button
                onClick={() => setExamClass('alim')}
                className={`p-4 rounded-2xl border-2 font-bold text-center transition-all ${
                  examClass === 'alim'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary/30 text-muted-foreground'
                }`}
              >
                <div className="text-lg">عالم</div>
                <div className="text-sm mt-1">আলিম</div>
              </button>
            </div>
          </div>

          {/* পরীক্ষার বছর */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> পরীক্ষার বছর
            </label>
            <div className="grid grid-cols-3 gap-3">
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setExamYear(y)}
                  className={`p-3 rounded-2xl border-2 font-bold text-center transition-all ${
                    examYear === y
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary/30 text-muted-foreground'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* পরীক্ষার মাস */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              পরীক্ষার মাস (আনুমানিক)
            </label>
            <select
              value={examMonth}
              onChange={e => setExamMonth(Number(e.target.value))}
              title="পরীক্ষার মাস নির্বাচন করুন"
              aria-label="পরীক্ষার মাস নির্বাচন করুন"
              className="w-full h-12 rounded-2xl border border-border bg-secondary/40 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-14 rounded-2xl gradient-primary text-base font-black tracking-wide group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                শুরু করো
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
