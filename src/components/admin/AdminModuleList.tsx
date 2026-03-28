import { useState } from 'react';
import { useModules, useModuleMutations } from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onSelectModule: (id: string) => void;
}

export default function AdminModuleList({ onSelectModule }: Props) {
  const { data: modules, isLoading } = useModules();
  const { create, update, remove } = useModuleMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', icon: '📚', level: 'beginner', estimated_weeks: 2, sort_order: 0 });

  const resetForm = () => {
    setForm({ title: '', description: '', icon: '📚', level: 'beginner', estimated_weeks: 2, sort_order: 0 });
    setEditId(null);
  };

  const openEdit = (mod: any) => {
    setForm({
      title: mod.title,
      description: mod.description || '',
      icon: mod.icon || '📚',
      level: mod.level || 'beginner',
      estimated_weeks: mod.estimated_weeks || 2,
      sort_order: mod.sort_order || 0,
    });
    setEditId(mod.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, ...form });
        toast.success('খণ্ড আপডেট হয়েছে');
      } else {
        await create.mutateAsync(form);
        toast.success('নতুন খণ্ড তৈরি হয়েছে');
      }
      setDialogOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই খণ্ড মুছে ফেলতে চান?')) return;
    try {
      await remove.mutateAsync(id);
      toast.success('খণ্ড মুছে ফেলা হয়েছে');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleTogglePublish = async (mod: any) => {
    await update.mutateAsync({ id: mod.id, is_published: !mod.is_published });
    toast.success(mod.is_published ? 'আনপাবলিশ করা হয়েছে' : 'পাবলিশ করা হয়েছে');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">📚 খণ্ড ব্যবস্থাপনা</h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />নতুন খণ্ড</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'খণ্ড সম্পাদনা' : 'নতুন খণ্ড'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>শিরোনাম</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="খণ্ড ১ — বীজ: শব্দ পরিচিতি" />
              </div>
              <div className="space-y-2">
                <Label>বিবরণ</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="এই খণ্ডের লক্ষ্য" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>আইকন</Label>
                  <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>লেভেল</Label>
                  <Input value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} placeholder="beginner" />
                </div>
                <div className="space-y-2">
                  <Label>ক্রম</Label>
                  <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={!form.title}>
                {editId ? 'আপডেট করুন' : 'তৈরি করুন'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {modules?.map(mod => (
            <Card key={mod.id} className="shadow-card">
              <CardContent className="flex items-center gap-4 py-4">
                <span className="text-2xl">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{mod.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{mod.level}</span>
                    <span className="text-xs text-muted-foreground">ক্রম: {mod.sort_order}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={mod.is_published} onCheckedChange={() => handleTogglePublish(mod)} />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(mod)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(mod.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onSelectModule(mod.id)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {modules?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">কোনো খণ্ড নেই। নতুন খণ্ড যোগ করুন।</div>
          )}
        </div>
      )}
    </div>
  );
}
