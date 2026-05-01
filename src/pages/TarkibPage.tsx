import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, Loader2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

// --- Types ---
interface TreeNode {
  text?: string;
  role: string;
  children?: TreeNode[];
}

interface PositionedNode extends TreeNode {
  x: number;
  y: number;
  id: string;
  level: number;
  children?: PositionedNode[];
}

// --- Layout Logic ---
function getTreeMaxDepth(node: TreeNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(getTreeMaxDepth));
}

function calculatePositions(node: TreeNode, level: number, maxDepth: number, nextX: { val: number }): PositionedNode {
  const children = (node.children || []).map(child => calculatePositions(child, level + 1, maxDepth, nextX));
  
  let x: number;
  if (!children || children.length === 0) {
    x = nextX.val;
    nextX.val += 200;
  } else {
    const firstX = children[0].x;
    const lastX = children[children.length - 1].x;
    x = (firstX + lastX) / 2;
  }

  // Words (leaves) should be at the top. 
  // Leaves are at various levels, but we want them all at the top row.
  // Actually, the textbook style has words at the top, and then analysis flows down.
  // So we assign Y based on level, but we need to ensure "text" nodes are treated as the starting point.
  
  return {
    ...node,
    id: Math.random().toString(36).substr(2, 9),
    x,
    y: level * 180 + 100,
    level,
    children: children.length > 0 ? children : undefined
  };
}

// --- SVG Component ---
function TarkibSVG({ root, scale }: { root: PositionedNode, scale: number }) {
  const nodes: PositionedNode[] = [];
  const flatten = (n: PositionedNode) => {
    nodes.push(n);
    n.children?.forEach(flatten);
  };
  flatten(root);

  const minX = Math.min(...nodes.map(n => n.x)) - 100;
  const maxX = Math.max(...nodes.map(n => n.x)) + 100;
  const maxY = Math.max(...nodes.map(n => n.y)) + 150;
  const width = maxX - minX;
  const height = maxY;

  const renderNode = (node: PositionedNode) => {
    const isLeaf = !node.children || node.children.length === 0;

    return (
      <g key={node.id}>
        {/* Word Text (Only for leaves) */}
        {node.text && (
          <text
            x={node.x}
            y={node.y - 60}
            textAnchor="middle"
            className="text-5xl font-bold fill-slate-900"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {node.text}
          </text>
        )}

        {/* Arrow from Text to Role (if leaf) */}
        {node.text && (
          <line
            x1={node.x} y1={node.y - 45}
            x2={node.x} y2={node.y - 20}
            stroke="#000" strokeWidth="1.5"
            markerEnd="url(#arrowhead)"
          />
        )}

        {/* Role Label */}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          className="text-xl font-bold fill-slate-800"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {node.role}
        </text>

        {/* Bracket and Arrow for children */}
        {node.children && node.children.length > 0 && (
          <g>
            {/* Brackets from children to a common bar */}
            <path
              d={`M ${node.children[0].x} ${node.y - 120} L ${node.children[node.children.length - 1].x} ${node.y - 120}`}
              fill="none" stroke="#000" strokeWidth="1.5"
            />
            {node.children.map(child => (
              <line
                key={`link-${child.id}`}
                x1={child.x} y1={child.y + 15}
                x2={child.x} y2={node.y - 120}
                stroke="#000" strokeWidth="1.5"
              />
            ))}
            {/* Arrow from common bar down to parent role */}
            <line
              x1={node.x} y1={node.y - 120}
              x2={node.x} y2={node.y - 25}
              stroke="#000" strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
            />
          </g>
        )}

        {node.children?.map(renderNode)}
      </g>
    );
  };

  return (
    <svg 
      width={width * scale} 
      height={height * scale} 
      viewBox={`${minX} 0 ${width} ${height}`}
      className="bg-white"
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
        </marker>
      </defs>
      {renderNode(root)}
    </svg>
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
  const [treeData, setTreeData] = useState<PositionedNode | null>(null);
  const [textFallback, setTextFallback] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

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
        // We want the WORDS at the top. The words are usually at the deepest level.
        // So we need to normalize the tree so that all leaves (words) are at the same top level.
        const maxDepth = getTreeMaxDepth(data.tree);
        setTreeData(calculatePositions(data.tree, 0, maxDepth, { val: 0 }));
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
      <div className="min-h-screen flex flex-col bg-white">
        <header className="px-6 h-20 border-b border-black/5 flex items-center justify-between glass-morphism sticky top-0 z-50">
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

          {treeData && (
            <div className="hidden md:flex items-center gap-2 bg-black/5 p-1 rounded-2xl">
              <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="h-10 w-10">
                <ZoomOut className="h-5 w-5" />
              </Button>
              <div className="px-2 text-xs font-black text-slate-400 w-12 text-center">
                {Math.round(scale * 100)}%
              </div>
              <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2, s + 0.1))} className="h-10 w-10">
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setScale(1)} className="h-10 w-10">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
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
            <div className="space-y-6">
              <div className="glass-card rounded-[2rem] p-6 space-y-4 shadow-sm border border-black/5">
                <div className="flex gap-3">
                  <Input
                    value={sentence}
                    onChange={e => setSentence(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && analyzeSentence()}
                    placeholder="আরবি বাক্য লিখুন (উদা: الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ)"
                    className="text-right font-serif text-lg h-16 rounded-3xl flex-1 shadow-sm px-8 bg-slate-50/50 border-none focus:bg-white transition-all"
                    dir="rtl"
                  />
                  <Button
                    disabled={loading || !sentence}
                    onClick={analyzeSentence}
                    className="h-16 px-8 rounded-3xl font-black text-lg gradient-primary shadow-lg active:scale-95 transition-transform"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'বিশ্লেষণ'}
                  </Button>
                </div>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-20 w-20 relative">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse" />
                    <Loader2 className="h-20 w-20 text-primary animate-spin" />
                  </div>
                  <p className="text-slate-500 font-bold">AI আপনার বাক্যের তারকিব ডায়াগ্রাম তৈরি করছে...</p>
                </div>
              )}

              {treeData && (
                <div className="relative rounded-[3rem] border border-black/5 shadow-2xl bg-white p-12 overflow-auto custom-scrollbar">
                   <div className="flex justify-center min-w-max" dir="rtl">
                      <TarkibSVG root={treeData} scale={scale} />
                   </div>
                </div>
              )}

              {textFallback && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-black/5 whitespace-pre-wrap font-medium leading-relaxed">
                  {textFallback}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tahkik' && (
            <div className="glass-card rounded-[2rem] p-6 space-y-4">
              <div className="flex gap-3">
                <Input
                  value={tahkikInput}
                  onChange={e => setTahkikInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTahkik()}
                  placeholder="আরবি শব্দ লেখো... যেমন: الْمُجْتَهِدُ"
                  className="text-right font-serif text-lg h-12 rounded-2xl flex-1 shadow-sm px-6 bg-slate-50/50 border-none"
                  dir="rtl"
                />
                <Button
                  onClick={handleTahkik}
                  disabled={tahkikLoading || !tahkikInput.trim()}
                  className="h-12 px-6 rounded-2xl font-bold gradient-primary shadow-md"
                >
                  {tahkikLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'বিশ্লেষণ'}
                </Button>
              </div>
              {tahkikResult && (
                <div className="bg-white rounded-2xl p-6 text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm border border-black/5">
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
