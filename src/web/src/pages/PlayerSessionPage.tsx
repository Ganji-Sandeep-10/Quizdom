import { useEffect, useCallback, useState } from 'react';
import {Link, useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { connectSocket, disconnectSocket } from '../services/socket';
import { CountdownTimer } from '../components/CountdownTimer';
import { QuestionCard } from '../components/QuestionCard';
import { Leaderboard } from '../components/Leaderboard';
import { QuestionSkeleton } from '../components/Skeletons';
import { SessionStatusBadge } from '../components/SessionStatusBadge';
import { toast } from 'sonner';
import { Zap, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import { useAuthStore } from '../stores/authStore';
import confetti from 'canvas-confetti';

import type {
  SessionStatePayload,
  QuestionStartedPayload,
  QuestionEndedPayload,
  LeaderboardPayload,
} from '../types/quiz';

const PlayerSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const store = useSessionStore();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [connected, setConnected] = useState(false);
  const [phase, setPhase] = useState<'waiting' | 'question' | 'result' | 'leaderboard' | 'ended'>('waiting');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please login to join a quiz');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, isLoading, navigate]);

  const playerName = user?.name || 'Anonymous';

  const triggerConfetti = () => {
    console.log("Triggering 3-second confetti celebration!");
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const setupSocket = useCallback(() => {
    const socket = connectSocket();

    socket.on('connect', () => {
      console.log("Socket connected, joining session:", sessionId);
      setConnected(true);
      store.setReconnecting(false);
      // Join / rejoin
      const authUser = useAuthStore.getState().user;
      socket.emit('join', { sessionId, playerName, userId: authUser?.id });
    });

    socket.on('session_state', (payload: SessionStatePayload) => {
      console.log("Session state update:", payload.status);
      store.setSession(payload.sessionId, payload.status);
      store.setPlayers(payload.players || []);
      if (payload.leaderboard) store.setLeaderboard(payload.leaderboard);

      if (payload.status === 'ENDED') {
        setPhase('ended');
      } else if (payload.question) {
        store.setQuestion(payload.question);
        const remaining = payload.question.endTime - Date.now();
        setPhase(remaining > 0 ? 'question' : 'result');
      } else if (payload.status === 'WAITING') {
        setPhase('waiting');
      }
    });

    socket.on('question_started', (payload: QuestionStartedPayload) => {
      console.log("Question started:", payload.question.index);
      store.setQuestion(payload.question);
      store.setQuestionResult(null);
      setPhase('question');
    });

    socket.on('question_ended', (payload: QuestionEndedPayload) => {
      const currentState = useSessionStore.getState();
      const currentSelected = currentState.selectedAnswer;
      
      console.log("Question ended event received");
      console.log("Correct index:", payload.correctOptionIndex);
      console.log("Current selected answer (from getState):", currentSelected);

      const isCorrect = currentSelected === payload.correctOptionIndex;
      
      store.setQuestionResult({
        questionIndex: payload.questionIndex,
        correctOptionIndex: payload.correctOptionIndex,
        playerAnswer: currentSelected ?? undefined,
        isCorrect: isCorrect,
      });

      setPhase('result');
      if (isCorrect) {
        triggerConfetti();
      }
    });

    socket.on('leaderboard', (payload: LeaderboardPayload) => {
      store.setLeaderboard(payload.leaderboard);
      if (phase === 'result') {
        setPhase('leaderboard');
      }
    });

    socket.on('ready_for_next', () => {
      setPhase('leaderboard');
    });

    socket.on('error', (msg: string) => {
      toast.error(msg);
    });

    socket.on('joined', (data: { playerId: string }) => {
      store.setPlayer(data.playerId, playerName);
    });

    return socket;
  }, [sessionId, playerName]);

  useEffect(() => {
    if (!sessionId) {
      navigate('/join');
      return;
    }
    const socket = setupSocket();
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('session_state');
      socket.off('question_started');
      socket.off('question_ended');
      socket.off('leaderboard');
      socket.off('ready_for_next');
      socket.off('error');
      socket.off('joined');
      disconnectSocket();
      store.reset();
    };
  }, [sessionId]);

  const handleSelectAnswer = (index: number) => {
    if (store.answerSubmitted) return;
    store.selectAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (store.selectedAnswer === null || store.answerSubmitted || !store.currentQuestion) return;
    
    const optionId = store.currentQuestion.options[store.selectedAnswer].id;
    const userId = store.playerId; // Use the ID from joined event

    store.submitAnswer();
    const socket = connectSocket();
    socket.emit('answer', {
      sessionId,
      userId,
      optionId,
    });
  };

  const isExpired = store.currentQuestion
    ? store.currentQuestion.endTime - Date.now() <= 0
    : false;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="w-50 h-12">
            <Link to="/">
              <img src={logo} alt="Quizdom logo" className="w-full h-full object-cover" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {store.status && <SessionStatusBadge status={store.status} />}
            {connected ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>
      </header>

      {/* Reconnecting banner */}
      {store.isReconnecting && (
        <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 text-center text-sm text-warning flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Reconnecting...
        </div>
      )}

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        <AnimatePresence mode="wait">
          {phase === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Waiting for host</h2>
              <p className="text-muted-foreground">
                You're in! The quiz will start soon.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Playing as <span className="font-semibold text-foreground">{playerName}</span>
              </p>
            </motion.div>
          )}

          {phase === 'question' && store.currentQuestion && (
            <motion.div
              key={`q-${store.currentQuestion.index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">
                  Question {store.currentQuestion.index + 1} of {store.currentQuestion.totalQuestions}
                </span>
                <CountdownTimer
                  endTime={store.currentQuestion.endTime}
                  onExpire={() => {
                    if (!store.answerSubmitted && store.selectedAnswer !== null) {
                      handleSubmitAnswer();
                    }
                  }}
                />
              </div>

              <QuestionCard
                questionText={store.currentQuestion.text}
                options={store.currentQuestion.options}
                selectedAnswer={store.selectedAnswer}
                answerSubmitted={store.answerSubmitted}
                disabled={store.answerSubmitted || isExpired}
                onSelect={handleSelectAnswer}
              />

              {store.selectedAnswer !== null && !store.answerSubmitted && !isExpired && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <button
                    onClick={handleSubmitAnswer}
                    className="w-full rounded-xl bg-primary py-4 text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity"
                  >
                    Lock In Answer
                  </button>
                </motion.div>
              )}

              {store.answerSubmitted && (
                <p className="text-center text-muted-foreground text-sm">
                  ✓ Answer submitted! Waiting for results...
                </p>
              )}
            </motion.div>
          )}

          {phase === 'result' && store.questionResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-8">
                {store.questionResult.isCorrect ? (
                  <div>
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-success">Correct!</h2>
                  </div>
                ) : store.questionResult.playerAnswer !== undefined ? (
                  <div>
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-bold text-destructive">Wrong</h2>
                  </div>
                ) : (
                  <div>
                    <div className="text-6xl mb-4">⏰</div>
                    <h2 className="text-2xl font-bold text-muted-foreground">Time's Up</h2>
                  </div>
                )}
              </div>

              {store.currentQuestion && (
                <QuestionCard
                  questionText={store.currentQuestion.text}
                  options={store.currentQuestion.options}
                  selectedAnswer={store.selectedAnswer}
                  answerSubmitted
                  correctOptionIndex={store.questionResult.correctOptionIndex}
                  disabled
                  onSelect={() => { }}
                />
              )}
            </motion.div>
          )}

          {phase === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <h2 className="text-xl font-bold text-center text-foreground mb-6">
                Standings
              </h2>
              <Leaderboard entries={store.leaderboard} currentPlayerId={store.playerId} />
              <p className="text-center text-muted-foreground text-sm mt-6">
                Waiting for next question...
              </p>
            </motion.div>
          )}

          {phase === 'ended' && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Quiz Complete!</h2>
              <div className="w-full max-w-md">
                <Leaderboard entries={store.leaderboard} currentPlayerId={store.playerId} maxEntries={5} />
              </div>
              <button
                onClick={() => navigate('/join')}
                className="mt-8 rounded-xl bg-primary px-8 py-3 text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Join Another Quiz
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PlayerSessionPage;
