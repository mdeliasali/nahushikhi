import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Sparkles, Wand2, Hash, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';

const tools = [
  {
    id: 'tarkib',
    title: 'তারকিব পার্সার',
    description: 'আরবি বাক্যের প্রতিটি পদের নাহু-সরফ কাঠামো ও গ্রামার ম্যাপ বিশ্লেষণ করুন।',
    icon: <MessageSquare className="h-8 w-8 text-amber-500" />,
    path: '/tools/tarkib',
    color: 'bg-amber-100/50',
    accent: 'text-amber-600'
  },
  {
    id: 'morphology',
    title: 'শব্দ রূপান্তর (সরফ)',
    description: 'শব্দের মূল অক্ষর থেকে বিভিন্ন রূপ (বাবে ইশতিকাক) তৈরি করুন।',
    icon: <Wand2 className="h-8 w-8 text-rose-500" />,
    path: '/tools/morphology',
    color: 'bg-rose-100/50',
    accent: 'text-rose-600'
  },
  {
    id: 'verb-builder',
    title: 'ফেল রূপান্তর (তাসরিফ)',
    description: 'ফেলের ১৪টি সিগাহর পূর্ণাঙ্গ তালিকা ও রূপান্তর দেখুন।',
    icon: <Hash className="h-8 w-8 text-indigo-500" />,
    path: '/tools/verb-builder',
    color: 'bg-indigo-100/50',
    accent: 'text-indigo-600'
  }
];

export default function ToolsPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-full bg-[#FDFCFB] pb-20">
        <header className="sticky top-0 z-40 glass-morphism w-full border-b border-black/5">
          <div className="container mx-auto max-w-5xl flex items-center justify-between h-20 px-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  ইন্টারেক্টিভ টুলস
                </h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">স্মার্ট আরবি গ্রামার ল্যাব</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="text-center mb-16 space-y-4 animate-in-fade">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">আপনার আরবি ভাষা শিখাকে <br/><span className="gradient-primary bg-clip-text text-transparent italic">স্মার্ট ও আধুনিক</span> করুন</h2>
            <p className="text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">নাহু ও সরফের জটিল বিষয়গুলো সহজে বোঝার জন্য আমাদের স্পেশাল টুলসগুলো ব্যবহার করুন।</p>
          </div>

          <div className="grid grid-cols-1 gap-6 animate-in-fade anim-delay-100">
            {tools.map((tool) => (
              <div 
                key={tool.id}
                onClick={() => navigate(tool.path)}
                className="group relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] blur-xl" />
                <div className="relative glass-card rounded-[2.5rem] p-8 border border-black/5 shadow-card hover:shadow-elevated transition-all flex flex-col md:flex-row items-center gap-8 ring-1 ring-black/5 group-hover:ring-primary/20">
                  <div className={`h-24 w-24 rounded-[2rem] ${tool.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{tool.title}</h3>
                    <p className="text-slate-500 font-bold leading-relaxed">{tool.description}</p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-3xl font-black tracking-tight">নতুন কোনো টুল প্রয়োজন?</h3>
                <p className="text-slate-400 font-medium">আপনার শিক্ষা আরও সহজ করতে আমাদের মতামত দিন।</p>
              </div>
              <Button className="h-16 px-10 bg-white text-slate-900 hover:bg-slate-100 font-black rounded-3xl shrink-0 text-lg shadow-xl">আমাদের জানান</Button>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
