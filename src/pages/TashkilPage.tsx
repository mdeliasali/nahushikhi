import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, ArrowRight, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const correctionData = [
  { wrong: "كَانَ عُثْمَانُ (رض) غَنِي", correct: "كَانَ عُثْمَانُ (رض) غَنِيًّا", rule: "كان এর খবর মানসুব হয়" },
  { wrong: "ذَهَبَ خَالِدٌ إِلَى الْمَدْرَسَة", correct: "ذَهَبَ خَالِدٌ إِلَى الْمَدْرَسَةِ", rule: "হরফে জার-এর পর মাজরুর" },
  { wrong: "إِنَّ اللهَ خَالِقًا", correct: "إِنَّ اللهَ خَالِقٌ", rule: "إن এর খবর মারফু" },
  { wrong: "هَذَا هِيَ أَخُوكَ", correct: "هَذَا هُوَ أَخُوكَ", rule: "মুযাক্কারের দামির هو" },
  { wrong: "قَرَأْتُ عِشْرُونَ كِتَابًا", correct: "قَرَأْتُ عِشْرِينَ كِتَابًا", rule: "মানসুব অবস্থায় عشرين" },
];

const tashkilData = [
  { 
    noHaraka: "الظلم مرتعه وخيم", 
    withHaraka: "اَلظُّلْمُ مَرْتَعُهُ وَخِيمٌ", 
    meaning: "অত্যাচারের পরিণতি ভয়াবহ",
    iraab: [
      { word: "اَلظُّلْمُ", role: "মুবতাদা", haraka: "রফা (যম্মা)" },
      { word: "مَرْتَعُهُ", role: "মুবতাদা সানি", haraka: "রফা (যম্মা)" },
      { word: "وَخِيمٌ", role: "খবর", haraka: "রফা (যম্মা)" }
    ]
  },
  { 
    noHaraka: "المؤمن بشره في وجهه", 
    withHaraka: "اَلْمُؤْمِنُ بِشْرُهُ فِي وَجْهِهِ", 
    meaning: "মুমিনের হাসি তার মুখে",
    iraab: [
      { word: "اَلْمُؤْمِنُ", role: "মুবতাদা", haraka: "রফা (যম্মা)" },
      { word: "بِشْرُهُ", role: "মুবতাদা সানি", haraka: "রফা (যম্মা)" },
      { word: "فِي وَجْهِهِ", role: "যার মাজরুর (খবর)", haraka: "জর (কাসরা)" }
    ]
  },
  { 
    noHaraka: "قراءة القران تزيد الايمان", 
    withHaraka: "قِرَاءَةُ الْقُرْآنِ تَزِيدُ الْإِيمَانَ", 
    meaning: "কুরআন তিলাওয়াত ঈমান বৃদ্ধি করে",
    iraab: [
      { word: "قِرَاءَةُ", role: "মুযাফ (মুবতাদা)", haraka: "রফা (যম্মা)" },
      { word: "الْقُرْآنِ", role: "মুযাফ ইলাইহি", haraka: "জর (কাসরা)" },
      { word: "تَزِيدُ", role: "ফেল", haraka: "রফা (যম্মা)" },
      { word: "الْإِيمَانَ", role: "মাফউল বিহি", haraka: "নসব (ফাতহা)" }
    ]
  },
  { 
    noHaraka: "الطالب يلعب في البيت", 
    withHaraka: "اَلطَّالِبُ يَلْعَبُ فِي الْبَيْتِ", 
    meaning: "ছাত্রটি ঘরে খেলছে",
    iraab: [
      { word: "اَلطَّالِبُ", role: "মুবতাদা", haraka: "রফা (যম্মা)" },
      { word: "يَلْعَبُ", role: "ফেল", haraka: "রফা (যম্মা)" },
      { word: "فِي الْبَيْتِ", role: "যার মাজরুর", haraka: "জর (কাসরা)" }
    ]
  },
  { 
    noHaraka: "الطامع في وثاق الذل", 
    withHaraka: "اَلطَّامِعُ فِي وَثَاقِ الذُّلِّ", 
    meaning: "লোভী ব্যক্তি লাঞ্ছনার শৃঙ্খলে",
    iraab: [
      { word: "اَلطَّامِعُ", role: "মুবতাদা", haraka: "রফা (যম্মা)" },
      { word: "فِي وَثَاقِ", role: "যার মাজরুর", haraka: "জর (কাসরা)" },
      { word: "الذُّلِّ", role: "মুযাফ ইলাইহি", haraka: "জর (কাসরা)" }
    ]
  }
];

