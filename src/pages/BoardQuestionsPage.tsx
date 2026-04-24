import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { BookOpen, Search, Info, CheckCircle2, XCircle, ArrowRight, BookMarked, RotateCcw, RefreshCcw, ArrowLeft } from "lucide-react";
import { useBoardQuestions } from "@/hooks/useExamPrep";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";


type ExamClass = Database['public']['Enums']['exam_class'];

export default function BoardQuestionsPage() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<ExamClass>("dakhil");
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  
  const { data: questions, isLoading } = useBoardQuestions(selectedClass, selectedYear);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  // Derive unique years for the filter from 2010 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);

  // Reset state when class or year filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setWrittenAnswer('');
    setShowResult(false);
  }, [selectedClass, selectedYear, questions]);

  const handleOptionSelect = (opt: string) => {
    if (showResult) return;
    setSelectedOption(opt);
  };

  const handleSubmit = () => {
    if (!selectedOption && !writtenAnswer.trim()) return;
    setShowResult(true);
  };

  const handleNext = () => {
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setWrittenAnswer('');
      setShowResult(false);
    }
  };

  const currentQ = questions?.[currentIndex];
  
  // Decide correctness. For MCQ it's strict equality. For written, we might just do a basic string match, 
  // but usually written answers need ai-grading or self-grading. For now, exact match or substring.
  const isCorrect = currentQ && (
    (selectedOption && selectedOption === currentQ.correct_answer) ||
    (writtenAnswer && writtenAnswer.trim().toLowerCase() === currentQ.correct_answer?.trim().toLowerCase()) ||
    (writtenAnswer && currentQ.correct_answer && currentQ.correct_answer.includes(writtenAnswer))
  );

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 animate-in-fade pb-20">
        <div className="glass-card rounded-[2rem] overflow-hidden shadow-card ring-1 ring-black/5 flex flex-col min-h-[80vh]">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-blue-50/50 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-100 shrink-0" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">বোর্ড প্রশ্নাবলি</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">ইন্টারেক্টিভ বোর্ড প্রশ্ন সমাধান ও রিভিশন</p>
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
          <div className="p-6 sm:p-8 flex-1 bg-slate-50/30 flex flex-col justify-center">
            {isLoading ? (
              <div className="space-y-4 max-w-2xl mx-auto w-full">
                <div className="h-48 bg-slate-100/50 rounded-2xl animate-pulse ring-1 ring-black/5" />
                <div className="h-16 bg-slate-100/50 rounded-2xl animate-pulse" />
                <div className="h-16 bg-slate-100/50 rounded-2xl animate-pulse" />
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
            ) : currentQ ? (
              <div className="max-w-2xl mx-auto w-full space-y-6">
                
                {/* Progress Indicators */}
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-slate-500">
                    প্রশ্ন {currentIndex + 1} / {questions.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {currentQ.board_name} {currentQ.year}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress 
                  value={((currentIndex + 1) / (questions?.length || 1)) * 100} 
                  className="h-1.5 bg-slate-100" 
                />


                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm ring-1 ring-slate-200/60 transition-all duration-300">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-relaxed">
                    {currentQ.question_text}
                  </h3>
                  
                  {currentQ.question_text_arabic && (
                    <p className="text-right text-2xl font-arabic text-slate-700 mt-5 leading-[2.5] bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-inner" dir="rtl">
                      {currentQ.question_text_arabic}
                    </p>
                  )}
                  
                  {/* Interactive Options or Input */}
                  <div className="mt-8">
                    {currentQ.options && Array.isArray(currentQ.options) && currentQ.options.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                        {currentQ.options.map((opt, i) => {
                          const isSelected = selectedOption === opt;
                          const isCorrectOpt = showResult && opt === currentQ.correct_answer;
                          const isWrongOpt = showResult && isSelected && !isCorrect;
                          
                          let btnClass = "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50";
                          if (isSelected && !showResult) btnClass = "border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500 shadow-sm";
                          if (isCorrectOpt) btnClass = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500 shadow-sm";
                          if (isWrongOpt) btnClass = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500 shadow-sm";

                          return (
                            <button 
                              key={i} 
                              onClick={() => handleOptionSelect(opt as string)}
                              disabled={showResult}
                              className={`p-4 rounded-xl border text-left font-medium transition-all duration-200 ${btnClass}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs shrink-0 ${isSelected && !showResult ? 'bg-blue-500 text-white' : isCorrectOpt ? 'bg-green-500 text-white' : isWrongOpt ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                  {String.fromCharCode(2534 + i)}
                                </div>
                                <span className={isCorrectOpt ? "font-bold" : ""}>{opt as string}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <textarea 
                          value={writtenAnswer}
                          onChange={e => setWrittenAnswer(e.target.value)}
                          disabled={showResult}
                          placeholder="আপনার উত্তর এখানে লিখুন..."
                          className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none min-h-[120px] transition-all"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  {!showResult && (
                    <div className="mt-8 flex justify-end">
                      <Button 
                        size="lg" 
                        onClick={handleSubmit} 
                        disabled={!selectedOption && !writtenAnswer.trim()}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl px-8"
                      >
                        উত্তর জমা দিন
                      </Button>
                    </div>
                  )}

                  {/* Flow Feedback */}
                  {showResult && (
                    <div className={`mt-8 p-6 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} animate-in-fade`}>
                      <div className="flex items-start gap-4">
                        {isCorrect ? (
                          <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                            <XCircle className="h-6 w-6" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h4 className={`text-lg font-bold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                            {isCorrect ? 'সঠিক উত্তর!' : 'ভুল উত্তর!'}
                          </h4>
                          
                          {!isCorrect && (
                                <div className="mt-2 space-y-4">
                                  <p className="text-sm font-medium text-red-700/80 mb-2">
                                    রিভিশন পেজ থেকে এই প্রশ্নের উত্তরটি ভালোভাবে জেনে নিন অথবা অধ্যায়টি পুনরায় পড়ে আবার চেষ্টা করুন।
                                  </p>
                                  
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button variant="outline" className="bg-white hover:bg-slate-50 border-red-200 text-red-700" onClick={() => window.open('/revision-cards', '_blank')}>
                                      <BookMarked className="h-4 w-4 mr-2" />
                                      রিভিশন পেজ
                                    </Button>
                                    <Button variant="outline" className="bg-white hover:bg-slate-50 border-red-200 text-red-700" onClick={() => window.open('/curriculum', '_blank')}>
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      অধ্যায়টি পুনরায় পড়ুন
                                    </Button>
                                  </div>
                                </div>
                          )}

                          {isCorrect && currentQ.explanation && (
                            <div className="mt-3 bg-white/60 p-3 rounded-lg border border-green-100 text-sm flex gap-2">
                              <Info className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                              <span className="text-green-800">{currentQ.explanation}</span>
                            </div>
                          )}
                          
                          <div className="mt-6 flex justify-end gap-3">
                            {isCorrect ? (
                              currentIndex < questions.length - 1 ? (
                                <Button 
                                  onClick={handleNext}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  পরবর্তি প্রশ্নে যান
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              ) : (
                                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold flex items-center">
                                  এই সেশনের সবগুলো প্রশ্ন শেষ! 🎉
                                </div>
                              )
                            ) : (
                              <Button 
                                onClick={() => {
                                  setShowResult(false);
                                  setSelectedOption(null);
                                  setWrittenAnswer('');
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-white"
                              >
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                পুনরায় চেষ্টা করুন
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
