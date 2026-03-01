import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Navbar } from '../components/Navbar';
import { DashboardSkeleton } from '../components/Skeletons';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Plus, BookOpen, Calendar, Loader2 } from 'lucide-react';
import type { Quiz } from '../types/quiz';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const { data } = await quizApi.list();
      setQuizzes(data.quizzes);
    } catch {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await quizApi.create({ title: newTitle, description: newDesc, questions: [] });
      toast.success('Quiz created!');
      setDialogOpen(false);
      setNewTitle('');
      setNewDesc('');
      navigate(`/dashboard/quiz/${data.quiz.id}`);
    } catch {
      toast.error('Failed to create quiz');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Quizzes</h1>
            <p className="text-muted-foreground mt-1">Manage your quizzes and sessions</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Quiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-title">Title</Label>
                  <Input
                    id="quiz-title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="My Awesome Quiz"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-desc">Description (optional)</Label>
                  <Input
                    id="quiz-desc"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="A fun quiz about..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Quiz
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : quizzes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No quizzes yet</h3>
            <p className="text-muted-foreground mb-4">Create your first quiz to get started</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {quizzes.map((quiz, i) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/dashboard/quiz/${quiz.id}`}
                    className="block rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{quiz.title}</h3>
                        {quiz.description && (
                          <p className="text-muted-foreground text-sm mt-1">{quiz.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