function CorrectionTab() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [graded, setGraded] = useState(false);

  const item = correctionData[currentIndex];

  const handleNext = () => {
    if (currentIndex < correctionData.length - 1) {
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
    setGraded(false);
  };

  if (currentIndex >= correctionData.length) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-sm font-medium text-amber-800 bg-amber-100 px-4 py-2 rounded-full mb-4">
        <span>প্রশ্ন {currentIndex + 1} / {correctionData.length}</span>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-inner">
        <p className="text-sm text-red-600 font-semibold mb-2">ভুল বাক্য:</p>
        <p className="text-3xl font-arabic text-red-700 leading-loose" dir="rtl">{item.wrong}</p>
      </div>

      {!showAnswer ? (
        <div className="space-y-4">
          <Textarea
            placeholder="সঠিক বাক্যটি এখানে লিখুন..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[100px] resize-none text-xl p-4 border-amber-200 focus-visible:ring-amber-500 rounded-xl font-arabic"
            dir="rtl"
          />
          <Button 
            className="w-full h-12 text-lg rounded-xl bg-amber-500 hover:bg-amber-600 text-white" 
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
            <p className="text-3xl font-arabic text-right leading-loose text-green-800 mb-4" dir="rtl">{item.correct}</p>
            <div className="bg-white/60 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-amber-800 font-medium"><span className="font-bold">নিয়ম:</span> {item.rule}</p>
            </div>
          </div>
          
          {!graded ? (
            <div className="space-y-3">
              <p className="text-center font-medium text-gray-600">আপনার উত্তর কি সঠিক হয়েছে?</p>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-lg"
                  onClick={() => setGraded(true)}
                >
                  <X className="mr-2" /> ভুল
                </Button>
                <Button 
                  className="flex-1 h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl text-lg"
                  onClick={() => setGraded(true)}
                >
                  <Check className="mr-2" /> সঠিক
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              className="w-full h-14 text-lg rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
              onClick={currentIndex < correctionData.length - 1 ? handleNext : handleRestart}
            >
              {currentIndex < correctionData.length - 1 ? (
                <>পরবর্তী <ArrowRight className="ml-2" /></>
              ) : (
                <>পুনরায় শুরু করুন <RotateCcw className="ml-2" /></>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function HarakatTab() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const item = tashkilData[currentIndex];

  const handleNext = () => {
    if (currentIndex < tashkilData.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setShowAnswer(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserInput('');
    setShowAnswer(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-sm font-medium text-amber-800 bg-amber-100 px-4 py-2 rounded-full mb-4">
        <span>প্রশ্ন {currentIndex + 1} / {tashkilData.length}</span>
      </div>

      <div className="bg-white border border-amber-200 rounded-xl p-6 text-center shadow-sm">
        <p className="text-sm text-gray-500 font-semibold mb-4">নিচের বাক্যে হরকত দিন:</p>
        <p className="text-3xl font-arabic text-gray-800 leading-loose mb-6" dir="rtl">{item.noHaraka}</p>
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 inline-block">
          <p className="text-sm text-amber-800"><span className="font-bold">অর্থ:</span> {item.meaning}</p>
        </div>
      </div>

      {!showAnswer ? (
        <div className="space-y-4">
          <Textarea
            placeholder="আপনার উত্তর এখানে লিখুন..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[100px] resize-none text-xl p-4 border-amber-200 focus-visible:ring-amber-500 rounded-xl font-arabic"
            dir="rtl"
          />
          <Button 
            className="w-full h-12 text-lg rounded-xl bg-amber-500 hover:bg-amber-600 text-white" 
            onClick={() => setShowAnswer(true)}
            disabled={!userInput.trim()}
          >
            উত্তর দেখো
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
            <p className="text-sm text-emerald-700 font-semibold mb-2">সঠিক হরকত:</p>
            <p className="text-4xl font-arabic text-center leading-loose text-emerald-900 mb-4" dir="rtl">{item.withHaraka}</p>
            
            <div className="mt-6">
              <p className="text-sm text-gray-600 font-bold mb-3">তারকিব বিশ্লেষণ:</p>
              <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-sm">
                <table className="w-full text-sm text-right" dir="rtl">
                  <thead className="bg-emerald-100 text-emerald-800">
                    <tr>
                      <th className="px-4 py-2 font-bold">শব্দ</th>
                      <th className="px-4 py-2 font-bold">অবস্থান</th>
                      <th className="px-4 py-2 font-bold">হরকত (ইরাব)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {item.iraab.map((irb, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-4 py-3 font-arabic text-lg">{irb.word}</td>
                        <td className="px-4 py-3 text-gray-700">{irb.role}</td>
                        <td className="px-4 py-3 text-emerald-700 font-medium">{irb.haraka}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full h-14 text-lg rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
            onClick={currentIndex < tashkilData.length - 1 ? handleNext : handleRestart}
          >
            {currentIndex < tashkilData.length - 1 ? (
              <>পরবর্তী <ArrowRight className="ml-2" /></>
            ) : (
              <>পুনরায় শুরু করুন <RotateCcw className="ml-2" /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function TashkilPage() {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="bg-amber-50 min-h-screen pb-24">
        <div className="bg-amber-500 text-white p-6 shadow-md rounded-b-3xl mb-6 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="absolute left-4 top-4 text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-2xl font-bold text-center mb-2">তাশকিল ও সংশোধন</h1>
          <p className="text-center text-amber-100 text-sm">বাক্য সংশোধন এবং হরকত অনুশীলন</p>
        </div>

        <div className="max-w-2xl mx-auto px-4">
          <Tabs defaultValue="correction" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-amber-200/50 p-1 rounded-xl h-14 mb-6">
              <TabsTrigger 
                value="correction" 
                className="rounded-lg text-amber-900 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm text-base font-medium"
              >
                বাক্য সংশোধন
              </TabsTrigger>
              <TabsTrigger 
                value="harakat"
                className="rounded-lg text-amber-900 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm text-base font-medium"
              >
                শকল (হরকত)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="correction" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="p-6 shadow-lg border-none bg-white/80 backdrop-blur-sm rounded-2xl">
                <CorrectionTab />
              </Card>
            </TabsContent>
            
            <TabsContent value="harakat" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="p-6 shadow-lg border-none bg-white/80 backdrop-blur-sm rounded-2xl">
                <HarakatTab />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
