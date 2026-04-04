import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuestions } from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle2, XCircle, BookOpen, Sparkles, MessageSquare, Keyboard } from 'lucide-react';
import Layout from '@/components/Layout';

export default function PracticePage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { data: allQuestions, isLoading } = useQuestions(chapterId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const questions = allQuestions?.filter(q => q.is_practice_question) ?? [];
  const currentQ = questions[currentIndex];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center gap-4 text-muted-foreground">
            <div className="w-12 h-12 rounded-full gradient-primary animate-bounce shadow-elevated" />
            <span className="font-bold tracking-widest text-xs uppercase">লোড হচ্ছে...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 p-8 glass-card rounded-[2.5rem] text-center space-y-6 shadow-elevated border-white/60 animate-in-fade">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">অনুশীলন পাওয়া যায়নি</h2>
            <p className="text-muted-foreground font-medium">এই অধ্যায়ে এখনও কোনো অনুশীলন প্রশ্ন যোগ করা হয়নি।</p>
          </div>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full h-14 rounded-2xl gradient-primary shadow-elevated text-white font-black tracking-wide"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            হোমে ফিরে যান
          </Button>
        </div>
      </Layout>
    );
  }

  const options = Array.isArray(currentQ?.options) ? (currentQ.options as string[]) : [];
  const hasOptions = options.length > 0;

  // Improved matching for text-based answers
  const checkAnswer = (selected: string, correct: string) => {
    const s = selected.trim().toLowerCase();
    const c = correct.trim().toLowerCase();
    return s === c;
  };

  const isCorrect = checkAnswer(selectedAnswer, currentQ?.correct_answer);
  const progressValue = ((currentIndex + 1) / questions.length) * 100;

  const handleCheck = () => {
    if (!selectedAnswer.trim()) return;
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedAnswer('');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      navigate('/');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 pb-24 lg:pb-8 animate-in-fade">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-2xl hover:bg-black/5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                অনুশীলন (Practice)
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                নিজের দক্ষতাকে ঝালাই করুন
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="px-1">
          <Progress value={progressValue} className="h-2.5 bg-secondary/50 border border-white/40 shadow-inner" />
        </div>

        <div className="glass-card rounded-[2.5rem] p-6 md:p-10 space-y-8 shadow-elevated border-white/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 gradient-primary opacity-20" />
          
          <div className="space-y-4">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3" /> প্রশ্ন
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug">
              {currentQ.question_text}
            </h2>
          </div>

          <div className="space-y-6 min-h-[140px]">
            {hasOptions ? (
              <div className="grid grid-cols-1 gap-3">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    disabled={showFeedback}
                    onClick={() => setSelectedAnswer(opt)}
                    className={`flex items-center text-left p-5 rounded-2xl transition-all duration-300 border-2 active:scale-[0.98]
                      ${selectedAnswer === opt && !showFeedback ? 'border-primary bg-primary/5 ring-4 ring-primary/10 shadow-md' : 'border-black/5 bg-white/40'}
                      ${showFeedback && opt === currentQ.correct_answer ? 'border-success bg-success/10 ring-4 ring-success/10' : ''}
                      ${showFeedback && opt === selectedAnswer && !isCorrect ? 'border-destructive bg-destructive/10 ring-4 ring-destructive/10' : ''}
                      ${!showFeedback && selectedAnswer !== opt ? 'hover:bg-white hover:border-primary/20 hover:shadow-sm' : ''}
                      ${showFeedback && opt !== currentQ.correct_answer && opt !== selectedAnswer ? 'opacity-40' : ''}
                    `}
                  >
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black mr-4 shrink-0 transition-colors
                      ${selectedAnswer === opt || (showFeedback && opt === currentQ.correct_answer) ? 'bg-primary text-white' : 'bg-secondary text-slate-500'}
                    `}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`font-bold text-lg ${selectedAnswer === opt ? 'text-primary' : 'text-slate-700'}`}>
                      {opt}
                    </span>
                    {showFeedback && opt === currentQ.correct_answer && (
                      <CheckCircle2 className="h-6 w-6 text-success ml-auto animate-in-zoom" />
                    )}
                    {showFeedback && opt === selectedAnswer && !isCorrect && (
                      <XCircle className="h-6 w-6 text-destructive ml-auto animate-in-zoom" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4 animate-in-fade">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <Keyboard className="h-3 w-3" /> আপনার উত্তর লিখুন
                </span>
                <Input
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={showFeedback}
                  placeholder="এখানে আপনার উত্তর টাইপ করুন..."
                  className="h-16 rounded-2xl border-2 border-black/5 bg-white/40 text-lg font-bold px-6 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/50 shadow-inner"
                />
                {showFeedback && !isCorrect && (
                  <p className="text-sm font-bold text-success ml-1 animate-in-fade">
                    সঠিক উত্তর ছিল: <span className="underline">{currentQ.correct_answer}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {showFeedback && (
            <div className={`p-6 rounded-3xl animate-in-fade shadow-inner ${isCorrect ? 'bg-success/5 border border-success/20' : 'bg-destructive/5 border border-destructive/20'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${isCorrect ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                  {isCorrect ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                </div>
                <span className={`text-lg font-black ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                  {isCorrect ? 'অসাধারণ! সঠিক হয়েছে 🎉' : 'দুঃখিত, ভুল হয়েছে'}
                </span>
              </div>
              {currentQ.explanation && (
                <div className="pl-13 space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">ব্যাখ্যা</p>
                  <p className="text-slate-600 font-medium leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            {!showFeedback ? (
              <Button 
                onClick={handleCheck} 
                disabled={!selectedAnswer.trim()}
                className="w-full h-16 rounded-2xl gradient-primary shadow-elevated text-lg font-black tracking-wide transition-all disabled:opacity-50 active:scale-95"
              >
                যাচাই করুন
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="w-full h-16 rounded-2xl bg-foreground text-background shadow-elevated text-lg font-black tracking-wide hover:bg-foreground/90 transition-all active:scale-95"
              >
                {currentIndex < questions.length - 1 ? 'পরবর্তী প্রশ্নে যান' : 'অনুশীলন শেষ করুন'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


