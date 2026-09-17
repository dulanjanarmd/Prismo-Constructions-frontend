import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ImageCarousel from '../components/ImageCarousel';
import PublicNavbar from '../components/PublicNavbar';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Reset Password
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { requestPasswordReset, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      await requestPasswordReset(email);
      setStatus({ type: 'success', message: 'OTP sent to your email.' });
      setStep(2);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      await resetPassword(email, otp, newPassword);
      setStatus({ type: 'success', message: 'Password reset successfully. You can now login.' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#e5e7eb] text-slate-900 relative font-sans overflow-y-auto">
      {/* Exact Header matching Landing Page */}
      <div className="relative px-4 sm:px-8">
        <PublicNavbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl h-[600px] flex bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden"
        >
          {/* Left Side: Carousel */}
          <div className="hidden md:block w-1/2 h-full relative border-r border-slate-100">
            <ImageCarousel className="absolute inset-0 w-full h-full" />
          </div>
          
          {/* Right Side: Form */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-between">
            <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Reset Password</h1>
            <p className="text-slate-500 text-lg">
              {step === 1 ? 'Enter your email to receive an OTP.' : 'Enter the OTP sent to your email and your new password.'}
            </p>
          </div>

          {status.message && (
            <div className={`p-3 rounded text-sm mb-6 text-center border font-medium ${
              status.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {status.message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="flex-1 flex flex-col justify-center space-y-6 my-6">
              <div>
                <input 
                  required 
                  type="email" 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button 
                disabled={isLoading}
                type="submit" 
                className="w-full flex items-center justify-center px-4 py-4 bg-[#1e2a35] text-white rounded-xl font-bold text-lg hover:bg-primary hover:text-[#022c22] transition-colors disabled:opacity-70 mt-6 shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  "SEND OTP"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="flex-1 flex flex-col justify-center space-y-6 my-6">
              <div>
                <input 
                  required 
                  type="text" 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <div>
                <input 
                  required 
                  type="password" 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button 
                disabled={isLoading || status.type === 'success'}
                type="submit" 
                className="w-full flex items-center justify-center px-4 py-4 bg-[#1e2a35] text-white rounded-xl font-bold text-lg hover:bg-primary hover:text-[#022c22] transition-colors disabled:opacity-70 mt-6 shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  "RESET PASSWORD"
                )}
              </button>
            </form>
          )}

            <div className="text-center text-sm text-slate-500">
              Remember your password? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </div>
          </div>
        </motion.div>
      </main>

      <div className="absolute -bottom-32 -right-32 text-slate-200 opacity-50 pointer-events-none z-0">
        <div className="w-96 h-96 border-[40px] border-current rounded-full"></div>
      </div>
    </div>
  );
};

export default ResetPassword;
