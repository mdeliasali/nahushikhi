import { useState } from 'react';
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

// --- Constants ---
const H_SPACING = 200;
const ROW_HEIGHT = 160;
const TOP_PAD = 80;

// --- Helpers ---
function getMaxDepth(node: TreeNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(getMaxDepth));
}

interface LayoutNode extends TreeNode {
  x: number;
  y: number;
  id: string;
  children?: LayoutNode[];
}

// Layout tree with Y inverted (leaves at top, root at bottom)
function layoutTree(node: TreeNode, level: number, maxDepth: number, nextLeafX: { val: number }): LayoutNode {
  const laidOutChildren = (node.children || []).map(child =>
    layoutTree(child, level + 1, maxDepth, nextLeafX)
  );

  let x: number;
  if (laidOutChildren.length === 0) {
    x = nextLeafX.val;
    nextLeafX.val += H_SPACING;
  } else {
    x = (laidOutChildren[0].x + laidOutChildren[laidOutChildren.length - 1].x) / 2;
  }

  const y = TOP_PAD + (maxDepth - level) * ROW_HEIGHT;

  return {
    ...node,
    x,
    y,
    id: `n${level}_${Math.random().toString(36).substr(2, 6)}`,
    children: laidOutChildren.length > 0 ? laidOutChildren : undefined,
  };
}

// Mirror all X coordinates for RTL layout
function mirrorX(node: LayoutNode, maxX: number): LayoutNode {
  return {
    ...node,
    x: maxX - node.x,
    children: node.children?.map(c => mirrorX(c, maxX)),
  };
}

function getMaxX(node: LayoutNode): number {
  const childMax = node.children ? Math.max(...node.children.map(getMaxX)) : 0;
  return Math.max(node.x, childMax);
}

