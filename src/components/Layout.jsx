import React, { useState } from 'react';
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications?.filter(n => !n.read)?.length || 0;

  const navItems = {
    admin: [
      { name: 'Admin Portal', path: '/portal/admin', icon: <Shield className="w-4 h-4 mr-2" /> },
    ],
    ceo: [
      { name: 'Portfolio', path: '/portal', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
      { name: 'Consultations', path: '/portal/consultations', icon: <MessageSquare className="w-4 h-4 mr-2" /> },
    ],
    project_manager: [
      { name: 'Dashboard', path: '/portal', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
      { name: 'Consultations', path: '/portal/consultations', icon: <MessageSquare className="w-4 h-4 mr-2" /> },
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

  const roleNav = currentUser ? navItems[currentUser.role] : [];

  return (
    <div className="bg-[#e5e7eb] rounded-b-[3rem] pb-4 relative px-4 sm:px-8 z-50">
      <header className="py-6 px-4 mx-auto w-full max-w-7xl flex items-center justify-between">
        
        {/* Left Side: Logo and Nav */}
        <div className="flex items-center space-x-2">
          <Link to="/portal" className="bg-white rounded-xl flex items-center justify-center h-12 px-3 shadow-md hover:opacity-90 transition-opacity">
            <img src="/prismo-logo.png" alt="Prismo Construction" className="h-10 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-xl p-1 items-center space-x-1 text-sm font-bold text-slate-600">
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
          <div className="hidden md:flex items-center bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-xl p-1 gap-0.5 text-sm font-bold relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-9 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    <span className="text-xs text-slate-500">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications?.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500 text-center">No notifications yet</p>
                    ) : (
                      notifications?.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-3 border-b border-slate-50 text-sm cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'}`}
                          onClick={() => {
                            if (!notif.read) markNotificationAsRead(notif.id);
                            setNotificationsOpen(false);
                          }}
                        >
                          <p className={`text-slate-800 ${!notif.read ? 'font-semibold' : ''}`}>{notif.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="relative w-9 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all"
            >
              <User className="w-5 h-5 -mt-[2px]" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-24 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="p-3 bg-slate-50">
                    <p className="font-bold text-slate-800 truncate">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{currentUser?.role?.replace('_', ' ')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={logout}
              className="px-6 py-2 bg-primary text-[#022c22] rounded-md transition-colors uppercase h-full flex items-center hover:opacity-90"
            >
              <LogOut className="w-4 h-4 mr-2" />
              SIGN OUT
            </button>
          </div>
          <button 
            className="md:hidden text-slate-600 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 w-12 flex items-center justify-center rounded-xl"
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
