import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import logo from '../assets/logo.png';
import heroBg from '../assets/hero-bg.png';

const JoinPage = () => {
  const [sessionId, setSessionId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim() || !playerName.trim()) return;
    // Store player name for session page
    sessionStorage.setItem('quiz_player_name', playerName.trim());
    navigate(`/session/${sessionId.trim()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-50 h-12">
              <img src={logo} alt="Quizdom logo" className="w-full h-full object-cover" />
            </div>
            <p className="text-muted-foreground text-lg">Join a live quiz session</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="session-id">Session Code</Label>
              <Input
                id="session-id"
                placeholder="Enter session code"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="text-center text-lg font-mono tracking-widest"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="player-name">Your Name</Label>
              <Input
                id="player-name"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
                maxLength={20}
              />
            </div>
            <Button type="submit" className="w-full text-lg h-12">
              Join Quiz
            </Button>
          </form>
        </div>
      </div>

      <div className="h-48 w-full overflow-hidden opacity-20 pointer-events-none">
        <img src={heroBg} alt="" className="w-full h-full object-cover object-top" />
      </div>
    </div>
  );
};

export default JoinPage;
