import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Video, Check, X } from 'lucide-react';
import { authService } from '../services/auth';
import ThemeToggle from '../components/ThemeToggle';

export default function Signup({ theme, toggleTheme }) {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Floating label state helpers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Calculate password strength
    const pwd = formData.password;
    let strength = 0;
    if (pwd.length > 7) strength += 25;
    if (pwd.match(/[A-Z]/)) strength += 25;
    if (pwd.match(/[0-9]/)) strength += 25;
    if (pwd.match(/[^A-Za-z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 50) {
      setError('Please choose a stronger password');
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.signup(formData);
      // Dummy success
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-error';
    if (passwordStrength <= 50) return 'bg-yellow-500';
    if (passwordStrength <= 75) return 'bg-primary';
    return 'bg-green-500';
  };

  const inputClasses = "block w-full px-4 pt-6 pb-2 text-on-surface bg-surface-container-highest border border-outline/30 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary peer transition-colors";
  const labelClasses = "absolute text-sm text-on-surface-variant duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-primary";

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-secondary/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
      
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

      <div className="flex-1 flex items-center justify-center p-4 z-10 mt-16 mb-8">
        <div className="w-full max-w-xl">
          <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/5">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-on-surface mb-2">Create an account</h1>
              <p className="text-on-surface-variant">Start collaborating with your team today.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-error-container/50 border border-error/50 text-on-error-container text-sm flex items-center gap-2">
                <X className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <input type="text" name="fullName" id="fullName" className={inputClasses} placeholder=" " value={formData.fullName} onChange={handleChange} required />
                  <label htmlFor="fullName" className={labelClasses}>Full Name</label>
                </div>
                <div className="relative">
                  <input type="text" name="username" id="username" className={inputClasses} placeholder=" " value={formData.username} onChange={handleChange} required />
                  <label htmlFor="username" className={labelClasses}>Username</label>
                </div>
              </div>

              <div className="relative">
                <input type="email" name="email" id="email" className={inputClasses} placeholder=" " value={formData.email} onChange={handleChange} required />
                <label htmlFor="email" className={labelClasses}>Email Address</label>
              </div>

              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" id="password" className={inputClasses} placeholder=" " value={formData.password} onChange={handleChange} required />
                <label htmlFor="password" className={labelClasses}>Password</label>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors p-1 z-20">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2 mt-1">
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: `${passwordStrength}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Password strength</span>
                    <span>
                      {passwordStrength <= 25 && 'Weak'}
                      {passwordStrength > 25 && passwordStrength <= 50 && 'Fair'}
                      {passwordStrength > 50 && passwordStrength <= 75 && 'Good'}
                      {passwordStrength > 75 && 'Strong'}
                    </span>
                  </div>
                </div>
              )}

              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="confirmPassword" id="confirmPassword" className={inputClasses} placeholder=" " value={formData.confirmPassword} onChange={handleChange} required />
                <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password</label>
                {formData.confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant z-20">
                    {formData.password === formData.confirmPassword ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-error" />}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-lg hover:bg-surface-tint transition-all shadow-glow disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-surface-tint transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
