import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Wand2, Hash, MessageSquare, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';

// Word Builder Tool
function WordBuilder() {
  const [root, setRoot] = useState('');
  const patterns = [
    { pattern: '\u0641\u064E\u0627\u0639\u0650\u0644', name: '\u0987\u09B8\u09AE\u09C7 \u09AB\u09BE\u0987\u09B2', example: '\u0995\u09B0\u09CD\u09A4\u09BE' },
    { pattern: '\u0645\u064E\u0641\u0652\u0639\u064F\u0648\u0644', name: '\u0987\u09B8\u09AE\u09C7 \u09AE\u09BE\u09AB\u0989\u09B2', example: '\u0995\u09B0\u09CD\u09AE' },
    { pattern: '\u0641\u064E\u0639\u064E\u0651\u0627\u0644', name: '\u09AE\u09C1\u09AC\u09BE\u09B2\u09BE\u0997\u09BE', example: '\u0985\u09A4\u09BF\u09B6\u09AF\u09BC' },
    { pattern: '\u0645\u064E\u0641\u0652\u0639\u064E\u0644', name: '\u0987\u09B8\u09AE\u09C7 \u09AF\u09BE\u09B0\u09AB', example: '\u09B8\u09CD\u09A5\u09BE\u09A8/\u0995\u09BE\u09B2' },
    { pattern: '\u0645\u0650\u0641\u0652\u0639\u064E\u0627\u0644', name: '\u0987\u09B8\u09AE\u09C7 \u0986\u09B2\u09BE\u09A4', example: '\u09AF\u09A8\u09CD\u09A4\u09CD\u09B0' },
    { pattern: '\u062A\u064E\u0641\u0652\u0639\u0650\u064A\u0644', name: '\u09AE\u09BE\u09B8\u09A6\u09BE\u09B0 (\u09AC\u09BE\u09AC-\u09E8)', example: '\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u09AC\u09BF\u09B6\u09C7\u09B7\u09CD\u09AF' },
  ];

  return (
    <div className="glass-card rounded-3xl overflow-hidden shadow-card ring-1 ring-black/5 animate-in-fade">
      <div className="p-5 bg-primary/5 border-b border-black/5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Wand2 className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-base font-extrabold tracking-tight">{'\uD83C\uDFAE'} শব্দ তৈরি (Word Builder)</h2>
      </div>
      <div className="p-5 space-y-5">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">মূল অক্ষর (Root Letters)</Label>
          <Input 
            value={root} 
            onChange={e => setRoot(e.target.value)} 
            placeholder="যেমন: ك ت ب" 
            className="h-14 font-arabic text-xl border-none bg-secondary/30 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all rounded-2xl text-center" 
            dir="rtl" 
          />
        </div>
        {root && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in-fade">
            {patterns.map((p, i) => (
              <div key={i} className="p-4 bg-white/60 rounded-2xl border border-black/5 hover:border-primary/20 hover:bg-white transition-all shadow-sm group">
                <p className="arabic-text text-2xl text-primary font-bold group-hover:scale-105 transition-transform origin-right">{p.pattern}</p>
                <p className="text-sm font-extrabold mt-1">{p.name}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{p.example}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Verb Conjugation Tool
function VerbBuilder() {
  const pronouns = [
    { bn: 'সে (পু.)', ar: '\u0647\u064F\u0648\u064E', suffix: '\u0641\u064E\u0639\u064E\u0644\u064E' },
    { bn: 'তারা দুজন (পু.)', ar: '\u0647\u064F\u0645\u064E\u0627', suffix: '\u0641\u064E\u0639\u064E\u0644\u064E\u0627' },
    { bn: 'তারা (পু.)', ar: '\u0647\u064F\u0645\u0652', suffix: '\u0641\u064E\u0639\u064E\u0644\u064F\u0648\u0627' },
    { bn: 'সে (স্ত্রী.)', ar: '\u0647\u0650\u064A\u064E', suffix: '\u0641\u064E\u0639\u064E\u0644\u064E\u062A\u0652' },
    { bn: 'তারা দুজন (স্ত্রী.)', ar: '\u0647\u064F\u0645\u064E\u0627', suffix: '\u0641\u064E\u0639\u064E\u0644\u064E\u062A\u064E\u0627' },
    { bn: 'তারা (স্ত্রী.)', ar: '\u0647\u064F\u0646\u064E\u0651', suffix: '\u0641\u064E\u0639\u064E\u0644\u0652\u0646\u064E' },
    { bn: 'তুমি (পু.)', ar: '\u0623\u064E\u0646\u0652\u062A\u064E', suffix: '\u0641\u064E\u0639\u064E\u0644\u0652\u062A\u064E' },
    { bn: 'তোমরা দুজন', ar: '\u0623\u064E\u0646\u0652\u062A\u064F\u0645\u064E\u0627', suffix: '\u0641\u064E\u0639\u064E\u0644\u0652\u062A\u064F\u0645\u064E\u0627' },
    { bn: 'তোমরা (পু.)', ar: '\u0623\u064E\u0646\u0652\u062A\u064F\u0645\u0652', suffix: '\u0641\u064E\u0639\u064E\u0644\u0652\u062A\u064F\u0645\u0652' },
    { bn: 'তুমি (স্ত্রী.)', ar: '\u0623\u064E\u0646\u0652\u062A\u0650', suffix: '\u0641\u064E\u0639\u064E\u0644\u0652\u062A\u0650' },
    { bn: 'তোমরা (স্ত্রী.)', ar: '\u0623\u064E\u0646\u0652\u062A\u064F\u0646\u064E\u0651', suffix: '\u0641\u064E\u0639\u064E\u0644\u0652\u062A\u064F\u0646\u064E\u0651' },
    { bn: 'আমি', ar: '\u0623\u064E\u0646\u064E\u0627', suffix: '\u0641\u064E\u0639\u064E\u0644\u0652\u062A\u064F' },
    { bn: 'আমরা', ar: '\u0646\u064E\u062D\u0652\u0646\u064F', suffix: '\u0641\u064E\u0639\u064E\u0644\u0652\u0646\u064E\u0627' },
  ];

  return (
    <div className="glass-card rounded-3xl overflow-hidden shadow-card ring-1 ring-black/5 animate-in-fade anim-delay-100">
      <div className="p-5 bg-indigo-50/50 border-b border-black/5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <Hash className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-base font-extrabold tracking-tight">{'\uD83D\uDCCA'} ক্রিয়ারূপ (Verb Builder)</h2>
      </div>
      <div className="p-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">ফেলে মাজি — ১৪ রূপ (তাসরিফে লুগাভি)</p>
        <div className="overflow-hidden rounded-2xl border border-black/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-50/30">
                <th className="text-left p-3 font-black text-[10px] uppercase tracking-widest text-muted-foreground">সর্বনাম</th>
                <th className="text-right p-3 font-black text-[10px] uppercase tracking-widest text-muted-foreground font-arabic">সর্বনাম</th>
                <th className="text-right p-3 font-black text-[10px] uppercase tracking-widest text-muted-foreground font-arabic">রূপ</th>
              </tr>
            </thead>
            <tbody>
              {pronouns.map((p, i) => (
                <tr key={i} className="border-b border-black/5 last:border-0 hover:bg-indigo-50/20 transition-colors">
                  <td className="p-3 text-xs font-bold text-slate-600">{p.bn}</td>
                  <td className="p-3 text-right font-arabic text-lg font-bold text-slate-800">{p.ar}</td>
                  <td className="p-3 text-right font-arabic text-xl font-black text-primary">{p.suffix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sentence Parser Tool
function SentenceParser() {
  const [sentence, setSentence] = useState('');
  const [analysis, setAnalysis] = useState('');

  return (
    <div className="glass-card rounded-3xl overflow-hidden shadow-card ring-1 ring-black/5 animate-in-fade anim-delay-200">
      <div className="p-5 bg-amber-50/50 border-b border-black/5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-amber-600" />
        </div>
        <h2 className="text-base font-extrabold tracking-tight">{'\uD83E\uDDE9'} বাক্য বিশ্লেষণ (Parsing Tool)</h2>
      </div>
      <div className="p-5 space-y-5">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">আরবি বাক্য</Label>
          <Input 
            value={sentence} 
            onChange={e => setSentence(e.target.value)} 
            placeholder="ذَهَبَ الرَّجُلُ إِلَى المَسْجِدِ" 
            className="h-14 font-arabic text-xl border-none bg-secondary/30 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all rounded-2xl text-right" 
            dir="rtl" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">আপনার বিশ্লেষণ</Label>
          <Textarea 
            value={analysis} 
            onChange={e => setAnalysis(e.target.value)} 
            placeholder="ذَهَبَ — ফেলে মাজি, الرَّجُلُ — ফাইল (মারফু), ..." 
            rows={4} 
            className="rounded-2xl border-none bg-secondary/30 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all p-4 font-medium"
          />
        </div>
        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-black uppercase tracking-widest text-amber-800">বিশ্লেষণের ধাপ</p>
          </div>
          <ol className="text-xs text-amber-900/70 space-y-2 font-bold list-decimal list-inside">
            <li>বাক্যটি জুমলা ফেলিয়া না ইসমিয়া চিহ্নিত করুন</li>
            <li>প্রতিটি শব্দের প্রকার (ইসম/ফেল/হরফ) নির্ণয় করুন</li>
            <li>ইরাব (রফা/নসব/জর) চিহ্নিত করুন</li>
            <li>ব্যাকরণগত ভূমিকা (ফাইল/মাফউল/মুবতাদা/খবর) লিখুন</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-full bg-[#FDFCFB] pb-10">
        <header className="sticky top-0 z-40 glass-morphism w-full border-b border-white/20">
          <div className="container mx-auto max-w-5xl flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-black/5"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-sm font-extrabold tracking-tight">{'\uD83D\uDEE0\uFE0F'} ইন্টারেক্টিভ টুলস</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl animate-in-fade">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <WordBuilder />
            <VerbBuilder />
            <SentenceParser />
          </div>
        </main>
      </div>
    </Layout>
  );
}

