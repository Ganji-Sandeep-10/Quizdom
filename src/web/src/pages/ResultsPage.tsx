import { useEffect, useState } from 'react';
import { authApi } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Trophy, Calendar, Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Participation {
  id: string;
  score: number;
  quizTitle: string;
  quizId: string;
  playedAt: string;
}

const ResultsPage = () => {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await authApi.profile();
        setParticipations(res.data.participations);
      } catch (err) {
        toast.error('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">My Results</h1>
          <p className="text-muted-foreground mt-2">Track your progress and quiz performance</p>
        </motion.div>

        {participations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 border-2 border-dashed rounded-3xl bg-card/30"
          >
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium text-foreground">No results yet</p>
            <p className="text-muted-foreground mb-8">Join a quiz and test your knowledge!</p>
            <Link to="/join">
              <Button size="lg" className="rounded-full px-8">
                Join a Quiz
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {participations.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-all hover:border-primary/30">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-6 min-w-0">
                          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                            <Trophy size={24} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-bold text-foreground truncate">{p.quizTitle}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(p.playedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 pr-3">Score</p>
                            <Badge variant="secondary" className="text-lg py-1 px-4 bg-primary/10 text-primary border-none font-bold">
                              {p.score}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultsPage;
