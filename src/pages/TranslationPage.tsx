import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, ArrowRight, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useTranslations } from '@/hooks/usePracticeTools';

type TranslationMode = 'ar-to-bn' | 'bn-to-ar';



export default function TranslationPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TranslationMode>('ar-to-bn');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [graded, setGraded] = useState(false);

  const { translations, loading } = useTranslations();
  const currentData = translations.filter(t => t.mode === mode).map(t => ({
    ar: t.ar_text,
    bn: t.bn_text
  }));
  const currentItem = currentData[currentIndex] || { ar: '', bn: '' };
  const progress = currentData.length > 0 ? ((currentIndex) / currentData.length) * 100 : 0;

  const handleNext = () => {
    if (currentIndex < currentData.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setShowAnswer(false);
      setGraded(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserInput('');
    setShowAnswer(false);
    setScore({ correct: 0, wrong: 0 });
    setGraded(false);
  };

  const handleGrade = (isCorrect: boolean) => {
    setScore(prev => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      wrong: !isCorrect ? prev.wrong + 1 : prev.wrong,
    }));
    setGraded(true);
  };

  return (
    <Layout>
      <div className="bg-background min-h-screen pb-24">
        {/* We use a custom header to match the prompt's request for primary theme */}
        <div className="gradient-primary text-primary-foreground p-6 shadow-md rounded-b-3xl mb-6 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="absolute left-4 top-4 text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-2xl font-bold text-center mb-2">অনুবাদ প্র্যাকটিস</h1>
          <div className="flex justify-between items-center bg-white/20 rounded-full px-4 py-2 mt-4 text-sm font-medium">
             <div className="flex gap-4">
                <span className="flex items-center gap-1"><Check size={16} className="text-green-300" /> {score.correct}</span>
                <span className="flex items-center gap-1"><X size={16} className="text-red-300" /> {score.wrong}</span>
             </div>
             <span>{currentIndex + 1} / {currentData.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-primary">লোড হচ্ছে...</div>
        ) : (
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <div className="flex justify-center bg-white p-1 rounded-full shadow-sm border border-primary/10">
            <Button
              variant={mode === 'ar-to-bn' ? 'default' : 'ghost'}
              className={`flex-1 rounded-full ${mode === 'ar-to-bn' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
              onClick={() => { setMode('ar-to-bn'); handleRestart(); }}
            >
              আরবি → বাংলা
            </Button>
            <Button
              variant={mode === 'bn-to-ar' ? 'default' : 'ghost'}
              className={`flex-1 rounded-full ${mode === 'bn-to-ar' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
              onClick={() => { setMode('bn-to-ar'); handleRestart(); }}
            >
              বাংলা → আরবি
            </Button>
          </div>

          <Progress value={progress} className="h-2 bg-primary/20" indicatorClassName="bg-primary" />

          {currentIndex < currentData.length ? (
            <Card className="p-6 shadow-lg border-none bg-white/80 backdrop-blur-sm rounded-2xl">
              <div className="min-h-[120px] flex items-center justify-center mb-6 bg-primary/5 rounded-xl p-4 border border-primary/10">
                {mode === 'ar-to-bn' ? (
                  <p className="text-3xl font-arabic text-right leading-loose" dir="rtl">
                    {currentItem.ar}
                  </p>
                ) : (
                  <p className="text-xl text-center font-medium">
                    {currentItem.bn}
                  </p>
                )}
              </div>

              {!showAnswer ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="আপনার অনুবাদ এখানে লিখুন..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="min-h-[100px] resize-none text-lg p-4 border-primary/20 focus-visible:ring-primary rounded-xl"
                    dir={mode === 'bn-to-ar' ? 'rtl' : 'ltr'}
                  />
                  <Button 
                    className="w-full h-12 text-lg rounded-xl gradient-primary text-primary-foreground hover:opacity-90" 
                    onClick={() => setShowAnswer(true)}
                    disabled={!userInput.trim()}
                  >
                    উত্তর দেখো
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <p className="text-sm text-green-700 font-semibold mb-2">সঠিক উত্তর:</p>
                    {mode === 'ar-to-bn' ? (
                      <p className="text-xl font-medium text-gray-800">{currentItem.bn}</p>
                    ) : (
                      <p className="text-2xl font-arabic text-right leading-loose text-gray-800" dir="rtl">{currentItem.ar}</p>
                    )}
                  </div>
                  
                  {!graded ? (
                    <div className="space-y-3">
                      <p className="text-center font-medium text-gray-600">আপনার উত্তর কি সঠিক হয়েছে?</p>
                      <div className="flex gap-4">
                        <Button 
                          variant="outline" 
                          className="flex-1 h-14 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-lg"
                          onClick={() => handleGrade(false)}
                        >
                          <X className="mr-2" /> ভুল
                        </Button>
                        <Button 
                          className="flex-1 h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl text-lg"
                          onClick={() => handleGrade(true)}
                        >
                          <Check className="mr-2" /> সঠিক
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full h-14 text-lg rounded-xl gradient-primary text-primary-foreground hover:opacity-90"
                      onClick={handleNext}
                    >
                      পরবর্তী <ArrowRight className="ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center space-y-6 shadow-lg border-none bg-white/80 backdrop-blur-sm rounded-2xl animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">অভিনন্দন!</h2>
              <p className="text-gray-600">আপনি এই পর্বটি সফলভাবে শেষ করেছেন।</p>
              
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="text-3xl font-bold text-green-600">{score.correct}</div>
                  <div className="text-sm font-medium text-green-800">সঠিক</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="text-3xl font-bold text-red-600">{score.wrong}</div>
                  <div className="text-sm font-medium text-red-800">ভুল</div>
                </div>
              </div>

              <Button 
                onClick={handleRestart}
                className="w-full h-14 text-lg rounded-xl gradient-primary text-primary-foreground hover:opacity-90"
              >
                <RotateCcw className="mr-2" /> পুনরায় শুরু করুন
              </Button>
            </Card>
          )}
        </div>
        )}
      </div>
    </Layout>
  );
}
