import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      await login(email, password);
      navigate('/portal');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl mx-4">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-ethnocentric text-slate-800 mb-2">Prismo</h1>
          <p className="text-slate-500 font-medium">Internal Management System</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50/80 backdrop-blur-sm text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-200 font-medium">
            {error}
          </motion.div>
        )}

        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50/80 backdrop-blur-sm text-green-700 p-3 rounded-lg text-sm mb-6 text-center border border-green-200 font-medium">
            {successMsg}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              required 
              type="email" 
              className="w-full rounded-lg bg-white/80 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-400 shadow-sm" 
              placeholder="name@prismo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input 
              required 
              type="password" 
              className="w-full rounded-lg bg-white/80 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-400 shadow-sm" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={isLoading}
            type="submit" 
            className="w-full flex items-center justify-center px-4 py-3.5 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-70 mt-6 shadow-md shadow-primary/30"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
