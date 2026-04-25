import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Sparkles, Languages, PenLine, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ToolsPage() {
  const navigate = useNavigate();

  const tools = [
    {
      title: 'তারকিব বিশ্লেষণ',
      description: 'আরবি বাক্যের গঠন ও ব্যাকরণগত বিশ্লেষণ এআই-এর মাধ্যমে শিখুন।',
      icon: Sparkles,
      path: '/tools/tarkib',
      color: 'bg-primary/10 text-primary',
      borderColor: 'border-primary/20 hover:border-primary/40'
    },
    {
      title: 'অনুবাদ প্র্যাকটিস',
      description: 'আরবি থেকে বাংলা এবং বাংলা থেকে আরবি অনুবাদের চর্চা করুন।',
      icon: Languages,
      path: '/translation',
      color: 'bg-primary/10 text-primary',
      borderColor: 'border-primary/20 hover:border-primary/40'
    },
    {
      title: 'তাশকিল ও সংশোধন',
      description: 'ভুল বাক্য সংশোধন এবং হরকত ছাড়া বাক্যে হরকত দেওয়ার অনুশীলন।',
      icon: PenLine,
      path: '/tashkil',
      color: 'bg-primary/10 text-primary',
      borderColor: 'border-primary/20 hover:border-primary/40'
    },
    {
      title: 'ইনশা ও রচনা',
      description: 'আরবি দরখাস্ত, চিঠি এবং বিভিন্ন বিষয়ের ওপর আরবি রচনা।',
      icon: FileText,
      path: '/insha',
      color: 'bg-primary/10 text-primary',
      borderColor: 'border-primary/20 hover:border-primary/40'
    }
  ];

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 animate-in-fade pb-24">
        <div className="flex flex-col items-center justify-center text-center mb-10 mt-4 space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 text-primary">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">বিশেষ অনুশীলন</h1>
          <p className="text-muted-foreground font-medium max-w-md">
            আপনার আরবি ব্যাকরণ দক্ষতা বাড়াতে আমাদের এআই টুলস এবং অনুশীলনসমূহ ব্যবহার করুন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {tools.map((tool, index) => (
            <Card 
              key={index}
              className={`p-6 cursor-pointer transition-all duration-300 border-2 ${tool.borderColor} shadow-sm hover:shadow-md rounded-[2rem] bg-white group`}
              onClick={() => navigate(tool.path)}
            >
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-[1.5rem] ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className="w-8 h-8" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
