import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Wand2, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';

const cleanRoot = (val: string) => {
  return val.replace(/[^\u0600-\u06FF]/g, '').replace(/[\u064B-\u065F]/g, ''); 
};

export default function MorphologyPage() {
  const navigate = useNavigate();
  const [inputRoot, setInputRoot] = useState('');
  const [babIdx, setBabIdx] = useState(0);
  
  const root = cleanRoot(inputRoot);
  const is3 = root.length === 3;
  const is4 = root.length === 4;
  const letters = (is3 || is4) ? root.split('') : ['ف', 'ع', 'ل'];
  const [c1, c2, c3] = letters;
  const c4 = letters[3] || '';
  const F = '\u064E', D = '\u064F', K = '\u0650', S = '\u0652', SH = '\u0651', TM = '\u0629';

  const abwab = [
    { name: 'نَصَرَ يَنْصُرُ', a: F, m: D },
    { name: 'ضَرَبَ يَضْرِبُ', a: F, m: K },
    { name: 'فَتَحَ يَفْتَحُ', a: F, m: F },
    { name: 'سَمِعَ يَسْمَعُ', a: K, m: F },
    { name: 'كَرُمَ يَكْرُمُ', a: D, m: D },
    { name: 'حَسِبَ يَحْسِبُ', a: K, m: K },
  ];
  const b = abwab[babIdx];

  const forms = is4 ? [
    { label: 'ماضي', wazn: 'فَعْلَلَ', word: `${c1}${F}${c2}${S}${c3}${F}${c4}${F}` },
    { label: 'مضارع', wazn: 'يُفَعْلِلُ', word: `ي${D}${c1}${F}${c2}${S}${c3}${K}${c4}${D}` },
    { label: 'مصدر', wazn: 'فَعْلَلَة', word: `${c1}${F}${c2}${S}${c3}${F}${c4}${F}${TM}` },
    { label: 'اسم ফاعل', wazn: 'مُفَعْلِل', word: `م${D}${c1}${F}${c2}${S}${c3}${K}${c4}` },
    { label: 'اسم مفعول', wazn: 'مُفَعْلَل', word: `م${D}${c1}${F}${c2}${S}${c3}${F}${c4}` },
    { label: 'أمر', wazn: 'فَعْلِلْ', word: `${c1}${F}${c2}${S}${c3}${K}${c4}${S}` },
  ] : [
    { label: 'ماضي', wazn: 'فَعَلَ', word: `${c1}${F}${c2}${b.a}${c3}${F}` },
    { label: 'مضارع', wazn: 'يَفْعُلُ', word: `ي${F}${c1}${S}${c2}${b.m}${c3}${D}` },
    { label: 'مصدر', wazn: 'فَعْل', word: `${c1}${F}${c2}${S}${c3}` },
    { label: 'اسم ফاعل', wazn: 'فَاعِل', word: `${c1}${F}ا${c2}${K}${c3}` },
    { label: 'اسم مفعول', wazn: 'مَفْعُول', word: `م${F}${c1}${S}${c2}${D}و${c3}` },
    { label: 'أمر', wazn: 'اُفْعُلْ', word: `ا${b.m === D ? D : K}${c1}${S}${c2}${b.m}${c3}${S}` },
    { label: 'مبالغة', wazn: 'فَعَّال', word: `${c1}${F}${c2}${F}${SH}ا${c3}` },
    { label: 'تفضيل', wazn: 'أَفْعَل', word: `أ${F}${c1}${S}${c2}${F}${c3}` },
  ];

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
                <Wand2 className="h-6 w-6 text-primary" />
                صرف الكلمة (Morphology)
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">শব্দের মূল কাঠামো ও রূপান্তর</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-auto">
          <div className="w-full max-w-2xl mx-auto space-y-8 animate-in-fade">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-card border border-black/5 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">মূল অক্ষর (Root Letters)</label>
                <Input 
                  value={inputRoot} 
                  onChange={e => setInputRoot(e.target.value)} 
                  placeholder="উদা: ک ت ب" 
                  className="h-20 font-arabic text-4xl bg-secondary/20 rounded-3xl text-center border-none shadow-inner" 
                  dir="rtl" 
                />
              </div>

              {!is4 && (
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">বাব নির্বাচন (Choose Bab)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {abwab.map((bb, i) => (
                      <Button 
                        key={i} 
                        variant={babIdx === i ? 'secondary' : 'outline'} 
                        onClick={() => setBabIdx(i)}
                        className={`h-12 font-arabic text-sm rounded-xl ${babIdx === i ? 'border-primary ring-1 ring-primary/20' : 'border-black/5'}`}
                        dir="rtl"
                      >
                        {bb.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {forms.map((f, i) => (
                <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-black/5 flex flex-col items-center justify-center space-y-3 hover:shadow-md transition-shadow">
                  <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/5 rounded-full uppercase tracking-widest">{f.label}</span>
                  <h3 className="font-arabic text-4xl text-slate-900 font-bold" dir="rtl">{f.word}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">ওজন:</span>
                    <span className="font-arabic text-base text-slate-500" dir="rtl">{f.wazn}</span>
                  </div>
                </div>
              ))}
            </div>

            {(root.length < 3) && (
              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-center gap-4">
                <Sparkles className="h-8 w-8 text-amber-500" />
                <p className="text-sm font-bold text-amber-700">৩ অথবা ৪টি মূল অক্ষর লিখলে শব্দরূপ গুলো এখানে প্রদর্শিত হবে।</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}
