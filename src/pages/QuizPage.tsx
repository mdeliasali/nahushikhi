import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuestions } from '@/hooks/useCurriculum';
import { useSubmitQuiz } from '@/hooks/useProgress';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Sparkles, Brain, ArrowRight, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  question_type: string;
  is_ai_generated?: boolean;
}

export default function QuizPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dbQuestions } = useQuestions(chapterId);
  const submitQuiz = useSubmitQuiz();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');

  useEffect(() => {
    if (chapterId) {
      supabase.from('chapters').select('title').eq('id', chapterId).single()
        .then(({ data }) => { if (data) setChapterTitle(data.title); });
    }
  }, [chapterId]);

  useEffect(() => {
    if (dbQuestions && chapterTitle) {
      const quizQs = dbQuestions
        .filter(q => q.is_quiz_question)
        .slice(0, 5)
        .map(q => ({
          id: q.id,
          question_text: q.question_text,
          options: Array.isArray(q.options) ? (q.options as string[]) : [],
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          question_type: q.question_type,
        }));

      generateAIQuestions(quizQs, chapterTitle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbQuestions, chapterTitle]);

  const generateAIQuestions = async (adminQs: QuizQuestion[], cTitle: string) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          chapterId,
          chapterTitle: cTitle,
          existingQuestions: adminQs.map(q => q.question_text),
          count: 5,
        },
      });

      if (!error && data?.questions) {
        const aiQs: QuizQuestion[] = data.questions.map((q: any, i: number) => ({
          id: `ai-${i}`,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          question_type: 'mcq',
          is_ai_generated: true,
        }));
        const combined = [...adminQs, ...aiQs];
        setQuestions(combined.sort(() => Math.random() - 0.5));
      } else {
        setQuestions(adminQs.sort(() => Math.random() - 0.5));
      }
    } catch {
      setQuestions(adminQs.sort(() => Math.random() - 0.5));
    }
    setAiLoading(false);
  };

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressValue = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleAnswer = (value: string) => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    const score = questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correct_answer ? 1 : 0);
    }, 0);

    const weakTopics = questions
      .filter(q => answers[q.id] !== q.correct_answer)
      .map(q => q.question_text.slice(0, 50));

    try {
      await submitQuiz.mutateAsync({
        chapterId: chapterId!,
        score,
        totalQuestions,
        answers: questions.map(q => ({
          questionId: q.id,
          selected: answers[q.id] || '',
          correct: q.correct_answer,
          isCorrect: answers[q.id] === q.correct_answer,
        })),
        weakTopics,
      });
    } catch {
      // Non-critical
    }

    setSubmitted(true);
    setShowResult(true);
  };

  const scoreValue = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct_answer ? 1 : 0), 0);

  if (aiLoading && questions.length === 0) {
    return (
      <div className="flex-1 h-full min-h-full flex flex-col items-center justify-center bg-white p-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
        </div>
        <div className="text-center mt-8 space-y-2">
          <h2 className="text-xl font-black">🤖 প্রশ্ন তৈরি হচ্ছে...</h2>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">AI আপনার জন্য কুইজ সাজাচ্ছে</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 h-full min-h-full flex flex-col items-center justify-center bg-white p-6">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
           <RotateCcw className="h-8 w-8 text-slate-400" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-xl font-black">কোনো প্রশ্ন পাওয়া যায়নি</h2>
          <p className="text-sm font-medium text-muted-foreground">এই অধ্যায়ে কোনো কুইজ প্রশ্ন তৈরি করা হয়নি।</p>
          <Button onClick={() => navigate('/')} className="rounded-full gradient-primary px-8">হোমে ফিরুন</Button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="flex-1 h-full min-h-full w-full overflow-y-auto bg-[#FDFCFB] pb-10">
        <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
          <div className="glass-card rounded-[3rem] p-8 shadow-elevated text-center relative overflow-hidden animate-in-fade">
            <div className="absolute top-0 left-0 w-full h-2 gradient-primary" />
            
            <div className="mb-6 inline-flex relative">
              <div className="h-24 w-24 rounded-full bg-amber-100 flex items-center justify-center shadow-inner">
                <Trophy className="h-12 w-12 text-amber-600" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-amber-500 animate-pulse" />
            </div>
            
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-black text-foreground leading-none">কুইজ ফলাফল</h1>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{chapterTitle}</p>
            </div>

            <div className="mb-8 p-6 bg-secondary/30 rounded-[2rem] space-y-1">
              <p className="text-5xl font-black text-primary leading-none">{scoreValue}/{totalQuestions}</p>
              <p className="text-sm font-bold text-muted-foreground mt-2">
                {scoreValue === totalQuestions ? '🎉 অসাধারণ! আপনি সেরা!' :
                 scoreValue >= totalQuestions * 0.7 ? '👏 চমৎকার ফলাফল!' :
                 '📚 অবিরত চেষ্টা করুন'}
              </p>
            </div>

            <div className="space-y-3 text-left mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">বিশ্লেষণ</h3>
              {questions.map((q, i) => {
                const isCorrect = answers[q.id] === q.correct_answer;
                return (
                  <div key={q.id} className={`p-4 rounded-2xl ring-1 transition-all ${
                    isCorrect ? 'bg-emerald-50/50 ring-emerald-100' : 'bg-rose-50/50 ring-rose-100'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 leading-tight">{q.question_text}</p>
                        {!isCorrect && (
                          <div className="flex flex-col gap-1 mt-2">
                            <p className="text-[10px] uppercase font-black text-rose-600 tracking-wider">সঠিক উত্তর</p>
                            <p className="text-xs font-bold text-emerald-700 bg-emerald-100/50 px-3 py-1 rounded-lg w-fit">{q.correct_answer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => { setShowResult(false); setSubmitted(false); setCurrentIndex(0); setAnswers({}); }}
                className="w-full h-14 rounded-2xl bg-foreground text-background font-black hover:bg-foreground/90"
              >
                আবার চেষ্টা করুন
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="w-full h-14 rounded-2xl font-black text-muted-foreground"
              >
                হোমে ফিরুন
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full min-h-full w-full overflow-y-auto bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 w-full">
        <div className="container mx-auto max-w-4xl flex items-center h-16 px-4 sm:px-6 gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-black truncate">{chapterTitle}</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">কুইজ সেশন</p>
          </div>
        </div>
        <Progress value={progressValue} className="h-1 bg-primary/5 rounded-none" />
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl pb-32">
        <div className="mb-8 space-y-4 animate-in-fade">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
              প্রশ্ন {currentIndex + 1} / {totalQuestions}
            </span>
            {currentQ.is_ai_generated && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full ring-1 ring-amber-100">
                <Sparkles className="h-2 w-2" /> AI-generated
              </span>
            )}
          </div>
          
          <h2 className="text-2xl font-black leading-tight text-foreground tracking-tight">
            {currentQ.question_text}
          </h2>
        </div>

        <div className="space-y-4 animate-in-fade anim-delay-100">
          {currentQ.options.map((opt, i) => {
            const isSelected = answers[currentQ.id] === opt;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className={`w-full text-left p-6 rounded-[2rem] transition-all relative border-2 ${
                  isSelected 
                  ? 'border-primary bg-primary/5 shadow-md active:scale-98' 
                  : 'border-transparent bg-secondary/40 hover:bg-secondary/60 active:bg-secondary/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full border-4 flex items-center justify-center text-xs font-black transition-colors ${
                    isSelected ? 'border-primary bg-primary text-white' : 'border-white bg-white/50 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className={`text-base font-bold transition-colors ${
                    isSelected ? 'text-primary' : 'text-slate-700'
                  }`}>
                    {opt}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
          <div className="container mx-auto max-w-4xl pointer-events-auto">
            {currentIndex < totalQuestions - 1 ? (
              <Button 
                onClick={handleNext} 
                className="w-full h-16 rounded-[2rem] gradient-primary shadow-elevated text-lg font-black group transition-transform active:scale-95"
                disabled={!answers[currentQ.id]}
              >
                পরবর্তী ধাপ
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="w-full h-16 rounded-[2rem] bg-foreground text-background shadow-elevated text-lg font-black transition-transform active:scale-95"
                disabled={!answers[currentQ.id]}
              >
                জমা দিন
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
