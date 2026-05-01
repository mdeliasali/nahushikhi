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
const H_SPACING = 200;   // horizontal gap between leaf nodes
const ROW_HEIGHT = 160;   // vertical gap between levels
const TOP_PAD = 80;       // padding at top of SVG

// --- Helper: get max depth of tree ---
function getMaxDepth(node: TreeNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(getMaxDepth));
}

// --- Layout: assign (x, y) to each node ---
// KEY INSIGHT: Y is INVERTED so that leaves (words) are at the TOP
// and root (sentence type) is at the BOTTOM
interface LayoutNode extends TreeNode {
  x: number;
  y: number;
  id: string;
  children?: LayoutNode[];
}

function layoutTree(node: TreeNode, level: number, maxDepth: number, nextLeafX: { val: number }): LayoutNode {
  // Process children first (bottom-up X)
  const laidOutChildren = (node.children || []).map(child =>
    layoutTree(child, level + 1, maxDepth, nextLeafX)
  );

  // X: leaf gets next slot, parent centers over children
  let x: number;
  if (laidOutChildren.length === 0) {
    x = nextLeafX.val;
    nextLeafX.val += H_SPACING;
  } else {
    x = (laidOutChildren[0].x + laidOutChildren[laidOutChildren.length - 1].x) / 2;
  }

  // Y: INVERTED — level 0 (root) at bottom, deepest level at top
  // deepest level = maxDepth, we want it at Y = TOP_PAD
  // root level = 0, we want it at Y = TOP_PAD + maxDepth * ROW_HEIGHT
  const y = TOP_PAD + (maxDepth - level) * ROW_HEIGHT;

  return {
    ...node,
    x,
    y,
    id: `n${level}_${Math.random().toString(36).substr(2, 6)}`,
    children: laidOutChildren.length > 0 ? laidOutChildren : undefined,
  };
}

// --- SVG Rendering ---
function TarkibSVG({ root, scale }: { root: LayoutNode; scale: number }) {
  // Collect all nodes for viewBox calculation
  const allNodes: LayoutNode[] = [];
  const collect = (n: LayoutNode) => { allNodes.push(n); n.children?.forEach(collect); };
  collect(root);

  const padding = 120;
  const minX = Math.min(...allNodes.map(n => n.x)) - padding;
  const maxX = Math.max(...allNodes.map(n => n.x)) + padding;
  const minY = Math.min(...allNodes.map(n => n.y)) - 90; // room for word text above top nodes
  const maxY = Math.max(...allNodes.map(n => n.y)) + 50;  // room below bottom role
  const svgW = maxX - minX;
  const svgH = maxY - minY;

  function renderNode(node: LayoutNode): JSX.Element {
    const isLeaf = !node.children || node.children.length === 0;

    // For a LEAF node (word):
    //   [Word text]   at (x, y - 55)    ← big Arabic word
    //       |
    //       ↓         arrow from y-40 to y-15
    //   [Role label]  at (x, y)          ← مبتدأ، خبر etc.
    //
    // For a PARENT node (e.g. جملة اسمية):
    //   Its children are ABOVE it (smaller Y).
    //   From each child's role label, draw a vertical line DOWN.
    //   Connect them with a horizontal bar.
    //   From the bar center, draw a vertical line + arrow DOWN to this node's role.

    return (
      <g key={node.id}>
        {/* === LEAF: Word text above role === */}
        {isLeaf && node.text && (
          <>
            <text
              x={node.x}
              y={node.y - 55}
              textAnchor="middle"
              fontSize="40"
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
              stroke="#1e293b" strokeWidth="1.8"
              markerEnd="url(#arrow)"
            />
          </>
        )}

        {/* === Role label === */}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#334155"
          style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
        >
          {node.role}
        </text>

        {/* === PARENT: Bracket connecting children down to this node === */}
        {!isLeaf && node.children && node.children.length > 0 && (() => {
          const children = node.children!;
          // Children's role Y (they are ABOVE this node)
          const childY = children[0].y;
          // This node's role Y
          const thisY = node.y;
          // The bracket bar sits midway between children and this node
          const barY = childY + (thisY - childY) * 0.4;

          return (
            <g>
              {/* Vertical lines from each child's role DOWN to the bar */}
              {children.map(child => (
                <line
                  key={`vline-${child.id}`}
                  x1={child.x} y1={child.y + 12}
                  x2={child.x} y2={barY}
                  stroke="#1e293b" strokeWidth="1.8"
                />
              ))}

              {/* Horizontal bar connecting all children */}
              {children.length > 1 && (
                <line
                  x1={children[0].x} y1={barY}
                  x2={children[children.length - 1].x} y2={barY}
                  stroke="#1e293b" strokeWidth="1.8"
                />
              )}

              {/* Vertical line + arrow from bar center DOWN to this role */}
              <line
                x1={node.x} y1={barY}
                x2={node.x} y2={thisY - 15}
                stroke="#1e293b" strokeWidth="1.8"
                markerEnd="url(#arrow)"
              />
            </g>
          );
        })()}

        {/* Recurse children */}
        {node.children?.map(renderNode)}
      </g>
    );
  }

  return (
    <svg
      width={svgW * scale}
      height={svgH * scale}
      viewBox={`${minX} ${minY} ${svgW} ${svgH}`}
      style={{ background: 'white' }}
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
  const [scale, setScale] = useState(1);

  // DEBUG: mock data for testing
  const [showDemo, setShowDemo] = useState(false);
  const demoTree: TreeNode = {
    role: 'جملة اسمية',
    children: [
      { text: 'زيدٌ', role: 'مبتدأ' },
      { text: 'قائمٌ', role: 'خبر' },
    ],
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
        const maxDepth = getMaxDepth(data.tree);
        setTreeData(layoutTree(data.tree, 0, maxDepth, { val: 0 }));
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
    const maxDepth = getMaxDepth(demoTree);
    setTreeData(layoutTree(demoTree, 0, maxDepth, { val: 0 }));
    setShowDemo(true);
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
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                বাক্য বিশ্লেষণ ও গ্রামার ম্যাপ
              </p>
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
                {/* Demo button for testing */}
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
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-20 w-20 relative">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse" />
                    <Loader2 className="h-20 w-20 text-primary animate-spin" />
                  </div>
                  <p className="text-slate-500 font-bold">AI আপনার বাক্যের তারকিব ডায়াগ্রাম তৈরি করছে...</p>
                </div>
              )}

              {treeData && (
                <div className="relative rounded-[2rem] border border-black/5 shadow-xl bg-white p-8 sm:p-12 overflow-auto">
                  <div className="flex justify-center min-w-max">
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
