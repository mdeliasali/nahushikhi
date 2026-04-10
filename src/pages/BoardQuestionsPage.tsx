import { useState } from "react";
import Layout from "@/components/Layout";
import { BookOpen, Search, Info } from "lucide-react";
import { useBoardQuestions } from "@/hooks/useExamPrep";
import { Database } from "@/integrations/supabase/types";

type ExamClass = Database['public']['Enums']['exam_class'];

export default function BoardQuestionsPage() {
  const [selectedClass, setSelectedClass] = useState<ExamClass>("dakhil");
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  
  const { data: questions, isLoading } = useBoardQuestions(selectedClass, selectedYear);

  // Derive unique years for the filter from 2010 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 animate-in-fade pb-20">
        <div className="glass-card rounded-[2rem] overflow-hidden shadow-card ring-1 ring-black/5 flex flex-col min-h-[80vh]">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-blue-50/50 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">প্রশ্নব্যাংক</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">বিগত সালের বোর্ড প্রশ্নাবলি সমাধানসহ</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <select 
                className="bg-white border border-slate-200 text-sm rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as ExamClass)}
                title="শ্রেণি নির্বাচন করুন"
                aria-label="শ্রেণি নির্বাচন করুন"
              >
                <option value="dakhil">দাখিল</option>
                <option value="alim">আলিম</option>
              </select>
              
              <select 
                className="bg-white border border-slate-200 text-sm rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                value={selectedYear || ""}
                onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : undefined)}
                title="সাল নির্বাচন করুন"
                aria-label="সাল নির্বাচন করুন"
              >
                <option value="">সকল সাল</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
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
                <div className="h-16 w-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">কোনো প্রশ্ন পাওয়া যায়নি</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  এই ফিল্টারের জন্য আপাতত ডাটাবেজে কোনো প্রস্তুতকৃত প্রশ্ন নেই। অ্যাডমিন প্যানেল থেকে প্রশ্ন যুক্ত হলে তা এখানে দেখা যাবে।
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/60">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">
                        {q.board_name} - {q.year}
                      </span>
                      {q.topic_tag && (
                        <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          {q.topic_tag}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed">
                      {idx + 1}. {q.question_text}
                    </h3>
                    
                    {q.question_text_arabic && (
                      <p className="text-right text-2xl font-arabic text-slate-700 mt-4 leading-[2.5] bg-slate-50 p-4 rounded-xl border border-slate-100" dir="rtl">
                        {q.question_text_arabic}
                      </p>
                    )}
                    
                    {/* Only show multiple choice options if it has them */}
                    {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`p-3 rounded-xl border text-sm font-medium ${opt === q.correct_answer ? 'border-green-200 bg-green-50 text-green-800' : 'border-slate-100 bg-slate-50 text-slate-700'}`}>
                            {String.fromCharCode(2534 + i)}. {opt as string}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {q.explanation && (
                      <div className="mt-5 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex align-top gap-3">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-slate-700 font-medium">
                          <span className="font-bold block mb-1">ব্যাখ্যা:</span>
                          {q.explanation}
                        </div>
                      </div>
                    )}
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
