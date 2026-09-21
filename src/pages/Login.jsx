import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ImageCarousel from '../components/ImageCarousel';
import PublicNavbar from '../components/PublicNavbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState('login'); // 'login', 'request-otp', 'reset-password'
  
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login, requestPasswordReset, resetPassword } = useAuth();
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

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      await requestPasswordReset(resetEmail);
      setView('reset-password');
      setSuccessMsg('OTP sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      await resetPassword(resetEmail, otp, newPassword);
      setView('login');
      setSuccessMsg('Password reset successful. Please sign in.');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-transparent text-slate-900 relative font-sans overflow-hidden">
      
      {/* Exact Header matching Landing Page */}
      <div className="bg-[#e5e7eb] rounded-b-[3rem] pb-4 relative px-4 sm:px-8">
        <PublicNavbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 pb-12">
        
        <div className="w-full max-w-5xl h-[520px] flex bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden">
          {/* Left Side: Carousel */}
          <div className="hidden md:block w-1/2 h-full relative border-r border-slate-100">
            <ImageCarousel className="absolute inset-0 w-full h-full" />
          </div>
          
          {/* Right Side: Form */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-between overflow-y-auto">
            <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Prismo Constructions</h1>
            <p className="text-slate-500 text-lg">
              {view === 'login' ? 'Welcome back. Please sign in.' : 
               view === 'request-otp' ? 'Enter your email to receive an OTP.' : 
               'Enter OTP and new password.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-2 mt-4 text-center border border-red-200 font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-3 rounded text-sm mb-2 mt-4 text-center border border-green-200 font-medium">
              {successMsg}
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="flex-1 flex flex-col justify-center space-y-4 my-6">
              <div>
                <input 
                  required 
                  type="email" 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="Email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <input 
                  required 
                  type="password" 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="Password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => { setView('request-otp'); setError(''); setSuccessMsg(''); }}
                    className="text-sm text-primary font-semibold hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button 
                disabled={isLoading}
                type="submit" 
                className="w-full flex items-center justify-center px-4 py-4 bg-[#1e2a35] text-white rounded-xl font-bold text-lg hover:bg-primary hover:text-[#022c22] transition-colors disabled:opacity-70 mt-2 shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  "SIGN IN"
                )}
              </button>
            </form>
          )}

          {view === 'request-otp' && (
            <form onSubmit={handleRequestOtp} className="flex-1 flex flex-col justify-center space-y-4 my-6">
              <div>
                <input 
                  required 
                  type="email" 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="Email address..."
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>

              <button 
                disabled={isLoading}
                type="submit" 
                className="w-full flex items-center justify-center px-4 py-4 bg-primary text-[#022c22] rounded-xl font-bold text-lg hover:bg-[#1e2a35] hover:text-white transition-colors disabled:opacity-70 mt-2 shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#022c22]/30 border-t-[#022c22] rounded-full animate-spin"></div>
                ) : (
                  "SEND OTP"
                )}
              </button>

              <div className="flex justify-center mt-4">
                <button 
                  type="button" 
                  onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                  className="text-sm text-slate-500 font-semibold hover:text-slate-800 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {view === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="flex-1 flex flex-col justify-center space-y-4 my-6">
              <div>
                <input 
                  required 
                  type="text" 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="Enter OTP..."
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <div>
                <input 
                  required 
                  type="password" 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="New Password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button 
                disabled={isLoading}
                type="submit" 
                className="w-full flex items-center justify-center px-4 py-4 bg-primary text-[#022c22] rounded-xl font-bold text-lg hover:bg-[#1e2a35] hover:text-white transition-colors disabled:opacity-70 mt-2 shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#022c22]/30 border-t-[#022c22] rounded-full animate-spin"></div>
                ) : (
                  "RESET PASSWORD"
                )}
              </button>

              <div className="flex justify-center mt-4">
                <button 
                  type="button" 
                  onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                  className="text-sm text-slate-500 font-semibold hover:text-slate-800 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

            <div className="text-center text-sm text-slate-500">
            </div>
          </div>
        </div>
      </main>

      {/* Decorative background element */}
      <div className="absolute -bottom-32 -right-32 text-slate-200 opacity-50 pointer-events-none z-0">
        <div className="w-96 h-96 border-[40px] border-current rounded-full"></div>
      </div>
    </div>
  );
};

export default Login;
