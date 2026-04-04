import { useState } from 'react';
import { useLessons, useLessonMutations } from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  chapterId: string;
  onEditLesson: (id: string) => void;
}

import { useQueryClient } from '@tanstack/react-query';

export default function AdminLessonList({ chapterId, onEditLesson }: Props) {
  const queryClient = useQueryClient();
  const { data: lessons, isLoading } = useLessons(chapterId);
  const { create, update, remove } = useLessonMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', lesson_type: 'lesson' as any, sort_order: 0 });

  const resetForm = () => { setForm({ title: '', lesson_type: 'lesson', sort_order: 0 }); setEditId(null); };

  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error('JSON array আশা করা হচ্ছে');
      
      const payload = parsed.map(item => ({
        ...item,
        chapter_id: chapterId,
      }));

      const { error } = await supabase.from('lessons').insert(payload);
      if (error) throw error;

      toast.success('থোক ইমপোর্ট সফল হয়েছে');
      setBulkOpen(false);
      setBulkJson('');
      queryClient.invalidateQueries({ queryKey: ['lessons', chapterId] });
      queryClient.invalidateQueries({ queryKey: ['full-curriculum'] });
    } catch (e: any) {
      toast.error('ইমপোর্ট ব্যর্থ: ' + e.message);
    }
  };

  const openEdit = (l: any) => {
    setForm({ title: l.title, lesson_type: l.lesson_type, sort_order: l.sort_order || 0 });
    setEditId(l.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, ...form });
        toast.success('পাঠ আপডেট হয়েছে');
      } else {
        await create.mutateAsync({ ...form, chapter_id: chapterId });
        toast.success('নতুন পাঠ তৈরি হয়েছে');
      }
      setDialogOpen(false);
      resetForm();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই পাঠ মুছে ফেলতে চান?')) return;
    try { await remove.mutateAsync(id); toast.success('মুছে ফেলা হয়েছে'); } catch (e: any) { toast.error(e.message); }
  };

  const typeLabels: Record<string, string> = {
    lesson: '📄 পাঠ', practice: '📝 অনুশীলন', real_arabic: '🧠 রিয়েল আরবি', smart_practice: '🎯 স্মার্ট প্র্যাকটিস', quiz: '✅ কুইজ', review: '🔁 রিভিশন', tool: '🎮 টুল',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">📄 পাঠ ব্যবস্থাপনা</h2>
        <div className="flex items-center gap-2">
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><Upload className="h-4 w-4 mr-1" />থোক ইমপোর্ট</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>JSON থেকে থোক ইমপোর্ট</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Textarea 
                  placeholder='[{"title":"Lesson 1","lesson_type":"lesson","sort_order":1}]'
                  className="font-mono text-xs h-40"
                  value={bulkJson}
                  onChange={e => setBulkJson(e.target.value)}
                />
                <Button onClick={handleBulkImport} className="w-full" disabled={!bulkJson}>
                  ইমপোর্ট করুন
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />নতুন পাঠ</Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'পাঠ সম্পাদনা' : 'নতুন পাঠ'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>শিরোনাম</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="পাঠের নাম" />
              </div>
              <div className="space-y-2">
                <Label>ধরন</Label>
                <Select value={form.lesson_type} onValueChange={(v: any) => setForm(f => ({ ...f, lesson_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson">📄 পাঠ</SelectItem>
                    <SelectItem value="practice">📝 অনুশীলন</SelectItem>
                    <SelectItem value="real_arabic">🧠 রিয়েল আরবি</SelectItem>
                    <SelectItem value="smart_practice">🎯 স্মার্ট প্র্যাকটিস</SelectItem>
                    <SelectItem value="quiz">✅ কুইজ</SelectItem>
                    <SelectItem value="review">🔁 রিভিশন</SelectItem>
                    <SelectItem value="tool">🎮 টুল</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ক্রম</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
              <Button onClick={handleSave} className="w-full" disabled={!form.title}>
                {editId ? 'আপডেট করুন' : 'তৈরি করুন'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {lessons?.map(l => (
          <Card key={l.id} className="shadow-card">
            <CardContent className="flex items-center gap-3 py-3">
              <span className="text-sm">{typeLabels[l.lesson_type]?.slice(0, 2) || '📄'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{l.title}</h3>
                <span className="text-xs text-muted-foreground">{typeLabels[l.lesson_type]} | ক্রম: {l.sort_order}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Switch checked={l.is_published} onCheckedChange={async () => {
                  await update.mutateAsync({ id: l.id, is_published: !l.is_published });
                }} />
                {l.lesson_type === 'lesson' && (
                  <Button variant="ghost" size="icon" onClick={() => onEditLesson(l.id)} title="কন্টেন্ট সম্পাদনা">
                    <FileText className="h-4 w-4 text-primary" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {lessons?.length === 0 && <div className="text-center py-12 text-muted-foreground">কোনো পাঠ নেই।</div>}
      </div>
    </div>
  );
}
