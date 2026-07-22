import { useState } from 'react';
import { Flame, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Dumbbell, Users } from 'lucide-react';
import { useAuth } from '../lib/auth';
import type { Role } from '../types';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await signIn(email.trim(), password);
        if (err) setError(err);
      } else {
        const { error: err } = await signUp(email.trim(), password, name.trim(), role);
        if (err) setError(err);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (e: React.MouseEvent, demoEmail: string) => {
    e.preventDefault();
    setEmail(demoEmail);
    setPassword('demo1234');
    setMode('login');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0F172A] dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center glow-teal">
            <Flame size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">FitForge</h1>
            <p className="text-slate-400 text-sm mt-1">Train smarter. Track everything.</p>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          {/* Mode tabs */}
          <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 animate-fade-in">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="input-field w-full pl-9"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field w-full pl-9"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full pl-9"
                  disabled={loading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all ${
                      role === 'client'
                        ? 'bg-teal-500/15 border-teal-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Dumbbell size={20} className={role === 'client' ? 'text-teal-400' : 'text-slate-400'} />
                    <span className="text-sm font-semibold">Client</span>
                    <span className="text-[10px] text-slate-500">Track workouts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('trainer')}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all ${
                      role === 'trainer'
                        ? 'bg-blue-500/15 border-blue-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Users size={20} className={role === 'trainer' ? 'text-blue-400' : 'text-slate-400'} />
                    <span className="text-sm font-semibold">Trainer</span>
                    <span className="text-[10px] text-slate-500">Coach clients</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Please wait...</>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-5 card p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
            Demo Accounts — Click to autofill
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={(e) => fillDemo(e, 'alex@fitforge.app')}
              className="w-full flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all text-left"
            >
              <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Dumbbell size={15} className="text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">Client Demo</div>
                <div className="text-xs text-slate-500">alex@fitforge.app</div>
              </div>
              <ArrowRight size={14} className="text-slate-600" />
            </button>
            <button
              type="button"
              onClick={(e) => fillDemo(e, 'marcus@fitforge.app')}
              className="w-full flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all text-left"
            >
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Users size={15} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">Trainer Demo</div>
                <div className="text-xs text-slate-500">marcus@fitforge.app</div>
              </div>
              <ArrowRight size={14} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}