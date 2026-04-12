import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Timer, CheckCircle, AlertCircle, RefreshCw, Trophy } from "lucide-react";
import { useBoardQuestions, useSaveMockTestSession } from "@/hooks/useExamPrep";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database } from "@/integrations/supabase/types";

type ExamClass = Database['public']['Enums']['exam_class'];

export default function MockTestPage() {
  const [selectedClass, setSelectedClass] = useState<ExamClass>("dakhil");
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Actually, we should fetch from a specific "mock questions" or random board questions
  // For now, we take all questions and pick 30 randomly (or all if < 30)
  const { data: allQuestions, isLoading } = useBoardQuestions(selectedClass);
  const saveSession = useSaveMockTestSession();
  
  // Randomly selected questions for this session
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && !testFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && !testFinished) {
      handleFinishTest();
    }
    return () => clearInterval(timer);
  }, [testStarted, testFinished, timeLeft]);

  const handleStartTest = () => {
    if (allQuestions && allQuestions.length > 0) {
      // Shuffle and take up to 30 questions
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 30));
    }
    setTestStarted(true);
    setTestFinished(false);
    setTimeLeft(30 * 60);
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (!testFinished && !showResult) {
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
    }
  };

  const handleSubmitQuestion = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !answers[currentQ.id]) return;
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowResult(false);
    } else {
      handleFinishTest();
    }
  };

  const handleFinishTest = async () => {
    setTestFinished(true);
    
    // Calculate Score
    let correct = 0;
    let wrong = 0;
    
    questions.forEach(q => {
      if (answers[q.id]) {
        if (answers[q.id] === q.correct_answer) correct++;
        else wrong++;
      }
    });
    
    const skipped = questions.length - (correct + wrong);
    const scorePercent = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    
    try {
      await saveSession.mutateAsync({
        exam_class: selectedClass,
        started_at: new Date(Date.now() - (1800 - timeLeft) * 1000).toISOString(),
        finished_at: new Date().toISOString(),
        duration_seconds: 1800 - timeLeft,
        total_questions: questions.length,
        correct_count: correct,
        wrong_count: wrong,
        skipped_count: skipped,
        score_percent: scorePercent,
        answers: answers
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalCorrect = questions.filter(q => answers[q.id] === q.correct_answer).length;
  const scorePercent = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

  const currentQ = questions[currentIndex];
  const isCorrect = currentQ && answers[currentQ.id] === currentQ.correct_answer;

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 animate-in-fade pb-20">
        <div className="glass-card rounded-[2rem] overflow-hidden shadow-card ring-1 ring-black/5 flex flex-col min-h-[80vh]">
          
          {/* Header */}
          <div className="p-6 sm:p-8 bg-indigo-50/50 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Timer className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">মডেল টেস্ট</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">পূর্ণাঙ্গ ৩০টি বহুনির্বাচনি প্রশ্ন</p>
              </div>
            </div>
            
            {testStarted && !testFinished && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100">
                <div className={`font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                  {formatTime(timeLeft)}
                </div>
                <Button onClick={handleFinishTest} variant="destructive" size="sm" className="rounded-lg h-8">
                  জমা দিন
                </Button>
              </div>
            )}
            
            {!testStarted && (
              <select 
                className="bg-white border border-slate-200 text-sm rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as ExamClass)}
                title="শ্রেণি নির্বাচন করুন"
                aria-label="শ্রেণি নির্বাচন করুন"
              >
                <option value="dakhil">দাখিল</option>
                <option value="alim">আলিম</option>
              </select>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6 sm:p-8 flex-1 bg-slate-50/30">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : !testStarted ? (
              <div className="flex flex-col items-center justify-center text-center py-10 max-w-sm mx-auto h-full space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 w-full space-y-4 text-left">
                  <h3 className="font-bold text-lg text-slate-800">পরীক্ষার নিয়মাবলি:</h3>
                  <ul className="text-sm text-slate-600 space-y-2 font-medium">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> মোট প্রশ্ন: ৩০টি</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> সময়: ৩০ মিনিট</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> প্রতিটি প্রশ্নের মান: ১</li>
                    <li className="flex items-center gap-2 text-amber-500"><AlertCircle className="h-4 w-4" /> সময় শেষ হলে স্বয়ংক্রিয়ভাবে জমা হবে</li>
                  </ul>
                </div>
                
                {allQuestions && allQuestions.length > 0 ? (
                  <Button 
                    onClick={handleStartTest} 
                    className="w-full h-14 text-lg rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
                  >
                     পরীক্ষা শুরু করুন
                  </Button>
                ) : (
                  <div className="text-red-500 font-medium bg-red-50 p-4 rounded-xl border border-red-100 w-full">
                    এই ক্লাসের জন্য এখনো প্রশ্ন ব্যাংক তৈরি করা হয়নি।
                  </div>
                )}
              </div>
            ) : testFinished ? (
              // Results View
              <div className="animate-in zoom-in-95 duration-500 space-y-8">
                <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
                  
                  <Trophy className={`h-20 w-20 mx-auto ${scorePercent >= 80 ? 'text-amber-400' : 'text-slate-300'} mb-4`} />
                  
                  <h2 className="text-3xl font-extrabold text-slate-800 mb-2">ফলাফল</h2>
                  <div className="flex justify-center items-end gap-2 mb-6">
                    <span className="text-5xl font-black text-indigo-600">{totalCorrect}</span>
                    <span className="text-xl font-bold text-slate-400 pb-1">/ {questions.length}</span>
                  </div>
                  
                  <Progress value={scorePercent} className="h-3 max-w-sm mx-auto mb-4 bg-slate-100" />
                  
                  <div className="flex justify-center gap-6 mt-8">
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase">সঠিক</div>
                      <div className="text-xl font-bold text-emerald-500">{totalCorrect}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase">ভুল</div>
                      <div className="text-xl font-bold text-red-500">{Object.keys(answers).length - totalCorrect}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase">বাদ</div>
                      <div className="text-xl font-bold text-slate-500">{questions.length - Object.keys(answers).length}</div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => { setTestStarted(false); setTestFinished(false); }} 
                    className="mt-8 rounded-xl"
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> আবার পরীক্ষা দিন
                  </Button>
                </div>
                
                {/* Answer Review */}
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-800">উত্তরপত্র পর্যালোচনা</h3>
                  
                  {questions.map((q, idx) => {
                    const userAnswer = answers[q.id];
                    const isCorrect = userAnswer === q.correct_answer;
                    const isSkipped = !userAnswer;
                    
                    return (
                      <div key={q.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${isCorrect ? 'border-emerald-200' : isSkipped ? 'border-slate-200' : 'border-red-200'}`}>
                        <div className="flex items-start gap-3 mb-4">
                          <span className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 ${isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-400' : 'bg-red-500'}`}>
                            {idx + 1}
                          </span>
                          <h4 className="font-semibold text-slate-800">{q.question_text}</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                          {q.options?.map((opt: string, i: number) => {
                            const isSelected = userAnswer === opt;
                            const isActuallyCorrect = opt === q.correct_answer;
                            
                            let optClass = "border-slate-100 bg-slate-50 opacity-60";
                            if (isActuallyCorrect) optClass = "border-emerald-300 bg-emerald-50/50 text-emerald-800 font-bold ring-1 ring-emerald-500/20";
                            else if (isSelected && !isActuallyCorrect) optClass = "border-red-300 bg-red-50/50 text-red-800";
                            
                            return (
                              <div key={i} className={`p-3 rounded-xl border text-sm flex justify-between items-center ${optClass}`}>
                                <span>{String.fromCharCode(2534 + i)}. {opt}</span>
                                {isActuallyCorrect && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Active Test View - One Question at a Time with Learning Loop
              <div className="max-w-2xl mx-auto w-full space-y-6">
                {currentQ && (
                  <>
                    {/* Progress Indicators */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-semibold text-slate-500">
                        প্রশ্ন {currentIndex + 1} / {questions.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {currentQ.board_name} {currentQ.year}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>

                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 transition-all duration-300">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-relaxed">
                        {currentQ.question_text}
                      </h3>
                      
                      {currentQ.question_text_arabic && (
                        <p className="text-right text-2xl font-arabic text-slate-700 mt-5 leading-[2.5] bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-inner" dir="rtl">
                          {currentQ.question_text_arabic}
                        </p>
                      )}
                      
                      <div className="mt-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                          {currentQ.options?.map((opt: string, i: number) => {
                            const isSelected = answers[currentQ.id] === opt;
                            const isCorrectOpt = showResult && opt === currentQ.correct_answer;
                            const isWrongOpt = showResult && isSelected && !isCorrect;
                            
                            let btnClass = "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50";
                            if (isSelected && !showResult) btnClass = "border-indigo-500 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-500 shadow-sm";
                            if (isCorrectOpt) btnClass = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500 shadow-sm";
                            if (isWrongOpt) btnClass = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500 shadow-sm";

                            return (
                              <button 
                                key={i} 
                                onClick={() => handleAnswerChange(currentQ.id, opt)}
                                disabled={showResult}
                                className={`p-4 rounded-xl border text-left font-medium transition-all duration-200 ${btnClass}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs shrink-0 ${isSelected && !showResult ? 'bg-indigo-500 text-white' : isCorrectOpt ? 'bg-green-500 text-white' : isWrongOpt ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {String.fromCharCode(2534 + i)}
                                  </div>
                                  <span className={isCorrectOpt ? "font-bold" : ""}>{opt}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {!showResult && (
                        <div className="mt-8 flex justify-end">
                          <Button 
                            size="lg" 
                            onClick={handleSubmitQuestion} 
                            disabled={!answers[currentQ.id]}
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
                                <CheckCircle className="h-6 w-6" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                                <AlertCircle className="h-6 w-6" />
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
                                      রিভিশন পেজ
                                    </Button>
                                    <Button variant="outline" className="bg-white hover:bg-slate-50 border-red-200 text-red-700" onClick={() => window.open('/curriculum', '_blank')}>
                                      অধ্যায়টি পুনরায় পড়ুন
                                    </Button>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-6 flex justify-end gap-3">
                                {isCorrect ? (
                                  <Button 
                                    onClick={handleNext}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {currentIndex < questions.length - 1 ? 'পরবর্তি প্রশ্নে যান' : 'পরীক্ষা শেষ করুন'}
                                  </Button>
                                ) : (
                                  <Button 
                                    onClick={() => {
                                      setShowResult(false);
                                      setAnswers(prev => {
                                        const next = { ...prev };
                                        delete next[currentQ.id];
                                        return next;
                                      });
                                    }}
                                    className="bg-slate-900 hover:bg-slate-800 text-white"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    পুনরায় চেষ্টা করুন
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
