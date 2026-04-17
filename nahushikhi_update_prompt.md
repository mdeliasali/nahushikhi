# নাহু শিখি — সম্পূর্ণ আপডেট প্রম্পট

---

## প্রেক্ষাপট (Context)

তুমি একটি React + TypeScript + Supabase অ্যাপ আপডেট করছ।
অ্যাপের নাম: **নাহু শিখি** — মাদ্রাসা পরীক্ষার্থীদের (দাখিল/আলিম) জন্য আরবি ব্যাকরণ প্রস্তুতির অ্যাপ।

**মূল দর্শন:** শিক্ষার্থী পরীক্ষায় পাস করতে চায়। তাই সব কিছু পরীক্ষার প্রশ্নকেন্দ্রিক।

**কেন্দ্রীয় শিক্ষা চক্র:**
> অনুশীলন → ভুল → পাঠ পড়ো → ফিরে চেষ্টা → প্রগ্রেসে সেভ

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Supabase (Auth, Database, Edge Functions)
- State: TanStack Query (React Query)
- Routing: React Router v6

**বিদ্যমান ফাইল স্ট্রাকচার যা ইতিমধ্যে ঠিক আছে এবং পরিবর্তন করবে না:**
- `src/integrations/supabase/` — সম্পূর্ণ রাখো
- `src/components/ui/` — সব shadcn কম্পোনেন্ট রাখো
- `src/hooks/useAuth.tsx` — রাখো, শুধু `useUserProfile` যোগ করো
- `src/pages/BoardQuestionsPage.tsx` — রাখো, পরিবর্তন নেই
- `src/pages/MockTestPage.tsx` — রাখো, পরিবর্তন নেই
- `src/pages/TarkibPage.tsx` — রাখো (শুধু তাহকিক ট্যাব যোগ করো)
- `src/pages/RevisionCardsPage.tsx` — রাখো, পরিবর্তন নেই
- `src/pages/ShortQuestionsPage.tsx` — রাখো, পরিবর্তন নেই
- `src/pages/LessonPage.tsx` — রাখো, পরিবর্তন নেই
- `src/pages/ProgressPage.tsx` — রাখো, পরিবর্তন নেই
- `src/pages/Admin.tsx` এবং সব `src/components/admin/` — রাখো
- `supabase/migrations/` — রাখো, নিচে একটি নতুন মাইগ্রেশন যোগ করবে
- `supabase/functions/analyze-sentence/` — রাখো

---

## পরিবর্তন ১: ফাইল ডিলিট করো

নিচের ফাইলগুলো **ডিলিট** করো। এগুলো placeholder ছিল, এখন আর দরকার নেই:

```
src/pages/VerbBuilderPage.tsx
src/pages/RealArabicPage.tsx
src/pages/SmartPracticePage.tsx
src/pages/MorphologyPage.tsx
```

---

## পরিবর্তন ২: App.tsx আপডেট করো

`src/App.tsx` থেকে ডিলিট করা পেজের route সরাও এবং নতুন `/onboarding` route যোগ করো।

```tsx
// এই import গুলো সরাও:
// import VerbBuilderPage from "./pages/VerbBuilderPage";
// import RealArabicPage from "./pages/RealArabicPage";
// import SmartPracticePage from "./pages/SmartPracticePage";
// import MorphologyPage from "./pages/MorphologyPage";

// এই নতুন import যোগ করো:
import OnboardingPage from "./pages/OnboardingPage";

// Routes-এ এই route গুলো সরাও:
// <Route path="/real-arabic/:lessonId" element={<RealArabicPage />} />
// <Route path="/smart-practice/:lessonId" element={<SmartPracticePage />} />
// <Route path="/tools/morphology" element={<MorphologyPage />} />
// <Route path="/tools/verb-builder" element={<VerbBuilderPage />} />

// Routes-এ এই নতুন route যোগ করো (auth route-এর পরে):
<Route path="/onboarding" element={<OnboardingPage />} />
```

---

## পরিবর্তন ৩: নতুন ফাইল তৈরি করো — `src/pages/OnboardingPage.tsx`

প্রথমবার সাইন-আপের পরে এই পেজ আসবে। এটি ইউজারের `target_exam_date` এবং পরীক্ষার বছর সেভ করবে।

