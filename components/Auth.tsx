
import React, { useState } from 'react';
import { User } from '../types';
import { AuthService } from '../services/authService';
import { Loader2, Chrome, Apple, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

interface AuthProps {
  onLogin: (user: User) => void;
  onOpenPrivacy: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onOpenPrivacy }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'ADMIN'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      let user: User;
      if (mode === 'ADMIN' || mode === 'LOGIN') {
        user = await AuthService.login(email, password);
      } else {
        user = await AuthService.register(name, email, password);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(''); setIsLoading(true);
    try { const user = await AuthService.loginWithGoogle(); onLogin(user); } catch (err) { setError("Google Sign-In failed"); } finally { setIsLoading(false); }
  };

  const handleAppleLogin = async () => {
    setError(''); setIsLoading(true);
    try { const user = await AuthService.loginWithApple(); onLogin(user); } catch (err) { setError("Apple Sign-In failed"); } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center animate-spring-in">
      <div className="ultra-glass rounded-[32px] p-8 w-full shadow-ios-float">
        <div className="flex flex-col items-center mb-8">
           <h2 className="text-lg font-semibold text-white mb-1">
             {mode === 'ADMIN' ? 'Admin Access' : mode === 'REGISTER' ? 'Create Account' : 'Welcome Back'}
           </h2>
           <p className="text-xs text-gray-500">Sign in to continue to Chronos</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white px-4 py-3 outline-none focus:border-white/30 transition-colors" required />
          )}
          <input type="text" placeholder={mode === 'ADMIN' ? 'Admin ID' : 'Email'} value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white px-4 py-3 outline-none focus:border-white/30 transition-colors" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white px-4 py-3 outline-none focus:border-white/30 transition-colors" required />

          <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={18}/> : (mode === 'REGISTER' ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        {mode !== 'ADMIN' && (
          <div className="space-y-3 mt-6 pt-6 border-t border-white/10">
              <button onClick={handleAppleLogin} type="button" disabled={isLoading} className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.23 3.97-.68.21.08.47.16.77.29-1.81 1.23-2.26 3.61-1.18 5.46 1.12 1.84 3.15 2.21 3.79 2.25-.18.7-.48 1.66-1.43 2.91M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/></svg>
                 Continue with Apple
              </button>
              <button onClick={handleGoogleLogin} type="button" disabled={isLoading} className="w-full bg-white text-black py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                <Chrome size={16} />
                Continue with Google
              </button>
          </div>
        )}

        <div className="mt-6 text-center space-y-4">
          <button onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); }} className="text-xs text-gray-500 hover:text-white transition-colors">
              {mode === 'LOGIN' ? "Create account" : "Already have an account?"}
          </button>
          
          <div className="flex justify-center gap-4 text-[10px] text-gray-600">
              <button onClick={onOpenPrivacy} className="hover:text-gray-400">Privacy</button>
              <button onClick={onOpenPrivacy} className="hover:text-gray-400">Terms</button>
              <button onClick={() => setMode('ADMIN')} className="hover:text-gray-400">Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
};
