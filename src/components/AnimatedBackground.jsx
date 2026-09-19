import React from 'react';
import { useLocation } from 'react-router-dom';

const AnimatedBackground = () => {
  const location = useLocation();
  
  if (location.pathname.startsWith('/portal')) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-white pointer-events-none">
      {/* Base Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 opacity-90" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9InBhdHRlcm4iIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem00MCAwdjQwSDBWMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCA0MGw0MC00MCIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] opacity-30" />

      {/* Blob 1 */}
      <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#f5a623]/10 to-[#fca311]/15 mix-blend-multiply blur-[100px] animate-blob" />

      {/* Blob 2 */}
      <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#fca311]/10 to-[#ffb74d]/10 mix-blend-multiply blur-[120px] animate-blob animation-delay-2000" />

      {/* Blob 3 */}
      <div className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] rounded-full bg-gradient-to-r from-[#f5a623]/5 to-[#fca311]/10 mix-blend-multiply blur-[150px] animate-blob animation-delay-4000" />
      
      {/* Abstract Lines (Subtle SVG Overlay) */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <path d="M-100,500 Q200,800 600,300 T1500,600" fill="none" stroke="#f5a623" strokeWidth="2" />
        <path d="M-100,200 Q400,-100 800,400 T1800,200" fill="none" stroke="#1e2a35" strokeWidth="1" />
        <circle cx="80%" cy="70%" r="15" fill="none" stroke="#f5a623" strokeWidth="2" />
        <circle cx="20%" cy="30%" r="8" fill="none" stroke="#1e2a35" strokeWidth="1" />
        <circle cx="60%" cy="10%" r="5" fill="#fca311" />
      </svg>
    </div>
  );
};

export default AnimatedBackground;
