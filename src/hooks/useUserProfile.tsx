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
        .from('profiles')
        .select('display_name, exam_class, target_exam_date, streak_count, best_mock_score')
        .eq('user_id', user.id)
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
