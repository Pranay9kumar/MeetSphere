import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Video, Mail } from 'lucide-react';
import { authService } from '../services/auth';
import ThemeToggle from '../components/ThemeToggle';

export default function Login({ theme, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login(email, password);
      // Dummy success, usually you would save token and redirect to dashboard
      navigate('/'); // For now redirect to home or dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-secondary/20 rounded-full mix-blend-screen filter blur-[100px] animation-delay-2000"></div>

      {/* Header */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Video className="w-5 h-5 text-on-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-on-surface">MeetSphere</span>
        </Link>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 shadow-2xl border border-white/5">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-on-surface mb-2">Welcome back</h1>
              <p className="text-on-surface-variant text-sm">Enter your details to access your workspace.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-error-container text-on-error-container text-sm flex items-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1 relative">
                <label className="text-sm font-medium text-on-surface-variant block mb-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-highest border border-outline/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-on-surface-variant">Password</label>
                  <a href="#" className="text-xs font-medium text-primary hover:text-surface-tint transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-outline/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded border-outline/30 text-primary focus:ring-primary bg-surface-container-highest"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-on-surface-variant">
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-surface-tint transition-all shadow-glow disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-primary hover:text-surface-tint transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
