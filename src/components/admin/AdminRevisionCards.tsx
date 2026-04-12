import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRevisionCards() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    exam_class: 'dakhil' | 'alim';
    topic: string;
    category: string;
    front_arabic: string;
    front_bengali: string;
    back_definition: string;
    back_example: string;
    back_rule: string;
    difficulty: 1 | 2 | 3;
    sort_order: number;
    is_published: boolean;
  }>({
    exam_class: 'dakhil',
    topic: '',
    category: '',
    front_arabic: '',
    front_bengali: '',
    back_definition: '',
    back_example: '',
    back_rule: '',
    difficulty: 1,
    sort_order: 0,
    is_published: true
  });

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('revision_cards')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error(error.message);
    } else {
      setCards(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const resetForm = () => {
    setForm({
      exam_class: 'dakhil',
      topic: '',
      category: '',
      front_arabic: '',
      front_bengali: '',
      back_definition: '',
      back_example: '',
      back_rule: '',
      difficulty: 1,
      sort_order: 0,
      is_published: true
    });
    setEditId(null);
  };

  const openEdit = (c: any) => {
    setForm({
      exam_class: c.exam_class,
      topic: c.topic,
      category: c.category,
      front_arabic: c.front_arabic || '',
      front_bengali: c.front_bengali,
      back_definition: c.back_definition,
      back_example: c.back_example || '',
      back_rule: c.back_rule || '',
      difficulty: c.difficulty || 1,
      sort_order: c.sort_order || 0,
      is_published: c.is_published
    });
    setEditId(c.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      exam_class: form.exam_class as 'dakhil' | 'alim',
      topic: form.topic,
      category: form.category,
      front_arabic: form.front_arabic || null,
      front_bengali: form.front_bengali,
      back_definition: form.back_definition,
      back_example: form.back_example || null,
      back_rule: form.back_rule || null,
      difficulty: form.difficulty as 1 | 2 | 3,
      sort_order: form.sort_order,
      is_published: form.is_published
    };

    try {
      if (editId) {
        const { error } = await supabase.from('revision_cards').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('কার্ড আপডেট হয়েছে');
      } else {
        const { error } = await supabase.from('revision_cards').insert(payload);
        if (error) throw error;
        toast.success('নতুন কার্ড তৈরি হয়েছে');
      }
      setDialogOpen(false);
      resetForm();
      fetchCards();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    try {
      const { error } = await supabase.from('revision_cards').delete().eq('id', id);
      if (error) throw error;
      toast.success('মুছে ফেলা হয়েছে');
      fetchCards();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-emerald-600">🃏 রিভিশন কার্ড ব্যবস্থাপনা</h2>
          <p className="text-xs text-muted-foreground mt-1">মোট কার্ড: {cards.length}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="h-4 w-4 mr-1" />নতুন কার্ড</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? 'কার্ড সম্পাদনা' : 'নতুন রিভিশন কার্ড'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
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
                  <Label>কঠিনতা (১-৩)</Label>
                  <Input type="number" min={1} max={3} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: (Math.min(3, Math.max(1, parseInt(e.target.value) || 1)) as 1 | 2 | 3) }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>টপিক (Topic)</Label>
                  <Input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="যেমন: ইসিম" />
                </div>
                <div className="space-y-2">
                  <Label>ক্যাটাগরি</Label>
                  <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="যেমন: প্রকারভেদ" />
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <Label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">কার্ডের সামনের দিক (Front)</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">আরবি শব্দ/বাক্য (ঐচ্ছিক)</Label>
                    <Input dir="rtl" value={form.front_arabic} onChange={e => setForm(f => ({ ...f, front_arabic: e.target.value }))} className="text-right font-arabic" />
                  </div>
                  <div>
                    <Label className="text-xs">বাংলা প্রশ্ন/টাইটেল</Label>
                    <Input value={form.front_bengali} onChange={e => setForm(f => ({ ...f, front_bengali: e.target.value }))} placeholder="মাজিদ কাকে বলে?" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <Label className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2 block">কার্ডের পেছনের দিক (Back)</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">সংজ্ঞা / উত্তর</Label>
                    <Textarea value={form.back_definition} onChange={e => setForm(f => ({ ...f, back_definition: e.target.value }))} rows={2} />
                  </div>
                  <div>
                    <Label className="text-xs">উদাহরণ (ঐচ্ছিক)</Label>
                    <Input dir="auto" value={form.back_example} onChange={e => setForm(f => ({ ...f, back_example: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">নিয়ম/সূত্র (ঐচ্ছিক)</Label>
                    <Input value={form.back_rule} onChange={e => setForm(f => ({ ...f, back_rule: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="space-y-2">
                  <Label>সর্ট অর্ডার</Label>
                  <Input type="number" className="w-24" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))} />
                  <Label>প্রকাশিত</Label>
                </div>
              </div>
              
              <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!form.topic || !form.front_bengali || !form.back_definition}>
                {editId ? 'আপডেট করুন' : 'তৈরি করুন'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">লোড হচ্ছে...</div>
        ) : cards.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-white rounded-xl border border-dashed">কোনো কার্ড নেই।</div>
        ) : (
          cards.map(c => (
            <Card key={c.id} className={`shadow-sm border-slate-200 ${!c.is_published ? 'opacity-60 saturate-50' : ''}`}>
              <CardContent className="p-0">
                <div className="p-4 flex flex-col h-full items-start gap-4">
                  <div className="flex-1 w-full flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">{c.topic}</span>
                        <span className="text-xs text-slate-500">{c.category}</span>
                        {c.exam_class === 'dakhil' ? (
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 rounded border border-blue-100">দাখিল</span>
                        ) : (
                          <span className="text-[10px] font-semibold bg-purple-50 text-purple-600 px-1.5 rounded border border-purple-100">আলিম</span>
                        )}
                        {!c.is_published && <span className="text-[10px] font-medium bg-red-100 text-red-700 px-1.5 rounded">ড্রাফট</span>}
                      </div>
                      <h4 className="text-sm font-semibold truncate text-slate-900">{c.front_bengali}</h4>
                      {c.front_arabic && <p className="text-sm font-arabic text-left text-slate-500 mt-1" dir="rtl">{c.front_arabic}</p>}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-50 p-2.5 rounded border border-slate-100 text-xs text-slate-600">
                    <div className="line-clamp-2"><strong>উত্তর:</strong> {c.back_definition}</div>
                    {c.back_example && <div className="mt-1 truncate opacity-80"><strong>উদা:</strong> {c.back_example}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
