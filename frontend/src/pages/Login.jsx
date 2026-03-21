import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const DEMO_CREDENTIALS = [
  { email: 'operator@boxtrack.internal', password: 'demo123', role: 'operator', name: 'Demo Operator' },
  { email: 'manager@boxtrack.internal', password: 'demo123', role: 'manager', name: 'Demo Manager' },
];

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDemoLogin = (demoEmail) => {
    const demo = DEMO_CREDENTIALS.find(d => d.email === demoEmail);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      login(response.data.accessToken, response.data.user);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm p-6 space-y-6 bg-card rounded-lg border border-border shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AS</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AgniSight</h1>
          </div>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>
        
        {error && <div className="text-destructive text-sm text-center font-medium bg-destructive/10 p-2 rounded">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@boxtrack.internal"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground text-center mb-3 font-medium">Demo Credentials</p>
          <div className="space-y-2">
            {DEMO_CREDENTIALS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => handleDemoLogin(demo.email)}
                className="w-full p-2 text-xs text-left rounded border border-input hover:bg-secondary transition-colors"
              >
                <div className="font-medium text-foreground">{demo.email}</div>
                <div className="text-muted-foreground">Password: {demo.password} • Role: {demo.role}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 text-center text-xs text-muted-foreground">
          <p>
            New to AgniSight?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-primary font-medium hover:underline"
            >
              Learn more
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
