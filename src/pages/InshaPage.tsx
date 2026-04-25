import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

const applicationText = {
  ar: `إِلَى مُدِيرِ الْمَدْرَسَةِ
الْمَوْضُوعُ: طَلَبُ الْإِجَازَةِ لِثَلَاثَةِ أَيَّامٍ
أَيُّهَا الْمُدِيرُ الْمُحْتَرَمُ،
أَرْفَعُ إِلَى حَضْرَتِكُمُ الْكَرِيمَةِ أَنِّي طَالِبٌ فِي الصَّفِّ الْعَاشِرِ.
وَالسَّبَبُ أَنَّنِي مَرِيضٌ وَلَا أَسْتَطِيعُ حُضُورَ الدِّرَاسَةِ.
فَأَرْجُو مِنْكُمْ مَنْحِي إِجَازَةً لِمُدَّةِ ثَلَاثَةِ أَيَّامٍ.
وَلَكُمْ جَزِيلُ الشُّكْرِ.
الْمُخْلِصُ، ....................`,
  bn: `বরাবর, প্রধান শিক্ষক মহোদয়
বিষয়: তিন দিনের ছুটির আবেদন
জনাব,
সবিনয় নিবেদন এই যে, আমি দশম শ্রেণির একজন ছাত্র।
কারণ হলো আমি অসুস্থ এবং মাদ্রাসায় উপস্থিত হতে পারছি না।
তাই অনুগ্রহ করে আমাকে তিন দিনের ছুটি দানে বাধিত করবেন।
আপনাকে অনেক ধন্যবাদ।
বিনীত নিবেদক, ....................`,
  keyPhrases: [
    { ar: "طَلَبُ الْإِجَازَةِ", bn: "ছুটির আবেদন" },
    { ar: "أَرْفَعُ إِلَى حَضْرَتِكُمُ", bn: "আপনার সমীপে পেশ করছি" },
    { ar: "لَا أَسْتَطِيعُ حُضُورَ الدِّرَاسَةِ", bn: "ক্লাসে উপস্থিত হতে পারছি না" },
    { ar: "وَلَكُمْ جَزِيلُ الشُّكْرِ", bn: "আপনাকে অনেক ধন্যবাদ" }
  ]
};

const letterText = {
  ar: `أَخِي الْكَرِيمُ،
السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ،
أَرْجُو أَنْ تَكُونَ بِخَيْرٍ. أَنَا بِخَيْرٍ وَالْحَمْدُ للهِ.
أَكْتُبُ إِلَيْكَ هَذِهِ الرِّسَالَةَ لِأُخْبِرَكَ أَنَّنِي بِحَاجَةٍ إِلَى شِرَاءِ بَعْضِ الْكُتُبِ الدِّرَاسِيَّةِ.
وَلِذَلِكَ، أَرْجُو مِنْكَ أَنْ تُرْسِلَ لِي أَلْفَ (1000) تَكَا.
مَعَ خَالِصِ تَحِيَّاتِي وَسَلَامِي.
أَخُوكَ الْمُحِبُّ، ....................`,
  bn: `প্রিয় ভাই,
আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ।
আশা করি আপনি ভালো আছেন। আলহামদুলিল্লাহ, আমিও ভালো আছি।
আমি এই চিঠিটি আপনাকে জানাচ্ছি যে আমার কিছু পাঠ্যবই কেনার প্রয়োজন।
সেজন্য, অনুগ্রহ করে আমাকে ১০০০ টাকা পাঠাবেন।
আমার আন্তরিক সালাম ও শুভেচ্ছা রইল।
আপনার স্নেহের ভাই, ....................`,
  keyPhrases: [
    { ar: "أَرْجُو أَنْ تَكُونَ بِخَيْرٍ", bn: "আশা করি আপনি ভালো আছেন" },
    { ar: "أَكْتُبُ إِلَيْكَ هَذِهِ الرِّسَالَةَ", bn: "আমি আপনাকে এই চিঠি লিখছি" },
    { ar: "بِحَاجَةٍ إِلَى شِرَاءِ الْكُتُبِ", bn: "বই কেনার প্রয়োজন" },
    { ar: "أَرْجُو مِنْكَ أَنْ تُرْسِلَ", bn: "অনুগ্রহ করে পাঠাবেন" }
  ]
};

