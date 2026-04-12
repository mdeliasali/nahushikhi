import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useModules, useChapters, useLessons, useQuestions,
  useModuleMutations, useChapterMutations, useLessonMutations, useQuestionMutations,
} from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, BookOpen, Layers, FileText, HelpCircle, Settings } from 'lucide-react';
import AdminModuleList from '@/components/admin/AdminModuleList';
import AdminChapterList from '@/components/admin/AdminChapterList';
import AdminLessonList from '@/components/admin/AdminLessonList';
import AdminLessonEditor from '@/components/admin/AdminLessonEditor';
import AdminQuestionList from '@/components/admin/AdminQuestionList';
import AdminAISettings from '@/components/admin/AdminAISettings';
import AdminBoardQuestions from '@/components/admin/AdminBoardQuestions';
import AdminRevisionCards from '@/components/admin/AdminRevisionCards';
import AdminAnalytics from '@/components/admin/AdminAnalytics';

type AdminView = 'dashboard' | 'modules' | 'chapters' | 'lessons' | 'lesson-editor' | 'questions' | 'ai-settings' | 'board-questions' | 'revision-cards' | 'analytics';

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div onClick={() => setView('modules')} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <Layers className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="font-bold text-lg mb-1">পাঠক্রম ও কন্টেন্ট</h3>
              <p className="text-slate-500 text-sm">অধ্যায়, পাঠ ও কুইজ পরিচালনা করুন</p>
            </div>
            
            <div onClick={() => setView('board-questions')} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <FileText className="h-8 w-8 text-amber-600 mb-4" />
              <h3 className="font-bold text-lg mb-1">বোর্ড প্রশ্ন ব্যাংক</h3>
              <p className="text-slate-500 text-sm">বিগত বছরের প্রশ্ন ম্যানেজমেন্ট</p>
            </div>
            
            <div onClick={() => setView('revision-cards')} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <HelpCircle className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="font-bold text-lg mb-1">রিভিশন কার্ড</h3>
              <p className="text-slate-500 text-sm">ইন্টারেক্টিভ ফ্ল্যাশকার্ড তৈরি করুন</p>
            </div>

            <div onClick={() => setView('analytics')} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <BookOpen className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-1">ইউজার পরিসংখ্যান</h3>
              <p className="text-slate-500 text-sm">মক টেস্ট ও ইউজার ডাটা ড্যাশবোর্ড</p>
            </div>

            <div onClick={() => setView('ai-settings')} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <Settings className="h-8 w-8 text-slate-600 mb-4" />
              <h3 className="font-bold text-lg mb-1">AI ও গ্লোবাল সেটিংস</h3>
              <p className="text-slate-500 text-sm">মডেল API এবং টুলস কনফিগারেশন</p>
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
      </main>
    </div>
  );
}
