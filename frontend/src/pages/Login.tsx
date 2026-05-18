import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    clearError();
  }, [isAuthenticated, navigate]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email address format';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // API error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-[#07080c] px-4 transition-colors duration-200 font-sans">
      
      <div className="w-full max-w-[380px] space-y-6">
        
        <div className="flex flex-col items-center text-center">
          <div className="h-10 w-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md">
            <Layers className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-4">
            Sign in to Smart Leads
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1.5">
            Enter your credentials to access your CRM workspace
          </p>
        </div>

        <div className="bg-white dark:bg-[#0d0f17] border border-slate-200/60 dark:border-slate-900/60 rounded-xl shadow-2xl p-6 md:p-8 space-y-5">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="flex items-start space-x-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-455 p-3 rounded-lg text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail size={13} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@workspace.com"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-[#07080c] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-500 ${
                    validationErrors.email ? 'border-rose-500 ring-rose-500/10' : 'border-slate-200/60 dark:border-slate-900/60'
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock size={13} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-[#07080c] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-500 ${
                    validationErrors.password ? 'border-rose-500 ring-rose-500/10' : 'border-slate-200/60 dark:border-slate-900/60'
                  }`}
                />
              </div>
              {validationErrors.password && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{validationErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <LogIn size={13} />
              )}
              <span>Sign In</span>
            </button>
          </form>

        </div>

        <div className="text-center">
          <p className="text-xs text-slate-550 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
