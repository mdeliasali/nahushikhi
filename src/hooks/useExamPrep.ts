import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

type ExamClass = Database['public']['Enums']['exam_class'];

// 1. Board Questions
export function useBoardQuestions(examClass?: ExamClass, year?: number, topicTag?: string) {
  return useQuery({
    queryKey: ['board_questions', examClass, year, topicTag],
    queryFn: async () => {
      let query = supabase.from('board_questions').select('*').eq('is_published', true);
      
      if (examClass) query = query.eq('exam_class', examClass);
      if (year) query = query.eq('year', year);
      if (topicTag) query = query.eq('topic_tag', topicTag);
      
      const { data, error } = await query.order('year', { ascending: false });
      
      if (error) {
        console.error('Error fetching board questions:', error);
        throw error;
      }
      return data;
    }
  });
}

// 2. Revision Cards
export function useRevisionCards(examClass?: ExamClass, category?: string) {
  return useQuery({
    queryKey: ['revision_cards', examClass, category],
    queryFn: async () => {
      let query = supabase.from('revision_cards').select('*').eq('is_published', true);
      
      if (examClass) query = query.eq('exam_class', examClass);
      if (category) query = query.eq('category', category);
      
      const { data, error } = await query.order('sort_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching revision cards:', error);
        throw error;
      }
      return data;
    }
  });
}

// 3. Short Questions
export function useShortQuestions(examClass?: ExamClass, importance?: number) {
  return useQuery({
    queryKey: ['short_questions', examClass, importance],
    queryFn: async () => {
      let query = supabase.from('short_questions').select('*').eq('is_published', true);
      
      if (examClass) query = query.eq('exam_class', examClass);
      if (importance) query = query.eq('importance', importance);
      
      const { data, error } = await query.order('importance', { ascending: false });
      
      if (error) {
        console.error('Error fetching short questions:', error);
        throw error;
      }
      return data;
    }
  });
}

// 4. Mock Test Sessions
export function useMockTestSessions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mock_test_sessions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mock_test_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('started_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });
}

export function useSaveMockTestSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (sessionData: Database['public']['Tables']['mock_test_sessions']['Insert']) => {
      if (!user) throw new Error("Must be logged in to save mock test session");
      
      const { data, error } = await supabase
        .from('mock_test_sessions')
        .insert([{ ...sessionData, user_id: user.id }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock_test_sessions'] });
      // You should generally invalidate profile too since it has `total_mock_tests`
    },
    onError: (error) => {
      toast.error('মক পরীক্ষার ফলাফল সেভ করতে সমস্যা হয়েছে: ' + error.message);
    }
  });
}
