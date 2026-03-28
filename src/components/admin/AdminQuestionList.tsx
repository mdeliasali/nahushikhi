import { useState } from 'react';
import { useQuestions, useQuestionMutations } from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  chapterId: string;
}

export default function AdminQuestionList({ chapterId }: Props) {
  const { data: questions } = useQuestions(chapterId);
  const { create, update, remove } = useQuestionMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    question_text: '',
    question_type: 'mcq' as any,
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    difficulty: 1,
    is_quiz_question: false,
    is_practice_question: true,
    sort_order: 0,
  });

  const resetForm = () => {
    setForm({
      question_text: '', question_type: 'mcq', options: ['', '', '', ''],
      correct_answer: '', explanation: '', difficulty: 1,
      is_quiz_question: false, is_practice_question: true, sort_order: 0,
    });
    setEditId(null);
  };

  const openEdit = (q: any) => {
    const opts = Array.isArray(q.options) ? q.options as string[] : ['', '', '', ''];
    setForm({
      question_text: q.question_text,
      question_type: q.question_type,
      options: opts.length >= 4 ? opts : [...opts, ...Array(4 - opts.length).fill('')],
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      difficulty: q.difficulty,
      is_quiz_question: q.is_quiz_question,
      is_practice_question: q.is_practice_question,
      sort_order: q.sort_order,
    });
    setEditId(q.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const filteredOptions = form.options.filter(o => o.trim());
    try {
      const payload = {
        question_text: form.question_text,
        question_type: form.question_type,
        options: filteredOptions,
        correct_answer: form.correct_answer,
        explanation: form.explanation || null,
        difficulty: form.difficulty,
        is_quiz_question: form.is_quiz_question,
        is_practice_question: form.is_practice_question,
        sort_order: form.sort_order,
        chapter_id: chapterId,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, ...payload });
        toast.success('প্রশ্ন আপডেট হয়েছে');
      } else {
        await create.mutateAsync(payload);
        toast.success('নতুন প্রশ্ন তৈরি হয়েছে');
      }
      setDialogOpen(false);
      resetForm();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    try { await remove.mutateAsync(id); toast.success('মুছে ফেলা হয়েছে'); } catch (e: any) { toast.error(e.message); }
  };

  const typeLabels: Record<string, string> = {
    mcq: 'MCQ', fill_blank: 'Fill Blank', matching: 'Matching',
    identification: 'Identification', irab_analysis: "I'rab", root_extraction: 'Root',
  };

  const quizCount = questions?.filter(q => q.is_quiz_question).length ?? 0;
  const practiceCount = questions?.filter(q => q.is_practice_question).length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">❓ প্রশ্ন ব্যবস্থাপনা</h2>
          <p className="text-xs text-muted-foreground mt-1">কুইজ: {quizCount}/5 | অনুশীলন: {practiceCount}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />নতুন প্রশ্ন</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? 'প্রশ্ন সম্পাদনা' : 'নতুন প্রশ্ন'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>প্রশ্ন</Label>
                <Textarea value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>ধরন</Label>
                  <Select value={form.question_type} onValueChange={(v: any) => setForm(f => ({ ...f, question_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>কঠিনতা (১-৫)</Label>
                  <Input type="number" min={1} max={5} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>অপশন (MCQ)</Label>
                {form.options.map((opt, i) => (
                  <Input key={i} value={opt} onChange={e => {
                    const next = [...form.options];
                    next[i] = e.target.value;
                    setForm(f => ({ ...f, options: next }));
                  }} placeholder={`অপশন ${i + 1}`} />
                ))}
              </div>
              <div className="space-y-2">
                <Label>সঠিক উত্তর</Label>
                <Input value={form.correct_answer} onChange={e => setForm(f => ({ ...f, correct_answer: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>ব্যাখ্যা</Label>
                <Textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} rows={2} />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_quiz_question} onCheckedChange={v => setForm(f => ({ ...f, is_quiz_question: v }))} />
                  <Label>কুইজ প্রশ্ন</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_practice_question} onCheckedChange={v => setForm(f => ({ ...f, is_practice_question: v }))} />
                  <Label>অনুশীলন প্রশ্ন</Label>
                </div>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={!form.question_text || !form.correct_answer}>
                {editId ? 'আপডেট করুন' : 'তৈরি করুন'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {questions?.map(q => (
          <Card key={q.id} className="shadow-card">
            <CardContent className="flex items-start gap-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{q.question_text}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded">{typeLabels[q.question_type]}</span>
                  <span className="text-xs text-muted-foreground">কঠিনতা: {q.difficulty}</span>
                  {q.is_quiz_question && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">কুইজ</span>}
                  {q.is_practice_question && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">অনুশীলন</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(q)}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {questions?.length === 0 && <div className="text-center py-12 text-muted-foreground">কোনো প্রশ্ন নেই।</div>}
      </div>
    </div>
  );
}
