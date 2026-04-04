import { useState } from 'react';
import { useAppSettings, useAppSettingMutations } from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Bot, Key, MessageSquare, Sparkles, Monitor } from 'lucide-react';

export default function AdminAISettings() {
  const { data: settings, isLoading } = useAppSettings();
  const { update } = useAppSettingMutations();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-center animate-pulse font-bold">সেটিংস লোড হচ্ছে...</div>;

  const getVal = (key: string) => settings?.find(s => s.key === key)?.value || '';

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      await update.mutateAsync({ key, value });
      toast.success('সেটিংস আপডেট করা হয়েছে');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingKey(null);
    }
  };

  const providers = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'google', name: 'Google Gemini' },
    { id: 'openrouter', name: 'OpenRouter' },
  ];

  return (
    <div className="space-y-6 animate-in-fade pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          AI কনফিগারেশন
        </h2>
        <p className="text-sm font-medium text-muted-foreground">AI প্রোভাইডার, মডেল এবং API কীসমূহ এখান থেকে পরিচালনা করুন।</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model & Provider Selection */}
        <Card className="rounded-[2rem] border-white/60 shadow-elevated overflow-hidden glass-card">
          <CardHeader className="bg-primary/5 border-b border-black/5">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Monitor className="h-5 w-5" />
              প্রোভাইডার ও মডেল
            </CardTitle>
            <CardDescription className="font-bold">সক্রিয় AI ইন্জিন কনফিগার করুন</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">AI প্রোভাইডার</Label>
              <Select 
                value={getVal('ai_provider') || 'openai'} 
                onValueChange={(v) => handleUpdate('ai_provider', v)}
              >
                <SelectTrigger className="h-12 rounded-xl border-2">
                  <SelectValue placeholder="প্রোভাইডার নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(p => (
                    <SelectItem key={p.id} value={p.id} className="font-bold">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">মডেল আইডি (Model ID)</Label>
              <Input 
                defaultValue={getVal('ai_model_id')}
                placeholder="যেমন: gpt-4o, gemini-1.5-pro, anthropic/claude-3-opus"
                onBlur={(e) => {
                  if (e.target.value !== getVal('ai_model_id')) {
                    handleUpdate('ai_model_id', e.target.value);
                  }
                }}
                className="h-12 rounded-xl focus:ring-primary bg-white/50 font-mono text-sm" 
              />
              <p className="text-[9px] text-muted-foreground italic px-1">OpenRouter ব্যবহার করলে মডেল পাথ (slug) এখানে লিখুন।</p>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="rounded-[2rem] border-white/60 shadow-elevated overflow-hidden glass-card">
          <CardHeader className="bg-amber-50/50 border-b border-black/5">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
              <Key className="h-5 w-5" />
              API কীসমূহ
            </CardTitle>
            <CardDescription className="font-bold">আপনার প্রোজেক্টের সিক্রেট কীসমূহ</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">OpenAI API Key</Label>
              <Input 
                type="password"
                defaultValue={getVal('openai_api_key')}
                onBlur={(e) => handleUpdate('openai_api_key', e.target.value)}
                className="h-11 rounded-xl bg-white/50" 
                placeholder="sk-..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Gemini API Key</Label>
              <Input 
                type="password"
                defaultValue={getVal('gemini_api_key')}
                onBlur={(e) => handleUpdate('gemini_api_key', e.target.value)}
                className="h-11 rounded-xl bg-white/50" 
                placeholder="AIza..."
              />
            </div>

            <div className="space-y-2 border-t pt-4 border-black/5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-orange-600 ml-1">OpenRouter API Key (নতুন)</Label>
              <Input 
                type="password"
                defaultValue={getVal('openrouter_api_key')}
                onBlur={(e) => handleUpdate('openrouter_api_key', e.target.value)}
                className="h-11 rounded-xl bg-white/50 border-orange-200 focus:ring-orange-200" 
                placeholder="sk-or-v1-..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Global Prompt */}
        <Card className="rounded-[2.5rem] border-white/60 shadow-elevated overflow-hidden lg:col-span-2 glass-card">
          <CardHeader className="bg-primary/5 border-b border-black/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              সিস্টেম প্রম্পট (System Prompt)
            </CardTitle>
            <CardDescription className="font-bold">AI শিক্ষককে গাইড করার জন্য স্থায়ী প্রম্পট</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Textarea 
              defaultValue={getVal('ai_system_prompt')}
              onBlur={(e) => handleUpdate('ai_system_prompt', e.target.value)}
              className="min-h-[140px] rounded-2xl text-base font-bold p-5 bg-white/50 resize-none focus:ring-primary/20"
              placeholder="AI এর ভূমিকা বর্ণনা করুন..."
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-medium max-w-md italic">
                * এই প্রম্পটটি প্রত্যেকটি বিশ্লেষণের সময় AI কে তার ভূমিকা মনে করিয়ে দেয়।
              </p>
              {savingKey && <span className="text-[10px] font-black uppercase text-primary animate-pulse flex items-center gap-1">
                <Save className="h-3 w-3" /> সংরক্ষণ হচ্ছে...
              </span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
