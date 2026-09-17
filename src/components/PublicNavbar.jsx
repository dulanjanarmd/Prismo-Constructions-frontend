import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const PublicNavbar = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/services', label: 'Services' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/about', label: 'About Us' },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="py-6 px-4 mx-auto w-full max-w-7xl flex flex-col md:flex-row md:items-center justify-between z-50 relative"
      >
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center h-16 transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <img src="/prismo-logo.png" alt="Prismo Construction" className="h-full object-contain" />
            </Link>
            
            <nav className="hidden md:flex bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-xl p-1 items-center space-x-1 text-sm font-semibold uppercase text-slate-600">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className="relative px-5 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full"
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white shadow-sm rounded-lg"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-slate-900 font-bold' : 'hover:text-slate-900'}`}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        
        <div className="hidden md:flex items-center bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-xl p-1 space-x-1 text-sm font-bold uppercase">
          {location.pathname === '/login' ? (
            <Link to="/register" className="px-6 py-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all duration-200 h-full flex items-center">
              Sign Up
            </Link>
          ) : (
            <Link to="/login" className="px-6 py-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all duration-200 h-full flex items-center">
              Sign In
            </Link>
          )}
          <a 
            href={location.pathname === '/' ? '#contact' : '/#contact'} 
            className="relative group h-full flex items-center bg-gradient-to-r from-[#f5a623] to-[#fca311] text-white px-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
            <span className="relative z-10">Request Consultation</span>
          </a>
        </div>
      </motion.header>
    </>
  );
};

export default PublicNavbar;
