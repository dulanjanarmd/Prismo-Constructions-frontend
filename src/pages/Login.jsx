import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, Server, Activity, Info, Network, Fingerprint, ShieldCheck, ChevronDown, MapPin, Laptop, X } from 'lucide-react';
import ImageCarousel from '../components/ImageCarousel';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMfa, setIsSendingMfa] = useState(false);
  const [mfaSentMessage, setMfaSentMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [role, setRole] = useState('project_manager');
  const [mfaCode, setMfaCode] = useState('');
  const [time, setTime] = useState(new Date());
  const [ipAddress, setIpAddress] = useState('Fetching IP...');
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Fetch real IP address
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('127.0.0.1'));
      
    return () => clearInterval(timer);
  }, []);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    // Enforce Strong Password Policy (Client-side validation)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Invalid credentials or password does not meet security policy (minimum 8 characters, uppercase, lowercase, number, and special character).');
      setIsLoading(false);
      return;
    }
    
    if (mfaCode.length !== 6) {
      setError('MFA Authenticator code must be exactly 6 digits.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Pass role and mfaCode
      await login(email, password, role, mfaCode);
      navigate('/portal');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-900 relative font-sans overflow-hidden">
      
      {/* Background Concentric Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -left-[30vh] -bottom-[30vh] w-[140vh] h-[140vh] rounded-full border-[15vh] border-slate-300/30"></div>
        <div className="absolute -left-[15vh] -bottom-[15vh] w-[110vh] h-[110vh] rounded-full border-[12vh] border-slate-300/40"></div>
        <div className="absolute left-[0] bottom-[0] w-[80vh] h-[80vh] rounded-full bg-slate-300/50"></div>
      </div>
      
      {/* Background Watermark Name removed as per request */}
      
      {/* Top Left Live Clock */}
      <div className="absolute top-6 left-8 text-xs font-mono text-slate-400 z-10 hidden sm:block">
        <p>SYSTEM TIME (LOCAL)</p>
        <p className="font-bold text-slate-500 text-sm">{time.toLocaleTimeString()}</p>
        <div className="mt-2 space-y-1">
          <p className="flex items-center gap-1.5"><Server className="w-3 h-3 text-primary" /> Node: PR-AUTH-04</p>
          <p className="flex items-center gap-1.5"><Network className="w-3 h-3 text-primary" /> AES-256 Encrypted</p>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 py-4">
        
        <div className="w-full max-w-5xl h-[620px] flex bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden">
          {/* Left Side: Carousel */}
          <div className="hidden md:block w-1/2 h-full relative border-r border-slate-100">
            <ImageCarousel className="absolute inset-0 w-full h-full" />
            
            {/* Internal Bulletin Overlay on Image */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent text-white">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Internal Security Bulletin</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Notice: All access is logged and monitored. Ensure your MFA device is active. 
                Unauthorized access attempts will be reported to the IT Security team automatically.
              </p>
            </div>
          </div>
          
          {/* Right Side: Form */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
            <div className="text-center flex flex-col items-center">
              <img src="/prismo-logo.png" alt="Prismo Constructions Logo" className="h-14 mb-3 object-contain" />
              <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border border-slate-200">
                <Lock className="w-3 h-3 text-primary" />
                Authorized Personnel Only
              </div>
            </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-2.5 rounded text-xs mb-1 mt-2 text-center border border-red-200 font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-2.5 rounded text-xs mb-1 mt-2 text-center border border-green-200 font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex-1 flex flex-col justify-center space-y-3.5 mt-2">
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assigned Role (RBAC)</label>
                <div className="relative">
                  <div 
                    onClick={() => {
                      // Toggle dropdown
                      const el = document.getElementById('role-dropdown');
                      if (el) el.classList.toggle('hidden');
                    }}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary outline-none transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>
                      {role === 'admin' && 'System Administrator'}
                      {role === 'ceo' && 'Chief Executive Officer (CEO)'}
                      {role === 'project_manager' && 'Project Manager'}
                      {role === 'site_engineer' && 'Site Engineer'}
                      {role === 'client' && 'Client (Project Owner)'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                  
                  {/* Custom Dropdown Menu */}
                  <div id="role-dropdown" className="hidden absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden py-1">
                    {[
                      { id: 'admin', label: 'System Administrator' },
                      { id: 'ceo', label: 'Chief Executive Officer (CEO)' },
                      { id: 'project_manager', label: 'Project Manager' },
                      { id: 'site_engineer', label: 'Site Engineer' },
                      { id: 'client', label: 'Client (Project Owner)' }
                    ].map((r) => (
                      <div 
                        key={r.id}
                        onClick={() => {
                          setRole(r.id);
                          document.getElementById('role-dropdown').classList.add('hidden');
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${role === r.id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email</label>
                <input 
                  required 
                  type="email" 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="name@prismo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Network Password</label>
                  <span className="text-[9px] text-slate-500 font-semibold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-slate-400" /> Policy Enforced
                  </span>
                </div>
                <input 
                  required 
                  type="password" 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">MFA Authenticator Code</label>
                  {mfaSentMessage && <span className="text-[9px] text-emerald-600 font-semibold">{mfaSentMessage}</span>}
                </div>
                <div className="flex gap-2">
                  <input 
                    required 
                    type="text" 
                    maxLength={6}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 tracking-[0.5em] font-mono" 
                    placeholder="000000"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <button 
                    type="button" 
                    disabled={isSendingMfa || !email}
                    onClick={async () => {
                      if (!email) return;
                      setIsSendingMfa(true);
                      setError('');
                      setMfaSentMessage('');
                      try {
                        const res = await fetch('http://localhost:8080/api/auth/send-mfa', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email })
                        });
                        if (!res.ok) throw new Error('Failed to send MFA code');
                        setMfaSentMessage('Code sent to email!');
                      } catch (err) {
                        setError('Could not send MFA code. Verify your email.');
                      } finally {
                        setIsSendingMfa(false);
                      }
                    }}
                    className="whitespace-nowrap px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-300 transition-colors disabled:opacity-50"
                  >
                    {isSendingMfa ? 'SENDING...' : 'GET CODE'}
                  </button>
                </div>
              </div>

              <div className="pt-1 pb-1">
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    required
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div className="text-[10px] text-slate-500 group-hover:text-slate-700 transition-colors leading-snug">
                    I acknowledge that I am accessing a secure corporate system and agree to the{' '}
                    <span 
                      onClick={(e) => { e.preventDefault(); setShowPolicy(true); }} 
                      className="font-semibold text-slate-700 underline hover:text-primary transition-colors"
                    >
                      Information Security Policy
                    </span>.

                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button 
                  disabled={isLoading || !agreed}
                  type="submit" 
                  className="w-full flex items-center justify-center px-4 py-3 bg-[#1e2a35] text-white rounded-xl font-bold hover:bg-primary transition-colors disabled:opacity-50 shadow-md"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "SECURE SIGN IN"
                  )}
                </button>
              </div>
            </form>
            
          </div>
        </div>
      </main>
      
      {/* Information Security Policy Right-side Drawer */}
      <AnimatePresence>
        {showPolicy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white/95 backdrop-blur-xl w-full max-w-2xl h-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-slate-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-slate-100 z-10 shrink-0 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldAlert className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">Information Security Policy</h2>
                    <p className="text-xs text-slate-500 mt-1">Prismo Constructions Internal Portal Access Controls</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPolicy(false)} 
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Active Session Fingerprint */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Session Fingerprint</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Network className="w-4 h-4 text-slate-400" />
                      <span><strong>IP:</strong> {ipAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span><strong>Node:</strong> PR-AUTH-04 (LK-COLOMBO)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Laptop className="w-4 h-4 text-slate-400" />
                      <span><strong>Device:</strong> Authorized Workstation</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span><strong>Session Limit:</strong> 15 Minutes Idle</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">1. Access Control & Monitoring</h3>
                  <p>Access to this internal portal is restricted to authorized Prismo Constructions personnel only. All access attempts—whether successful or failed—are rigorously logged, monitored, and audited by the IT Security Department. Your current IP Address ({ipAddress}) and device fingerprint have been recorded.</p>
                  
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mt-6">2. Session Management</h3>
                  <p>For security purposes, your session will automatically terminate after exactly <strong>15 minutes of inactivity</strong>. Upon timeout, you will be forcibly disconnected and required to re-authenticate using your network password and Multi-Factor Authentication (MFA) device.</p>
                  
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mt-6">3. Data Confidentiality</h3>
                  <p>All project data, financial records, client blueprints, and communication histories contained within this portal are strictly classified as <strong>CONFIDENTIAL & INTERNAL</strong>. Unauthorized distribution, screenshotting, or sharing of credentials is grounds for immediate termination and potential legal action.</p>
                  
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mt-6">4. Incident Reporting</h3>
                  <p>If you suspect your credentials have been compromised or if you notice unauthorized activity on your account, you are required to report it immediately to the IT Helpdesk at <a href="mailto:security@prismo.com" className="text-primary hover:underline font-medium">security@prismo.com</a>.</p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-3">
                <button 
                  onClick={() => setShowPolicy(false)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => setShowPolicy(false)}
                  className="px-6 py-2.5 bg-[#1e2a35] text-white rounded-lg font-bold text-sm hover:bg-primary transition-colors shadow-sm"
                >
                  I Understand & Agree
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
