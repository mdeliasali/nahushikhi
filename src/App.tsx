import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import LessonPage from "./pages/LessonPage";
import QuizPage from "./pages/QuizPage";
import PracticePage from "./pages/PracticePage";
import ProgressPage from "./pages/ProgressPage";
import ToolsPage from "./pages/ToolsPage";
import TarkibPage from "./pages/TarkibPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import BoardQuestionsPage from "./pages/BoardQuestionsPage";
import MockTestPage from "./pages/MockTestPage";
import RevisionCardsPage from "./pages/RevisionCardsPage";
import ShortQuestionsPage from "./pages/ShortQuestionsPage";
import TranslationPage from "./pages/TranslationPage";
import TashkilPage from "./pages/TashkilPage";
import InshaPage from "./pages/InshaPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
            
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/quiz/:chapterId" element={<QuizPage />} />
            <Route path="/practice/:chapterId" element={<PracticePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/tarkib" element={<TarkibPage />} />
            <Route path="/question-bank" element={<BoardQuestionsPage />} />
            <Route path="/mock-test" element={<MockTestPage />} />
            <Route path="/revision" element={<RevisionCardsPage />} />
            <Route path="/short-questions" element={<ShortQuestionsPage />} />
            <Route path="/translation" element={<TranslationPage />} />
            <Route path="/tashkil" element={<TashkilPage />} />
            <Route path="/insha" element={<InshaPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
