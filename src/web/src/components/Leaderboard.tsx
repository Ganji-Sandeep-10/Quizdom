import { motion, AnimatePresence } from 'framer-motion';
import type { LeaderboardEntry } from '../types/quiz';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: string | null;
  maxEntries?: number;
}

const rankColors = [
  'bg-[hsl(var(--leaderboard-gold))] text-foreground',
  'bg-[hsl(var(--leaderboard-silver))] text-foreground',
  'bg-[hsl(var(--leaderboard-bronze))] text-foreground',
];

export const Leaderboard = ({ entries, currentPlayerId, maxEntries = 10 }: LeaderboardProps) => {
  const displayed = entries.slice(0, maxEntries);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg text-foreground">Leaderboard</h3>
      </div>
      <AnimatePresence mode="popLayout">
        {displayed.map((entry, i) => (
          <motion.div
            key={entry.playerId}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
              entry.playerId === currentPlayerId
                ? 'bg-primary/10 border border-primary/20'
                : 'bg-card border border-border'
            }`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              i < 3 ? rankColors[i] : 'bg-muted text-muted-foreground'
            }`}>
              {entry.rank}
            </div>
            <span className="flex-1 font-medium text-foreground truncate">
              {entry.playerName}
              {entry.playerId === currentPlayerId && (
                <span className="ml-2 text-xs text-primary">(You)</span>
              )}
            </span>
            <motion.span
              key={entry.score}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="font-bold text-primary tabular-nums"
            >
              {entry.score.toLocaleString()}
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
      {entries.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No scores yet</p>
      )}
    </div>
  );
};