```tsx
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
      .from('user_profiles')
      .upsert({
        id: user.id,
        exam_class: examClass,
        target_exam_date: targetDate,
      });

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
              className="w-full h-12 rounded-2xl border border-border bg-secondary/40 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
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
```

---

## পরিবর্তন ৪: `src/hooks/useAuth.tsx` আপডেট করো

`Auth.tsx`-এ sign-up হলে `/onboarding`-এ redirect হবে। `useAuth.tsx`-এ `signUp` ফাংশনের রিটার্ন ভ্যালুতে `needsOnboarding: true` যোগ করো:

```tsx
// signUp ফাংশন পরিবর্তন করো:
const signUp = async (email: string, password: string, displayName: string, examClass: string = 'dakhil') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, exam_class: examClass },
      emailRedirectTo: window.location.origin,
    },
  });
  return { error: error as Error | null, needsOnboarding: !error && !!data.user };
};
```

`Auth.tsx`-এ `handleSignUp` আপডেট করো:

```tsx
const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  const form = new FormData(e.currentTarget);
  const { error, needsOnboarding } = await signUp(
    form.get('email') as string,
    form.get('password') as string,
    form.get('displayName') as string,
    form.get('examClass') as string
  );
  if (error) {
    toast.error(error.message);
  } else {
    toast.success('অ্যাকাউন্ট তৈরি হয়েছে!');
    if (needsOnboarding) navigate('/onboarding');
  }
  setLoading(false);
};
```

---

## পরিবর্তন ৫: নতুন hook — `src/hooks/useUserProfile.tsx`

এই hook টি তৈরি করো। এটি ইউজারের `user_profiles` টেবিল থেকে শ্রেণি ও পরীক্ষার তারিখ পড়বে।

```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user_profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('exam_class, target_exam_date, streak_count, best_mock_score')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// পরীক্ষার কাউন্টডাউন হিসাব করার utility
export function getDaysUntilExam(targetExamDate: string | null | undefined): number | null {
  if (!targetExamDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(targetExamDate);
  const diff = examDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
```

---

## পরিবর্তন ৬: `src/pages/Index.tsx` আপডেট করো (হোম পেজ)

হোম পেজে **৩টি গুরুত্বপূর্ণ জিনিস** যোগ করো:

### ৬.১ — পরীক্ষার কাউন্টডাউন ব্যানার

Hero সেকশনের উপরে অথবা ভেতরে নিচের কোড যোগ করো:

```tsx
import { useUserProfile, getDaysUntilExam } from '@/hooks/useUserProfile';
import { useMockTestSessions } from '@/hooks/useExamPrep';

// কম্পোনেন্টের ভেতরে:
const { data: profile } = useUserProfile();
const { data: sessions } = useMockTestSessions();
const daysLeft = getDaysUntilExam(profile?.target_exam_date);

// দুর্বল টপিক বের করো mock test sessions থেকে:
const allWeakTopics = sessions?.flatMap(s => s.weak_topics || []) || [];
const topicCounts = allWeakTopics.reduce((acc, topic) => {
  acc[topic] = (acc[topic] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
const weakTopics = Object.entries(topicCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 4)
  .map(entry => entry[0]);
```

Hero কার্ডের ভেতরে (আজকের লক্ষ্যের উপরে) কাউন্টডাউন যোগ করো:

```tsx
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
```

### ৬.২ — দুর্বল টপিক সেকশন

Quick Actions গ্রিডের নিচে, যদি `weakTopics.length > 0` হলে এই সেকশন দেখাও:

```tsx
{weakTopics.length > 0 && (
  <div className="space-y-3">
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
```

### ৬.৩ — `todaysGoal` mock data সরিয়ে real data দাও

```tsx
// পুরনো mock data সরাও:
// const todaysGoal = { total: 50, completed: 15, currentStreak: 3 };

// নতুন real data:
const totalTests = sessions?.length || 0;
const todaysGoal = {
  total: 10,
  completed: Math.min(10, totalTests),
  currentStreak: profile?.streak_count || 0,
};
```

---

## পরিবর্তন ৭: `src/pages/TarkibPage.tsx` আপডেট করো

