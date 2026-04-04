import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, Sparkles, Wand2, Hash, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

// --- Types ---
interface TarkibNode {
  id: string;
  text: string;
  role: string | null;
  children?: string[];
  level: number;
}

// --- Helper Functions ---
const cleanRoot = (val: string) => {
  return val.replace(/[^\u0600-\u06FF]/g, '').replace(/[\u064B-\u065F]/g, ''); 
};

// --- Sub-components ---

function WordBuilder() {
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
    { label: 'اسم فاعل', wazn: 'مُفَعْلِل', word: `م${D}${c1}${F}${c2}${S}${c3}${K}${c4}` },
    { label: 'اسم مفعول', wazn: 'مُفَعْلَل', word: `م${D}${c1}${F}${c2}${S}${c3}${F}${c4}` },
    { label: 'أمر', wazn: 'فَعْلِلْ', word: `${c1}${F}${c2}${S}${c3}${K}${c4}${S}` },
  ] : [
    { label: 'ماضي', wazn: 'فَعَلَ', word: `${c1}${F}${c2}${b.a}${c3}${F}` },
    { label: 'مضارع', wazn: 'يَفْعُلُ', word: `ي${F}${c1}${S}${c2}${b.m}${c3}${D}` },
    { label: 'مصدر', wazn: 'فَعْل', word: `${c1}${F}${c2}${S}${c3}` },
    { label: 'اسم فاعل', wazn: 'فَاعِل', word: `${c1}${F}ا${c2}${K}${c3}` },
    { label: 'اسم مفعول', wazn: 'مَفْعُول', word: `م${F}${c1}${S}${c2}${D}و${c3}` },
    { label: 'أمر', wazn: 'اُفْعُلْ', word: `ا${b.m === D ? D : K}${c1}${S}${c2}${b.m}${c3}${S}` },
    { label: 'مبالغة', wazn: 'فَعَّال', word: `${c1}${F}${c2}${F}${SH}ا${c3}` },
    { label: 'تفضيل', wazn: 'أَفْعَل', word: `أ${F}${c1}${S}${c2}${F}${c3}` },
  ];

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-card ring-1 ring-black/5 animate-in-fade h-full pb-4">
      <div className="p-5 bg-primary/5 border-b border-black/5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center"><Wand2 className="h-5 w-5 text-primary" /></div>
        <h2 className="text-base font-extrabold">صرف الكلمة</h2>
      </div>
      <div className="p-5 space-y-3">
        <Input value={inputRoot} onChange={e => setInputRoot(e.target.value)} placeholder="মূল অক্ষর: ك ت ب" className="h-12 font-arabic text-xl border-none bg-secondary/30 rounded-2xl text-center shadow-inner" dir="rtl" />
        {!is4 && (
          <select title="اختيار الباب" aria-label="اختيار الباب (Choose Bab)" value={babIdx} onChange={e => setBabIdx(Number(e.target.value))} className="w-full h-10 rounded-xl border border-black/10 bg-white/60 px-3 font-arabic text-sm text-right" dir="rtl">
            {abwab.map((bb, i) => <option key={i} value={i}>{bb.name}</option>)}
          </select>
        )}
        <div className="grid grid-cols-2 gap-2">
          {forms.map((f, i) => (
            <div key={i} className="p-3 bg-white/60 rounded-xl border border-black/5">
              <p className="font-arabic text-xl text-primary font-bold text-center" dir="rtl">{f.word}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[9px] font-black text-slate-400">{f.label}</span>
                <span className="font-arabic text-xs text-slate-500" dir="rtl">{f.wazn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VerbBuilder() {
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
    { p: 'هُوَ', w: `${c1}${F}${c2}${b.a}${c3}${F}` },
    { p: 'هُمَا', w: `${c1}${F}${c2}${b.a}${c3}${F}ا` },
    { p: 'هُمْ', w: `${c1}${F}${c2}${b.a}${c3}${D}وا` },
    { p: 'هِيَ', w: `${c1}${F}${c2}${b.a}${c3}${F}تْ` },
    { p: 'هُمَا', w: `${c1}${F}${c2}${b.a}${c3}${F}تَا` },
    { p: 'هُنَّ', w: `${c1}${F}${c2}${b.a}${c3}${S}نَ` },
    { p: 'أَنْتَ', w: `${c1}${F}${c2}${b.a}${c3}${S}تَ` },
    { p: 'أَنْتُمَا', w: `${c1}${F}${c2}${b.a}${c3}${S}تُمَا` },
    { p: 'أَنْتُمْ', w: `${c1}${F}${c2}${b.a}${c3}${S}تُمْ` },
    { p: 'أَنْتِ', w: `${c1}${F}${c2}${b.a}${c3}${S}تِ` },
    { p: 'أَنْتُمَا', w: `${c1}${F}${c2}${b.a}${c3}${S}تُمَا` },
    { p: 'أَنْتُنَّ', w: `${c1}${F}${c2}${b.a}${c3}${S}تُنَّ` },
    { p: 'أَنَا', w: `${c1}${F}${c2}${b.a}${c3}${S}تُ` },
    { p: 'نَحْنُ', w: `${c1}${F}${c2}${b.a}${c3}${S}نَا` },
  ];
  const mudari3 = [
    { p: 'هُوَ', w: `ي${F}${c1}${S}${c2}${b.m}${c3}${D}` },
    { p: 'هُمَا', w: `ي${F}${c1}${S}${c2}${b.m}${c3}${F}انِ` },
    { p: 'هُمْ', w: `ي${F}${c1}${S}${c2}${b.m}${c3}${D}ونَ` },
    { p: 'هِيَ', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${D}` },
    { p: 'هُمَا', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${F}انِ` },
    { p: 'هُنَّ', w: `ي${F}${c1}${S}${c2}${b.m}${c3}${S}نَ` },
    { p: 'أَنْتَ', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${D}` },
    { p: 'أَنْتُمَا', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${F}انِ` },
    { p: 'أَنْتُمْ', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${D}ونَ` },
    { p: 'أَنْتِ', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${K}ينَ` },
    { p: 'أَنْتُمَا', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${F}انِ` },
    { p: 'أَنْتُنَّ', w: `ت${F}${c1}${S}${c2}${b.m}${c3}${S}نَ` },
    { p: 'أَنَا', w: `أ${F}${c1}${S}${c2}${b.m}${c3}${D}` },
    { p: 'نَحْنُ', w: `ن${F}${c1}${S}${c2}${b.m}${c3}${D}` },
  ];
  const madi4 = [
    { p: 'هُوَ', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${F}` },
    { p: 'هُمَا', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${F}ا` },
    { p: 'هُمْ', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${D}وا` },
    { p: 'هِيَ', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${F}تْ` },
    { p: 'هُمَا', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${F}تَا` },
    { p: 'هُنَّ', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${S}نَ` },
    { p: 'أَنْتَ', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${S}تَ` },
    { p: 'أَنْتُمَا', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${S}تُمَا` },
    { p: 'أَنْتُمْ', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${S}تُمْ` },
    { p: 'أَنْتِ', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${S}تِ` },
    { p: 'أَنْتُمَا', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${S}تُمَا` },
    { p: 'أَنْتُنَّ', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${S}تُنَّ` },
    { p: 'أَنَا', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${S}تُ` },
    { p: 'نَحْنُ', w: `${c1}${F}${c2}${S}${c3}${F}${c4}${S}نَا` },
  ];
  const mudari4 = [
    { p: 'هُوَ', w: `ي${D}${c1}${F}${c2}${S}${c3}${K}${c4}${D}` },
    { p: 'هُمَا', w: `ي${D}${c1}${F}${c2}${S}${c3}${K}${c4}${F}انِ` },
    { p: 'هُمْ', w: `ي${D}${c1}${F}${c2}${S}${c3}${K}${c4}${D}ونَ` },
    { p: 'هِيَ', w: `ت${D}${c1}${F}${c2}${S}${c3}${K}${c4}${D}` },
    { p: 'هُمَا', w: `ت${D}${c1}${F}${c2}${S}${c3}${K}${c4}${F}انِ` },
    { p: 'هُنَّ', w: `ي${D}${c1}${F}${c2}${S}${c3}${K}${c4}${S}نَ` },
    { p: 'أَنْتَ', w: `ت${D}${c1}${F}${c2}${S}${c3}${K}${c4}${D}` },
    { p: 'أَنْتُمَا', w: `ت${D}${c1}${F}${c2}${S}${c3}${K}${c4}${F}انِ` },
    { p: 'أَنْتُمْ', w: `ت${D}${c1}${F}${c2}${S}${c3}${K}${c4}${D}ونَ` },
    { p: 'أَنْتِ', w: `ت${D}${c1}${F}${c2}${S}${c3}${K}${c4}${K}ينَ` },
    { p: 'أَنْتُمَا', w: `ت${D}${c1}${F}${c2}${S}${c3}${K}${c4}${F}انِ` },
    { p: 'أَنْتُنَّ', w: `ت${D}${c1}${F}${c2}${S}${c3}${K}${c4}${S}نَ` },
    { p: 'أَنَا', w: `أ${D}${c1}${F}${c2}${S}${c3}${K}${c4}${D}` },
    { p: 'نَحْنُ', w: `ن${D}${c1}${F}${c2}${S}${c3}${K}${c4}${D}` },
  ];

  const rows = tense === 'madi' ? (is4 ? madi4 : madi3) : (is4 ? mudari4 : mudari3);

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-card ring-1 ring-black/5 animate-in-fade anim-delay-100 flex flex-col h-full">
      <div className="p-5 bg-indigo-50/50 border-b border-black/5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0"><Hash className="h-5 w-5 text-indigo-600" /></div>
        <h2 className="text-base font-extrabold">تصريف الفعل</h2>
      </div>
      <div className="p-5 flex-1 space-y-3">
        <Input value={inputRoot} onChange={e => setInputRoot(e.target.value)} placeholder="মূল অক্ষর: ن ص ر" className="h-11 font-arabic text-lg border-none bg-secondary/30 rounded-xl text-center shadow-inner" dir="rtl" />
        {!is4 && (
          <select title="اختيار الباب" aria-label="اختيار الباب (Choose Bab)" value={babIdx} onChange={e => setBabIdx(Number(e.target.value))} className="w-full h-9 rounded-xl border border-black/10 bg-white/60 px-3 font-arabic text-sm text-right" dir="rtl">
            {abwab.map((bb, i) => <option key={i} value={i}>{bb.name}</option>)}
          </select>
        )}
        <div className="flex bg-white/60 p-1 rounded-xl border border-black/5">
          <Button variant={tense === 'madi' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTense('madi')} className="flex-1 h-8 text-xs font-black rounded-lg">ماضي</Button>
          <Button variant={tense === 'mudari' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTense('mudari')} className="flex-1 h-8 text-xs font-black rounded-lg">مضارع</Button>
        </div>
        <div className="rounded-xl border border-black/5 bg-white/40 overflow-hidden">
          {rows.map((r, i) => (
            <div key={i} className="flex justify-between items-center px-3 py-2 border-b border-black/5 last:border-0 bg-white/50">
              <span className="font-arabic text-sm text-slate-500" dir="rtl">{r.p}</span>
              <span className="font-arabic text-lg text-indigo-600 font-bold" dir="rtl">{r.w}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TarkibVisualization({ nodes }: { nodes: TarkibNode[] }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-amber-50 rounded-[2.5rem] border-2 border-dashed border-amber-200 min-h-[300px]">
        <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
        <p className="text-sm font-bold text-amber-700">ডেটা পাওয়া যায়নি। পুনরায় চেষ্টা করুন।</p>
      </div>
    );
  }

  // Classic Arabic grammar tree: Words top → Roles middle → Sentence bottom
  const ROW_H = 90;
  const COL_W = 160;
  const PADDING = 40;

  const maxLevel = Math.max(...nodes.map(n => n.level ?? 0));
  const wordNodes = nodes.filter(n => (n.level ?? 0) === 0);

  const layout = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};

    // Words at top row, RTL order (first word on right)
    const totalWidth = PADDING * 2 + wordNodes.length * COL_W;
    wordNodes.forEach((node, idx) => {
      pos[node.id] = {
        x: totalWidth - PADDING - (idx + 1) * COL_W + COL_W / 2,
        y: PADDING + 30
      };
    });

    // Higher level nodes below, centered over their children
    for (let lvl = 1; lvl <= maxLevel; lvl++) {
      const levelNodes = nodes.filter(n => (n.level ?? 0) === lvl);
      levelNodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          const childXs = node.children.map(cid => pos[cid]?.x).filter(Boolean);
          const centerX = childXs.reduce((a, b) => a + b, 0) / childXs.length;
          pos[node.id] = { x: centerX, y: PADDING + 30 + lvl * ROW_H };
        }
      });
    }

    return pos;
  }, [nodes, maxLevel, wordNodes.length]);

  const svgWidth = Math.max(400, PADDING * 2 + wordNodes.length * COL_W);
  const svgHeight = PADDING * 2 + 30 + (maxLevel + 1) * ROW_H;

  return (
    <div className="w-full overflow-x-auto py-6 bg-white rounded-[2.5rem] border border-black/5 shadow-inner min-h-[350px]">
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="mx-auto">
        <defs>
          <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="8" orient="auto">
            <polygon points="0 0, 8 0, 4 8" fill="#111827" />
          </marker>
        </defs>

        {/* Draw connections: parent → children with bracket style */}
        {nodes.map(node => {
          if (!node.children || node.children.length === 0 || !layout[node.id]) return null;
          const parent = layout[node.id];

          if (node.children.length === 1) {
            // Single child: straight line up
            const child = layout[node.children[0]];
            if (!child) return null;
            return (
              <line
                key={`line-${node.id}`}
                x1={child.x} y1={child.y + 20}
                x2={parent.x} y2={parent.y - 25}
                stroke="#111827" strokeWidth="1.5" markerEnd="url(#arrowDown)"
              />
            );
          }

          // Multiple children: bracket merge
          const childPositions = node.children.map(cid => layout[cid]).filter(Boolean);
          if (childPositions.length === 0) return null;

          const bracketY = parent.y - 40;
          return (
            <g key={`bracket-${node.id}`}>
              {/* Vertical lines from each child down to bracket */}
              {childPositions.map((cp, i) => (
                <line key={`v-${node.id}-${i}`}
                  x1={cp.x} y1={cp.y + 20}
                  x2={cp.x} y2={bracketY}
                  stroke="#111827" strokeWidth="1.5"
                />
              ))}
              {/* Horizontal bracket connecting all children */}
              <line
                x1={Math.min(...childPositions.map(c => c.x))} y1={bracketY}
                x2={Math.max(...childPositions.map(c => c.x))} y2={bracketY}
                stroke="#111827" strokeWidth="1.5"
              />
              {/* Vertical line from bracket center down to parent label */}
              <line
                x1={parent.x} y1={bracketY}
                x2={parent.x} y2={parent.y - 20}
                stroke="#111827" strokeWidth="1.5"
              />
            </g>
          );
        })}

        {/* Render node labels */}
        {nodes.map(node => {
          const p = layout[node.id];
          if (!p) return null;
          const isWord = (node.level ?? 0) === 0;

          return (
            <g key={node.id}>
              {/* Arabic word / phrase */}
              <text
                x={p.x} y={p.y}
                textAnchor="middle"
                fill="#111827"
                fontSize={isWord ? 32 : 26}
                fontWeight="bold"
                fontFamily="'Noto Naskh Arabic', 'Scheherazade New', serif"
              >
                {node.text}
              </text>
              {/* Role label below */}
              {node.role && (
                <text
                  x={p.x} y={p.y + 28}
                  textAnchor="middle"
                  fill="#4b5563"
                  fontSize={16}
                  fontFamily="'Noto Naskh Arabic', serif"
                >
                  {node.role}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SentenceParser() {
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'text' | 'map'>('text');
  const [analysisData, setAnalysisData] = useState<{ text: string, nodes: TarkibNode[] } | null>(null);

  const analyzeSentence = async () => {
    if (!sentence) return;
    setLoading(true);
    setAnalysisData(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentence', { body: { sentence, action: 'parse_tarkib' } });
      if (error) throw error;
      if (!data) throw new Error('সার্ভার থেকে কোনো রেসপন্স আসেনি।');
      
      // Check if the Edge Function returned an error object
      if (data.error) throw new Error(data.error);
      
      let nodes: TarkibNode[] = [];
      if (Array.isArray(data)) nodes = data;
      else if (typeof data === 'object') {
        nodes = data.nodes || data.tarkib || Object.values(data).find((v: unknown) => Array.isArray(v)) as TarkibNode[] || [];
      }

      if (!nodes.length) throw new Error('AI থেকে সঠিক ফরম্যাটে ডাটা পাওয়া যায়নি। Admin Settings চেক করুন।');

      const textRes = nodes.map(n => `${n.text}: ${n.role || ''}`).join('\n');
      setAnalysisData({ text: textRes, nodes });
      setView('map');
    } catch (e: any) {
      toast.error(e.message || 'বিশ্লেষণ ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-card ring-1 ring-black/5 animate-in-fade flex flex-col h-full col-span-1 md:col-span-2 xl:col-span-1">
      <div className="p-6 bg-amber-50/50 border-b border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <MessageSquare className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="text-base font-extrabold">তারকিব পার্সার</h2>
        </div>
        {analysisData && (
          <div className="flex bg-white/60 p-1 rounded-xl border border-black/5">
            <Button variant={view === 'text' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('text')} className="h-8 text-[10px] font-black uppercase rounded-lg px-3">টেক্সট</Button>
            <Button variant={view === 'map' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('map')} className="h-8 text-[10px] font-black uppercase rounded-lg px-3">ম্যাপ</Button>
          </div>
        )}
      </div>
      <div className="p-6 space-y-6 flex-1 flex flex-col">
        <div className="flex gap-2">
          <Button disabled={loading || !sentence} onClick={analyzeSentence} className="h-14 px-6 gradient-primary text-white font-black rounded-2xl shadow-elevated transition-transform active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'বিশ্লেষণ'}
          </Button>
          <Input 
            value={sentence} 
            onChange={e => setSentence(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && analyzeSentence()}
            placeholder="আরবি বাক্য লিখুন..." 
            className="h-14 font-arabic text-2xl bg-secondary/30 rounded-2xl text-right flex-1 shadow-inner px-6 border-none ring-0 focus-visible:ring-2 focus-visible:ring-amber-200" 
            dir="rtl" 
          />
        </div>
        <div className="flex-1 min-h-[400px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-black/5 rounded-[2.5rem] border-2 border-dashed border-black/10 min-h-[400px]">
              <Loader2 className="h-10 w-10 text-amber-400 animate-spin mb-3" />
              <p className="text-sm font-bold text-muted-foreground">AI আপনার বাক্যটি বিশ্লেষণ করছে... <br/>অনগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।</p>
            </div>
          ) : analysisData ? (
            view === 'text' ? <Textarea value={analysisData.text} readOnly className="h-full rounded-3xl border-none bg-white shadow-inner p-6 font-bold text-amber-900 leading-loose resize-none min-h-[400px]" /> : <TarkibVisualization nodes={analysisData.nodes} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-black/5 rounded-[2.5rem] border-2 border-dashed border-black/10 min-h-[400px]">
              <Sparkles className="h-10 w-10 text-amber-300 mb-3" />
              <p className="text-sm font-bold text-muted-foreground leading-relaxed">আরবি বাক্য লিখে "বিশ্লেষণ" বাটনে ক্লিক করুন <br/>তারকিব মাইন্ড ম্যাপ দেখার জন্য।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function ToolsPage() {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="min-h-full bg-[#FDFCFB] pb-10">
        <header className="sticky top-0 z-40 glass-morphism w-full border-b border-white/20">
          <div className="container mx-auto max-w-5xl flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5" onClick={() => navigate('/')}><ArrowLeft className="h-5 w-5" /></Button>
              <h1 className="text-sm font-black tracking-widest uppercase flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />ইন্টারেক্টিভ টুলস</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-5xl animate-in-fade">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <WordBuilder />
            <VerbBuilder />
            <SentenceParser />
          </div>
        </main>
      </div>
    </Layout>
  );
}
