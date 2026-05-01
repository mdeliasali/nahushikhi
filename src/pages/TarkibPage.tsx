import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

export default function TarkibPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tarkib' | 'tahkik'>('tarkib');
  const [tahkikInput, setTahkikInput] = useState('');
  const [tahkikResult, setTahkikResult] = useState<string | null>(null);
  const [tahkikLoading, setTahkikLoading] = useState(false);
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [tarkibResult, setTarkibResult] = useState<string | null>(null);

  const handleTahkik = async () => {
    if (!tahkikInput.trim()) return;
    setTahkikLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentence', {
        body: {
          sentence: tahkikInput,
          action: 'tahkik',
        },
      });
      if (error) throw error;
      setTahkikResult(data?.analysis || data?.text || JSON.stringify(data));
    } catch (err) {
      toast.error('বিশ্লেষণে সমস্যা হয়েছে');
    } finally {
      setTahkikLoading(false);
    }
  };

  const analyzeSentence = async () => {
    if (!sentence) return;
    setLoading(true);
    setTarkibResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentence', {
        body: { sentence, action: 'parse_tarkib' }
      });

      if (error) {
        throw new Error(`Connection error: ${error.message || 'Server unavailable'}`);
      }
      if (data?.error) throw new Error(data.error);

      const text = data?.analysis || data?.text || '';
      if (!text) throw new Error('বিশ্লেষণ ডেটা পাওয়া যায়নি। অনুগ্রহ করে অন্য বাক্য চেষ্টা করুন।');
      setTarkibResult(text);
    } catch (e: any) {
      toast.error(e.message || 'বিশ্লেষণ ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
        <header className="px-6 h-20 border-b border-black/5 flex items-center glass-morphism sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                তারকিব পার্সার
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">বাক্য বিশ্লেষণ ও গ্রামার ম্যাপ</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-y-auto">
          <div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('tarkib')}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'tarkib' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              তারকিব বিশ্লেষণ
            </button>
            <button
              onClick={() => setActiveTab('tahkik')}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'tahkik' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              তাহকিক (শব্দ)
            </button>
          </div>

          {activeTab === 'tarkib' && (
            <div className="glass-card rounded-[2rem] p-6 space-y-4">
              <div>
                <h2 className="text-lg font-black">তারকিব — বাক্য বিশ্লেষণ</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  আরবি বাক্যের প্রতিটি পদের ব্যাকরণগত অবস্থান বিশ্লেষণ করো
                </p>
              </div>
              <div className="flex gap-3">
                <Input
                  value={sentence}
                  onChange={e => setSentence(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyzeSentence()}
                  placeholder="আরবি বাক্য লিখুন (উদা: الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ)"
                  className="text-right font-serif text-lg h-12 rounded-2xl flex-1"
                  dir="rtl"
                />
                <Button
                  disabled={loading || !sentence}
                  onClick={analyzeSentence}
                  className="h-12 px-6 rounded-2xl font-bold"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'বিশ্লেষণ'}
                </Button>
              </div>
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm font-bold text-slate-500">AI বাক্য বিশ্লেষণ করছে...</p>
                  </div>
                </div>
              )}
              {tarkibResult && (
                <div className="bg-secondary/30 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {tarkibResult}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tahkik' && (
            <div className="glass-card rounded-[2rem] p-6 space-y-4">
              <div>
                <h2 className="text-lg font-black">তাহকিক — শব্দ বিশ্লেষণ</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  যেকোনো আরবি শব্দের মূল (জযর), ওজন, ইরাব ও অর্থ বিশ্লেষণ করো
                </p>
              </div>
              <div className="flex gap-3">
                <Input
                  value={tahkikInput}
                  onChange={e => setTahkikInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTahkik()}
                  placeholder="আরবি শব্দ লেখো... যেমন: الْمُجْتَهِدُ"
                  className="text-right font-serif text-lg h-12 rounded-2xl flex-1"
                  dir="rtl"
                />
                <Button
                  onClick={handleTahkik}
                  disabled={tahkikLoading || !tahkikInput.trim()}
                  className="h-12 px-6 rounded-2xl font-bold"
                >
                  {tahkikLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : 'বিশ্লেষণ'}
                </Button>
              </div>
              {tahkikResult && (
                <div className="bg-secondary/30 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {tahkikResult}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