পেজের উপরে দুটো ট্যাব যোগ করো: **তারকিব** এবং **তাহকিক (শব্দ বিশ্লেষণ)**।

তারকিব বিশ্লেষণের বিদ্যমান কোড একটি ট্যাবে রাখো। দ্বিতীয় ট্যাবে নিচের তাহকিক UI যোগ করো:

```tsx
// ফাইলের শুরুতে নতুন state যোগ করো:
const [activeTab, setActiveTab] = useState<'tarkib' | 'tahkik'>('tarkib');
const [tahkikInput, setTahkikInput] = useState('');
const [tahkikResult, setTahkikResult] = useState<string | null>(null);
const [tahkikLoading, setTahkikLoading] = useState(false);

// তাহকিক analyze ফাংশন:
const handleTahkik = async () => {
  if (!tahkikInput.trim()) return;
  setTahkikLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke('analyze-sentence', {
      body: {
        sentence: tahkikInput,
        mode: 'tahkik', // শব্দ বিশ্লেষণ মোড
      },
    });
    if (error) throw error;
    setTahkikResult(data?.analysis || data?.text || JSON.stringify(data));
  } catch (err) {
    toast.error('বিশ্লেষণে সমস্যা হয়েছে');
  } finally {
    setTahkikLoading(false);
  }
};

// JSX-এ বিদ্যমান পেজের একদম উপরে (ArrowLeft button-এর নিচে) ট্যাব যোগ করো:
<div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl w-fit">
  <button
    onClick={() => setActiveTab('tarkib')}
    className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
      activeTab === 'tarkib' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
    }`}
  >
    তারকিব বিশ্লেষণ
  </button>
  <button
    onClick={() => setActiveTab('tahkik')}
    className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
      activeTab === 'tahkik' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
    }`}
  >
    তাহকিক (শব্দ)
  </button>
</div>

// বিদ্যমান তারকিব কনটেন্টকে: {activeTab === 'tarkib' && ( ... )} দিয়ে wrap করো

// তাহকিক ট্যাবের কনটেন্ট:
{activeTab === 'tahkik' && (
  <div className="glass-card rounded-[2rem] p-6 space-y-4">
    <div>
      <h2 className="text-lg font-black">তাহকিক — শব্দ বিশ্লেষণ</h2>
      <p className="text-sm text-muted-foreground mt-1">
        যেকোনো আরবি শব্দের মূল (জযর), ওজন, ইরাব ও অর্থ বিশ্লেষণ করো
      </p>
    </div>
    <div className="flex gap-3">
      <Input
        value={tahkikInput}
        onChange={e => setTahkikInput(e.target.value)}
        placeholder="আরবি শব্দ লেখো... যেমন: الْمُجْتَهِدُ"
        className="text-right font-serif text-lg h-12 rounded-2xl flex-1"
        dir="rtl"
      />
      <Button
        onClick={handleTahkik}
        disabled={tahkikLoading || !tahkikInput.trim()}
        className="h-12 px-6 rounded-2xl font-bold"
      >
        {tahkikLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : 'বিশ্লেষণ'}
      </Button>
    </div>
    {tahkikResult && (
      <div className="bg-secondary/30 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium">
        {tahkikResult}
      </div>
    )}
  </div>
)}
```

---

## পরিবর্তন ৮: `src/pages/ToolsPage.tsx` আপডেট করো

tools array থেকে `verb-builder` এবং `morphology` এন্ট্রি সরাও। শুধু `tarkib` রাখো এবং `/tools/tarkib` route-কে সরাসরি `/tools` এ মার্জ করো অথবা ToolsPage থেকে সরাসরি TarkibPage-এ redirect করো:

```tsx
// ToolsPage.tsx সহজ করো — শুধু tarkib লিঙ্ক রাখো
// অথবা useEffect দিয়ে সরাসরি /tools/tarkib এ navigate করো:

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ToolsPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/tools/tarkib', { replace: true });
  }, []);
  return null;
}
```

---

## পরিবর্তন ৯: `src/components/BottomNav.tsx` আপডেট করো

BottomNav-এ পাঠ্যক্রম এবং AI টুলস সরাসরি যোগ করো:

