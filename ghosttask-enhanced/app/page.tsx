'use client';

import React, { useState, useEffect } from 'react';
import Dashboard from './dashboard/page';
import { Lock, Mail, User, Sparkles, CheckSquare, Eye, EyeOff } from 'lucide-react';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem('ghosttask_token');
    const savedUser = localStorage.getItem('ghosttask_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const url = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering ? { name, email, password } : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Authentication failed');
      localStorage.setItem('ghosttask_token', data.data.token);
      localStorage.setItem('ghosttask_user', JSON.stringify(data.data.user));
      setToken(data.data.token);
      setUser(data.data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ghosttask_token');
    localStorage.removeItem('ghosttask_user');
    setToken(null);
    setUser(null);
    setName(''); setEmail(''); setPassword('');
  };

  if (!mounted) return null;
  if (token) return <Dashboard user={user} token={token} onLogout={handleLogout} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a081a] relative overflow-hidden font-sans p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#110e2e]/80 border border-[#231e5e]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex bg-indigo-600 p-3.5 rounded-2xl text-white shadow-xl shadow-indigo-600/30 items-center justify-center">
            <CheckSquare className="h-7 w-7 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl tracking-tight text-white flex items-center justify-center gap-1.5">
              GhostTask <span className="text-indigo-400 font-normal text-xs uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded">AI</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {isRegistering ? 'Create your smart account to get started' : 'Sign in to access your personal timeline'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl text-center">{errorMsg}</div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input type="text" required placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#16123a] border border-[#262164] rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#16123a] border border-[#262164] rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#16123a] border border-[#262164] rounded-2xl pl-10 pr-10 py-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-white">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white font-bold text-xs py-3.5 rounded-2xl transition shadow-lg shadow-indigo-600/10 flex items-center justify-center space-x-2 cursor-pointer mt-6">
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Sparkles className="h-4 w-4" /><span>{isRegistering ? 'Sign Up' : 'Sign In'}</span></>
            )}
          </button>
        </form>

        <div className="text-center">
          <button onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition">
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
