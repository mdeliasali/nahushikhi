import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import { useTranslations, usePracticeMutations, Translation } from '@/hooks/usePracticeTools';
import { toast } from 'sonner';

export default function AdminTranslations() {
  const { translations, loading, refresh } = useTranslations();
  const { addTranslation, updateTranslation, deleteTranslation } = usePracticeMutations();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Translation>>({});

  const handleEdit = (item: Translation) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      mode: 'ar-to-bn',
      ar_text: '',
      bn_text: ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.ar_text || !formData.bn_text || !formData.mode) {
      toast.error('সবগুলো ঘর পূরণ করুন');
      return;
    }

    try {
      if (editingId === 'new') {
        await addTranslation(formData as any);
        toast.success('সফলভাবে যুক্ত হয়েছে');
      } else if (editingId) {
        await updateTranslation(editingId, formData);
        toast.success('সফলভাবে আপডেট হয়েছে');
      }
      setEditingId(null);
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'কোনো একটি সমস্যা হয়েছে');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?')) {
      try {
        await deleteTranslation(id);
        toast.success('মুছে ফেলা হয়েছে');
        refresh();
      } catch (err: any) {
        toast.error(err.message || 'সমস্যা হয়েছে');
      }
    }
  };

  if (loading) return <div className="py-10 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">অনুবাদ ম্যানেজমেন্ট</h2>
        <Button onClick={handleAddNew} disabled={editingId !== null}>
          <Plus className="h-4 w-4 mr-2" /> নতুন যোগ করুন
        </Button>
      </div>

      {editingId && (
        <Card className="border-indigo-100 shadow-sm mb-6">
          <CardHeader>
            <CardTitle>{editingId === 'new' ? 'নতুন অনুবাদ যোগ করুন' : 'অনুবাদ সম্পাদনা করুন'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ধরণ</Label>
              <Select
                value={formData.mode}
                onValueChange={(val) => setFormData({ ...formData, mode: val as 'ar-to-bn' | 'bn-to-ar' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ধরণ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar-to-bn">আরবি থেকে বাংলা</SelectItem>
                  <SelectItem value="bn-to-ar">বাংলা থেকে আরবি</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>আরবি বাক্য</Label>
              <Input
                value={formData.ar_text || ''}
                onChange={(e) => setFormData({ ...formData, ar_text: e.target.value })}
                placeholder="আরবি বাক্য লিখুন"
                dir="rtl"
                className="text-lg font-arabic"
              />
            </div>

            <div className="space-y-2">
              <Label>বাংলা অর্থ</Label>
              <Input
                value={formData.bn_text || ''}
                onChange={(e) => setFormData({ ...formData, bn_text: e.target.value })}
                placeholder="বাংলা অর্থ লিখুন"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" /> বাতিল
              </Button>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="h-4 w-4 mr-2" /> সেভ করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {translations.map((item) => (
          <Card key={item.id} className="border-slate-200">
            <CardContent className="p-4 flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {item.mode === 'ar-to-bn' ? 'আরবি -> বাংলা' : 'বাংলা -> আরবি'}
                </div>
                <div className="text-xl font-arabic text-right">{item.ar_text}</div>
                <div className="text-slate-600">{item.bn_text}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)} disabled={editingId !== null}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)} disabled={editingId !== null}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {translations.length === 0 && !editingId && (
          <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl">কোনো ডাটা পাওয়া যায়নি</div>
        )}
      </div>
    </div>
  );
}
