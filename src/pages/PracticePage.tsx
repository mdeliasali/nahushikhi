import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuestions } from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function PracticePage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { data: allQuestions } = useQuestions(chapterId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const questions = allQuestions?.filter(q => q.is_practice_question) ?? [];
  const currentQ = questions[currentIndex];

  if (questions.length === 0) {
    return (
      <div className="flex-1 h-full min-h-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">এই অধ্যায়ে কোনো অনুশীলন নেই</p>
          <Button onClick={() => navigate('/')}>হোমে ফিরুন</Button>
        </div>
      </div>
    );
  }

  const isCorrect = selectedAnswer === currentQ?.correct_answer;

  const handleCheck = () => {
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

  const options = Array.isArray(currentQ?.options) ? (currentQ.options as string[]) : [];

  return (
    <div className="flex-1 h-full min-h-full overflow-y-auto bg-background">
      <header className="border-b bg-card shadow-card sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold">অনুশীলন</h1>
            <p className="text-xs text-muted-foreground">{currentIndex + 1}/{questions.length}</p>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">{currentQ.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showFeedback}>
              {options.map((opt, i) => (
                <div key={i} className={`flex items-center space-x-2 p-3 rounded-lg transition-colors
                  ${showFeedback && opt === currentQ.correct_answer ? 'bg-success/10 border border-success/30' : ''}
                  ${showFeedback && opt === selectedAnswer && !isCorrect ? 'bg-destructive/10 border border-destructive/30' : ''}
                  ${!showFeedback ? 'hover:bg-muted/50' : ''}
                `}>
                  <RadioGroupItem value={opt} id={`opt-${i}`} />
                  <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                </div>
              ))}
            </RadioGroup>

            {showFeedback && (
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {isCorrect ? (
                    <><CheckCircle2 className="h-5 w-5 text-success" /><span className="font-medium text-success">সঠিক! 🎉</span></>
                  ) : (
                    <><XCircle className="h-5 w-5 text-destructive" /><span className="font-medium text-destructive">ভুল</span></>
                  )}
                </div>
                {currentQ.explanation && (
                  <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              {!showFeedback ? (
                <Button onClick={handleCheck} disabled={!selectedAnswer}>
                  যাচাই করুন
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {currentIndex < questions.length - 1 ? 'পরবর্তী' : 'সমাপ্ত'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
