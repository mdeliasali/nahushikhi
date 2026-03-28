import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuestions } from '@/hooks/useCurriculum';
import { useSubmitQuiz } from '@/hooks/useProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

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
    if (dbQuestions) {
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

      // Try to generate AI questions
      generateAIQuestions(quizQs);
    }
  }, [dbQuestions]);

  const generateAIQuestions = async (adminQs: QuizQuestion[]) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          chapterId,
          chapterTitle,
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
        // Shuffle
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
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

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

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct_answer ? 1 : 0), 0);

  if (aiLoading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-lg">🤖 AI প্রশ্ন তৈরি হচ্ছে...</div>
          <p className="text-sm text-muted-foreground">কিছুক্ষণ অপেক্ষা করুন</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">এই অধ্যায়ে কোনো কুইজ প্রশ্ন নেই</p>
          <Button onClick={() => navigate('/')}>হোমে ফিরুন</Button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8 max-w-2xl">
          <Card className="shadow-elevated">
            <CardHeader className="text-center">
              <Trophy className="h-16 w-16 mx-auto text-accent mb-2" />
              <CardTitle className="text-2xl">কুইজ ফলাফল</CardTitle>
              <p className="text-muted-foreground">{chapterTitle}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{score}/{totalQuestions}</p>
                <p className="text-muted-foreground mt-2">
                  {score === totalQuestions ? '🎉 অসাধারণ! সব সঠিক!' :
                   score >= totalQuestions * 0.7 ? '👏 ভালো হয়েছে!' :
                   '📚 আরও অনুশীলন প্রয়োজন'}
                </p>
              </div>

              <div className="space-y-4">
                {questions.map((q, i) => {
                  const isCorrect = answers[q.id] === q.correct_answer;
                  return (
                    <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{q.question_text}</p>
                          {!isCorrect && (
                            <p className="text-xs text-muted-foreground mt-1">
                              সঠিক উত্তর: <span className="font-medium text-foreground">{q.correct_answer}</span>
                            </p>
                          )}
                          {q.explanation && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{q.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => navigate('/')}>হোমে ফিরুন</Button>
                <Button onClick={() => { setShowResult(false); setSubmitted(false); setCurrentIndex(0); setAnswers({}); }}>
                  আবার চেষ্টা করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold">কুইজ: {chapterTitle}</h1>
            <p className="text-xs text-muted-foreground">প্রশ্ন {currentIndex + 1}/{totalQuestions}</p>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl">
        <Progress value={progress} className="mb-6" />

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">{currentQ.question_text}</CardTitle>
            {currentQ.is_ai_generated && (
              <span className="text-xs text-muted-foreground">🤖 AI-generated</span>
            )}
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQ.id] || ''}
              onValueChange={handleAnswer}
            >
              {currentQ.options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={opt} id={`opt-${i}`} />
                  <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-end mt-6 gap-2">
              {currentIndex < totalQuestions - 1 ? (
                <Button onClick={handleNext} disabled={!answers[currentQ.id]}>
                  পরবর্তী
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!answers[currentQ.id]}>
                  জমা দিন
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
