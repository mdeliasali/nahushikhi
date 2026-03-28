import { useState } from 'react';
import { useChapters, useChapterMutations } from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, ChevronRight, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  moduleId: string;
  onSelectChapter: (id: string) => void;
  onManageQuestions: (id: string) => void;
}

export default function AdminChapterList({ moduleId, onSelectChapter, onManageQuestions }: Props) {
  const { data: chapters, isLoading } = useChapters(moduleId);
  const { create, update, remove } = useChapterMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', sort_order: 0 });

  const resetForm = () => { setForm({ title: '', description: '', sort_order: 0 }); setEditId(null); };

  const openEdit = (ch: any) => {
    setForm({ title: ch.title, description: ch.description || '', sort_order: ch.sort_order || 0 });
    setEditId(ch.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, ...form });
        toast.success('অধ্যায় আপডেট হয়েছে');
      } else {
        await create.mutateAsync({ ...form, module_id: moduleId });
        toast.success('নতুন অধ্যায় তৈরি হয়েছে');
      }
      setDialogOpen(false);
      resetForm();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই অধ্যায় মুছে ফেলতে চান?')) return;
    try { await remove.mutateAsync(id); toast.success('মুছে ফেলা হয়েছে'); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">📖 অধ্যায় ব্যবস্থাপনা</h2>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />নতুন অধ্যায়</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'অধ্যায় সম্পাদনা' : 'নতুন অধ্যায়'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>শিরোনাম</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="অধ্যায়ের নাম" />
              </div>
              <div className="space-y-2">
                <Label>বিবরণ</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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

      <div className="space-y-3">
        {chapters?.map(ch => (
          <Card key={ch.id} className="shadow-card">
            <CardContent className="flex items-center gap-4 py-4">
              <span className="text-lg">📖</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{ch.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{ch.description}</p>
                <span className="text-xs text-muted-foreground">ক্রম: {ch.sort_order}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Switch checked={ch.is_published} onCheckedChange={async () => {
                  await update.mutateAsync({ id: ch.id, is_published: !ch.is_published });
                  toast.success(ch.is_published ? 'আনপাবলিশ' : 'পাবলিশ');
                }} />
                <Button variant="ghost" size="icon" onClick={() => onManageQuestions(ch.id)} title="প্রশ্ন">
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(ch)}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(ch.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onSelectChapter(ch.id)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {chapters?.length === 0 && <div className="text-center py-12 text-muted-foreground">কোনো অধ্যায় নেই।</div>}
      </div>
    </div>
  );
}
