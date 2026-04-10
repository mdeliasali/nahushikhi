import { useState } from "react";
import Layout from "@/components/Layout";
import { MessageSquareText, Search, BookOpenCheck } from "lucide-react";
import { useShortQuestions } from "@/hooks/useExamPrep";
import { Database } from "@/integrations/supabase/types";

type ExamClass = Database['public']['Enums']['exam_class'];

export default function ShortQuestionsPage() {
  const [selectedClass, setSelectedClass] = useState<ExamClass>("dakhil");
  
  const { data: questions, isLoading } = useShortQuestions(selectedClass);

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 animate-in-fade pb-20">
        <div className="glass-card rounded-[2rem] overflow-hidden shadow-card ring-1 ring-black/5 flex flex-col min-h-[80vh]">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-rose-50/50 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <MessageSquareText className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">সংক্ষিপ্ত প্রশ্নাবলি</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">মডেল উত্তরসহ গুরুত্বপূর্ণ প্রশ্নোত্তর</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <select 
                className="bg-white border border-slate-200 text-sm rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-rose-100 outline-none"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as ExamClass)}
              >
                <option value="dakhil">দাখিল</option>
                <option value="alim">আলিম</option>
              </select>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 sm:p-8 flex-1 bg-slate-50/30">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-slate-100/50 rounded-2xl animate-pulse ring-1 ring-black/5" />
                ))}
              </div>
            ) : !questions || questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 h-full">
                <div className="h-16 w-16 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">কোনো সংক্ষিপ্ত প্রশ্ন পাওয়া যায়নি</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  অ্যাডমিন প্যানেল থেকে প্রশ্ন যুক্ত হলে তা এখানে প্রদর্শিত হবে।
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/60 overflow-hidden relative">
                    {/* Importance Indicator */}
                    {q.importance === 3 && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                        অত্যন্ত গুরুত্বপূর্ণ
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold leading-none mt-0.5">
                        {idx + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed pr-8">
                        {q.question_text}
                      </h3>
                    </div>
                    
                    <div className="mt-4 pl-9">
                      <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100 flex align-top gap-3">
                        <BookOpenCheck className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-sm text-rose-700 block mb-2">মডেল উত্তর:</span>
                          <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                            {q.model_answer}
                          </p>
                          
                          {q.answer_points && Array.isArray(q.answer_points) && q.answer_points.length > 0 && (
                            <ul className="mt-3 space-y-2">
                              {q.answer_points.map((point, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-700">
                                  <span className="text-rose-500 font-bold">•</span>
                                  {point as string}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      
                      {(q.likely_year || q.topic_tag) && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {q.likely_year && (
                            <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                              বোর্ড সাল: {q.likely_year}
                            </span>
                          )}
                          {q.topic_tag && (
                            <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">
                              টপিক: {q.topic_tag}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
