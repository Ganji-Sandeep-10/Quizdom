import { Badge } from './ui/badge';

interface SessionStatusBadgeProps {
  status: 'WAITING' | 'LIVE' | 'ENDED';
}

export const SessionStatusBadge = ({ status }: SessionStatusBadgeProps) => {
  const variants: Record<string, string> = {
    WAITING: 'bg-warning/15 text-warning border-warning/30',
    LIVE: 'bg-success/15 text-success border-success/30',
    ENDED: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <Badge variant="outline" className={`${variants[status]} font-medium`}>
      {status === 'LIVE' && <span className="mr-1 inline-block h-2 w-2 rounded-full bg-success animate-pulse" />}
      {status}
    </Badge>
  );
};