// --- SVG Rendering ---
function TarkibSVG({ root }: { root: LayoutNode }) {
  const allNodes: LayoutNode[] = [];
  const collect = (n: LayoutNode) => { allNodes.push(n); n.children?.forEach(collect); };
  collect(root);

  const padding = 100;
  const minX = Math.min(...allNodes.map(n => n.x)) - padding;
  const maxX = Math.max(...allNodes.map(n => n.x)) + padding;
  const minY = Math.min(...allNodes.map(n => n.y)) - 90;
  const maxY = Math.max(...allNodes.map(n => n.y)) + 50;
  const svgW = maxX - minX;
  const svgH = maxY - minY;

  function renderNode(node: LayoutNode): JSX.Element {
    const isLeaf = !node.children || node.children.length === 0;

    return (
      <g key={node.id}>
        {/* LEAF: Arabic word text */}
        {isLeaf && node.text && (
          <>
            <text
              x={node.x}
              y={node.y - 55}
              textAnchor="middle"
              fontSize="38"
              fontWeight="bold"
              fill="#1e293b"
              style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
            >
              {node.text}
            </text>
            {/* Arrow from word down to role */}
            <line
              x1={node.x} y1={node.y - 38}
              x2={node.x} y2={node.y - 15}
              stroke="#1e293b" strokeWidth="1.5"
              markerEnd="url(#arrow)"
            />
          </>
        )}

        {/* Role label */}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#334155"
          style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
        >
          {node.role}
        </text>

        {/* PARENT: Bracket connecting children down to this node */}
        {!isLeaf && node.children && node.children.length > 0 && (() => {
          const children = node.children!;
          const childY = children[0].y;
          const thisY = node.y;
          const barY = childY + (thisY - childY) * 0.4;

          return (
            <g>
              {/* Vertical lines from each child's role DOWN to the bar */}
              {children.map(child => (
                <line
                  key={`vline-${child.id}`}
                  x1={child.x} y1={child.y + 12}
                  x2={child.x} y2={barY}
                  stroke="#1e293b" strokeWidth="1.5"
                />
              ))}

              {/* Horizontal bar connecting all children */}
              {children.length > 1 && (
                <line
                  x1={children[0].x} y1={barY}
                  x2={children[children.length - 1].x} y2={barY}
                  stroke="#1e293b" strokeWidth="1.5"
                />
              )}

              {/* Vertical line + arrow from bar center DOWN to this role */}
              <line
                x1={node.x} y1={barY}
                x2={node.x} y2={thisY - 15}
                stroke="#1e293b" strokeWidth="1.5"
                markerEnd="url(#arrow)"
              />
            </g>
          );
        })()}

        {node.children?.map(renderNode)}
      </g>
    );
  }

  return (
    <svg
      width="100%"
      viewBox={`${minX} ${minY} ${svgW} ${svgH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ background: 'white', maxWidth: `${svgW}px` }}
    >
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 10 4, 0 8" fill="#1e293b" />
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
  const [treeData, setTreeData] = useState<LayoutNode | null>(null);
  const [textFallback, setTextFallback] = useState<string | null>(null);

  // Demo data for testing
  const demoTree: TreeNode = {
    role: 'جملة اسمية',
    children: [
      { text: 'زيدٌ', role: 'مبتدأ' },
      { text: 'قائمٌ', role: 'خبر' },
    ],
  };

  const buildTree = (tree: TreeNode) => {
    const maxDepth = getMaxDepth(tree);
    const laid = layoutTree(tree, 0, maxDepth, { val: 0 });
    // Mirror X for RTL — first child (مبتدأ) goes to the RIGHT
    const mx = getMaxX(laid);
    return mirrorX(laid, mx);
  };

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
        body: { sentence, action: 'parse_tarkib' },
      });
      if (error) throw new Error(error.message || 'Server unavailable');
      if (data?.error) throw new Error(data.error);

      if (data?.tree) {
        setTreeData(buildTree(data.tree));
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

  const handleShowDemo = () => {
    setTreeData(buildTree(demoTree));
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-white">
        <header className="px-4 sm:px-6 h-16 sm:h-20 border-b border-black/5 flex items-center justify-between glass-morphism sticky top-0 z-50">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                তারকিব পার্সার
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                বাক্য বিশ্লেষণ ও গ্রামার ম্যাপ
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 gap-4 sm:gap-6 overflow-y-auto">
          {/* Tab switcher */}
          <div className="flex gap-1 sm:gap-2 p-1 bg-secondary/30 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('tarkib')}
              className={`px-3 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'tarkib' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              তারকিব বিশ্লেষণ
            </button>
            <button
              onClick={() => setActiveTab('tahkik')}
              className={`px-3 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'tahkik' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              তাহকিক (শব্দ)
            </button>
          </div>

          {activeTab === 'tarkib' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="glass-card rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm border border-black/5">
                <div className="flex gap-2 sm:gap-3">
                  <Input
                    value={sentence}
                    onChange={e => setSentence(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && analyzeSentence()}
                    placeholder="আরবি বাক্য লিখুন..."
                    className="text-right font-serif text-base sm:text-lg h-12 sm:h-16 rounded-2xl sm:rounded-3xl flex-1 shadow-sm px-4 sm:px-8 bg-slate-50/50 border-none focus:bg-white transition-all"
                    dir="rtl"
                  />
                  <Button
                    disabled={loading || !sentence}
                    onClick={analyzeSentence}
                    className="h-12 sm:h-16 px-4 sm:px-8 rounded-2xl sm:rounded-3xl font-black text-sm sm:text-lg gradient-primary shadow-lg active:scale-95 transition-transform"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'বিশ্লেষণ'}
                  </Button>
                </div>
                {/* Demo button */}
                {!treeData && !loading && (
                  <Button
                    variant="outline"
                    onClick={handleShowDemo}
                    className="text-xs"
                  >
                    ডেমো দেখুন (زيدٌ قائمٌ)
                  </Button>
                )}
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 gap-4">
                  <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary animate-spin" />
                  <p className="text-slate-500 font-bold text-sm sm:text-base">AI তারকিব ডায়াগ্রাম তৈরি করছে...</p>
                </div>
              )}

              {/* Tree Result */}
              {treeData && (
                <div className="rounded-2xl sm:rounded-[2rem] border border-black/5 shadow-xl bg-white p-4 sm:p-8 md:p-12 overflow-x-auto">
                  <div className="flex justify-center">
                    <TarkibSVG root={treeData} />
                  </div>
                </div>
              )}

              {textFallback && (
                <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 shadow-sm border border-black/5 whitespace-pre-wrap font-medium leading-relaxed text-sm sm:text-base">
                  {textFallback}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tahkik' && (
            <div className="glass-card rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex gap-2 sm:gap-3">
                <Input
                  value={tahkikInput}
                  onChange={e => setTahkikInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTahkik()}
                  placeholder="আরবি শব্দ লেখো..."
                  className="text-right font-serif text-base sm:text-lg h-12 rounded-2xl flex-1 shadow-sm px-4 sm:px-6 bg-slate-50/50 border-none"
                  dir="rtl"
                />
                <Button
                  onClick={handleTahkik}
                  disabled={tahkikLoading || !tahkikInput.trim()}
                  className="h-12 px-4 sm:px-6 rounded-2xl font-bold gradient-primary shadow-md text-sm"
                >
                  {tahkikLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'বিশ্লেষণ'}
                </Button>
              </div>
              {tahkikResult && (
                <div className="bg-white rounded-2xl p-4 sm:p-6 text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm border border-black/5">
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
