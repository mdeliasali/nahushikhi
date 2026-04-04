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
import RealArabicPage from "./pages/RealArabicPage";
import SmartPracticePage from "./pages/SmartPracticePage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

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
            
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
            
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/quiz/:chapterId" element={<QuizPage />} />
            <Route path="/practice/:chapterId" element={<PracticePage />} />
            <Route path="/real-arabic/:lessonId" element={<RealArabicPage />} />
            <Route path="/smart-practice/:lessonId" element={<SmartPracticePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
