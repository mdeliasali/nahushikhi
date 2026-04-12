import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBoardQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    year: number;
    board_name: string;
    exam_class: 'dakhil' | 'alim';
    question_type: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    marks: number;
  }>({
    year: new Date().getFullYear(),
    board_name: 'ঢাকা বোর্ড',
    exam_class: 'dakhil',
    question_type: 'mcq',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    marks: 1
  });

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('board_questions')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error(error.message);
    } else {
      setQuestions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const resetForm = () => {
    setForm({
      year: new Date().getFullYear(),
      board_name: 'ঢাকা বোর্ড',
      exam_class: 'dakhil',
      question_type: 'mcq',
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      marks: 1
    });
    setEditId(null);
  };

  const openEdit = (q: any) => {
    const opts = Array.isArray(q.options) ? q.options as string[] : ['', '', '', ''];
    setForm({
      year: q.year,
      board_name: q.board_name,
      exam_class: q.exam_class,
      question_type: q.question_type,
      question_text: q.question_text,
      options: opts.length >= 4 ? opts : [...opts, ...Array(4 - opts.length).fill('')],
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      marks: q.marks || 1
    });
    setEditId(q.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const filteredOptions = form.options.filter(o => o.trim());
    const payload = {
      year: form.year,
      board_name: form.board_name,
      exam_class: form.exam_class as 'dakhil' | 'alim',
      question_type: form.question_type,
      question_text: form.question_text,
      options: filteredOptions,
      correct_answer: form.correct_answer,
      explanation: form.explanation || null,
      marks: form.marks
    };

    try {
      if (editId) {
        const { error } = await supabase.from('board_questions').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('প্রশ্ন আপডেট হয়েছে');
      } else {
        const { error } = await supabase.from('board_questions').insert(payload);
        if (error) throw error;
        toast.success('নতুন প্রশ্ন তৈরি হয়েছে');
      }
      setDialogOpen(false);
      resetForm();
      fetchQuestions();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    try {
      const { error } = await supabase.from('board_questions').delete().eq('id', id);
      if (error) throw error;
      toast.success('মুছে ফেলা হয়েছে');
      fetchQuestions();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-amber-600">📝 বোর্ড প্রশ্ন ব্যবস্থাপনা</h2>
          <p className="text-xs text-muted-foreground mt-1">মোট প্রশ্ন: {questions.length}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white"><Plus className="h-4 w-4 mr-1" />নতুন প্রশ্ন</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? 'প্রশ্ন সম্পাদনা' : 'নতুন বোর্ড প্রশ্ন'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>শিক্ষাবর্ষ (Year)</Label>
                  <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) || new Date().getFullYear() }))} />
                </div>
                <div className="space-y-2">
                  <Label>বোর্ডের নাম</Label>
                  <Input value={form.board_name} onChange={e => setForm(f => ({ ...f, board_name: e.target.value }))} placeholder="যেমন: ঢাকা বোর্ড" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>শ্রেণি</Label>
                  <Select value={form.exam_class} onValueChange={(v: any) => setForm(f => ({ ...f, exam_class: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dakhil">দাখিল (Dakhil)</SelectItem>
                      <SelectItem value="alim">আলিম (Alim)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>প্রশ্নের ধরন</Label>
                  <Select value={form.question_type} onValueChange={(v: any) => setForm(f => ({ ...f, question_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">MCQ</SelectItem>
                      <SelectItem value="fill_blank">Fill Blank</SelectItem>
                      <SelectItem value="matching">Matching</SelectItem>
                      <SelectItem value="identification">Identification</SelectItem>
                      <SelectItem value="irab_analysis">I'rab Analysis</SelectItem>
                      <SelectItem value="root_extraction">Root Extraction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>প্রশ্ন</Label>
                <Textarea value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} rows={2} />
              </div>

              {form.question_type === 'mcq' && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border">
                  <Label className="text-xs text-slate-500 font-bold uppercase tracking-wider">অপশন (MCQ)</Label>
                  {form.options.map((opt, i) => (
                    <Input key={i} value={opt} onChange={e => {
                      const next = [...form.options];
                      next[i] = e.target.value;
                      setForm(f => ({ ...f, options: next }));
                    }} placeholder={`অপশন ${i + 1}`} className="mb-2 bg-white" />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>সঠিক উত্তর</Label>
                  <Input value={form.correct_answer} onChange={e => setForm(f => ({ ...f, correct_answer: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>মান (Marks)</Label>
                  <Input type="number" min={1} value={form.marks} onChange={e => setForm(f => ({ ...f, marks: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ব্যাখ্যা (ঐচ্ছিক)</Label>
                <Textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} rows={2} />
              </div>
              
              <Button onClick={handleSave} className="w-full bg-amber-600 hover:bg-amber-700" disabled={!form.question_text || !form.correct_answer}>
                {editId ? 'আপডেট করুন' : 'তৈরি করুন'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">লোড হচ্ছে...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-xl border border-dashed">কোনো বোর্ড প্রশ্ন নেই।</div>
        ) : (
          questions.map(q => (
            <Card key={q.id} className="shadow-sm border-slate-200">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">{q.year}</span>
                    <span className="text-xs font-semibold bg-slate-100 border text-slate-700 px-2 py-0.5 rounded-md">{q.board_name}</span>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{q.exam_class === 'dakhil' ? 'দাখিল' : 'আলিম'}</span>
                    <span className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded">{q.question_type}</span>
                  </div>
                  <p className="text-sm font-medium">{q.question_text}</p>
                  <div className="flex flex-wrap items-center mt-2 gap-1.5">
                    <span className="text-xs text-slate-500">সঠিক:</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 rounded">{q.correct_answer}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(q)} className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)} className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
