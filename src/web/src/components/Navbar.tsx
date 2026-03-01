import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { LogOut, User, Menu, LayoutDashboard, Settings, Sun, Moon, Plus, ChevronRight, Trophy, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useTheme } from './theme-provider';
import { quizApi } from '../services/api';
import { useState } from 'react';


export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md px-4 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center text-foreground">
          <div className="w-50 h-12">
            <img src={logo} alt="Quizdom logo" className="w-full h-full object-cover" />
          </div>            
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer border border-gray-300 dark:border-zinc-800">
                  <img
                    src={`https://api.dicebear.com/7.x/lorelei/png?seed=${user?.avatarSeed || user?.name || 'Carlos'}`}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-12 w-12 border-2 border-gray-300 dark:border-zinc-800 rounded-full">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-4 mt-8">
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12 text-lg"
                      onClick={() => navigate('/profile')}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Button>

                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12 text-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      onClick={async () => {
                        if (!user) {
                          navigate('/login?redirect=/');
                          return;
                        }
                        setCreatingQuiz(true);
                        try {
                          const { data } = await quizApi.create({ title: 'Untitled quiz', description: '', questions: [] });
                          toast.success('Quiz created!');
                          navigate(`/dashboard/quiz/${data.quiz.id}`);
                        } catch (err) {
                          toast.error('Failed to create quiz');
                        } finally {
                          setCreatingQuiz(false);
                        }
                      }}
                      disabled={creatingQuiz}
                    >
                      {creatingQuiz ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                      <span>Create Quiz</span>
                    </Button>

                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12 text-lg"
                      onClick={() => navigate('/results')}
                    >
                      <Trophy className="h-5 w-5" />
                      <span>My Results</span>
                    </Button>

                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12 text-lg"
                      onClick={() => navigate('/dashboard')}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Quiz Dashboard</span>
                    </Button>
                    
                    <div className="h-px bg-border my-2" />
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-12 px-4 text-lg"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                      </div>
                    </Button>

                    <div className="h-px bg-border my-2" />

                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12 text-lg"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Button>

                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12 text-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
