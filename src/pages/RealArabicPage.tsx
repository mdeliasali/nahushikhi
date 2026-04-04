import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, CheckCircle2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

export default function RealArabicPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 pb-24 lg:pb-8 animate-in-fade">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-2xl hover:bg-black/5">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              রিয়েল আরবি (Real Arabic)
            </h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Quranic & Sentential Analysis
            </p>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 md:p-8 space-y-8 shadow-elevated border-white/60">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2">
              বাক্য বিশ্লেষণ করুন
            </div>
            {/* Example Hardcoded Real Arabic content */}
            <p className="arabic-text text-4xl md:text-5xl leading-[2] text-foreground font-bold">
              الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
            </p>
            <p className="text-muted-foreground text-sm">সকল প্রশংসা জগতসমূহের প্রতিপালক আল্লাহর জন্য</p>
          </div>

          <div className="bg-secondary/30 rounded-3xl p-6 border-2 border-dashed border-primary/20">
            <h3 className="font-bold text-center mb-6 text-foreground">শব্দগুলো চিহ্নিত করুন</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                <span className="arabic-text text-2xl block mb-2">الْحَمْدُ</span>
                <span className="text-xs font-bold text-primary uppercase">ইসম (Ism)</span>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer opacity-70">
                <span className="arabic-text text-2xl block mb-2">لِ</span>
                <span className="text-xs font-bold text-muted-foreground uppercase">হরফ নির্বাচন করুন</span>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer opacity-70">
                <span className="arabic-text text-2xl block mb-2">اللَّهِ</span>
                <span className="text-xs font-bold text-muted-foreground uppercase">ইসম নির্বাচন করুন</span>
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-14 rounded-2xl gradient-primary shadow-elevated text-base font-black tracking-wide"
            onClick={() => {
              /* Add submission logic here */
              navigate('/');
            }}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            পরবর্তী ধাপে যান
          </Button>

        </div>
      </div>
    </Layout>
  );
}
