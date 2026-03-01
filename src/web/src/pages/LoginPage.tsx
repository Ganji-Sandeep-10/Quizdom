import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import logo from '../assets/logo.png';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(redirectPath);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/">
              <div className="inline-flex w-50 h-12">
                <img src={logo} alt="Quizdom logo" className="w-full h-full object-cover" />
              </div>            
            </Link>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sign In
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to={`/register${redirectPath !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`} className="text-primary font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="h-48 w-full overflow-hidden opacity-20 pointer-events-none">
        <img src={heroBg} alt="" className="w-full h-full object-cover object-top" />
      </div>
    </div>
  );
};

export default LoginPage;
