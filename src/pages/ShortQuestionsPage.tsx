import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { MessageSquareText, Search, BookOpenCheck, CheckCircle2, XCircle, ArrowRight, BookMarked, RotateCcw, RefreshCcw } from "lucide-react";
import { useShortQuestions } from "@/hooks/useExamPrep";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/PageHeader";

type ExamClass = Database['public']['Enums']['exam_class'];

export default function ShortQuestionsPage() {
  const [selectedClass, setSelectedClass] = useState<ExamClass>("dakhil");
  
  const { data: questions, isLoading } = useShortQuestions(selectedClass);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [writtenAnswer, setWrittenAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isGraded, setIsGraded] = useState<'none' | 'correct' | 'wrong'>('none');

  useEffect(() => {
    setCurrentIndex(0);
    setWrittenAnswer('');
    setShowResult(false);
    setIsGraded('none');
  }, [selectedClass, questions]);

  const handleSubmit = () => {
    if (!writtenAnswer.trim()) return;
    setShowResult(true);
  };

  const handleNext = () => {
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setWrittenAnswer('');
      setShowResult(false);
      setIsGraded('none');
    }
  };

  const currentQ = questions?.[currentIndex];

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 animate-in-fade pb-20">
        <div className="glass-card rounded-[2rem] overflow-hidden shadow-card ring-1 ring-black/5 flex flex-col min-h-[80vh]">
          <PageHeader
            title="সংক্ষিপ্ত প্রশ্নাবলি"
            subtitle="মডেল উত্তরসহ গুরুত্বপূর্ণ প্রশ্নোত্তর ও সেল্ফ-টেস্ট"
            icon={MessageSquareText}
            iconBgColor="bg-rose-100"
            iconColor="text-rose-600"
            className="bg-rose-50/50"
          >
            <select 
              className="bg-white border border-slate-200 text-sm rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-rose-100 outline-none cursor-pointer"
              value={selectedClass}
              title="শ্রেণি নির্বাচন করুন"
              aria-label="শ্রেণি নির্বাচন করুন"
              onChange={(e) => setSelectedClass(e.target.value as ExamClass)}
            >
              <option value="dakhil">দাখিল</option>
              <option value="alim">আলিম</option>
            </select>
          </PageHeader>
          
          {/* Content */}
          <div className="p-6 sm:p-8 flex-1 bg-slate-50/30 flex flex-col justify-center">
            {isLoading ? (
              <div className="space-y-4 max-w-2xl mx-auto w-full">
                <div className="h-32 bg-slate-100/50 rounded-2xl animate-pulse ring-1 ring-black/5" />
                <div className="h-32 bg-slate-100/50 rounded-2xl animate-pulse ring-1 ring-black/5" />
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
            ) : currentQ ? (
              <div className="max-w-2xl mx-auto w-full space-y-6">
                
                {/* Progress Indicators */}
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-slate-500">
                    প্রশ্ন {currentIndex + 1} / {questions.length}
                  </div>
                  <div className="flex items-center gap-2">
                    {currentQ.likely_year && (
                      <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        সাল: {currentQ.likely_year}
                      </span>
                    )}
                    {currentQ.importance === 3 && (
                      <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        অত্যন্ত গুরুত্বপূর্ণ
                      </span>
                    )}
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
                  
                  {/* Interactive Input */}
                  <div className="mt-8">
                    {!showResult ? (
                      <div className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium mb-2">আপনার উত্তর লিখুন:</p>
                        <textarea 
                          value={writtenAnswer}
                          onChange={e => setWrittenAnswer(e.target.value)}
                          placeholder="সংক্ষিপ্ত প্রশ্নের উত্তর লিখুন..."
                          className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-100 outline-none min-h-[120px] transition-all"
                        />
                        <div className="mt-4 flex justify-end">
                          <Button 
                            size="lg" 
                            onClick={handleSubmit} 
                            disabled={!writtenAnswer.trim()}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl px-8"
                          >
                            উত্তর জমা দিন
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <span className="font-bold text-sm text-slate-500 block mb-2">আপনার উত্তর:</span>
                          <p className="text-slate-800 font-medium whitespace-pre-wrap">{writtenAnswer}</p>
                        </div>
                        
                        <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100 flex gap-3">
                          <BookOpenCheck className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-sm text-rose-700 block mb-2">মডেল উত্তর:</span>
                            <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                              {currentQ.model_answer}
                            </p>
                            
                            {currentQ.answer_points && Array.isArray(currentQ.answer_points) && currentQ.answer_points.length > 0 && (
                              <ul className="mt-3 space-y-2">
                                {currentQ.answer_points.map((point: any, i: number) => (
                                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                                    <span className="text-rose-500 font-bold">•</span>
                                    {point as string}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        {/* Grading flow */}
                        {isGraded === 'none' && (
                          <div className="mt-6 border-t pt-6 text-center animate-in-fade">
                            <h4 className="text-lg font-bold text-slate-800 mb-4">মডেল উত্তরের সাথে মিলিয়ে আপনার উত্তর কেমন হলো?</h4>
                            <div className="flex justify-center flex-wrap gap-4">
                              <Button 
                                onClick={() => setIsGraded('correct')}
                                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                              >
                                <CheckCircle2 className="h-5 w-5" /> সঠিক হয়েছে
                              </Button>
                              <Button 
                                onClick={() => setIsGraded('wrong')}
                                className="bg-red-600 hover:bg-red-700 text-white gap-2"
                              >
                                <XCircle className="h-5 w-5" /> ভুল বা অসম্পূর্ণ
                              </Button>
                            </div>
                          </div>
                        )}

                        {isGraded === 'wrong' && (
                          <div className="mt-6 p-6 rounded-xl border bg-red-50 border-red-200 animate-in-fade">
                            <div className="flex items-start gap-4">
                              <div className="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                                <XCircle className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold mb-1 text-red-800">ভুল বা অসম্পূর্ণ উত্তর</h4>
                                <div className="mt-2 space-y-4">
                                  <p className="text-sm font-medium text-red-700/80 mb-2">
                                    রিভিশন পেজ থেকে মডেল উত্তরটি ভালোভাবে জেনে নিন অথবা অধ্যায়টি পুনরায় পড়ে আবার চেষ্টা করুন।
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

                                <div className="mt-6 flex justify-end gap-3">
                                  <Button 
                                    onClick={() => {
                                      setShowResult(false);
                                      setWrittenAnswer('');
                                      setIsGraded('none');
                                    }}
                                    className="bg-slate-900 hover:bg-slate-800 text-white"
                                  >
                                    <RefreshCcw className="h-4 w-4 mr-2" />
                                    পুন্রায় চেষ্টা করুন
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {isGraded === 'correct' && (
                          <div className="mt-6 p-6 rounded-xl border bg-green-50 border-green-200 animate-in-fade">
                            <div className="flex items-start gap-4">
                              <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle2 className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold mb-1 text-green-800">চমৎকার! সঠিক উত্তর।</h4>
                                
                                <div className="mt-6 flex justify-end gap-3">
                                  {currentIndex < questions.length - 1 ? (
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
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
