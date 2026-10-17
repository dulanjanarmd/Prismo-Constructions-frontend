import React, { useState, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  Briefcase, 
  CheckSquare, 
  Camera, 
  MessageSquare, 
  Menu, 
  X,
  LogOut,
  User,
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Activity,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ProfileModal from './ProfileModal';
import NotificationDrawer from './NotificationDrawer';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 bg-white text-red-600">
        <h1 className="text-2xl font-bold">React Crashed!</h1>
        <pre className="mt-4 p-4 bg-slate-100 rounded text-sm overflow-auto">{this.state.error?.toString()}</pre>
        <pre className="mt-4 p-4 bg-slate-100 rounded text-xs overflow-auto">{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);

  const unreadCount = notifications?.filter(n => !n.read)?.length || 0;

  const navItems = {
    admin: [
      { name: 'Admin Portal', path: '/portal/admin', icon: <Shield className="w-4 h-4 mr-2" /> },
    ],
    ceo: [
      { name: 'Portfolio', path: '/portal', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    ],
    project_manager: [
      { name: 'Dashboard', path: '/portal', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
      { name: 'Projects', path: '/portal/projects', icon: <Briefcase className="w-4 h-4 mr-2" /> },
      { name: 'Tasks', path: '/portal/tasks', icon: <CheckSquare className="w-4 h-4 mr-2" /> },
      { name: 'Approvals', path: '/portal/approvals', icon: <MessageSquare className="w-4 h-4 mr-2" /> },
    ],
    site_engineer: [
      { name: 'Dashboard', path: '/portal', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
      { name: 'Tasks', path: '/portal/tasks', icon: <CheckSquare className="w-4 h-4 mr-2" /> },
      { name: 'Daily Logs', path: '/portal/logs', icon: <Camera className="w-4 h-4 mr-2" /> },
      { name: 'Issues', path: '/portal/issues', icon: <AlertTriangle className="w-4 h-4 mr-2" /> },
      { name: 'Projects', path: '/portal/projects', icon: <Briefcase className="w-4 h-4 mr-2" /> },
    ],
    client: [
      { name: 'Dashboard', path: '/portal', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
      { name: 'My Projects', path: '/portal/projects', icon: <Briefcase className="w-4 h-4 mr-2" /> },
      { name: 'Approvals', path: '/portal/approvals', icon: <CheckSquare className="w-4 h-4 mr-2" /> },
    ]
  };

  const roleNav = currentUser ? (navItems[currentUser.role?.toLowerCase()] || []) : [];

  return (
    <div className="bg-[#e5e7eb] rounded-b-2xl sm:rounded-b-[3rem] pb-2 sm:pb-4 relative px-3 sm:px-6 md:px-8 z-50">
      <header className="py-3 sm:py-6 mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between gap-2">
          {/* Left Side: Logo and Nav */}
          <div className="flex items-center space-x-2 min-w-0">
            <Link to="/portal" className="bg-white rounded-lg flex items-center justify-center h-10 sm:h-12 px-2.5 sm:px-3 shadow-md hover:opacity-90 transition-opacity shrink-0">
              <img src="/prismo-logo.png" alt="Prismo Construction" className="h-8 sm:h-10 w-auto object-contain" />
            </Link>
            <nav className="hidden lg:flex bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center space-x-1 text-sm font-bold text-slate-600">
              {roleNav.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative px-4 xl:px-5 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap ${
                      isActive 
                        ? 'bg-white shadow-sm text-slate-900 font-bold' 
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <span className="relative z-10 transition-colors duration-200">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Desktop Quick Actions */}
            <div className="hidden lg:flex items-center bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 gap-2 text-sm font-bold relative">
              <button
                onClick={() => setShowNotifications(true)}
                className="relative w-10 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="relative w-10 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all overflow-hidden"
                title="Profile"
              >
                {currentUser?.profilePictureUrl ? (
                  <img src={currentUser.profilePictureUrl} alt="Profile" className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <div className="w-full h-full rounded-lg bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm uppercase">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </button>
              <button 
                onClick={logout}
                className="px-5 py-2 bg-primary text-white rounded-lg transition-colors uppercase h-full flex items-center hover:opacity-90 font-bold tracking-wide"
              >
                SIGN OUT
              </button>
            </div>

            {/* Mobile / Tablet Notifications Button */}
            <button
              onClick={() => setShowNotifications(true)}
              className="lg:hidden relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-600 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-lg"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile / Tablet Profile Button */}
            <button 
              onClick={() => setShowProfileModal(true)}
              className="lg:hidden w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-600 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-lg overflow-hidden p-1"
              title="Profile"
            >
              {currentUser?.profilePictureUrl ? (
                <img src={currentUser.profilePictureUrl} alt="Profile" className="w-full h-full rounded-md object-cover" />
              ) : (
                <div className="w-full h-full rounded-md bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs sm:text-sm uppercase">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              )}
            </button>

            {/* Mobile / Tablet Menu Toggle */}
            <button 
              className="lg:hidden text-slate-700 bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden flex flex-col space-y-2 pt-4 pb-2 border-t border-slate-300/60 mt-3"
            >
              <div className="grid grid-cols-2 gap-2">
                {roleNav.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2.5 text-sm font-semibold transition-all rounded-lg ${
                        isActive 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'bg-white/80 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {item.icon}
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="border-t border-slate-300/80 pt-3 flex items-center justify-between px-2">
                <div className="flex items-center text-slate-700">
                  <User className="w-4 h-4 mr-2 text-primary" />
                  <span className="font-bold text-xs truncate max-w-[150px]">{currentUser?.name}</span>
                  <span className="text-[10px] ml-1.5 uppercase px-1.5 py-0.5 bg-slate-200 rounded font-bold text-slate-600">
                    {currentUser?.role}
                  </span>
                </div>
                <button 
                  onClick={logout}
                  className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg flex items-center text-xs font-bold transition-colors shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  SIGN OUT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
      
      <NotificationDrawer 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
};

const Layout = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100 transition-colors duration-300 flex flex-col font-sans relative">
        <Navbar />
        
        <main className="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto mt-2 md:mt-4">
          <Outlet />
        </main>


      </div>
    </ErrorBoundary>
  );
};

export default Layout;
