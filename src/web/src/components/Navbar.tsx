import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';
import logo from '../assets/logo.png';
import { Badge } from './ui/badge';
import { toast } from 'sonner';


export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex py-4 items-center justify-between px-5">
        <Link to="/" className="flex items-center text-foreground ml-3">
          <div className="w-50 h-12">
            <img src={logo} alt="Quizdom logo" className="w-full h-full object-cover" />
          </div>            
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/join">
            <Button variant="ghost" size="sm">Join Quiz</Button>
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Profile</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-red-200 text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>

            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
