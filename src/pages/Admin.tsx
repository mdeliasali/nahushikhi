import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useModules, useChapters, useLessons, useQuestions,
  useModuleMutations, useChapterMutations, useLessonMutations, useQuestionMutations,
} from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, BookOpen, Layers, FileText, HelpCircle, Settings, Languages, CheckSquare, Edit3 } from 'lucide-react';
import AdminModuleList from '@/components/admin/AdminModuleList';
import AdminChapterList from '@/components/admin/AdminChapterList';
import AdminLessonList from '@/components/admin/AdminLessonList';
import AdminLessonEditor from '@/components/admin/AdminLessonEditor';
import AdminQuestionList from '@/components/admin/AdminQuestionList';
import AdminAISettings from '@/components/admin/AdminAISettings';
import AdminBoardQuestions from '@/components/admin/AdminBoardQuestions';
import AdminRevisionCards from '@/components/admin/AdminRevisionCards';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminTranslations from '@/components/admin/AdminTranslations';
import AdminTashkils from '@/components/admin/AdminTashkils';
import AdminInshas from '@/components/admin/AdminInshas';

type AdminView = 'dashboard' | 'modules' | 'chapters' | 'lessons' | 'lesson-editor' | 'questions' | 'ai-settings' | 'board-questions' | 'revision-cards' | 'analytics' | 'translations' | 'tashkils' | 'inshas';

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [view, setView] = useState<AdminView>('dashboard');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAdmin, navigate]);

  if (loading) return <div className="flex-1 h-full min-h-full flex items-center justify-center">লোড হচ্ছে...</div>;
  if (!isAdmin) return null;

  const goBack = () => {
    switch (view) {
      case 'chapters': setView('modules'); break;
      case 'lessons': setView('chapters'); break;
      case 'lesson-editor': setView('lessons'); break;
      case 'questions': setView('chapters'); break;
      case 'modules':
      case 'ai-settings':
      case 'board-questions':
      case 'revision-cards':
      case 'analytics':
      case 'translations':
      case 'tashkils':
      case 'inshas':
        setView('dashboard'); break;
      default: navigate('/'); break;
    }
  };

  const breadcrumb = () => {
    const parts = ['অ্যাডমিন'];
    if (view !== 'dashboard') {
      if (view === 'modules') parts.push('পাঠক্রম');
      if (view === 'chapters') parts.push('খণ্ড');
      if (view === 'lessons' || view === 'lesson-editor') parts.push('অধ্যায়');
      if (view === 'lesson-editor') parts.push('পাঠ সম্পাদনা');
      if (view === 'questions') parts.push('প্রশ্ন');
      if (view === 'ai-settings') parts.push('AI কনফিগারেশন');
      if (view === 'board-questions') parts.push('বোর্ড প্রশ্ন');
      if (view === 'revision-cards') parts.push('রিভিশন কার্ড');
      if (view === 'analytics') parts.push('পরিসংখ্যান');
      if (view === 'translations') parts.push('অনুবাদ অনুশীলন');
      if (view === 'tashkils') parts.push('তাশকিল ও সংশোধন');
      if (view === 'inshas') parts.push('ইনশা ও রচনা');
    }
    return parts.join(' › ');
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden bg-background">
      <header className="border-b bg-card shadow-card sticky top-0 z-50">
        <div className="container mx-auto max-w-5xl flex items-center gap-4 h-14 px-4 sm:px-6">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold">{breadcrumb()}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <BookOpen className="h-4 w-4 mr-1" />
            হোম
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl">
        {view === 'dashboard' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            <div onClick={() => setView('modules')} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-50 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-50 flex items-center justify-center mb-3 sm:mb-5">
                <Layers className="h-5 w-5 sm:h-7 sm:w-7 text-indigo-600" />
              </div>
              <h3 className="font-bold text-sm sm:text-lg mb-1 text-slate-800">পাঠক্রম ও কন্টেন্ট</h3>
              <p className="text-slate-500 text-[10px] sm:text-sm font-medium">অধ্যায় ও কুইজ পরিচালনা</p>
            </div>
            
            <div onClick={() => setView('board-questions')} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-50 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-50 flex items-center justify-center mb-3 sm:mb-5">
                <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-sm sm:text-lg mb-1 text-slate-800">বোর্ড প্রশ্ন</h3>
              <p className="text-slate-500 text-[10px] sm:text-sm font-medium">বিগত সালের প্রশ্ন ম্যানেজমেন্ট</p>
            </div>
            
            <div onClick={() => setView('revision-cards')} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-50 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-50 flex items-center justify-center mb-3 sm:mb-5">
                <HelpCircle className="h-5 w-5 sm:h-7 sm:w-7 text-amber-600" />
              </div>
              <h3 className="font-bold text-sm sm:text-lg mb-1 text-slate-800">রিভিশন কার্ড</h3>
              <p className="text-slate-500 text-[10px] sm:text-sm font-medium">নিয়ম ও সংজ্ঞা</p>
            </div>

            <div onClick={() => setView('analytics')} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-50 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-cyan-50 flex items-center justify-center mb-3 sm:mb-5">
                <FileText className="h-5 w-5 sm:h-7 sm:w-7 text-cyan-600" />
              </div>
              <h3 className="font-bold text-sm sm:text-lg mb-1 text-slate-800">ইউজার পরিসংখ্যান</h3>
              <p className="text-slate-500 text-[10px] sm:text-sm font-medium">মক টেস্ট ও ইউজার ডাটা</p>
            </div>

            <div onClick={() => setView('translations')} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-50 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-50 flex items-center justify-center mb-3 sm:mb-5">
                <Languages className="h-5 w-5 sm:h-7 sm:w-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-sm sm:text-lg mb-1 text-slate-800">অনুবাদ অনুশীলন</h3>
              <p className="text-slate-500 text-[10px] sm:text-sm font-medium">আরবি ও বাংলা অনুবাদ ডাটাবেস</p>
            </div>
            
            <div onClick={() => setView('tashkils')} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-50 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-teal-50 flex items-center justify-center mb-3 sm:mb-5">
                <CheckSquare className="h-5 w-5 sm:h-7 sm:w-7 text-teal-600" />
              </div>
              <h3 className="font-bold text-sm sm:text-lg mb-1 text-slate-800">তাশকিল ও সংশোধন</h3>
              <p className="text-slate-500 text-[10px] sm:text-sm font-medium">হরকত এবং বাক্য সংশোধন</p>
            </div>

            <div onClick={() => setView('inshas')} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-50 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-pink-50 flex items-center justify-center mb-3 sm:mb-5">
                <Edit3 className="h-5 w-5 sm:h-7 sm:w-7 text-pink-600" />
              </div>
              <h3 className="font-bold text-sm sm:text-lg mb-1 text-slate-800">ইনশা ও রচনা</h3>
              <p className="text-slate-500 text-[10px] sm:text-sm font-medium">দরখাস্ত, চিঠি এবং রচনা</p>
            </div>

            <div onClick={() => setView('ai-settings')} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-50 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center mb-3 sm:mb-5">
                <Settings className="h-5 w-5 sm:h-7 sm:w-7 text-slate-600" />
              </div>
              <h3 className="font-bold text-sm sm:text-lg mb-1 text-slate-800">AI ও গ্লোবাল সেটিংস</h3>
              <p className="text-slate-500 text-[10px] sm:text-sm font-medium">মডেল API এবং টুলস</p>
            </div>
          </div>
        )}

        {view === 'modules' && (
          <AdminModuleList
            onSelectModule={(id) => { setSelectedModuleId(id); setView('chapters'); }}
          />
        )}
        {view === 'chapters' && (
          <AdminChapterList
            moduleId={selectedModuleId}
            onSelectChapter={(id) => { setSelectedChapterId(id); setView('lessons'); }}
            onManageQuestions={(id) => { setSelectedChapterId(id); setView('questions'); }}
          />
        )}
        {view === 'lessons' && (
          <AdminLessonList
            chapterId={selectedChapterId}
            onEditLesson={(id) => { setSelectedLessonId(id); setView('lesson-editor'); }}
          />
        )}
        {view === 'lesson-editor' && (
          <AdminLessonEditor
            lessonId={selectedLessonId}
            onBack={() => setView('lessons')}
          />
        )}
        {view === 'questions' && (
          <AdminQuestionList chapterId={selectedChapterId} />
        )}
        {view === 'ai-settings' && (
          <AdminAISettings />
        )}
        {view === 'board-questions' && (
          <AdminBoardQuestions />
        )}
        {view === 'revision-cards' && (
          <AdminRevisionCards />
        )}
        {view === 'analytics' && (
          <AdminAnalytics />
        )}
        {view === 'translations' && (
          <AdminTranslations />
        )}
        {view === 'tashkils' && (
          <AdminTashkils />
        )}
        {view === 'inshas' && (
          <AdminInshas />
        )}
      </main>
    </div>
  );
}
