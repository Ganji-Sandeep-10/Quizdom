import { useEffect, useState } from 'react';
import { authApi } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { User, Mail, Calendar, BookOpen, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ProfileData {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
  quizzes: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    _count: { questions: number };
  }[];
  participations: {
    id: string;
    score: number;
    quizTitle: string;
    quizId: string;
    playedAt: string;
  }[];
}

const ProfilePage = () => {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.profile();
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100-64px)] py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-background to-primary/5 border border-border p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-primary/20 flex items-center justify-center text-primary border-4 border-background shadow-xl">
              <User size={48} />
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{data.user.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Mail size={16} /> {data.user.email}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} /> Joined {new Date(data.user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Trophy className="text-yellow-500" size={20} /> Overview
            </h2>
            
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-sm text-muted-foreground mb-1">Quizzes Created</p>
                    <p className="text-3xl font-bold text-foreground">{data.quizzes.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-sm text-muted-foreground mb-1">Quizzes Participated</p>
                    <p className="text-3xl font-bold text-foreground">{data.participations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participation History (Mobile/Tablet visible if needed, or just stay side by side) */}
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground pt-4">
              <Trophy className="text-primary" size={20} /> Latest Results
            </h2>
            <div className="space-y-3">
              {data.participations.length === 0 ? (
                <p className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-xl">No quiz history yet</p>
              ) : (
                data.participations.slice(0, 5).map((p) => (
                  <motion.div 
                    key={p.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl border border-border bg-card/30 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{p.quizTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.playedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                      Score: {p.score}
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Quizzes Created Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <BookOpen className="text-primary" size={20} /> My Quizzes
              </h2>
              <Link to="/dashboard">
                <Button variant="link" className="text-primary p-0 h-auto">
                  Manage All <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.quizzes.length === 0 ? (
                <div className="col-span-2 text-center py-20 border border-dashed rounded-3xl">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">You haven't created any quizzes yet.</p>
                  <Link to="/dashboard" className="mt-4 inline-block">
                    <Button variant="outline" size="sm">Create your first quiz</Button>
                  </Link>
                </div>
              ) : (
                data.quizzes.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link to={`/dashboard/quiz/${quiz.id}`}>
                      <Card className="h-full border-border/50 hover:border-primary/30 transition-all hover:shadow-lg bg-card/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-foreground line-clamp-1">{quiz.title}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                            {quiz.description || "No description provided."}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> {new Date(quiz.createdAt).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                              {quiz._count.questions} Questions
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
