import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Lock, CheckCircle2, BookOpen, FileText, HelpCircle, RotateCcw, Wrench, PlayCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { Progress } from './ui/progress';

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
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.length > 0 ? [modules[0].id] : []));
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
    <div className="space-y-4">
      {modules.map(mod => {
        const modChapters = chapters.filter(c => c.module_id === mod.id);
        const modLessons = lessons.filter(l => modChapters.some(c => c.id === l.chapter_id));
        const modCompletedCount = modLessons.filter(l => completedLessonIds.has(l.id)).length;
        const modTotalCount = modLessons.length;
        const isExpanded = expandedModules.has(mod.id);
        const progressPercent = modTotalCount > 0 ? (modCompletedCount / modTotalCount) * 100 : 0;

        return (
          <div key={mod.id} className="rounded-[2rem] glass-card overflow-hidden ring-1 ring-white/20 shadow-card animate-in-fade">
            <button
              onClick={() => toggleModule(mod.id)}
              className="w-full flex items-center gap-4 p-5 text-left transition-all active:scale-[0.98]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/50 text-2xl shrink-0 shadow-sm">
                {mod.icon || '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base tracking-tight">{mod.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={progressPercent} className="h-1.5 w-20" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {modCompletedCount}/{modTotalCount} সম্পন্ন
                  </span>
                </div>
              </div>
              <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}>
                <ChevronDown className="h-5 w-5" />
              </div>
            </button>

            {isExpanded && (
              <div className="px-3 pb-5 space-y-3 animate-in-fade">
                {modChapters.map(chapter => {
                  const chapterLessons = lessons.filter(l => l.chapter_id === chapter.id);
                  const chapterCompletedCount = chapterLessons.filter(l => completedLessonIds.has(l.id)).length;
                  const isChapterExpanded = expandedChapters.has(chapter.id);
                  const chapterProgressPercent = chapterLessons.length > 0 ? (chapterCompletedCount / chapterLessons.length) * 100 : 0;

                  return (
                    <div key={chapter.id} className="rounded-2xl bg-white/40 ring-1 ring-black/5 overflow-hidden">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-white/60"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm tracking-tight">{chapter.title}</h4>
                          <span className="text-[10px] text-muted-foreground">{chapterLessons.length} টি পাঠ</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="text-[10px] font-bold text-primary/80">
                            {Math.round(chapterProgressPercent)}%
                          </div>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isChapterExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {isChapterExpanded && (
                        <div className="bg-white/20 pb-2">
                          {chapterLessons.map(lesson => {
                            const unlocked = isLessonUnlocked(lesson, chapterLessons);
                            const completed = completedLessonIds.has(lesson.id);

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => unlocked && handleLessonClick(lesson)}
                                disabled={!unlocked}
                                className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all border-b border-black/5 last:border-0
                                  ${unlocked ? 'hover:bg-primary/5 active:bg-primary/10 cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                                  ${completed ? 'bg-success/5' : ''}`}
                              >
                                <div className={`relative flex items-center justify-center h-8 w-8 rounded-full shrink-0 
                                  ${completed ? 'bg-success/20 text-success' : unlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                  {!unlocked ? <Lock className="h-3.5 w-3.5" /> :
                                   completed ? <CheckCircle2 className="h-4 w-4" /> :
                                   <PlayCircle className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className={`text-sm font-medium block truncate ${!unlocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                                    {lesson.title}
                                  </span>
                                  <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/70">
                                    {lessonTypeLabel[lesson.lesson_type] || lesson.lesson_type}
                                  </span>
                                </div>
                                {unlocked && !completed && (
                                  <ChevronRight className="h-3.5 w-3.5 text-primary/40" />
                                )}
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