```tsx
const navItems = [
  { icon: Home, label: 'হোম', path: '/', id: 'nav-home' },
  { icon: BookOpen, label: 'প্রশ্নব্যাংক', path: '/question-bank', id: 'nav-qb' },
  { icon: Timer, label: 'মক টেস্ট', path: '/mock-test', id: 'nav-mock' },
  { icon: Sparkles, label: 'তারকিব', path: '/tools/tarkib', id: 'nav-tools' },  // নতুন
  { icon: User, label: 'প্রোফাইল', path: '/progress', id: 'nav-progress' },
];
// Sparkles lucide-react থেকে import করো
```

---

## পরিবর্তন ১০: নতুন Supabase মাইগ্রেশন ফাইল

`supabase/migrations/` ফোল্ডারে নতুন ফাইল তৈরি করো (নাম: বর্তমান timestamp + `_add_onboarding_check.sql`):

```sql
-- user_profiles টেবিলে onboarding_completed কলাম যোগ করো
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- user নতুন সাইনআপ করলে profile তৈরি হওয়ার trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, exam_class, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'exam_class')::exam_class, 'dakhil'),
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- OnboardingPage সাবমিট করলে true হবে
-- (OnboardingPage.tsx থেকে upsert call করার সময় onboarding_completed: true যোগ করো)
```

`OnboardingPage.tsx`-এ `upsert` call আপডেট করো:

```tsx
const { error } = await supabase
  .from('user_profiles')
  .upsert({
    id: user.id,
    exam_class: examClass,
    target_exam_date: targetDate,
    onboarding_completed: true,  // এই লাইন যোগ করো
  });
```

---

## পরিবর্তন ১১: `src/pages/ProgressPage.tsx` — শ্রেণি হার্ডকোড ঠিক করো

`ProgressPage.tsx`-এ নিচের লাইনটি:
```tsx
<p>...দাখিল পরীক্ষার্থী</p>  // হার্ডকোড করা
```

`useUserProfile` hook দিয়ে ডায়নামিক করো:

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

// কম্পোনেন্টে:
const { data: profile } = useUserProfile();

// JSX-এ:
<p>...{profile?.exam_class === 'alim' ? 'আলিম' : 'দাখিল'} পরীক্ষার্থী</p>
```

---

## সারসংক্ষেপ — কোন ফাইলে কী করবে

| ফাইল | কাজ |
|------|-----|
| `VerbBuilderPage.tsx` | ডিলিট |
| `RealArabicPage.tsx` | ডিলিট |
| `SmartPracticePage.tsx` | ডিলিট |
| `MorphologyPage.tsx` | ডিলিট |
| `App.tsx` | route পরিষ্কার + `/onboarding` যোগ |
| `OnboardingPage.tsx` | নতুন তৈরি |
| `useUserProfile.tsx` | নতুন তৈরি |
| `useAuth.tsx` | `signUp` return value আপডেট |
| `Auth.tsx` | signup redirect → `/onboarding` |
| `Index.tsx` | কাউন্টডাউন + দুর্বল টপিক + real data |
| `TarkibPage.tsx` | তাহকিক ট্যাব যোগ |
| `ToolsPage.tsx` | সরলীকরণ — tarkib-এ redirect |
| `BottomNav.tsx` | Tarkib nav item যোগ |
| `ProgressPage.tsx` | শ্রেণি dynamic করো |
| নতুন migration `.sql` | onboarding_completed + trigger |

---

## গুরুত্বপূর্ণ নির্দেশনা

1. **কোনো বিদ্যমান Supabase টেবিল বা migration ডিলিট করবে না**
2. **shadcn/ui কম্পোনেন্ট অপরিবর্তিত রাখবে**
3. **Admin পেজ ও সব admin কম্পোনেন্ট স্পর্শ করবে না**
4. **`analyze-sentence` Edge Function অপরিবর্তিত রাখবে** — শুধু `mode: 'tahkik'` parameter পাঠাবে, function নিজেই handle করবে
5. **TypeScript type error থাকলে `as any` ব্যবহার না করে proper type fix করো**
6. **প্রতিটি পরিবর্তনের পর `import` ঠিক আছে কিনা নিশ্চিত করো**
