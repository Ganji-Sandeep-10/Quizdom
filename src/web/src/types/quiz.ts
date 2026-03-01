export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOptionIndex: number;
  duration: number; // seconds
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Session {
  id: string;
  code: string;
  quizId: string;
  quizTitle?: string;
  status: 'WAITING' | 'LIVE' | 'ENDED';
  currentQuestionIndex: number;
  totalQuestions: number;
  players: Player[];
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isConnected: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  lastScore?: number;
}

export interface LiveQuestion {
  index: number;
  text: string;
  options: QuestionOption[];
  endTime: number; // server timestamp
  totalQuestions: number;
}

export interface QuestionResult {
  questionIndex: number;
  correctOptionIndex: number;
  playerAnswer?: number;
  isCorrect?: boolean;
}

// Socket event payloads
export interface SessionStatePayload {
  sessionId: string;
  status: Session['status'];
  currentQuestionIndex: number;
  totalQuestions: number;
  players: Player[];
  question?: LiveQuestion;
  leaderboard?: LeaderboardEntry[];
}

export interface QuestionStartedPayload {
  question: LiveQuestion;
}

export interface QuestionEndedPayload {
  correctOptionIndex: number;
  questionIndex: number;
}

export interface LeaderboardPayload {
  leaderboard: LeaderboardEntry[];
}
