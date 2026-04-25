import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface Translation {
  id: string;
  mode: 'ar-to-bn' | 'bn-to-ar';
  ar_text: string;
  bn_text: string;
}

export interface Tashkil {
  id: string;
  type: 'correction' | 'harakat';
  wrong_text?: string;
  correct_text: string;
  rule_text?: string;
  no_haraka_text?: string;
  meaning?: string;
  iraab_json?: any;
}

export interface Insha {
  id: string;
  type: 'application' | 'letter' | 'essay';
  title?: string;
  ar_text: string;
  bn_text?: string;
  key_phrases_json?: any;
}

// Hooks for Translations
export function useTranslations() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTranslations = async () => {
    setLoading(true);
    const { data } = await supabase.from('practice_translations').select('*').order('created_at', { ascending: true });
    if (data) setTranslations(data as Translation[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  return { translations, loading, refresh: fetchTranslations };
}

// Hooks for Tashkils
export function useTashkils() {
  const [tashkils, setTashkils] = useState<Tashkil[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTashkils = async () => {
    setLoading(true);
    const { data } = await supabase.from('practice_tashkils').select('*').order('created_at', { ascending: true });
    if (data) setTashkils(data as Tashkil[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTashkils();
  }, []);

  return { tashkils, loading, refresh: fetchTashkils };
}

// Hooks for Inshas
export function useInshas() {
  const [inshas, setInshas] = useState<Insha[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInshas = async () => {
    setLoading(true);
    const { data } = await supabase.from('practice_inshas').select('*').order('created_at', { ascending: true });
    if (data) setInshas(data as Insha[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchInshas();
  }, []);

  return { inshas, loading, refresh: fetchInshas };
}

// Mutations
export function usePracticeMutations() {
  const addTranslation = async (item: Omit<Translation, 'id'>) => {
    return await supabase.from('practice_translations').insert([item]).select();
  };
  const updateTranslation = async (id: string, item: Partial<Translation>) => {
    return await supabase.from('practice_translations').update(item).eq('id', id).select();
  };
  const deleteTranslation = async (id: string) => {
    return await supabase.from('practice_translations').delete().eq('id', id);
  };

  const addTashkil = async (item: Omit<Tashkil, 'id'>) => {
    return await supabase.from('practice_tashkils').insert([item]).select();
  };
  const updateTashkil = async (id: string, item: Partial<Tashkil>) => {
    return await supabase.from('practice_tashkils').update(item).eq('id', id).select();
  };
  const deleteTashkil = async (id: string) => {
    return await supabase.from('practice_tashkils').delete().eq('id', id);
  };

  const addInsha = async (item: Omit<Insha, 'id'>) => {
    return await supabase.from('practice_inshas').insert([item]).select();
  };
  const updateInsha = async (id: string, item: Partial<Insha>) => {
    return await supabase.from('practice_inshas').update(item).eq('id', id).select();
  };
  const deleteInsha = async (id: string) => {
    return await supabase.from('practice_inshas').delete().eq('id', id);
  };

  return {
    addTranslation, updateTranslation, deleteTranslation,
    addTashkil, updateTashkil, deleteTashkil,
    addInsha, updateInsha, deleteInsha
  };
}
