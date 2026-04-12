import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Hash } from 'lucide-react';
import Layout from '@/components/Layout';

const cleanRoot = (val: string) => {
  return val.replace(/[^\u0600-\u06FF]/g, '').replace(/[\u064B-\u065F]/g, ''); 
};

export default function VerbBuilderPage() {
  const navigate = useNavigate();
  const [inputRoot, setInputRoot] = useState('');
  const [babIdx, setBabIdx] = useState(0);
  const [tense, setTense] = useState<'madi' | 'mudari'>('madi');
  
  const root = cleanRoot(inputRoot);
  const is3 = root.length === 3;
  const is4 = root.length === 4;
  const letters = (is3 || is4) ? root.split('') : ['ف', 'ع', 'ل'];
  const [c1, c2, c3] = letters;
  const c4 = letters[3] || '';
  const F = '\u064E', D = '\u064F', K = '\u0650', S = '\u0652';

  const abwab = [
    { name: 'نَصَرَ', a: F, m: D },
    { name: 'ضَرَبَ', a: F, m: K },
    { name: 'فَتَحَ', a: F, m: F },
    { name: 'سَمِعَ', a: K, m: F },
    { name: 'كَرُمَ', a: D, m: D },
    { name: 'حَسِبَ', a: K, m: K },
  ];
  const b = abwab[babIdx];

  const madi3 = [
    { p: 'هُوَ (সে)', w: `${c1}${F}${c2}${b.a}${c3}${F}` },
    { p: 'هُمَا (তারা ২ জন)', w: `${c1}${F}${c2}${b.a}${c3}${F}ا` },
    { p: 'هُمْ (তারা সকল)', w: `${c1}${F}${c2}${b.a}${c3}${D}وا` },
    { p: 'هِيَ (সে স্ত্রী)', w: `${c1}${F}${c2}${b.a}${c3}${F}تْ` },
    { p: 'هُمَا (তারা ২ স্ত্রী)', w: `${c1}${F}${c2}${b.a}${c3}${F}تَا` },
    { p: 'هُنَّ (তারা সকল স্ত্রী)', w: `${c1}${F}${c2}${b.a}${c3}${S}نَ` },
    { p: 'أَنْتَ (তুমি)', w: `${c1}${F}${c2}${b.a}${c3}${S}تَ` },
    { p: 'أَنْتُمَا (তোমরা ২ জন)', w: `${c1}${F}${c2}${b.a}${c3}${S}تُمَا` },
    { p: 'أَنْتُمْ (তোমরা সকল)', w: `${c1}${F}${c2}${b.a}${c3}${S}تُمْ` },
    { p: 'أَنْتِ (তুমি স্ত্রী)', w: `${c1}${F}${c2}${b.a}${c3}${S}تِ` },
    { p: 'أَنْتُمَا (তোমরা ২ স্ত্রী)', w: `${c1}${F}${c2}${b.a}${c3}${S}تُمَا` },
    { p: 'أَنْتُنَّ (তোমরা সকল স্ত্রী)', w: `${c1}${F}${c2}${b.a}${c3}${S}تُنَّ` },
    { p: 'أَنَا (আমি)', w: `${c1}${F}${c2}${b.a}${c3}${S}تُ` },
    { p: 'نَحْنُ (আমরা)', w: `${c1}${F}${c2}${b.a}${c3}${S}نَا` },
  ];
  const mudari3 = [
    { p: 'هُوَ (সে)', w: `ي${F}${c1}${S}${c2}${b.m}${c3}${D}` },
    { p: 'هُمَا (তারা ২ জন)', w: `ي${F}${c1}${S}${c2}${b.m}${c3}${F}انِ` },
    { p: 'هُمْ (তারা সকল)', w: `ي${F}${c1}${S}${c2}${b.m}${c3}${D}ونَ` },
    { p: 'هِيَ (সে স্ত্রী)', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${D}` },
    { p: 'هُمَا (তারা ২ স্ত্রী)', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${F}انِ` },
    { p: 'هُنَّ (তারা সকল স্ত্রী)', w: `ي${F}${c1}${S}${c2}${b.m}${c3}${S}نَ` },
    { p: 'أَنْتَ (তুমি)', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${D}` },
    { p: 'أَنْتُمَا (তোমরা ২ জন)', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${F}انِ` },
    { p: 'أَنْتُمْ (তোমরা সকল)', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${D}ونَ` },
    { p: 'أَنْتِ (তুমি স্ত্রী)', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${K}ينَ` },
    { p: 'أَنْتُمَا (তোমরা ২ স্ত্রী)', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${F}انِ` },
    { p: 'أَنْتُنَّ (তোমরা সকল স্ত্রী)', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${S}نَ` },
    { p: 'أَنَا (আমি)', w: `أ${F}${c1}${S}${c2}${b.m}${c3}${D}` },
    { p: 'نَحْنُ (আমরা)', w: `ن${F}${c1}${S}${c2}${b.m}${c3}${D}` },
  ];

  const rows = tense === 'madi' ? madi3 : mudari3;

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-[#FDFCFB]">
        <header className="px-6 h-20 border-b border-black/5 flex items-center justify-between glass-morphism sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/tools')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Hash className="h-6 w-6 text-indigo-600" />
                تصريف الفعل (Verb Conjugator)
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ফেল এর ১৪ সিগাহ রূপান্তর</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-hidden">
          <div className="w-full max-w-4xl mx-auto flex flex-col h-full gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-[2rem] p-6 shadow-card border border-black/5 flex flex-col justify-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">মূল অক্ষর (Root Letters)</label>
                <Input 
                  value={inputRoot} 
                  onChange={e => setInputRoot(e.target.value)} 
                  placeholder="উদা: ن ص ر" 
                  className="h-16 font-arabic text-3xl bg-secondary/20 rounded-2xl text-center border-none shadow-inner" 
                  dir="rtl" 
                />
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-card border border-black/5 flex flex-col justify-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">زمان (Tense)</label>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <Button 
                    variant="ghost" 
                    onClick={() => setTense('madi')} 
                    className={`flex-1 h-12 rounded-xl font-bold ${tense === 'madi' ? 'shadow-sm bg-white hover:bg-white text-slate-900' : 'text-slate-500'}`}
                  >মাضي (Past)</Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setTense('mudari')} 
                    className={`flex-1 h-12 rounded-xl font-bold ${tense === 'mudari' ? 'shadow-sm bg-white hover:bg-white text-slate-900' : 'text-slate-500'}`}
                  >مضارع (Present)</Button>
                </div>
              </div>
            </div>

            {!is4 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {abwab.map((bb, i) => (
                  <Button 
                    key={i} 
                    variant={babIdx === i ? 'secondary' : 'outline'} 
                    onClick={() => setBabIdx(i)}
                    className={`h-10 px-6 font-arabic text-sm rounded-full ${babIdx === i ? 'bg-indigo-600 text-white border-transparent' : 'border-black/5'}`}
                    dir="rtl"
                  >
                    {bb.name}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-auto rounded-[2.5rem] border border-black/5 shadow-inner bg-white/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {rows.map((r, i) => (
                  <div key={i} className="flex justify-between items-center px-6 py-4 rounded-2xl hover:bg-white transition-colors border-b border-black/5 md:border-b-0 group">
                    <span className="font-arabic text-base text-slate-400 font-bold group-hover:text-indigo-400 transition-colors" dir="rtl">{r.p}</span>
                    <span className="font-arabic text-3xl text-slate-900 font-black" dir="rtl">{r.w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
