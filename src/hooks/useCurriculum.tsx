import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Module = Database['public']['Tables']['modules']['Row'];
type Chapter = Database['public']['Tables']['chapters']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type ModuleInsert = Database['public']['Tables']['modules']['Insert'];
type ChapterInsert = Database['public']['Tables']['chapters']['Insert'];
type LessonInsert = Database['public']['Tables']['lessons']['Insert'];
type QuestionInsert = Database['public']['Tables']['questions']['Insert'];

export interface AppSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}


export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as Module[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useChapters(moduleId?: string) {
  return useQuery({
    queryKey: ['chapters', moduleId],
    queryFn: async () => {
      let q = supabase.from('chapters').select('*').order('sort_order');
      if (moduleId) q = q.eq('module_id', moduleId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!moduleId || moduleId === undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLessons(chapterId?: string) {
  return useQuery({
    queryKey: ['lessons', chapterId],
    queryFn: async () => {
      let q = supabase.from('lessons').select('*').order('sort_order');
      if (chapterId) q = q.eq('chapter_id', chapterId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!chapterId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useQuestions(chapterId?: string) {
  return useQuery({
    queryKey: ['questions', chapterId],
    queryFn: async () => {
      let q = supabase.from('questions').select('*').order('sort_order');
      if (chapterId) q = q.eq('chapter_id', chapterId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Question[];
    },
    enabled: !!chapterId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFullCurriculum() {
  return useQuery({
    queryKey: ['full-curriculum'],
    queryFn: async () => {
      const [modulesRes, chaptersRes, lessonsRes] = await Promise.all([
        supabase.from('modules').select('*').order('sort_order'),
        supabase.from('chapters').select('*').order('sort_order'),
        supabase.from('lessons').select('*').order('sort_order'),
      ]);
      if (modulesRes.error) throw modulesRes.error;
      if (chaptersRes.error) throw chaptersRes.error;
      if (lessonsRes.error) throw lessonsRes.error;

      return {
        modules: modulesRes.data as Module[],
        chapters: chaptersRes.data as Chapter[],
        lessons: lessonsRes.data as Lesson[],
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations
export function useModuleMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['modules'] });
    qc.invalidateQueries({ queryKey: ['full-curriculum'] });
  };

  const create = useMutation({
    mutationFn: async (data: ModuleInsert) => {
      const { error } = await supabase.from('modules').insert(data);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Module> & { id: string }) => {
      const { error } = await supabase.from('modules').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('modules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export function useChapterMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['chapters'] });
    qc.invalidateQueries({ queryKey: ['full-curriculum'] });
  };

  const create = useMutation({
    mutationFn: async (data: ChapterInsert) => {
      const { error } = await supabase.from('chapters').insert(data);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Chapter> & { id: string }) => {
      const { error } = await supabase.from('chapters').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('chapters').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export function useLessonMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['lessons'] });
    qc.invalidateQueries({ queryKey: ['full-curriculum'] });
  };

  const create = useMutation({
    mutationFn: async (data: LessonInsert) => {
      const { error } = await supabase.from('lessons').insert(data);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Lesson> & { id: string }) => {
      const { error } = await supabase.from('lessons').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export function useQuestionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['questions'] });

  const create = useMutation({
    mutationFn: async (data: QuestionInsert) => {
      const { error } = await supabase.from('questions').insert(data);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Question> & { id: string }) => {
      const { error } = await supabase.from('questions').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export function useAppSettings() {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings' as any).select('*');
      if (error) throw error;
      return (data as unknown) as AppSetting[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAppSettingMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['app-settings'] });

  const update = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      const { error } = await supabase.from('app_settings' as any).update({ value, updated_at: new Date().toISOString() }).eq('key', key);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { update };
}
