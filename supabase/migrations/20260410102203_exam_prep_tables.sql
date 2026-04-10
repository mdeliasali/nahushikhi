-- ══════════════════════════════════════════
-- EXAM PREP TABLES — নাহু শিখি আপডেট
-- ══════════════════════════════════════════

-- 1. EXAM CLASS ENUM
CREATE TYPE public.exam_class AS ENUM ('dakhil', 'alim');

-- 2. BOARD QUESTIONS (বোর্ড প্রশ্নব্যাংক)
CREATE TABLE public.board_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL CHECK (year >= 2010 AND year <= 2030),
  board_name TEXT NOT NULL, -- 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'সিলেট', 'বরিশাল', 'যশোর', 'কুমিল্লা', 'দিনাজপুর', 'ময়মনসিংহ'
  exam_class exam_class NOT NULL DEFAULT 'dakhil',
  question_type question_type NOT NULL DEFAULT 'mcq',
  question_text TEXT NOT NULL,
  question_text_arabic TEXT,
  options JSONB, -- for MCQ: ["option1", "option2", "option3", "option4"]
  correct_answer TEXT NOT NULL,
  explanation TEXT, -- বাংলায় ব্যাখ্যা
  topic_tag TEXT, -- e.g. 'ইসম', 'ফে'ল', 'হরফ', 'ইরাব', 'মুবতাদা-খবর'
  marks INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MOCK TEST SESSIONS (মক পরীক্ষার রেকর্ড)
CREATE TABLE public.mock_test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_class exam_class NOT NULL DEFAULT 'dakhil',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_seconds INTEGER, -- কত সেকেন্ডে শেষ করেছে
  total_questions INTEGER NOT NULL DEFAULT 30,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  score_percent NUMERIC(5,2) DEFAULT 0,
  answers JSONB, -- {"question_id": "selected_answer", ...}
  weak_topics TEXT[], -- topics where user made mistakes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. REVISION CARDS (রিভিশন ফ্ল্যাশকার্ড)
CREATE TABLE public.revision_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_class exam_class NOT NULL DEFAULT 'dakhil',
  topic TEXT NOT NULL, -- e.g. 'ইসমের সংজ্ঞা', 'মুবতাদা-খবর'
  category TEXT NOT NULL, -- 'ইসম' | 'ফে'ল' | 'হরফ' | 'ইরাব' | 'বাক্য গঠন' | 'সংজ্ঞা'
  front_arabic TEXT, -- আরবি টেক্সট (সামনের দিক)
  front_bengali TEXT NOT NULL, -- বাংলা (সামনের দিক)
  back_definition TEXT NOT NULL, -- সংজ্ঞা (পিছনের দিক)
  back_example TEXT, -- উদাহরণ
  back_rule TEXT, -- নিয়ম/সূত্র
  difficulty INTEGER DEFAULT 1 CHECK (difficulty IN (1,2,3)), -- 1=সহজ, 2=মাঝারি, 3=কঠিন
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. SHORT QUESTIONS & MODEL ANSWERS (সংক্ষিপ্ত প্রশ্ন)
CREATE TABLE public.short_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_class exam_class NOT NULL DEFAULT 'dakhil',
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  model_answer TEXT NOT NULL, -- বাংলায় মডেল উত্তর
  answer_points JSONB, -- ["পয়েন্ট ১", "পয়েন্ট ২"] — মুখস্থ-বান্ধব
  importance INTEGER DEFAULT 2 CHECK (importance IN (1,2,3)), -- 1=কম, 2=মাঝারি, 3=অত্যন্ত গুরুত্বপূর্ণ
  likely_year TEXT, -- "২০২২, ২০২৩" — কোন বছর এসেছিল
  topic_tag TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. USER BOOKMARKS (বুকমার্ক)
CREATE TABLE public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('board_question', 'revision_card', 'short_question')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

-- 7. USER CARD PROGRESS (ফ্ল্যাশকার্ড অগ্রগতি)
CREATE TABLE public.user_card_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.revision_cards(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unseen' CHECK (status IN ('unseen', 'known', 'unknown')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, card_id)
);

-- 8. UPDATE profiles TABLE (নতুন কলাম যোগ)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS exam_class exam_class DEFAULT 'dakhil',
  ADD COLUMN IF NOT EXISTS target_exam_date DATE,
  ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date DATE,
  ADD COLUMN IF NOT EXISTS total_mock_tests INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_mock_score NUMERIC(5,2) DEFAULT 0;

-- ── RLS POLICIES ──

ALTER TABLE public.board_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published board questions" ON public.board_questions
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage board questions" ON public.board_questions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.mock_test_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own mock sessions" ON public.mock_test_sessions
  FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON public.mock_test_sessions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.revision_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published revision cards" ON public.revision_cards
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage revision cards" ON public.revision_cards
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.short_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published short questions" ON public.short_questions
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage short questions" ON public.short_questions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON public.user_bookmarks
  FOR ALL TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.user_card_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own card progress" ON public.user_card_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ── INDEXES ──
CREATE INDEX idx_board_questions_year ON public.board_questions(year);
CREATE INDEX idx_board_questions_class ON public.board_questions(exam_class);
CREATE INDEX idx_board_questions_type ON public.board_questions(question_type);
CREATE INDEX idx_board_questions_topic ON public.board_questions(topic_tag);
CREATE INDEX idx_mock_sessions_user ON public.mock_test_sessions(user_id);
CREATE INDEX idx_revision_cards_class ON public.revision_cards(exam_class);
CREATE INDEX idx_revision_cards_category ON public.revision_cards(category);
CREATE INDEX idx_short_questions_class ON public.short_questions(exam_class);
