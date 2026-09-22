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
import FloatingChatWidget from './FloatingChatWidget';
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
    <div className="bg-[#e5e7eb] rounded-b-[3rem] pb-4 relative px-4 sm:px-8 z-50">
      <header className="py-6 px-4 mx-auto w-full max-w-7xl flex items-center justify-between">
        
        {/* Left Side: Logo and Nav */}
        <div className="flex items-center space-x-2">
          <Link to="/portal" className="bg-white rounded-lg flex items-center justify-center h-12 px-3 shadow-md hover:opacity-90 transition-opacity">
            <img src="/prismo-logo.png" alt="Prismo Construction" className="h-10 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center space-x-1 text-sm font-bold text-slate-600">
            {roleNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-5 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full ${
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

        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 gap-2 text-sm font-bold relative">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative w-10 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all"
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
              className="relative w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all overflow-hidden border border-slate-200"
            >
              {currentUser?.profilePictureUrl ? (
                <img src={currentUser.profilePictureUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm uppercase">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              )}
            </button>
            <button 
              onClick={logout}
              className="px-6 py-2 bg-primary text-[#022c22] rounded-lg transition-colors uppercase h-full flex items-center hover:opacity-90"
            >
              <LogOut className="w-4 h-4 mr-2" />
              SIGN OUT
            </button>
          </div>
          <button 
            className="md:hidden text-slate-600 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 w-12 flex items-center justify-center rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden flex flex-col space-y-4 pt-6 pb-2 overflow-hidden"
            >
              {roleNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-2 text-sm font-medium transition-colors rounded ${
                    location.pathname === item.path 
                      ? 'text-primary' 
                      : 'text-slate-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-slate-300 pt-4 flex items-center justify-between px-4">
                <div className="flex items-center text-slate-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium text-xs">{currentUser?.name}</span>
                </div>
                <button 
                  onClick={logout}
                  className="text-red-500 flex items-center text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4 mr-2" />
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

        <FloatingChatWidget />
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
