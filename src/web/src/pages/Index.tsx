import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Plus, ChevronRight, BarChart3, Minus, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import CategoryCarousel from '../components/CategoryCarousel';
import logo from '../assets/logo.png';
import { Input } from '../components/ui/input';
import { quizApi, sessionApi } from '../services/api';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

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
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          {/* Left: User Avatar (Quizdom logo) */}
          <div className="w-50 h-12 ">
            <img src={logo} alt="Quizdom logo" className="w-full h-full object-cover" />
          </div>

          {/* Right: menu toggle + navigation buttons + home + profile */}
          <div className="flex items-center gap-4 justify-center">
            {menuOpen && (
              <div className="flex items-center gap-2">
                <Link to="/" className="h-10 flex items-center justify-center px-4 rounded-full bg-black text-white text-sm  hover:bg-gray-800 transition">Home</Link>
                <Link to="/features" className="h-10 flex items-center justify-center px-4 rounded-full bg-black text-white text-sm  hover:bg-gray-800 transition">Features</Link>
                <Link to="/about" className="h-10 flex items-center justify-center px-4 rounded-full bg-black text-white text-sm  hover:bg-gray-800 transition">About</Link>
                <Link to="/faq" className="h-10 flex items-center justify-center px-4 rounded-full bg-black text-white text-sm  hover:bg-gray-800 transition">FAQ</Link>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(o => !o)}
              className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-800 transition"
            >
              {menuOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>

            {/* when clicked, call backend to create a new quiz and navigate to it */}
            <button
              onClick={async () => {
                // if user not logged in, redirect to login
                if (!user) {
                  navigate('/login?redirect=/');
                  return;
                }
                setCreatingQuiz(true);
                try {
                  // supply a default title so the request passes validation
                  const { data } = await quizApi.create({ title: 'Untitled quiz', description: '', questions: [] });
                  toast.success('Quiz created!');
                  navigate(`/dashboard/quiz/${data.quiz.id}`);
                } catch (err) {
                  toast.error('Failed to create quiz');
                } finally {
                  setCreatingQuiz(false);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium text-sm flex items-center justify-center"
              disabled={creatingQuiz}
            >
              {creatingQuiz && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Quiz
            </button>

            <Link to="/profile">
              <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer">
                <img
                  src="https://api.dicebear.com/7.x/adventurer/png?seed=Carlos"
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-8 text-sm font-medium"
        >
          <span>👑</span>
          Mom was right, studying pays
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl sm:text-7xl font-bold text-black text-center mb-12 leading-tight max-w-4xl"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
        >
          The ultimate fun<br />knowledge matters
        </motion.h1>

        {/* Join Quiz Button / Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          {!showCodeInput ? (
            <Button
              onClick={() => setShowCodeInput(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full font-medium flex items-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              Join Quiz
            </Button>
          ) : (
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
          )}
        </motion.div>

        {/* Developer category carousel */}
        <section className="w-full pb-10 bg-gray-50">
          <CategoryCarousel />
          <h2 className="text-2xl font-bold text-center mt-6">
            Build quizzes on any topic — pick a category above
          </h2>
        </section>

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
    </div>
  );
};

export default Index;
