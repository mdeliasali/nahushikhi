import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useModules, useChapters, useLessons, useQuestions,
  useModuleMutations, useChapterMutations, useLessonMutations, useQuestionMutations,
} from '@/hooks/useCurriculum';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, BookOpen, Layers, FileText, HelpCircle } from 'lucide-react';
import AdminModuleList from '@/components/admin/AdminModuleList';
import AdminChapterList from '@/components/admin/AdminChapterList';
import AdminLessonList from '@/components/admin/AdminLessonList';
import AdminLessonEditor from '@/components/admin/AdminLessonEditor';
import AdminQuestionList from '@/components/admin/AdminQuestionList';

type AdminView = 'modules' | 'chapters' | 'lessons' | 'lesson-editor' | 'questions';

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [view, setView] = useState<AdminView>('modules');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  if (loading) return <div className="min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>;
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const goBack = () => {
    switch (view) {
      case 'chapters': setView('modules'); break;
      case 'lessons': setView('chapters'); break;
      case 'lesson-editor': setView('lessons'); break;
      case 'questions': setView('chapters'); break;
      default: navigate('/'); break;
    }
  };

  const breadcrumb = () => {
    const parts = ['অ্যাডমিন'];
    if (view !== 'modules') parts.push('খণ্ড');
    if (view === 'lessons' || view === 'lesson-editor') parts.push('অধ্যায়');
    if (view === 'lesson-editor') parts.push('পাঠ সম্পাদনা');
    if (view === 'questions') parts.push('প্রশ্ন');
    return parts.join(' › ');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-14 px-4">
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

      <main className="container px-4 py-6 max-w-4xl">
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
      </main>
    </div>
  );
}
