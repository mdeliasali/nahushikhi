import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

// --- Tree Data Type ---
interface TreeNode {
  text?: string;
  role: string;
  children?: TreeNode[];
}

// --- Recursive Bracket Tree Component ---
function BracketTree({ node }: { node: TreeNode }) {
  const children = node.children || [];
  const isLeaf = children.length === 0;

  if (isLeaf) {
    return (
      <div className="flex flex-col items-center mx-2 sm:mx-3">
        {node.text && (
          <span className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
            {node.text}
          </span>
        )}
        <div className="w-px h-2 sm:h-3 bg-slate-800 mt-1" />
        <span className="text-[10px] sm:text-xs font-bold text-slate-700 whitespace-nowrap mt-0.5" style={{ fontFamily: "'Amiri', serif" }}>
          {node.role}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Children row */}
      <div className="flex items-end justify-center" dir="rtl">
        {children.map((child, i) => (
          <BracketTree key={i} node={child} />
        ))}
      </div>

      {/* Bracket connector */}
      <div className="flex flex-col items-center w-full mt-1">
        {/* Vertical stubs from children + horizontal bar */}
        {children.length > 1 ? (
          <div className="relative w-full flex justify-center">
            {/* Horizontal bar spanning children area */}
            <div className="border-t-2 border-slate-800" style={{ width: `${Math.max(60, 100 - (100 / (children.length + 1)))}%` }} />
          </div>
        ) : (
          <div className="w-px h-1 bg-slate-800" />
        )}
        {/* Vertical line down to label */}
        <div className="w-px h-2 sm:h-3 bg-slate-800" />
      </div>

      {/* This node's role label */}
      <span className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-800 whitespace-nowrap" style={{ fontFamily: "'Amiri', serif" }}>
        {node.role}
      </span>
    </div>
  );
}

// --- Main Page ---
export default function TarkibPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tarkib' | 'tahkik'>('tarkib');
  const [tahkikInput, setTahkikInput] = useState('');
  const [tahkikResult, setTahkikResult] = useState<string | null>(null);
  const [tahkikLoading, setTahkikLoading] = useState(false);
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [textFallback, setTextFallback] = useState<string | null>(null);

  const handleTahkik = async () => {
    if (!tahkikInput.trim()) return;
    setTahkikLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentence', {
        body: { sentence: tahkikInput, action: 'tahkik' },
      });
      if (error) throw error;
      setTahkikResult(data?.analysis || data?.text || JSON.stringify(data));
    } catch {
      toast.error('বিশ্লেষণে সমস্যা হয়েছে');
    } finally {
      setTahkikLoading(false);
    }
  };

  const analyzeSentence = async () => {
    if (!sentence) return;
    setLoading(true);
    setTreeData(null);
    setTextFallback(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentence', {
        body: { sentence, action: 'parse_tarkib' }
      });

      if (error) throw new Error(error.message || 'Server unavailable');
      if (data?.error) throw new Error(data.error);

      if (data?.tree) {
        setTreeData(data.tree);
      } else if (data?.analysis) {
        setTextFallback(data.analysis);
      } else {
        throw new Error('বিশ্লেষণ ডেটা পাওয়া যায়নি।');
      }
    } catch (e: any) {
      toast.error(e.message || 'বিশ্লেষণ ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
        <header className="px-4 sm:px-6 h-16 sm:h-20 border-b border-black/5 flex items-center glass-morphism sticky top-0 z-50">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                তারকিব পার্সার
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">বাক্য বিশ্লেষণ ও গ্রামার ম্যাপ</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 gap-4 sm:gap-6 overflow-y-auto">
          {/* Tab switcher */}
          <div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('tarkib')}
              className={`px-4 sm:px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'tarkib' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              তারকিব বিশ্লেষণ
            </button>
            <button
              onClick={() => setActiveTab('tahkik')}
              className={`px-4 sm:px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'tahkik' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              তাহকিক (শব্দ)
            </button>
          </div>

          {/* Tarkib Tab */}
          {activeTab === 'tarkib' && (
            <div className="glass-card rounded-[2rem] p-4 sm:p-6 space-y-4">
              <div>
                <h2 className="text-lg font-black">তারকিব — বাক্য বিশ্লেষণ</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  আরবি বাক্যের প্রতিটি পদের ব্যাকরণগত অবস্থান tree diagram-এ দেখো
                </p>
              </div>
              <div className="flex gap-3">
                <Input
                  value={sentence}
                  onChange={e => setSentence(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyzeSentence()}
                  placeholder="আরবি বাক্য লিখুন (উদা: الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ)"
                  className="text-right font-serif text-base sm:text-lg h-12 rounded-2xl flex-1"
                  dir="rtl"
                />
                <Button
                  disabled={loading || !sentence}
                  onClick={analyzeSentence}
                  className="h-12 px-5 sm:px-6 rounded-2xl font-bold"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'বিশ্লেষণ'}
                </Button>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm font-bold text-slate-500">AI বাক্য বিশ্লেষণ করছে...</p>
                  </div>
                </div>
              )}

              {/* Tree Diagram Result */}
              {treeData && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 overflow-x-auto">
                  <div className="flex justify-center min-w-fit" dir="rtl">
                    <BracketTree node={treeData} />
                  </div>
                </div>
              )}

              {/* Text Fallback */}
              {textFallback && (
                <div className="bg-secondary/30 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {textFallback}
                </div>
              )}
            </div>
          )}

          {/* Tahkik Tab */}
          {activeTab === 'tahkik' && (
            <div className="glass-card rounded-[2rem] p-4 sm:p-6 space-y-4">
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
                  {tahkikLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'বিশ্লেষণ'}
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
