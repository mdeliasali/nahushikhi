export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      board_questions: {
        Row: {
          id: string; year: number; board_name: string; exam_class: 'dakhil' | 'alim';
          question_type: string; question_text: string; question_text_arabic: string | null;
          options: string[] | null; correct_answer: string; explanation: string | null;
          topic_tag: string | null; marks: number; is_published: boolean;
          created_at: string; updated_at: string;
        }
        Insert: Partial<Database['public']['Tables']['board_questions']['Row']> & { question_text: string; correct_answer: string; year: number; board_name: string; }
        Update: Partial<Database['public']['Tables']['board_questions']['Row']>
        Relationships: []
      }
      mock_test_sessions: {
        Row: {
          id: string; user_id: string; exam_class: 'dakhil' | 'alim';
          started_at: string; finished_at: string | null; duration_seconds: number | null;
          total_questions: number; correct_count: number; wrong_count: number;
          skipped_count: number; score_percent: number; answers: Record<string,string> | null;
          weak_topics: string[] | null; created_at: string;
        }
        Insert: Partial<Database['public']['Tables']['mock_test_sessions']['Row']> & { user_id: string; total_questions: number; }
        Update: Partial<Database['public']['Tables']['mock_test_sessions']['Row']>
        Relationships: [
          {
            foreignKeyName: "mock_test_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      revision_cards: {
        Row: {
          id: string; exam_class: 'dakhil' | 'alim'; topic: string; category: string;
          front_arabic: string | null; front_bengali: string; back_definition: string;
          back_example: string | null; back_rule: string | null; difficulty: 1 | 2 | 3;
          sort_order: number; is_published: boolean; created_at: string;
        }
        Insert: Partial<Database['public']['Tables']['revision_cards']['Row']> & { topic: string; front_bengali: string; back_definition: string; category: string; }
        Update: Partial<Database['public']['Tables']['revision_cards']['Row']>
        Relationships: []
      }
      short_questions: {
        Row: {
          id: string; exam_class: 'dakhil' | 'alim'; chapter_id: string | null;
          question_text: string; model_answer: string; answer_points: string[] | null;
          importance: 1 | 2 | 3; likely_year: string | null; topic_tag: string | null;
          is_published: boolean; created_at: string;
        }
        Insert: Partial<Database['public']['Tables']['short_questions']['Row']> & { question_text: string; model_answer: string; }
        Update: Partial<Database['public']['Tables']['short_questions']['Row']>
        Relationships: [
          {
            foreignKeyName: "short_questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          }
        ]
      }
      chapters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          module_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          chapter_id: string
          content: Json | null
          created_at: string
          id: string
          is_published: boolean
          lesson_type: Database["public"]["Enums"]["lesson_type"]
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          content?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          content?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          estimated_weeks: number | null
          icon: string | null
          id: string
          is_published: boolean
          level: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_weeks?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean
          level?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_weeks?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean
          level?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          exam_class: "dakhil" | "alim" | null
          target_exam_date: string | null
          streak_count: number | null
          last_active_date: string | null
          total_mock_tests: number | null
          best_mock_score: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          exam_class?: "dakhil" | "alim" | null
          target_exam_date?: string | null
          streak_count?: number | null
          last_active_date?: string | null
          total_mock_tests?: number | null
          best_mock_score?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          exam_class?: "dakhil" | "alim" | null
          target_exam_date?: string | null
          streak_count?: number | null
          last_active_date?: string | null
          total_mock_tests?: number | null
          best_mock_score?: number | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          chapter_id: string
          correct_answer: string
          created_at: string
          difficulty: number
          explanation: string | null
          id: string
          is_practice_question: boolean
          is_quiz_question: boolean
          lesson_id: string | null
          options: Json | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          sort_order: number
        }
        Insert: {
          chapter_id: string
          correct_answer: string
          created_at?: string
          difficulty?: number
          explanation?: string | null
          id?: string
          is_practice_question?: boolean
          is_quiz_question?: boolean
          lesson_id?: string | null
          options?: Json | null
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"]
          sort_order?: number
        }
        Update: {
          chapter_id?: string
          correct_answer?: string
          created_at?: string
          difficulty?: number
          explanation?: string | null
          id?: string
          is_practice_question?: boolean
          is_quiz_question?: boolean
          lesson_id?: string | null
          options?: Json | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          chapter_id: string
          completed_at: string
          id: string
          score: number
          total_questions: number
          user_id: string
          weak_topics: string[] | null
        }
        Insert: {
          answers?: Json | null
          chapter_id: string
          completed_at?: string
          id?: string
          score?: number
          total_questions?: number
          user_id: string
          weak_topics?: string[] | null
        }
        Update: {
          answers?: Json | null
          chapter_id?: string
          completed_at?: string
          id?: string
          score?: number
          total_questions?: number
          user_id?: string
          weak_topics?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_weak_topics: {
        Row: {
          chapter_id: string
          id: string
          incorrect_count: number
          last_tested: string
          mastered: boolean
          topic: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          id?: string
          incorrect_count?: number
          last_tested?: string
          mastered?: boolean
          topic: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          id?: string
          incorrect_count?: number
          last_tested?: string
          mastered?: boolean
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_weak_topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      exam_class: "dakhil" | "alim"
      lesson_type: "lesson" | "practice" | "quiz" | "review" | "tool"
      question_type:
        | "mcq"
        | "fill_blank"
        | "matching"
        | "identification"
        | "irab_analysis"
        | "root_extraction"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      exam_class: ["dakhil", "alim"],
      lesson_type: ["lesson", "practice", "quiz", "review", "tool"],
      question_type: [
        "mcq",
        "fill_blank",
        "matching",
        "identification",
        "irab_analysis",
        "root_extraction",
      ],
    },
  },
} as const
