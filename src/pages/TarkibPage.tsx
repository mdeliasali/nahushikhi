import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, Loader2, ZoomIn, ZoomOut, Maximize2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface TarkibNode {
  id: string;
  text: string;
  role: string | null;
  level: number;
  children: string[];
}

function TarkibVisualization({ nodes, scale }: { nodes: TarkibNode[], scale: number }) {
  const maxLevel = Math.max(0, ...nodes.map(n => n.level || 0));
  const wordNodes = nodes.filter(n => (n.level || 0) === 0);
  
  // PDF-like layout dimensions
  const COL_W = 160;
  const ROW_H = 130;
  const PADDING_X = 100;
  const PADDING_Y = 80;
  
  const totalLeafs = wordNodes.length;
  const svgWidth = Math.max(800, (totalLeafs * COL_W) + (PADDING_X * 2));
  const svgHeight = (maxLevel * ROW_H) + PADDING_Y * 2 + 80;

  const layout = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const words = nodes.filter(n => (n.level || 0) === 0);
    
    // Distribute words Right-To-Left tightly
    words.forEach((node, idx) => {
      pos[node.id] = {
        x: svgWidth - PADDING_X - (idx * COL_W) - (COL_W / 2),
        y: PADDING_Y
      };
    });

    for (let lvl = 1; lvl <= maxLevel; lvl++) {
      const levelNodes = nodes.filter(n => (n.level || 0) === lvl);
      levelNodes.forEach(node => {
        if (node.children?.length > 0) {
          const childPos = node.children.map(cid => pos[cid]).filter(Boolean);
          if (childPos.length > 0) {
             const avgX = childPos.reduce((a, b) => a + b.x, 0) / childPos.length;
             pos[node.id] = { x: avgX, y: PADDING_Y + (lvl * ROW_H) };
          }
        }
      });
    }
    return pos;
  }, [nodes, svgWidth, maxLevel]);

  // Helper for orthogonal path with rounded corners
  const getOrthogonalPath = (x1: number, y1: number, x2: number, y2: number) => {
    if (Math.abs(x1 - x2) < 5) return `M ${x1} ${y1} L ${x2} ${y2}`;
    
    const midY = y1 + (y2 - y1) / 2;
    const radius = Math.min(12, Math.abs(x1 - x2) / 2, Math.abs(y1 - midY));
    
    const dirX = x2 > x1 ? 1 : -1;
    const dirY1 = midY > y1 ? 1 : -1;
    const dirY2 = y2 > midY ? 1 : -1;
    
    return [
      `M ${x1} ${y1}`,
      `L ${x1} ${midY - radius * dirY1}`,
      `Q ${x1} ${midY} ${x1 + radius * dirX} ${midY}`,
      `L ${x2 - radius * dirX} ${midY}`,
      `Q ${x2} ${midY} ${x2} ${midY + radius * dirY2}`,
      `L ${x2} ${y2}`
    ].join(' ');
  };

  return (
    <div className="absolute inset-0 overflow-auto custom-scrollbar flex bg-slate-50/50">
      <div className="min-w-max min-h-full flex flex-col items-center justify-start p-8 md:p-16 mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] rounded-3xl" />
          <svg 
            width={svgWidth * scale} 
            height={svgHeight * scale} 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            className="overflow-visible relative z-10 [text-rendering:geometricPrecision]"
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
            </defs>

            {/* Draw Paths connecting Parent and Children */}
            {nodes.map(node => {
               const parentPos = layout[node.id];
               if (!parentPos || !node.children?.length) return null;

               return node.children.map((childId, idx) => {
                  const childNode = nodes.find(n => n.id === childId);
                  const childPos = layout[childId];
                  if (!childPos || !childNode) return null;

                  const isChildWord = (childNode.level || 0) === 0;
                  const startY = isChildWord ? childPos.y + 65 : childPos.y + 35; 
                  const endY = parentPos.y - 30; 
                  
                  const total = node.children.length;
                  let targetX = parentPos.x;
                  if (total > 1) {
                     const spread = Math.min(120, total * 40); 
                     const step = spread / (total - 1);
                     targetX = parentPos.x + (spread / 2) - (idx * step);
                  }

                  const path = getOrthogonalPath(childPos.x, startY, targetX, endY);

                  return (
                    <path
                      key={`path-${node.id}-${childId}`}
                      d={path}
                      fill="none"
                      strokeWidth="2"
                      stroke="#94a3b8"
                      markerEnd="url(#arrowhead)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                    />
                  );
               });
            })}

            {/* Draw Nodes */}
            {nodes.map(node => {
               const p = layout[node.id];
               if (!p) return null;
               const isWord = (node.level || 0) === 0;

               return (
                 <g key={node.id}>
                    {isWord ? (
                      <foreignObject x={p.x - 80} y={p.y - 40} width={160} height={120}>
                        <div className="flex flex-col items-center justify-center w-full h-full text-center">
                          <span className="text-4xl font-bold font-arabic text-slate-800 leading-tight drop-shadow-sm">{node.text}</span>
                          {node.role && (
                            <span className="text-sm font-bold font-arabic text-amber-700 mt-3 bg-amber-100/80 px-4 py-1.5 rounded-full border border-amber-300/50 shadow-sm backdrop-blur-sm">
                              {node.role}
                            </span>
                          )}
                        </div>
                      </foreignObject>
                    ) : (
                      <foreignObject x={p.x - 120} y={p.y - 30} width={240} height={60}>
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="text-[16px] font-bold font-arabic text-emerald-800 bg-emerald-50 border-2 border-emerald-200/60 px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm">
                            {node.role}
                          </span>
                        </div>
                      </foreignObject>
                    )}
                 </g>
               );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function TarkibPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tarkib' | 'tahkik'>('tarkib');
  const [tahkikInput, setTahkikInput] = useState('');
  const [tahkikResult, setTahkikResult] = useState<string | null>(null);
  const [tahkikLoading, setTahkikLoading] = useState(false);
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<TarkibNode[] | null>(null);
  const [scale, setScale] = useState(1);

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
    setAnalysisData(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentence', { 
        body: { sentence, action: 'parse_tarkib' } 
      });
      
      console.log('Tarkib API Data:', data, 'Error:', error);
      
      if (error) {
        throw new Error(`Connection error: ${error.message || 'Server unavailable'}`);
      }
      if (data?.error) throw new Error(data.error);

      let nodes: TarkibNode[] = [];
      if (Array.isArray(data)) nodes = data;
      else if (data?.nodes) nodes = data.nodes;
      
      if (!nodes.length) throw new Error('বিশ্লেষণ ডেটা পাওয়া যায়নি। অনুগ্রহ করে অন্য বাক্য চেষ্টা করুন।');
      setAnalysisData(nodes);
    } catch (e: any) {
      toast.error(e.message || 'বিশ্লেষণ ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-[#FDFCFB]">
        <header className="px-6 h-20 border-b border-black/5 flex items-center justify-between glass-morphism sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-amber-500" />
                তারকিব পার্সার
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">বাক্য বিশ্লেষণ ও গ্রামার ম্যাপ</p>
            </div>
          </div>

          {analysisData && (
            <div className="hidden md:flex items-center gap-2 bg-black/5 p-1 rounded-2xl">
              <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="h-10 w-10 text-slate-600 hover:bg-white rounded-xl">
                <ZoomOut className="h-5 w-5" />
              </Button>
              <div className="px-2 text-xs font-black text-slate-400 w-12 text-center">
                {Math.round(scale * 100)}%
              </div>
              <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2, s + 0.1))} className="h-10 w-10 text-slate-600 hover:bg-white rounded-xl">
                <ZoomIn className="h-5 w-5" />
              </Button>
              <div className="w-px h-6 bg-black/10 mx-1" />
              <Button variant="ghost" size="icon" onClick={() => setScale(1)} className="h-10 w-10 text-slate-600 hover:bg-white rounded-xl">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </header>

        <main className="flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-hidden">
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
            <>
              <div className="w-full max-w-4xl mx-auto flex gap-3">
            <Input 
              value={sentence} 
              onChange={e => setSentence(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && analyzeSentence()}
              placeholder="আরবি বাক্য লিখুন (উদা: الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ)" 
              className="h-16 font-arabic text-3xl bg-white rounded-3xl text-right flex-1 shadow-card border-black/5 px-8 ring-offset-0 focus:ring-2 focus:ring-amber-200" 
              dir="rtl" 
            />
            <Button 
              disabled={loading || !sentence} 
              onClick={analyzeSentence} 
              className="h-16 px-8 gradient-primary text-white font-black rounded-3xl shadow-elevated transition-transform active:scale-95 disabled:opacity-50 text-lg"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'বিশ্লেষণ'}
            </Button>
          </div>

          <div className="flex-1 relative rounded-[3rem] overflow-hidden border border-black/5 shadow-card bg-slate-50/50">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <div className="relative h-24 w-24 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-200" />
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                  <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-amber-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">বাক্য বিশ্লেষণ করা হচ্ছে</h3>
                <p className="text-sm font-bold text-slate-500">AI আপনার বাক্যের নাহু-সরফ কাঠামো ম্যাপ করছে...</p>
              </div>
            ) : analysisData ? (
              <>
                <TarkibVisualization nodes={analysisData} scale={scale} />
                <div className="absolute bottom-10 right-10 flex flex-col gap-2 md:hidden">
                  <Button variant="secondary" size="icon" onClick={() => setScale(s => Math.min(2, s + 0.2))} className="rounded-full shadow-lg h-12 w-12"><ZoomIn /></Button>
                  <Button variant="secondary" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="rounded-full shadow-lg h-12 w-12"><ZoomOut /></Button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                <div className="h-24 w-24 rounded-[2.5rem] bg-amber-50 flex items-center justify-center mb-6 shadow-sm ring-1 ring-amber-100">
                  <Sparkles className="h-12 w-12 text-amber-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-3">তারকিব ড্যাশবোর্ড</h2>
                <p className="text-sm font-bold text-slate-500 max-w-sm leading-relaxed">
                  উপরে একটি আরবি বাক্য লিখে সার্চ দিন। আমি আপনাকে বাক্যের প্রতিটি পদের পদবি এবং তাদের মধ্যকার সম্পর্ক ম্যাপ আকারে দেখাব।
                </p>
              </div>
            )}
          </div>
            </>
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
