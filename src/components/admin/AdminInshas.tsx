import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import { useInshas, usePracticeMutations, Insha } from '@/hooks/usePracticeTools';
import { toast } from 'sonner';

export default function AdminInshas() {
  const { inshas, loading, refresh } = useInshas();
  const { addInsha, updateInsha, deleteInsha } = usePracticeMutations();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Insha>>({});
  const [keyPhrasesJsonStr, setKeyPhrasesJsonStr] = useState('');

  const handleEdit = (item: Insha) => {
    setEditingId(item.id);
    setFormData(item);
    setKeyPhrasesJsonStr(item.key_phrases_json ? JSON.stringify(item.key_phrases_json, null, 2) : '');
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      type: 'essay',
      ar_text: '',
    });
    setKeyPhrasesJsonStr('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
    setKeyPhrasesJsonStr('');
  };

  const handleSave = async () => {
    if (!formData.ar_text || !formData.type) {
      toast.error('আরবি টেক্সট এবং ধরণ অবশ্যই দিতে হবে');
      return;
    }

    let parsedKeyPhrases = null;
    if (keyPhrasesJsonStr) {
      try {
        parsedKeyPhrases = JSON.parse(keyPhrasesJsonStr);
      } catch (e) {
        toast.error('Key Phrases JSON এর ফরম্যাট ঠিক নেই');
        return;
      }
    }

    const payload = {
      ...formData,
      key_phrases_json: parsedKeyPhrases
    };

    try {
      if (editingId === 'new') {
        await addInsha(payload as any);
        toast.success('সফলভাবে যুক্ত হয়েছে');
      } else if (editingId) {
        await updateInsha(editingId, payload);
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
        await deleteInsha(id);
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
        <h2 className="text-2xl font-bold">ইনশা ও রচনা ম্যানেজমেন্ট</h2>
        <Button onClick={handleAddNew} disabled={editingId !== null}>
          <Plus className="h-4 w-4 mr-2" /> নতুন যোগ করুন
        </Button>
      </div>

      {editingId && (
        <Card className="border-indigo-100 shadow-sm mb-6">
          <CardHeader>
            <CardTitle>{editingId === 'new' ? 'নতুন যোগ করুন' : 'সম্পাদনা করুন'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ধরণ</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val as 'application' | 'letter' | 'essay' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ধরণ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essay">রচনা (Essay)</SelectItem>
                  <SelectItem value="application">দরখাস্ত (Application)</SelectItem>
                  <SelectItem value="letter">চিঠি (Letter)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>শিরোনাম (Title)</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="যেমন: দরখাস্ত / সময়ের মূল্য"
              />
            </div>

            <div className="space-y-2">
              <Label>আরবি টেক্সট</Label>
              <textarea
                className="w-full min-h-[150px] p-3 rounded-md border border-input bg-transparent text-lg font-arabic shadow-sm"
                value={formData.ar_text || ''}
                onChange={(e) => setFormData({ ...formData, ar_text: e.target.value })}
                dir="rtl"
                placeholder="আরবি টেক্সট..."
              />
            </div>

            <div className="space-y-2">
              <Label>বাংলা অনুবাদ (দরখাস্ত/চিঠির জন্য)</Label>
              <textarea
                className="w-full min-h-[150px] p-3 rounded-md border border-input bg-transparent text-md shadow-sm"
                value={formData.bn_text || ''}
                onChange={(e) => setFormData({ ...formData, bn_text: e.target.value })}
                placeholder="বাংলা অনুবাদ..."
              />
            </div>

            <div className="space-y-2">
              <Label>Key Phrases JSON (গুরুত্বপূর্ণ বাক্য)</Label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm"
                value={keyPhrasesJsonStr}
                onChange={(e) => setKeyPhrasesJsonStr(e.target.value)}
                placeholder='[{"ar": "طَلَبُ الْإِجَازَةِ", "bn": "ছুটির আবেদন"}]'
                dir="ltr"
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
        {inshas.map((item) => (
          <Card key={item.id} className="border-slate-200">
            <CardContent className="p-4 flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {item.type === 'essay' ? 'রচনা' : item.type === 'application' ? 'দরখাস্ত' : 'চিঠি'}
                  </div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                </div>
                <div className="text-xl font-arabic text-right whitespace-pre-wrap leading-loose line-clamp-3">
                  {item.ar_text}
                </div>
                {item.bn_text && (
                  <div className="text-slate-600 whitespace-pre-wrap line-clamp-2">
                    {item.bn_text}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0 mt-8">
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
        {inshas.length === 0 && !editingId && (
          <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl">কোনো ডাটা পাওয়া যায়নি</div>
        )}
      </div>
    </div>
  );
}
