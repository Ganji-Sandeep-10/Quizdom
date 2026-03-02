import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi, sessionApi } from '../services/api';
import { Navbar } from '../components/Navbar';
import { SessionStatusBadge } from '../components/SessionStatusBadge';
import { DashboardSkeleton } from '../components/Skeletons';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Play, ArrowLeft, Loader2 } from 'lucide-react';
import type { Quiz, Question, Session } from '../types/quiz';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const QuizDetailPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [creatingSess, setCreatingSess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteQuizName, setDeleteQuizName] = useState('');
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  // Question form
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qDuration, setQDuration] = useState(30);

  // Edit Question form
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [updatingQuestion, setUpdatingQuestion] = useState(false);
  const [eqText, setEqText] = useState('');
  const [eqOptions, setEqOptions] = useState(['', '', '', '']);
  const [eqCorrect, setEqCorrect] = useState(0);

  // Edit Question handler wrapper
  const handleEditClick = (q: Question) => {
    setEditingQuestionId(q.id);
    setEqText(q.text);
    // Find matching correct index if possible
    let cIndex = q.options.findIndex(o => Number(o.id) === Number(q.correctOptionIndex)) || 0; 
    if (cIndex === -1 && (q as any).correctOptionIndex !== undefined) {
       cIndex = Number((q as any).correctOptionIndex);
    }
    
    const correctOptIndexByRef = q.options.findIndex(o => o.id === (q as any).correctId);
    if (correctOptIndexByRef !== -1) cIndex = correctOptIndexByRef;

    setEqCorrect(cIndex);
    const opts = q.options.map(o => o.text);
    while (opts.length < 4) opts.push('');
    setEqOptions(opts.slice(0, 4));
    setEditDialogOpen(true);
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || !editingQuestionId) return;
    setUpdatingQuestion(true);
    try {
      await quizApi.updateQuestion(quiz.id, editingQuestionId, {
        text: eqText,
        options: eqOptions,
        correctIndex: eqCorrect,
      });
      await fetchData();
      setEditDialogOpen(false);
      toast.success('Question updated!');
    } catch {
      toast.error('Failed to update question');
    } finally {
      setUpdatingQuestion(false);
    }
  };

  const fetchData = async () => {
    try {
      const [quizRes, sessRes] = await Promise.all([
        quizApi.get(quizId!),
        sessionApi.list(quizId!),
      ]);
      setQuiz(quizRes.data.quiz);
      setSessions(sessRes.data.sessions);
    } catch {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    setAddingQuestion(true);
    try {
      await quizApi.addQuestion(quiz.id, {
        text: qText,
        options: qOptions,
        correctIndex: qCorrect,
      });
      await fetchData();
      setDialogOpen(false);
      setQText('');
      setQOptions(['', '', '', '']);
      setQCorrect(0);
      toast.success('Question added!');
    } catch {
      toast.error('Failed to add question');
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleCreateSession = async () => {
    setCreatingSess(true);
    try {
      const { data } = await sessionApi.create(quizId!);
      toast.success('Session created!');
      navigate(`/dashboard/session/${data.session.id}`);
    } catch {
      toast.error('Failed to create session');
    } finally {
      setCreatingSess(false);
    }
  };

  const handleDeleteQuestion = async (index: number) => {
    if (!quiz) return;
    const question = quiz.questions[index];
    try {
      await quizApi.deleteQuestion(quiz.id, question.id);
      await fetchData();
      toast.success('Question deleted');
    } catch {
      toast.error('Failed to delete question');
    }
  };

  const handleDeleteQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || deleteQuizName !== quiz.title) return;
    setDeletingQuiz(true);
    try {
      await quizApi.delete(quiz.id);
      toast.success('Quiz deleted');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete quiz');
    } finally {
      setDeletingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Quiz not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{quiz.title}</h1>
            {quiz.description && <p className="text-muted-foreground mt-1">{quiz.description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleCreateSession} disabled={creatingSess || quiz.questions.length === 0}>
              {creatingSess ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
              New Session
            </Button>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Quiz
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Quiz</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    This action cannot be undone. This will permanently delete the <strong>{quiz.title}</strong> quiz, all of its questions, and associated sessions.
                  </div>
                  <form onSubmit={handleDeleteQuiz} className="space-y-4">
                    <div className="space-y-2">
                      <Label>To confirm, type "{quiz.title}" in the box below</Label>
                      <Input 
                        value={deleteQuizName} 
                        onChange={(e) => setDeleteQuizName(e.target.value)} 
                        placeholder={quiz.title} 
                        required 
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeleteQuizName(''); }}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="destructive" 
                        disabled={deleteQuizName !== quiz.title || deletingQuiz}
                      >
                        {deletingQuiz ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Delete
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="questions">Questions ({quiz.questions.length})</TabsTrigger>
            <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Questions</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add Question</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddQuestion} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Input value={qText} onChange={(e) => setQText(e.target.value)} required placeholder="What is...?" />
                      </div>
                      {qOptions.map((opt, i) => (
                        <div key={i} className="space-y-1">
                          <Label className="text-sm">
                            Option {String.fromCharCode(65 + i)}
                            {i === qCorrect && <span className="text-success ml-1">✓ Correct</span>}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const next = [...qOptions];
                                next[i] = e.target.value;
                                setQOptions(next);
                              }}
                              required
                              placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant={i === qCorrect ? 'default' : 'outline'}
                              onClick={() => setQCorrect(i)}
                            >
                              ✓
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label>Duration (seconds)</Label>
                        <Input
                          type="number"
                          min={5}
                          max={120}
                          value={qDuration}
                          onChange={(e) => setQDuration(Number(e.target.value))}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={addingQuestion}>
                        {addingQuestion && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add Question
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {quiz.questions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
                  No questions yet. Add some to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {quiz.questions.map((q, i) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            <span className="text-muted-foreground mr-2">Q{i + 1}.</span>
                            {q.text}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {q.options.map((opt, oi) => (
                              <span
                                key={opt.id}
                                className={`text-sm px-3 py-1.5 rounded-lg ${
                                  oi === q.correctOptionIndex
                                    ? 'bg-success/10 text-success font-medium'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {String.fromCharCode(65 + oi)}. {opt.text}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(q)}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(i)}
                            className="text-destructive hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="sessions">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Active Sessions</h2>
              </div>


              {sessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
                  No sessions yet
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/dashboard/session/${s.id}`)}
                      className="w-full text-left rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm font-mono">{s.id}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(s.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <SessionStatusBadge status={s.status} />
                    </button>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>

        {/* Edit Question Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Input value={eqText} onChange={(e) => setEqText(e.target.value)} required />
              </div>
              {eqOptions.map((opt, i) => (
                <div key={i} className="space-y-1">
                  <Label className="text-sm">
                    Option {String.fromCharCode(65 + i)}
                    {i === eqCorrect && <span className="text-success ml-1">✓ Correct</span>}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const next = [...eqOptions];
                        next[i] = e.target.value;
                        setEqOptions(next);
                      }}
                      required
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant={i === eqCorrect ? 'default' : 'outline'}
                      onClick={() => setEqCorrect(i)}
                    >
                      ✓
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="submit" className="w-full" disabled={updatingQuestion}>
                {updatingQuestion && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default QuizDetailPage;
