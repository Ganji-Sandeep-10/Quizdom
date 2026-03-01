import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from './stores/authStore';
import { AuthGuard } from './components/AuthGuard';
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import QuizDetailPage from "./pages/QuizDetailPage";
import SessionHostPage from "./pages/SessionHostPage";
import JoinPage from "./pages/JoinPage";
import PlayerSessionPage from "./pages/PlayerSessionPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ResultsPage from "./pages/ResultsPage";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const AuthInit = ({ children }: { children: React.ReactNode }) => {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  return <>{children}</>;
};

import { ThemeProvider } from './components/theme-provider';

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="quizmeter-ui-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthInit>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/session/:sessionId" element={<PlayerSessionPage />} />
              <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
              <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
              <Route path="/results" element={<AuthGuard><ResultsPage /></AuthGuard>} />
              <Route path="/dashboard/quiz/:quizId" element={<AuthGuard><QuizDetailPage /></AuthGuard>} />

              <Route path="/dashboard/session/:sessionId" element={<AuthGuard><SessionHostPage /></AuthGuard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthInit>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
