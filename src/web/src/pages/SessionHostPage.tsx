import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionApi } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { Navbar } from '../components/Navbar';
import { SessionStatusBadge } from '../components/SessionStatusBadge';
import { Leaderboard } from '../components/Leaderboard';
import { DashboardSkeleton } from '../components/Skeletons';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Play, SkipForward, Square, ArrowLeft, Users, Copy, Loader2 } from 'lucide-react';
import type { Session, LeaderboardEntry, Player } from '../types/quiz';
import { motion } from 'framer-motion';

const SessionHostPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(-1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [status, setStatus] = useState<Session['status']>('WAITING');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const { data } = await sessionApi.get(sessionId!);
      setSession(data.session);
      setStatus(data.session.status);
      setPlayers(data.session.players);
      setCurrentQIndex(data.session.currentQuestionIndex);
      setTotalQuestions(data.session.totalQuestions);
    } catch {
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();

    const socket = connectSocket();

    socket.emit('host_join', { sessionId });

    socket.on('session_state', (payload) => {
      setStatus(payload.status);
      setPlayers(payload.players || []);
      setCurrentQIndex(payload.currentQuestionIndex);
      setTotalQuestions(payload.totalQuestions);
      if (payload.leaderboard) setLeaderboard(payload.leaderboard);
    });

    socket.on('leaderboard', (payload) => {
      setLeaderboard(payload.leaderboard);
    });

    socket.on('question_started', (payload) => {
      setCurrentQIndex(payload.question.index);
      setStatus('LIVE');
    });

    socket.on('question_ended', () => {
      // Wait for leaderboard
    });

    socket.on('ready_for_next', () => {
      // Host can move to next
    });

    return () => {
      socket.off('session_state');
      socket.off('leaderboard');
      socket.off('question_started');
      socket.off('question_ended');
      socket.off('ready_for_next');
      disconnectSocket();
    };
  }, [sessionId, fetchSession]);

  const handleStartSession = async () => {
    setActionLoading(true);
    try {
      await sessionApi.start(sessionId!);
      setStatus('LIVE');
      toast.success('Session started!');
    } catch {
      toast.error('Failed to start session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartQuestion = (duration?: number) => {
    setActionLoading(true);
    const socket = connectSocket();
    socket.emit('start_question', { sessionId, duration: duration || 30 });
    // Reset loading after a small delay since socket emits don't have direct callbacks here
    setTimeout(() => setActionLoading(false), 500);
  };

  const handleNextQuestion = () => {
    setActionLoading(true);
    const socket = connectSocket();
    socket.emit('next_question', { sessionId });
    setTimeout(() => setActionLoading(false), 500);
  };

  const handleEndSession = async () => {
    setActionLoading(true);
    try {
      await sessionApi.end(sessionId!);
      setStatus('ENDED');
      toast.success('Session ended');
    } catch {
      toast.error('Failed to end session');
    } finally {
      setActionLoading(false);
    }
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId || '');
    toast.success('Session ID copied!');
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Host Control</h1>
              <SessionStatusBadge status={status} />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <div>
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Join Code</p>
                  <p className="text-4xl font-black text-primary tracking-widest">{session?.code || '------'}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(session?.code || '');
                    toast.success('Join code copied!');
                  }}
                  className="ml-auto"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <button
                onClick={copySessionId}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-mono opacity-50">ID: {sessionId}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {status === 'WAITING' && (
              <Button onClick={handleStartSession} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
                Start Session
              </Button>
            )}
            {status === 'LIVE' && (
              <>
                <Button onClick={() => handleStartQuestion()} variant="default" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
                  Start Question
                </Button>
                <Button onClick={handleNextQuestion} variant="secondary" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <SkipForward className="h-4 w-4 mr-1" />}
                  Next
                </Button>
                <Button onClick={handleEndSession} variant="destructive" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Square className="h-4 w-4 mr-1" />}
                  End
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress */}
        {totalQuestions > 0 && (
          <div className="mb-6 rounded-xl bg-card border border-border p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Question Progress</span>
              <span className="font-medium text-foreground">
                {currentQIndex + 1} / {totalQuestions}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Players */}
          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg text-foreground">Players ({players.length})</h3>
            </div>
            {players.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Waiting for players to join...</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                    <div className={`h-2 w-2 rounded-full ${p.isConnected ? 'bg-success' : 'bg-muted-foreground'}`} />
                    <span className="text-sm font-medium text-foreground flex-1">{p.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{p.score} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="rounded-xl bg-card border border-border p-5">
            <Leaderboard entries={leaderboard} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionHostPage;
