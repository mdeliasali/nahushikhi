import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

import { useEffect } from 'react';
import { useInshas } from '@/hooks/usePracticeTools';

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
        <div className="flex justify-between items-center bg-primary/10 p-3 border-b border-primary/20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="text-primary hover:bg-primary/20 hover:text-primary"
          >
            {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
            {copied ? 'কপি হয়েছে' : 'কপি করুন'}
          </Button>
          
          {bnText && (
            <Button 
              size="sm"
              onClick={() => setShowMeaning(!showMeaning)}
              className="bg-white text-primary hover:text-primary border border-primary/30 hover:bg-primary/5 shadow-sm"
            >
              {showMeaning ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
              {showMeaning ? 'অর্থ লুকান' : 'অর্থ দেখুন'}
            </Button>
          )}
        </div>
        
        <div className="p-6">
          <div className="font-arabic text-2xl leading-loose text-gray-900 whitespace-pre-line text-right" dir="rtl">
            {arText}
          </div>
          
          {showMeaning && bnText && (
            <div className="mt-6 pt-6 border-t border-primary/10 animate-in fade-in slide-in-from-top-4 duration-300">
              <p className="text-sm font-semibold text-primary mb-2">অনুবাদ:</p>
              <div className="text-lg text-gray-700 whitespace-pre-line font-medium leading-relaxed">
                {bnText}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
        <h3 className="font-bold text-primary mb-4 flex items-center">
          <div className="w-2 h-6 bg-primary rounded-full mr-2"></div>
          মুখস্থ করার বাক্য
        </h3>
        <div className="space-y-3">
          {keyPhrases && keyPhrases.length > 0 ? keyPhrases.map((phrase, idx) => (
            <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-primary/10 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <p className="text-gray-600 font-medium md:w-1/2">{phrase.bn}</p>
              <p className="font-arabic text-xl text-primary md:w-1/2 text-right" dir="rtl">{phrase.ar}</p>
            </div>
          )) : <p className="text-sm text-primary">কোনো বাক্য পাওয়া যায়নি</p>}
        </div>
      </div>
    </div>
  );
}

export default function InshaPage() {
  const navigate = useNavigate();
  const { inshas, loading } = useInshas();
  
  const applications = inshas.filter(i => i.type === 'application');
  const letters = inshas.filter(i => i.type === 'letter');
  const essaysData = inshas.filter(i => i.type === 'essay');

  const [activeEssayId, setActiveEssayId] = useState<string | null>(null);

  useEffect(() => {
    if (essaysData.length > 0 && !activeEssayId) {
      setActiveEssayId(essaysData[0].id);
    }
  }, [essaysData, activeEssayId]);

  const application = applications[0] || { title: 'কোনো ডাটা নেই', ar_text: '', bn_text: '', key_phrases_json: [] };
  const letter = letters[0] || { title: 'কোনো ডাটা নেই', ar_text: '', bn_text: '', key_phrases_json: [] };
  const activeEssay = essaysData.find(e => e.id === activeEssayId) || essaysData[0] || { title: 'কোনো ডাটা নেই', ar_text: '', key_phrases_json: [] };

  return (
    <Layout>
      <div className="bg-background min-h-screen pb-24">
        <div className="gradient-primary text-primary-foreground p-6 shadow-md rounded-b-3xl mb-6 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="absolute left-4 top-4 text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-2xl font-bold text-center mb-2">ইনশা ও রচনা</h1>
          <p className="text-center text-primary-foreground/80 text-sm">দরখাস্ত, চিঠি এবং আরবি রচনা শিখুন</p>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <Tabs defaultValue="application" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-primary/10 p-1 rounded-xl h-14 mb-6">
              <TabsTrigger 
                value="application" 
                className="rounded-lg text-primary data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm md:text-base font-medium"
              >
                দরখাস্ত
              </TabsTrigger>
              <TabsTrigger 
                value="letter"
                className="rounded-lg text-primary data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm md:text-base font-medium"
              >
                চিঠি
              </TabsTrigger>
              <TabsTrigger 
                value="essay"
                className="rounded-lg text-primary data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm md:text-base font-medium"
              >
                রচনা
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="application" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              {loading ? <div className="text-center py-10 text-primary">লোড হচ্ছে...</div> : (
                <TextCard 
                  arText={application.ar_text || ''} 
                  bnText={application.bn_text || ''} 
                  keyPhrases={application.key_phrases_json || []} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="letter" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              {loading ? <div className="text-center py-10 text-primary">লোড হচ্ছে...</div> : (
                <TextCard 
                  arText={letter.ar_text || ''} 
                  bnText={letter.bn_text || ''} 
                  keyPhrases={letter.key_phrases_json || []} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="essay" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              {loading ? <div className="text-center py-10 text-primary">লোড হচ্ছে...</div> : (
                <>
                  <div className="mb-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {essaysData.map(essay => (
                      <Button
                        key={essay.id}
                        variant={activeEssay.id === essay.id ? "default" : "outline"}
                        className={`whitespace-nowrap rounded-full ${
                          activeEssay.id === essay.id 
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                            : 'border-primary/20 text-primary bg-white hover:bg-primary/5'
                        }`}
                        onClick={() => setActiveEssayId(essay.id)}
                      >
                        {essay.title}
                      </Button>
                    ))}
                  </div>
                  <TextCard 
                    arText={activeEssay.ar_text || ''} 
                    keyPhrases={activeEssay.key_phrases_json || []} 
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
