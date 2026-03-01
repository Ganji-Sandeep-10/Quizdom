import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  endTime: number;
  onExpire?: () => void;
}

export const CountdownTimer = ({ endTime, onExpire }: CountdownTimerProps) => {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
  const [total] = useState(() => Math.max(1, Math.ceil((endTime - Date.now()) / 1000)));

  const handleExpire = useCallback(() => {
    onExpire?.();
  }, [onExpire]);

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0) {
        clearInterval(interval);
        handleExpire();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [endTime, handleExpire]);

  const progress = total > 0 ? remaining / total : 0;
  const isUrgent = remaining <= 5;
  const circumference = 2 * Math.PI * 45;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="6"
        />
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={isUrgent ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transition={{ duration: 0.1 }}
        />
      </svg>
      <span className={`absolute text-2xl font-bold ${isUrgent ? 'text-destructive' : 'text-foreground'}`}>
        {remaining}
      </span>
    </div>
  );
};
