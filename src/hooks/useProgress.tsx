import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useMarkComplete() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useQuizAttempts(chapterId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['quiz-attempts', chapterId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      let q = supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      if (chapterId) q = q.eq('chapter_id', chapterId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSubmitQuiz() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      chapterId: string;
      score: number;
      totalQuestions: number;
      answers: any[];
      weakTopics: string[];
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        chapter_id: params.chapterId,
        score: params.score,
        total_questions: params.totalQuestions,
        answers: params.answers,
        weak_topics: params.weakTopics,
      });
      if (error) throw error;

      // Update weak topics
      for (const topic of params.weakTopics) {
        await supabase.from('user_weak_topics').upsert({
          user_id: user.id,
          chapter_id: params.chapterId,
          topic,
          incorrect_count: 1,
          last_tested: new Date().toISOString(),
        }, { onConflict: 'user_id,chapter_id,topic' });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
  });
}

export function useWeakTopics() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['weak-topics', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_weak_topics')
        .select('*')
        .eq('user_id', user.id)
        .eq('mastered', false)
        .order('incorrect_count', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
