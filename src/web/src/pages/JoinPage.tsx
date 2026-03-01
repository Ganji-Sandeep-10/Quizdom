import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuthStore } from '../stores/authStore';
import { sessionApi } from '../services/api';
import { toast } from 'sonner';
import logo from '../assets/logo.png';
import heroBg from '../assets/hero-bg.png';

const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  
  const [sessionCode, setSessionCode] = useState(initialCode);
  const [isResolving, setIsResolving] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      toast.error('Please login to join a quiz');
      navigate(`/login?redirect=${redirect}`);
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Auto-resolve if code is provided in URL and user is authed
  useEffect(() => {
    if (isAuthenticated && initialCode.length === 6 && !isResolving) {
      handleJoinAction(initialCode);
    }
  }, [isAuthenticated, initialCode]);

  const handleJoinAction = async (code: string) => {
    if (!user) return;
    setIsResolving(true);
    try {
      const { data } = await sessionApi.getByCode(code.trim());
      sessionStorage.setItem('quiz_player_name', user.name);
      navigate(`/session/${data.session.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid session code');
    } finally {
      setIsResolving(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim() || !user) return;
    handleJoinAction(sessionCode);
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-50 h-12 mx-auto">
              <img src={logo} alt="Quizdom logo" className="w-full h-full object-contain" />
            </div>
            <p className="text-muted-foreground text-lg">Join a live quiz session</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="session-id">6-Digit Session Code</Label>
              <Input
                id="session-id"
                placeholder="000000"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl font-mono tracking-[0.5em]"
                required
                disabled={isResolving}
              />
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
              <p className="text-sm text-muted-foreground">Joining as</p>
              <p className="font-bold text-foreground">{user?.name}</p>
            </div>
            <Button type="submit" className="w-full text-lg h-12" disabled={isResolving || sessionCode.length < 6}>
              {isResolving ? 'Joining...' : 'Join Quiz'}
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
