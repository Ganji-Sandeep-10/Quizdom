import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Plus, ChevronRight, ArrowUpRight, BarChart3, Minus, X, Loader2, Menu, LayoutDashboard, Settings, Sun, Moon, LogOut, User as UserIcon, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import CategoryCarousel from '../components/CategoryCarousel';
import FloatingActionButton from '../components/FloatingActionButton';
import logo from '../assets/logo.png';
import { Input } from '../components/ui/input';
import { quizApi, sessionApi } from '../services/api';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { useTheme } from '../components/theme-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";

const Index = () => {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/login');
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim()) return;

    if (!user) {
      toast.error('Please login to join a quiz');
      navigate(`/login?redirect=${encodeURIComponent(`/join?code=${sessionCode.trim()}`)}`);
      return;
    }

    try {
      const { data } = await sessionApi.getByCode(sessionCode.trim());
      sessionStorage.setItem('quiz_player_name', user.name);
      navigate(`/session/${data.session.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid session code');
    }
  };

  const handleCloseInput = () => {
    setShowCodeInput(false);
    setSessionCode('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between text-black dark:text-white">
          {/* Left: User Avatar (Quizdom logo) */}
          <div className="w-50 h-12 ">
            <img src={logo} alt="Quizdom logo" className="w-full h-full object-cover" />
          </div>

          {/* Right: navigation buttons + profile */}
          <div className="flex items-center gap-4 justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-12 w-12 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full border-2 border-gray-200 dark:border-zinc-800"
            >
              {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </Button>

            <Link to="/profile">
              <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer border border-gray-200 dark:border-zinc-800">
                <img
                  src={`https://api.dicebear.com/7.x/lorelei/png?seed=${user?.avatarSeed || user?.name || 'Carlos'}`}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full border-2 border-gray-200 dark:border-zinc-800">
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
                    <UserIcon className="h-5 w-5" />
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className='pt-12'/>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-8 text-sm font-medium"
        >
          <span>👑</span>
          Think Fast...Win Faster...
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl sm:text-5xl font-bold text-black dark:text-white text-center mb-12 leading-tight max-w-4xl"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
        >
          Turn Knowledge Into Competition.<br/>Make Every Answer Count.
        </motion.h1>

        {/* Join Quiz Button / Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 flex items-center justify-center gap-3"
        >
          {!showCodeInput ? (
            <>
              <Button
                onClick={() => setShowCodeInput(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full font-medium flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                Join Quiz
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
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
                    variant="outline"
                    className="w-12 h-12 rounded-full border-2 border-blue-700 text-blue-700 hover:bg-blue-600 hover:text-white transition-all p-0 flex items-center justify-center shrink-0"
                  >
                    {creatingQuiz ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Create quiz</p>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <form onSubmit={handleJoinSubmit}>
                <div className="relative">
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition flex-shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    maxLength={6}
                    className="rounded-full pl-14 pr-14 py-6 w-72 text-center font-mono text-lg tracking-widest border-2 border-gray-300 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleCloseInput}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
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
                    variant="outline"
                    className="w-12 h-12 rounded-full border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white transition-all p-0 flex items-center justify-center shrink-0"
                  >
                    {creatingQuiz ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Create quiz</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </motion.div>

        {/* Developer category carousel */}
        <section className="w-full pb-1 bg-gray-50">
          <CategoryCarousel />
        </section>
        <div className="text-center pt-2 pb-7">
          <h2 className="text-2xl font-bold text-center mt-6">
            Build quizzes on any topic — pick a category above
          </h2>
        </div>

        {/* Three Step Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl"
        >
          {/* Step 1 */}
          <div className="bg-gray-100 rounded-3xl p-8 flex flex-col">
            <div className="mb-8 flex items-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm">
                + New quiz
              </Button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              <span className="font-bold text-gray-800">STEP 1</span>
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Head over to the home page, then click on <span className="font-bold">New Quiz</span> to start creating a quiz.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-100 rounded-3xl p-8 flex flex-col">
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">
                  💳
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Connect Wallet</p>
                  <p className="text-xs text-gray-600">Add money in game</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
                  👤
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Piyush Raj</p>
                  <p className="text-xs text-gray-600">Added modern theme and base points per Q</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">
                  ⚙️
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Add Interactions</p>
                  <p className="text-xs text-gray-600">Enhance engagement</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4 mt-4">
              <span className="font-bold text-gray-800">STEP 2</span>
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Build your quiz, customize the design, collaborate with others, set scoring rules, and put your SOL on the line.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-100 rounded-3xl p-8 flex flex-col">
            <div className="mb-8 flex items-end justify-center h-32 gap-2">
              <div className="w-12 h-16 bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg"></div>
              <div className="w-12 h-24 bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg"></div>
              <div className="w-12 h-20 bg-gradient-to-t from-blue-600 to-blue-500 rounded-lg"></div>
              <div className="w-12 h-12 bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg"></div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              <span className="font-bold text-gray-800">STEP 3</span>
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Launch the quiz and see votes roll in, leaderboards change, and spectators engage in real time.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 px-4 text-center text-sm text-gray-600">
        <p>© 2026 QuizMeter. Built for live engagement.</p>
      </footer>
      <FloatingActionButton />
    </div>
  );
};

export default Index;
