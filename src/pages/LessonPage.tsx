import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMarkComplete, useUserProgress } from '@/hooks/useProgress';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Sparkles, Key, Brain, Languages, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';
import Layout from '@/components/Layout';

interface LessonContent {
  arabicDefinition?: string;
  bengaliDefinition?: string;
  explanation?: string;
  arabicExamples?: { arabic: string; bengali: string }[];
  realArabic?: { sentence: string; analysis: string }[];
  keywords?: string[];
}

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const markComplete = useMarkComplete();
  const { data: progress } = useUserProgress();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, chapters(title, module_id, modules(title))')
        .eq('id', lessonId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  const { data: siblingLessons } = useQuery({
    queryKey: ['sibling-lessons', lesson?.chapter_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, sort_order')
        .eq('chapter_id', lesson!.chapter_id)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!lesson?.chapter_id,
  });

  if (isLoading) {
    return (
      <div className="flex-1 h-full min-h-full flex flex-col bg-background p-6 space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
        <div className="space-y-4 pt-4 px-2">
          <Skeleton className="h-32 w-full rounded-[2rem]" />
          <Skeleton className="h-40 w-full rounded-[2rem]" />
          <Skeleton className="h-24 w-full rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex-1 h-full min-h-full flex items-center justify-center bg-background p-6">
        <div className="glass-card p-8 rounded-3xl text-center max-w-sm">
          <p className="text-muted-foreground font-medium mb-4">পাঠ পাওয়া যায়নি</p>
          <Button onClick={() => navigate('/')} className="rounded-xl">ফিরে যান</Button>
        </div>
      </div>
    );
  }

  const content = (lesson.content || {}) as unknown as LessonContent;
  const isCompleted = progress?.some(p => p.lesson_id === lessonId && p.completed);

  const currentIndex = siblingLessons?.findIndex(l => l.id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? siblingLessons?.[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && siblingLessons && currentIndex < siblingLessons.length - 1
    ? siblingLessons[currentIndex + 1]
    : null;

  const handleComplete = async () => {
    try {
      await markComplete.mutateAsync(lessonId!);
      toast.success('পাঠ সম্পন্ন হয়েছে! 🎉', {
        className: 'rounded-2xl glass-card border-none shadow-elevated',
      });
    } catch {
      toast.error('সমস্যা হয়েছে');
    }
  };

  return (
    <div className="flex-1 h-full min-h-full flex flex-col bg-background overflow-y-auto no-scrollbar">
      {/* Immersive Header */}
      <header className="sticky top-0 z-50 glass-morphism w-full">
        <div className="container mx-auto max-w-4xl flex items-center gap-4 h-16 px-4 sm:px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-black/5"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate mb-0.5">
              {(lesson as any).chapters?.title}
            </p>
            <h1 className="text-sm font-extrabold tracking-tight truncate">{lesson.title}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <div className="space-y-8 animate-in-fade">
          {/* Progress Indication (Current/Total in chapter) */}
          <div className="flex items-center justify-center gap-1.5 opacity-50 mb-4">
            {siblingLessons?.map((l) => (
              <div 
                key={l.id} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  l.id === lessonId ? 'w-8 bg-primary opacity-100' : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Arabic Definition */}
          {content.arabicDefinition && (
            <section className="animate-in-fade">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Languages className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">التعريف আরবি সংজ্ঞা</h2>
              </div>
              <div className="glass-card rounded-[2rem] p-6 shadow-sm border-white/40 ring-1 ring-black/5 bg-emerald-50/30">
                <p className="arabic-text text-2xl leading-[2.2] text-foreground/90 font-bold">{content.arabicDefinition}</p>
              </div>
            </section>
          )}

          {/* Bengali Definition */}
          {content.bengaliDefinition && (
            <section className="animate-in-fade anim-delay-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-sky-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-sky-600" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">বাংলা সংজ্ঞা</h2>
              </div>
              <div className="glass-card rounded-[2rem] p-6 shadow-sm border-white/40 ring-1 ring-black/5 bg-sky-50/30">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-[1.8] text-foreground/90 font-medium text-base">
                  {content.bengaliDefinition}
                </div>
              </div>
            </section>
          )}

          {/* Explanation */}
          {content.explanation && (
            <section className="animate-in-fade anim-delay-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">ব্যাখ্যা</h2>
              </div>
              <div className="glass-card rounded-[2rem] p-6 shadow-sm border-white/40 ring-1 ring-black/5">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-[1.8] text-foreground/90 font-medium text-base">
                  {content.explanation}
                </div>
              </div>
            </section>
          )}

          {/* Arabic Examples */}
          {content.arabicExamples && content.arabicExamples.length > 0 && (
            <section className="animate-in-fade anim-delay-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">আরবি উদাহরণ</h2>
              </div>
              <div className="space-y-4">
                {content.arabicExamples.map((ex, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6 shadow-sm ring-1 ring-black/5 flex flex-col gap-3 group transition-all hover:ring-primary/20">
                    <p className="arabic-text text-3xl text-primary font-bold">{ex.arabic}</p>
                    <div className="h-px w-10 bg-primary/10 transition-all group-hover:w-full" />
                    <p className="text-base text-muted-foreground font-semibold">{ex.bengali}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Keywords */}
          {content.keywords && content.keywords.length > 0 && (
            <section className="animate-in-fade anim-delay-400">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Key className="h-4 w-4 text-amber-600" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">মূল শব্দ</h2>
              </div>
              <div className="glass-card rounded-2xl p-4 shadow-sm ring-1 ring-black/5 flex flex-wrap gap-2.5">
                {content.keywords.map((kw, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-primary/5 text-primary border border-primary/10 text-sm font-bold tracking-tight">
                    {kw}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Real Arabic / Advanced Analysis */}
          {content.realArabic && content.realArabic.length > 0 && (
            <section className="animate-in-fade anim-delay-400">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-indigo-600" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">বাক্য বিশ্লেষণ</h2>
              </div>
              <div className="space-y-5">
                {content.realArabic.map((ra, i) => (
                  <div key={i} className="rounded-3xl p-6 border-2 border-indigo-50 bg-indigo-50/20 shadow-sm">
                    <p className="arabic-text text-2xl text-indigo-900 mb-4 leading-loose">{ra.sentence}</p>
                    <div className="bg-white/80 rounded-2xl p-4 ring-1 ring-indigo-100 text-sm leading-relaxed text-slate-700 font-medium">
                      {ra.analysis}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Modern Fixed Bottom Nav for Navigation */}
      <footer className="sticky bottom-0 z-50 w-full p-4 glass-morphism border-t border-white/20 safe-area-bottom">
        <div className="container mx-auto max-w-4xl flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {prevLesson && (
              <Button 
                variant="ghost" 
                className="rounded-xl h-12 px-4 font-bold text-muted-foreground hover:bg-black/5"
                onClick={() => navigate(`/lesson/${prevLesson.id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                আগে
              </Button>
            )}
          </div>

          <div className="flex flex-1 justify-center max-w-[200px]">
             {!isCompleted ? (
              <Button 
                onClick={handleComplete} 
                disabled={markComplete.isPending}
                className="w-full h-12 rounded-2xl gradient-primary shadow-elevated font-extrabold text-sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                সম্পন্ন করুন
              </Button>
            ) : nextLesson ? (
              <div className="flex items-center gap-2 text-primary font-extrabold text-sm bg-primary/10 px-4 py-2 rounded-2xl ring-1 ring-primary/20">
                <CheckCircle2 className="h-4 w-4" />
                সম্পন্ন!
              </div>
            ) : (
              <div className="flex items-center gap-2 text-primary font-extrabold text-sm bg-primary/10 px-4 py-2 rounded-2xl ring-1 ring-primary/20">
                <CheckCircle2 className="h-4 w-4" />
                অধ্যায় শেষ!
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {nextLesson && (
              <Button 
                variant="outline"
                className="rounded-xl h-12 px-4 border-primary/20 hover:bg-primary/5 text-primary font-bold shadow-sm"
                onClick={() => navigate(`/lesson/${nextLesson.id}`)}
              >
                পরে
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
