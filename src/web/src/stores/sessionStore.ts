import { create } from 'zustand';
import type {
  LiveQuestion,
  LeaderboardEntry,
  Player,
  QuestionResult,
  Session,
} from '../types/quiz';

interface SessionState {
  sessionId: string | null;
  status: Session['status'] | null;
  players: Player[];
  currentQuestion: LiveQuestion | null;
  questionResult: QuestionResult | null;
  leaderboard: LeaderboardEntry[];
  selectedAnswer: number | null;
  answerSubmitted: boolean;
  playerId: string | null;
  playerName: string | null;
  isReconnecting: boolean;

  setSession: (sessionId: string, status: Session['status']) => void;
  setPlayers: (players: Player[]) => void;
  setQuestion: (question: LiveQuestion | null) => void;
  setQuestionResult: (result: QuestionResult | null) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  selectAnswer: (index: number) => void;
  submitAnswer: () => void;
  setPlayer: (id: string, name: string) => void;
  setReconnecting: (val: boolean) => void;
  setStatus: (status: Session['status']) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  status: null as Session['status'] | null,
  players: [],
  currentQuestion: null,
  questionResult: null,
  leaderboard: [],
  selectedAnswer: null,
  answerSubmitted: false,
  playerId: null,
  playerName: null,
  isReconnecting: false,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  setSession: (sessionId, status) => set({ sessionId, status }),
  setPlayers: (players) => set({ players }),
  setQuestion: (question) =>
    set({ currentQuestion: question, selectedAnswer: null, answerSubmitted: false, questionResult: null }),
  setQuestionResult: (result) => set({ questionResult: result }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  selectAnswer: (index) => set({ selectedAnswer: index }),
  submitAnswer: () => set({ answerSubmitted: true }),
  setPlayer: (id, name) => set({ playerId: id, playerName: name }),
  setReconnecting: (val) => set({ isReconnecting: val }),
  setStatus: (status) => set({ status }),
  reset: () => set(initialState),
}));
