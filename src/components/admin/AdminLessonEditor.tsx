import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLessonMutations } from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface LessonContent {
  explanation: string;
  arabicExamples: { arabic: string; bengali: string }[];
  realArabic: { sentence: string; analysis: string }[];
  keywords: string[];
}

interface Props {
  lessonId: string;
  onBack: () => void;
}

export default function AdminLessonEditor({ lessonId, onBack }: Props) {
  const { update } = useLessonMutations();

  const { data: lesson } = useQuery({
    queryKey: ['lesson-edit', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [content, setContent] = useState<LessonContent>({
    explanation: '',
    arabicExamples: [],
    realArabic: [],
    keywords: [],
  });
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (lesson?.content) {
      const c = lesson.content as any;
      setContent({
        explanation: c.explanation || '',
        arabicExamples: c.arabicExamples || [],
        realArabic: c.realArabic || [],
        keywords: c.keywords || [],
      });
    }
  }, [lesson]);

  const handleSave = async () => {
    try {
      await update.mutateAsync({ id: lessonId, content: content as any });
      toast.success('কন্টেন্ট সেভ হয়েছে');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const addArabicExample = () => {
    setContent(c => ({ ...c, arabicExamples: [...c.arabicExamples, { arabic: '', bengali: '' }] }));
  };

  const updateArabicExample = (i: number, field: 'arabic' | 'bengali', value: string) => {
    setContent(c => ({
      ...c,
      arabicExamples: c.arabicExamples.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex),
    }));
  };

  const removeArabicExample = (i: number) => {
    setContent(c => ({ ...c, arabicExamples: c.arabicExamples.filter((_, idx) => idx !== i) }));
  };

  const addRealArabic = () => {
    setContent(c => ({ ...c, realArabic: [...c.realArabic, { sentence: '', analysis: '' }] }));
  };

  const updateRealArabic = (i: number, field: 'sentence' | 'analysis', value: string) => {
    setContent(c => ({
      ...c,
      realArabic: c.realArabic.map((ra, idx) => idx === i ? { ...ra, [field]: value } : ra),
    }));
  };

  const removeRealArabic = (i: number) => {
    setContent(c => ({ ...c, realArabic: c.realArabic.filter((_, idx) => idx !== i) }));
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setContent(c => ({ ...c, keywords: [...c.keywords, keywordInput.trim()] }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (i: number) => {
    setContent(c => ({ ...c, keywords: c.keywords.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">📝 কন্টেন্ট সম্পাদনা: {lesson?.title}</h2>
        <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" />সেভ করুন</Button>
      </div>

      {/* Explanation */}
      <Card>
        <CardHeader><CardTitle className="text-base">ব্যাখ্যা</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={content.explanation}
            onChange={e => setContent(c => ({ ...c, explanation: e.target.value }))}
            placeholder="পাঠের বিস্তারিত ব্যাখ্যা লিখুন..."
            rows={8}
          />
        </CardContent>
      </Card>

      {/* Arabic Examples */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">আরবি উদাহরণ</CardTitle>
          <Button size="sm" variant="outline" onClick={addArabicExample}><Plus className="h-4 w-4 mr-1" />যোগ করুন</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.arabicExamples.map((ex, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 p-3 bg-muted/50 rounded-lg relative">
              <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeArabicExample(i)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
              <div>
                <Label className="text-xs">আরবি টেক্সট</Label>
                <Input value={ex.arabic} onChange={e => updateArabicExample(i, 'arabic', e.target.value)} className="font-arabic text-right" dir="rtl" />
              </div>
              <div>
                <Label className="text-xs">বাংলা অর্থ</Label>
                <Input value={ex.bengali} onChange={e => updateArabicExample(i, 'bengali', e.target.value)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader><CardTitle className="text-base">মূল শব্দ</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input value={keywordInput} onChange={e => setKeywordInput(e.target.value)} placeholder="শব্দ লিখুন" onKeyDown={e => e.key === 'Enter' && addKeyword()} />
            <Button size="sm" onClick={addKeyword}>যোগ</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {content.keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1">
                {kw}
                <button onClick={() => removeKeyword(i)} className="hover:text-destructive">×</button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real Arabic */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">🧠 Real Arabic</CardTitle>
          <Button size="sm" variant="outline" onClick={addRealArabic}><Plus className="h-4 w-4 mr-1" />যোগ করুন</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.realArabic.map((ra, i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-lg relative space-y-2">
              <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeRealArabic(i)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
              <div>
                <Label className="text-xs">আরবি বাক্য</Label>
                <Input value={ra.sentence} onChange={e => updateRealArabic(i, 'sentence', e.target.value)} className="font-arabic text-right" dir="rtl" />
              </div>
              <div>
                <Label className="text-xs">বিশ্লেষণ</Label>
                <Textarea value={ra.analysis} onChange={e => updateRealArabic(i, 'analysis', e.target.value)} rows={2} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
