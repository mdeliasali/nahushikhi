import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMarkComplete, useUserProgress } from '@/hooks/useProgress';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface LessonContent {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">পাঠ পাওয়া যায়নি</p>
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
      toast.success('পাঠ সম্পন্ন হয়েছে! 🎉');
    } catch {
      toast.error('সমস্যা হয়েছে');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {(lesson as any).chapters?.modules?.title} › {(lesson as any).chapters?.title}
            </p>
            <h1 className="text-sm font-semibold truncate">{lesson.title}</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-3xl">
        <div className="space-y-6 animate-fade-in">
          {/* Explanation */}
          {content.explanation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  ব্যাখ্যা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                  {content.explanation}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Arabic Examples */}
          {content.arabicExamples && content.arabicExamples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📝 আরবি উদাহরণ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.arabicExamples.map((ex, i) => (
                  <div key={i} className="bg-secondary/50 rounded-lg p-4">
                    <p className="arabic-highlight text-xl mb-2">{ex.arabic}</p>
                    <p className="text-sm text-muted-foreground">{ex.bengali}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Keywords */}
          {content.keywords && content.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔑 মূল শব্দ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {content.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Real Arabic */}
          {content.realArabic && content.realArabic.length > 0 && (
            <Card className="border-accent/30">
              <CardHeader>
                <CardTitle className="text-lg">🧠 Real Arabic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.realArabic.map((ra, i) => (
                  <div key={i} className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                    <p className="arabic-text text-lg mb-2">{ra.sentence}</p>
                    <p className="text-sm text-foreground">{ra.analysis}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Completion & Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {prevLesson && (
                <Button variant="ghost" onClick={() => navigate(`/lesson/${prevLesson.id}`)}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  পূর্ববর্তী
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isCompleted ? (
                <Button onClick={handleComplete} disabled={markComplete.isPending}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  সম্পন্ন করুন
                </Button>
              ) : (
                <span className="text-success text-sm font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  সম্পন্ন
                </span>
              )}
              {nextLesson && (
                <Button variant="outline" onClick={() => navigate(`/lesson/${nextLesson.id}`)}>
                  পরবর্তী
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
