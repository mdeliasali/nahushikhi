import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Lock, CheckCircle2, BookOpen, FileText, HelpCircle, RotateCcw, Wrench } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Module = Database['public']['Tables']['modules']['Row'];
type Chapter = Database['public']['Tables']['chapters']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];

interface Props {
  modules: Module[];
  chapters: Chapter[];
  lessons: Lesson[];
  completedLessonIds: Set<string>;
}

const lessonTypeIcon: Record<string, React.ReactNode> = {
  lesson: <FileText className="h-4 w-4" />,
  practice: <BookOpen className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
  review: <RotateCcw className="h-4 w-4" />,
  tool: <Wrench className="h-4 w-4" />,
};

const lessonTypeLabel: Record<string, string> = {
  lesson: 'পাঠ',
  practice: 'অনুশীলন',
  quiz: 'কুইজ',
  review: 'রিভিশন',
  tool: 'টুল',
};

export default function CurriculumTree({ modules, chapters, lessons, completedLessonIds }: Props) {
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Check if a lesson is unlocked (all previous lessons completed)
  const isLessonUnlocked = (lesson: Lesson, chapterLessons: Lesson[]) => {
    const idx = chapterLessons.findIndex(l => l.id === lesson.id);
    if (idx === 0) return true;
    for (let i = 0; i < idx; i++) {
      if (!completedLessonIds.has(chapterLessons[i].id)) return false;
    }
    return true;
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.lesson_type === 'quiz') {
      navigate(`/quiz/${lesson.chapter_id}`);
    } else if (lesson.lesson_type === 'practice') {
      navigate(`/practice/${lesson.chapter_id}`);
    } else {
      navigate(`/lesson/${lesson.id}`);
    }
  };

  return (
    <div className="space-y-3">
      {modules.map(mod => {
        const modChapters = chapters.filter(c => c.module_id === mod.id);
        const modLessons = lessons.filter(l => modChapters.some(c => c.id === l.chapter_id));
        const modCompleted = modLessons.filter(l => completedLessonIds.has(l.id)).length;
        const modTotal = modLessons.length;
        const isExpanded = expandedModules.has(mod.id);

        return (
          <div key={mod.id} className="rounded-lg border bg-card shadow-card overflow-hidden">
            <button
              onClick={() => toggleModule(mod.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
              <span className="text-xl">{mod.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{mod.title}</h3>
                {mod.description && <p className="text-xs text-muted-foreground truncate">{mod.description}</p>}
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {modCompleted}/{modTotal}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t">
                {modChapters.map(chapter => {
                  const chapterLessons = lessons.filter(l => l.chapter_id === chapter.id);
                  const chapterCompleted = chapterLessons.filter(l => completedLessonIds.has(l.id)).length;
                  const isChapterExpanded = expandedChapters.has(chapter.id);

                  return (
                    <div key={chapter.id}>
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors text-left border-b"
                      >
                        {isChapterExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <span className="text-sm">📖</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{chapter.title}</h4>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                          {chapterCompleted}/{chapterLessons.length}
                        </div>
                      </button>

                      {isChapterExpanded && (
                        <div className="bg-muted/20">
                          {chapterLessons.map(lesson => {
                            const unlocked = isLessonUnlocked(lesson, chapterLessons);
                            const completed = completedLessonIds.has(lesson.id);

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => unlocked && handleLessonClick(lesson)}
                                disabled={!unlocked}
                                className={`w-full flex items-center gap-3 px-10 py-2.5 text-left transition-colors border-b border-border/50
                                  ${unlocked ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                                  ${completed ? 'bg-success/5' : ''}`}
                              >
                                <span className={`shrink-0 ${completed ? 'text-success' : unlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {!unlocked ? <Lock className="h-4 w-4" /> :
                                   completed ? <CheckCircle2 className="h-4 w-4" /> :
                                   lessonTypeIcon[lesson.lesson_type] || <FileText className="h-4 w-4" />}
                                </span>
                                <span className="text-sm flex-1 truncate">{lesson.title}</span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {lessonTypeLabel[lesson.lesson_type] || lesson.lesson_type}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
