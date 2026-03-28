import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

// Word Builder Tool
function WordBuilder() {
  const [root, setRoot] = useState('');
  const patterns = [
    { pattern: 'فَاعِل', name: 'ইসমে ফাইল', example: 'কর্তা' },
    { pattern: 'مَفْعُول', name: 'ইসমে মাফউল', example: 'কর্ম' },
    { pattern: 'فَعَّال', name: 'মুবালাগা', example: 'অতিশয়' },
    { pattern: 'مَفْعَل', name: 'ইসমে যারফ', example: 'স্থান/কাল' },
    { pattern: 'مِفْعَال', name: 'ইসমে আলাত', example: 'যন্ত্র' },
    { pattern: 'تَفْعِيل', name: 'মাসদার (বাব-২)', example: 'ক্রিয়াবিশেষ্য' },
  ];

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">🎮 শব্দ তৈরি (Word Builder)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>মূল অক্ষর (Root Letters) লিখুন</Label>
          <Input value={root} onChange={e => setRoot(e.target.value)} placeholder="যেমন: ك ت ب" className="font-arabic text-right text-lg" dir="rtl" />
        </div>
        {root && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patterns.map((p, i) => (
              <div key={i} className="p-3 bg-secondary/50 rounded-lg">
                <p className="arabic-text text-lg">{p.pattern}</p>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.example}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Verb Conjugation Tool
function VerbBuilder() {
  const pronouns = [
    { bn: 'সে (পু.)', ar: 'هُوَ', suffix: 'فَعَلَ' },
    { bn: 'তারা দুজন (পু.)', ar: 'هُمَا', suffix: 'فَعَلَا' },
    { bn: 'তারা (পু.)', ar: 'هُمْ', suffix: 'فَعَلُوا' },
    { bn: 'সে (স্ত্রী.)', ar: 'هِيَ', suffix: 'فَعَلَتْ' },
    { bn: 'তারা দুজন (স্ত্রী.)', ar: 'هُمَا', suffix: 'فَعَلَتَا' },
    { bn: 'তারা (স্ত্রী.)', ar: 'هُنَّ', suffix: 'فَعَلْنَ' },
    { bn: 'তুমি (পু.)', ar: 'أَنْتَ', suffix: 'فَعَلْتَ' },
    { bn: 'তোমরা দুজন', ar: 'أَنْتُمَا', suffix: 'فَعَلْتُمَا' },
    { bn: 'তোমরা (পু.)', ar: 'أَنْتُمْ', suffix: 'فَعَلْتُمْ' },
    { bn: 'তুমি (স্ত্রী.)', ar: 'أَنْتِ', suffix: 'فَعَلْتِ' },
    { bn: 'তোমরা (স্ত্রী.)', ar: 'أَنْتُنَّ', suffix: 'فَعَلْتُنَّ' },
    { bn: 'আমি', ar: 'أَنَا', suffix: 'فَعَلْتُ' },
    { bn: 'আমরা', ar: 'نَحْنُ', suffix: 'فَعَلْنَا' },
  ];

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">📊 ক্রিয়ারূপ (Verb Builder)</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">ফেলে মাজি — ১৪ রূপ (তাসরিফে লুগাভি)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-2">সর্বনাম (বাংলা)</th>
                <th className="text-right py-2 px-2 font-arabic">সর্বনাম</th>
                <th className="text-right py-2 pl-2 font-arabic">রূপ</th>
              </tr>
            </thead>
            <tbody>
              {pronouns.map((p, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 pr-2 text-xs">{p.bn}</td>
                  <td className="py-2 px-2 text-right font-arabic text-base">{p.ar}</td>
                  <td className="py-2 pl-2 text-right font-arabic text-base text-primary">{p.suffix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Sentence Parser Tool
function SentenceParser() {
  const [sentence, setSentence] = useState('');
  const [analysis, setAnalysis] = useState('');

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">🧩 বাক্য বিশ্লেষণ (Parsing Tool)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>আরবি বাক্য লিখুন</Label>
          <Input value={sentence} onChange={e => setSentence(e.target.value)} placeholder="ذَهَبَ الرَّجُلُ إِلَى المَسْجِدِ" className="font-arabic text-right text-lg" dir="rtl" />
        </div>
        <div className="space-y-2">
          <Label>আপনার বিশ্লেষণ লিখুন</Label>
          <Textarea value={analysis} onChange={e => setAnalysis(e.target.value)} placeholder="ذَهَبَ — ফেলে মাজি, الرَّجُلُ — ফাইল (মারফু), ..." rows={4} />
        </div>
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm font-medium mb-2">💡 বিশ্লেষণের ধাপ:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>বাক্যটি জুমলা ফেলিয়া না ইসমিয়া চিহ্নিত করুন</li>
            <li>প্রতিটি শব্দের প্রকার (ইসম/ফেল/হরফ) নির্ণয় করুন</li>
            <li>ইরাব (রফা/নসব/জর) চিহ্নিত করুন</li>
            <li>ব্যাকরণগত ভূমিকা (ফাইল/মাফউল/মুবতাদা/খবর) লিখুন</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ToolsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-semibold">🛠️ ইন্টারেক্টিভ টুলস</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-3xl space-y-6">
        <WordBuilder />
        <VerbBuilder />
        <SentenceParser />
      </main>
    </div>
  );
}
