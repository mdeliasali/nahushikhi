import { useState } from "react";
import Layout from "@/components/Layout";
import { Copy, Layers, ChevronRight, ChevronLeft } from "lucide-react";
import { useRevisionCards } from "@/hooks/useExamPrep";
import { Database } from "@/integrations/supabase/types";

type ExamClass = Database['public']['Enums']['exam_class'];

export default function RevisionCardsPage() {
  const [selectedClass, setSelectedClass] = useState<ExamClass>("dakhil");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const { data: cards, isLoading } = useRevisionCards(selectedClass);

  const handleNext = () => {
    if (cards && currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c - 1), 150);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 animate-in-fade pb-20">
        <div className="glass-card rounded-[2rem] overflow-hidden shadow-card ring-1 ring-black/5 flex flex-col min-h-[80vh]">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-amber-50/50 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <Copy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">রিভিশন কার্ড</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">ফ্ল্যাশকার্ড স্টাইলে দ্রুত রিভিশন</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <select 
                className="bg-white border border-slate-200 text-sm rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-amber-100 outline-none"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value as ExamClass);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
              >
                <option value="dakhil">দাখিল</option>
                <option value="alim">আলিম</option>
              </select>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 sm:p-8 flex-1 bg-slate-50/30 flex flex-col relative items-center justify-center">
            {isLoading ? (
              <div className="w-full max-w-md aspect-[3/4] bg-slate-100/50 rounded-3xl animate-pulse ring-1 ring-black/5" />
            ) : !cards || cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-amber-50 text-amber-300 rounded-full flex items-center justify-center mb-4">
                  <Layers className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">কোনো রিভিশন কার্ড পাওয়া যায়নি</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  অ্যাডমিন প্যানেল থেকে কার্ড যুক্ত হলে তা এখানে প্রদর্শিত হবে।
                </p>
              </div>
            ) : (
              <div className="w-full max-w-md flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-4 px-2">
                  <span className="text-sm font-bold text-slate-400">
                    কার্ড {currentIndex + 1} / {cards.length}
                  </span>
                  <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md">
                    {cards[currentIndex].category}
                  </span>
                </div>
                
                {/* Flashcard Implementation */}
                <div 
                  className="w-full aspect-[3/4] sm:aspect-square relative cursor-pointer perspective-1000"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front of card */}
                    <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-lg ring-1 ring-slate-200/50 p-8 flex flex-col items-center justify-center text-center">
                      <div className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">প্রশ্ন / পয়েন্ট</div>
                      
                      <h2 className="text-2xl font-extrabold text-slate-800 mb-6">
                        {cards[currentIndex].topic}
                      </h2>
                      
                      {cards[currentIndex].front_bengali && (
                        <p className="text-base text-slate-600 font-medium">
                          {cards[currentIndex].front_bengali}
                        </p>
                      )}
                      
                      {cards[currentIndex].front_arabic && (
                        <p className="text-3xl font-arabic text-slate-800 mt-6 leading-[2]" dir="rtl">
                          {cards[currentIndex].front_arabic}
                        </p>
                      )}
                      
                      <div className="absolute bottom-6 left-0 right-0 text-center">
                        <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full">
                          উত্তর দেখতে ট্যাপ করুন
                        </span>
                      </div>
                    </div>
                    
                    {/* Back of card */}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-amber-50 to-white rounded-3xl shadow-lg ring-1 ring-amber-200 p-8 flex flex-col items-center justify-center text-center rotate-y-180 overflow-y-auto">
                      <div className="text-sm font-bold text-amber-600/60 mb-6 uppercase tracking-widest sticky top-0 bg-white/80 backdrop-blur-sm py-2">সংজ্ঞা ও নিয়ম</div>
                      
                      <div className="space-y-6 w-full text-left">
                        <div>
                          <p className="text-base text-slate-800 leading-relaxed font-medium">
                            {cards[currentIndex].back_definition}
                          </p>
                        </div>
                        
                        {cards[currentIndex].back_rule && (
                          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <span className="text-xs font-bold text-blue-700 block mb-1">নিয়ম:</span>
                            <p className="text-sm text-slate-700">{cards[currentIndex].back_rule}</p>
                          </div>
                        )}
                        
                        {cards[currentIndex].back_example && (
                          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                            <span className="text-xs font-bold text-emerald-700 block mb-1">উদাহরণ:</span>
                            <p className="text-lg font-arabic text-slate-800 text-right leading-loose" dir="rtl">{cards[currentIndex].back_example}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-between w-full mt-8 gap-4">
                  <button 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex-1 h-14 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 text-slate-600" />
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1}
                    className="flex-1 h-14 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-2xl font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    পরবর্তী <ChevronRight className="h-5 w-5 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
