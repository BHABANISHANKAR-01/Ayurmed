import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email);
    // The useEffect above will handle the redirect once 'user' state updates
    setIsSubmitting(false);
  };

  const setDemoUser = (roleEmail: string) => {
    setEmail(roleEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
            <Activity className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">AyurMed India</h1>
          <p className="text-slate-400 mt-2">Secure Hospital Management Platform</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="you@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in...' : <><span className="mr-1">Sign In</span> <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-500 mb-4">Demo Logins (Click to fill)</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setDemoUser('rajesh@example.com')} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Patient</button>
              <button onClick={() => setDemoUser('anjali@hospital.com')} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Doctor</button>
              <button onClick={() => setDemoUser('admin@hospital.com')} className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100">Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;