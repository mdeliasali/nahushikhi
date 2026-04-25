import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import { useTashkils, usePracticeMutations, Tashkil } from '@/hooks/usePracticeTools';
import { toast } from 'sonner';

export default function AdminTashkils() {
  const { tashkils, loading, refresh } = useTashkils();
  const { addTashkil, updateTashkil, deleteTashkil } = usePracticeMutations();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Tashkil>>({});
  const [iraabJsonStr, setIraabJsonStr] = useState('');

  const handleEdit = (item: Tashkil) => {
    setEditingId(item.id);
    setFormData(item);
    setIraabJsonStr(item.iraab_json ? JSON.stringify(item.iraab_json, null, 2) : '');
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      type: 'harakat',
      correct_text: '',
    });
    setIraabJsonStr('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
    setIraabJsonStr('');
  };

  const handleSave = async () => {
    if (!formData.correct_text || !formData.type) {
      toast.error('সঠিক বাক্যটি অবশ্যই দিতে হবে');
      return;
    }

    let parsedIraab = null;
    if (iraabJsonStr) {
      try {
        parsedIraab = JSON.parse(iraabJsonStr);
      } catch (e) {
        toast.error('ইরাব JSON এর ফরম্যাট ঠিক নেই');
        return;
      }
    }

    const payload = {
      ...formData,
      iraab_json: parsedIraab
    };

    try {
      if (editingId === 'new') {
        await addTashkil(payload as any);
        toast.success('সফলভাবে যুক্ত হয়েছে');
      } else if (editingId) {
        await updateTashkil(editingId, payload);
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
        await deleteTashkil(id);
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
        <h2 className="text-2xl font-bold">তাশকিল ও সংশোধন ম্যানেজমেন্ট</h2>
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
                onValueChange={(val) => setFormData({ ...formData, type: val as 'correction' | 'harakat' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ধরণ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harakat">হরকত (Tashkil)</SelectItem>
                  <SelectItem value="correction">সংশোধন (Correction)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.type === 'correction' && (
              <>
                <div className="space-y-2">
                  <Label>ভুল বাক্য</Label>
                  <Input
                    value={formData.wrong_text || ''}
                    onChange={(e) => setFormData({ ...formData, wrong_text: e.target.value })}
                    dir="rtl"
                    className="font-arabic"
                  />
                </div>
                <div className="space-y-2">
                  <Label>সঠিক বাক্য</Label>
                  <Input
                    value={formData.correct_text || ''}
                    onChange={(e) => setFormData({ ...formData, correct_text: e.target.value })}
                    dir="rtl"
                    className="font-arabic"
                  />
                </div>
                <div className="space-y-2">
                  <Label>নিয়ম (Rule)</Label>
                  <Input
                    value={formData.rule_text || ''}
                    onChange={(e) => setFormData({ ...formData, rule_text: e.target.value })}
                  />
                </div>
              </>
            )}

            {formData.type === 'harakat' && (
              <>
                <div className="space-y-2">
                  <Label>হরকত ছাড়া বাক্য</Label>
                  <Input
                    value={formData.no_haraka_text || ''}
                    onChange={(e) => setFormData({ ...formData, no_haraka_text: e.target.value })}
                    dir="rtl"
                    className="font-arabic"
                  />
                </div>
                <div className="space-y-2">
                  <Label>হরকত সহ বাক্য (সঠিক)</Label>
                  <Input
                    value={formData.correct_text || ''}
                    onChange={(e) => setFormData({ ...formData, correct_text: e.target.value })}
                    dir="rtl"
                    className="font-arabic"
                  />
                </div>
                <div className="space-y-2">
                  <Label>অর্থ</Label>
                  <Input
                    value={formData.meaning || ''}
                    onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ইরাব JSON (তারকিব)</Label>
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm"
                    value={iraabJsonStr}
                    onChange={(e) => setIraabJsonStr(e.target.value)}
                    placeholder='[{"word": "اَلظُّلْمُ", "role": "মুবতাদা", "haraka": "রফা"}]'
                    dir="ltr"
                  />
                </div>
              </>
            )}

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
        {tashkils.map((item) => (
          <Card key={item.id} className="border-slate-200">
            <CardContent className="p-4 flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {item.type === 'harakat' ? 'হরকত' : 'সংশোধন'}
                </div>
                {item.type === 'harakat' ? (
                  <>
                    <div className="text-xl font-arabic text-right">{item.correct_text}</div>
                    <div className="text-slate-500 text-right font-arabic">{item.no_haraka_text}</div>
                    <div className="text-slate-600">{item.meaning}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-arabic text-right text-emerald-600">{item.correct_text}</div>
                    <div className="text-lg font-arabic text-right text-rose-500">{item.wrong_text}</div>
                    <div className="text-slate-600">নিয়ম: {item.rule_text}</div>
                  </>
                )}
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
        {tashkils.length === 0 && !editingId && (
          <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl">কোনো ডাটা পাওয়া যায়নি</div>
        )}
      </div>
    </div>
  );
}