const essays = [
  {
    id: "time",
    title: "সময়ের মূল্য",
    ar: `الْوَقْتُ مِنْ أَثْمَنِ الْأَشْيَاءِ فِي حَيَاةِ الْإِنْسَانِ. هُوَ كَالسَّيْفِ إِنْ لَمْ تَقْطَعْهُ قَطَعَكَ.
يَجِبُ عَلَيْنَا أَنْ نَسْتَغِلَّ أَوْقَاتَنَا فِي الْأَعْمَالِ الصَّالِحَةِ وَالْمُفِيدَةِ. فَالْوَقْتُ الَّذِي يَمْضِي لَا يَعُودُ أَبَدًا.
وَقَدْ حَثَّنَا الْإِسْلَامُ عَلَى أَهَمِّيَّةِ الْوَقْتِ، فَالْمُسْلِمُ الْعَاقِلُ هُوَ مَنْ يُحَافِظُ عَلَى وَقْتِهِ.`,
    keySentences: [
      { ar: "الْوَقْتُ كَالسَّيْفِ إِنْ لَمْ تَقْطَعْهُ قَطَعَكَ", bn: "সময় তরবারির মতো, তুমি তাকে না কাটলে সে তোমাকে কাটবে" },
      { ar: "فَالْوَقْتُ الَّذِي يَمْضِي لَا يَعُودُ أَبَدًا", bn: "যে সময় চলে যায় তা আর ফিরে আসে না" }
    ]
  },
  {
    id: "ilm",
    title: "ইলমের ফযিলত",
    ar: `الْعِلْمُ نُورٌ وَالْجَهْلُ ظُلْمَةٌ. طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ وَمُسْلِمَةٍ.
بِالْعِلْمِ يَرْتَقِي الْإِنْسَانُ وَتُبْنَى الْأُمَمُ. إِنَّ الْعُلَمَاءَ وَرَثَةُ الْأَنْبِيَاءِ، وَلَمْ يُوَرِّثُوا دِينَارًا وَلَا دِرْهَمًا إِنَّمَا وَرَّثُوا الْعِلْمَ.
لِذَلِكَ يَجِبُ عَلَى كُلِّ طَالِبٍ أَنْ يَجْتَهِدَ فِي طَلَبِ الْعِلْمِ.`,
    keySentences: [
      { ar: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ", bn: "জ্ঞান অর্জন করা প্রত্যেক মুসলমানের উপর ফরজ" },
      { ar: "إِنَّ الْعُلَمَاءَ وَرَثَةُ الْأَنْبِيَاءِ", bn: "নিশ্চয়ই আলেমগণ নবীদের উত্তরসূরি" }
    ]
  },
  {
    id: "madrasa",
    title: "মাদ্রাসা",
    ar: `مَدْرَسَتِي هِيَ بَيْتِي الثَّانِي. فِيهَا أَتَعَلَّمُ الْقُرْآنَ وَالْحَدِيثَ وَالْعُلُومَ النَّافِعَةَ.
أُحِبُّ أَسَاتِذَتِي لِأَنَّهُمْ يُعَلِّمُونَنَا الْأَخْلَاقَ الْحَسَنَةَ. بِنَايَةُ مَدْرَسَتِي جَمِيلَةٌ وَنَظِيفَةٌ، وَفِيهَا مَكْتَبَةٌ كَبِيرَةٌ.
أَنَا أَفْتَخِرُ بِأَنَّنِي طَالِبٌ فِي هَذِهِ الْمَدْرَسَةِ الْعَرِيقَةِ.`,
    keySentences: [
      { ar: "مَدْرَسَتِي هِيَ بَيْتِي الثَّانِي", bn: "আমার মাদ্রাসা আমার দ্বিতীয় বাড়ি" },
      { ar: "أَنَا أَفْتَخِرُ بِأَنَّنِي طَالِبٌ فِي هَذِهِ الْمَدْرَسَةِ", bn: "আমি এই মাদ্রাসার ছাত্র হওয়ায় গর্বিত" }
    ]
  }
];

function TextCard({ 
  arText, 
  bnText, 
  keyPhrases 
}: { 
  arText: string; 
  bnText?: string; 
  keyPhrases: { ar: string; bn: string }[];
}) {
  const [showMeaning, setShowMeaning] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(arText);
    setCopied(true);
    toast({
      title: "কপি করা হয়েছে",
      description: "আরবি টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে।",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden shadow-lg border-none bg-white/80 backdrop-blur-sm rounded-2xl relative">
        <div className="flex justify-between items-center bg-emerald-100 p-3 border-b border-emerald-200">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800"
          >
            {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
            {copied ? 'কপি হয়েছে' : 'কপি করুন'}
          </Button>
          
          {bnText && (
            <Button 
              size="sm"
              onClick={() => setShowMeaning(!showMeaning)}
              className="bg-white text-emerald-800 hover:text-emerald-900 border border-emerald-300 hover:bg-emerald-50 shadow-sm"
            >
              {showMeaning ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
              {showMeaning ? 'অর্থ লুকান' : 'অর্থ দেখুন'}
            </Button>
          )}
        </div>
        
        <div className="p-6">
          <div className="font-arabic text-2xl leading-loose text-emerald-950 whitespace-pre-line text-right" dir="rtl">
            {arText}
          </div>
          
          {showMeaning && bnText && (
            <div className="mt-6 pt-6 border-t border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <p className="text-sm font-semibold text-emerald-600 mb-2">অনুবাদ:</p>
              <div className="text-lg text-gray-700 whitespace-pre-line font-medium leading-relaxed">
                {bnText}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="bg-emerald-50/80 rounded-2xl p-5 border border-emerald-100">
        <h3 className="font-bold text-emerald-800 mb-4 flex items-center">
          <div className="w-2 h-6 bg-emerald-500 rounded-full mr-2"></div>
          মুখস্থ করার বাক্য
        </h3>
        <div className="space-y-3">
          {keyPhrases.map((phrase, idx) => (
            <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <p className="text-gray-600 font-medium md:w-1/2">{phrase.bn}</p>
              <p className="font-arabic text-xl text-emerald-800 md:w-1/2 text-right" dir="rtl">{phrase.ar}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InshaPage() {
  const [activeEssay, setActiveEssay] = useState(essays[0]);
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="bg-emerald-50 min-h-screen pb-24">
        <div className="bg-emerald-600 text-white p-6 shadow-md rounded-b-3xl mb-6 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="absolute left-4 top-4 text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-2xl font-bold text-center mb-2">ইনশা ও রচনা</h1>
          <p className="text-center text-emerald-100 text-sm">দরখাস্ত, চিঠি এবং আরবি রচনা শিখুন</p>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <Tabs defaultValue="application" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-emerald-200/50 p-1 rounded-xl h-14 mb-6">
              <TabsTrigger 
                value="application" 
                className="rounded-lg text-emerald-900 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-sm md:text-base font-medium"
              >
                দরখাস্ত
              </TabsTrigger>
              <TabsTrigger 
                value="letter"
                className="rounded-lg text-emerald-900 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-sm md:text-base font-medium"
              >
                চিঠি
              </TabsTrigger>
              <TabsTrigger 
                value="essay"
                className="rounded-lg text-emerald-900 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-sm md:text-base font-medium"
              >
                রচনা
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="application" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <TextCard 
                arText={applicationText.ar} 
                bnText={applicationText.bn} 
                keyPhrases={applicationText.keyPhrases} 
              />
            </TabsContent>
            
            <TabsContent value="letter" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <TextCard 
                arText={letterText.ar} 
                bnText={letterText.bn} 
                keyPhrases={letterText.keyPhrases} 
              />
            </TabsContent>
            
            <TabsContent value="essay" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {essays.map(essay => (
                  <Button
                    key={essay.id}
                    variant={activeEssay.id === essay.id ? "default" : "outline"}
                    className={`whitespace-nowrap rounded-full ${
                      activeEssay.id === essay.id 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50'
                    }`}
                    onClick={() => setActiveEssay(essay)}
                  >
                    {essay.title}
                  </Button>
                ))}
              </div>
              <TextCard 
                arText={activeEssay.ar} 
                keyPhrases={activeEssay.keySentences} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
