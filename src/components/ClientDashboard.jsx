import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, ArrowRight, Bell, Calendar, CheckSquare, MessageSquare,
  FileText, Plus, X, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientDashboard = () => {
  const { projects, approvals, logs, sendGlobalMessage } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const STATUS_STYLE = {
    Completed:   'bg-green-100 text-green-700',
    'In Progress':'bg-blue-100 text-blue-700',
    Planning:    'bg-purple-100 text-purple-700',
    'On Hold':   'bg-amber-100 text-amber-700',
    Delayed:     'bg-red-100 text-red-700'
  };

  // Filter to only show THIS client's projects
  const myProjects = projects.filter(p => {
    if (!p.clientId) return false;
    const clientIdRaw = String(p.clientId).replace('u', '');
    const currentIdRaw = String(currentUser?.id).replace('u', '');
    return clientIdRaw === currentIdRaw;
  });

  // Filter approvals to only THIS client's approvals
  const pendingApprovals = approvals.filter(a => {
    const isForMyProject = myProjects.some(p =>
      String(p.id) === String(a.projectId) || `p${p.id}` === String(a.projectId)
    );
    const statusLower = (a.status || '').toLowerCase();
    return isForMyProject && statusLower === 'pending';
  });

  // Summary stats
  const totalProjects = myProjects.length;
  const inProgress = myProjects.filter(p => p.status === 'In Progress').length;
  const completed = myProjects.filter(p => p.status === 'Completed').length;
  const pendingCount = pendingApprovals.length;

  // Real notifications: recent logs for my projects
  const myProjectIds = myProjects.map(p => String(p.id));
  const recentLogs = logs
    .filter(l => {
      const pId = String(l.projectId).replace('p', '');
      return myProjectIds.includes(pId) || myProjectIds.includes(String(l.projectId));
    })
    .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
    .slice(0, 5);

  // Recent approvals for notification feed
  const recentApprovals = approvals
    .filter(a => {
      const isForMyProject = myProjects.some(p =>
        String(p.id) === String(a.projectId) || `p${p.id}` === String(a.projectId)
      );
      const statusLower = (a.status || '').toLowerCase();
      return isForMyProject && (statusLower === 'approved' || statusLower === 'rejected');
    })
    .sort((a, b) => new Date(b.dateRequested || 0) - new Date(a.dateRequested || 0))
    .slice(0, 3);

  const notificationItems = [
    ...recentLogs.map(l => ({
      icon: FileText,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      text: `New progress report submitted for ${myProjects.find(p => `p${p.id}` === String(l.projectId) || String(p.id) === String(l.projectId))?.name || 'your project'} (+${l.percentageCompleted}%)`,
      date: l.date || l.createdAt
    })),
    ...recentApprovals.map(a => ({
      icon: CheckSquare,
      iconColor: a.status?.toLowerCase() === 'approved' ? 'text-green-600' : 'text-red-600',
      iconBg: a.status?.toLowerCase() === 'approved' ? 'bg-green-100' : 'bg-red-100',
      text: `Approval "${a.title}" was ${a.status?.toLowerCase()}`,
      date: a.dateRequested
    }))
  ]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 5);

  const handleSendRequest = async () => {
    if (!requestText.trim()) return;
    // Send as global message on the first project (or generic)
    const firstProjectId = myProjects[0]?.id;
    if (firstProjectId) {
      await sendGlobalMessage(firstProjectId, `[CLIENT REQUEST] ${requestText}`);
    }
    setRequestSent(true);
    setRequestText('');
    setTimeout(() => {
      setRequestSent(false);
      setIsRequestModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Client Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Welcome back, {currentUser?.name || 'Client'}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 border border-border">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Projects</p>
          <p className="text-3xl font-bold text-slate-900">{totalProjects}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 border border-border">
          <p className="text-sm font-medium text-slate-500 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-blue-600">{inProgress}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 border border-border">
          <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600">{completed}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-4 border border-amber-200 bg-amber-50/50">
          <p className="text-sm font-medium text-amber-600 mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content (Projects) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-primary" />
              My Projects
            </h2>
            <button onClick={() => navigate('/portal/projects')} className="text-sm text-primary hover:underline font-medium">
              View all
            </button>
          </div>

          {myProjects.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No projects assigned to you yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card p-4 cursor-pointer hover:shadow-lg transition-all border border-border group"
                  onClick={() => navigate(`/portal/projects/${project.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">{project.name}</h3>
                      <p className="text-sm text-slate-500">{project.location || 'Location Not Specified'}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_STYLE[project.status] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-primary">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${project.progress || 0}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border mt-auto space-y-3">
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      End Date: {project.endDate || 'TBD'}
                    </div>
                    <button className="w-full py-2 bg-slate-100 hover:bg-primary hover:text-white text-slate-700 rounded-md text-sm font-semibold transition-colors flex items-center justify-center group-hover:bg-primary group-hover:text-white">
                      View Project <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Content (Notifications & Approvals) */}
        <div className="space-y-4">
          <div className="glass-card p-4 border-t-4 border-t-amber-500">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-amber-500" />
              Action Required
            </h2>

            {pendingApprovals.length > 0 ? (
              <div className="space-y-3">
                {pendingApprovals.slice(0, 3).map(approval => (
                  <div key={approval.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <h4 className="font-semibold text-sm text-slate-900 mb-1">{approval.title}</h4>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">{approval.description}</p>
                    <button
                      onClick={() => navigate('/portal/approvals')}
                      className="text-xs font-bold text-amber-700 hover:underline"
                    >
                      Review &amp; Respond &rarr;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            )}
          </div>

          <div className="glass-card p-4">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              Recent Notifications
            </h2>

            {notificationItems.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No recent activity.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notificationItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-800">{item.text}</p>
                      {item.date && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Info Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b flex justify-between items-center bg-indigo-50">
                <div>
                  <h2 className="text-lg font-bold text-indigo-900">Message Project Manager</h2>
                  <p className="text-xs text-indigo-600 mt-0.5">Your message will be delivered directly to the PM</p>
                </div>
                <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {requestSent ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckSquare className="w-7 h-7 text-green-600" />
                    </div>
                    <p className="font-semibold text-green-700">Request sent successfully!</p>
                    <p className="text-sm text-slate-500 mt-1">The Project Manager will review your message.</p>
                  </div>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Request or Message</label>
                    <textarea
                      rows="5"
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      placeholder="Describe what you need — e.g. 'Please provide an updated timeline for the foundation phase' or 'Request for site visit next week'..."
                      value={requestText}
                      onChange={e => setRequestText(e.target.value)}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={handleSendRequest}
                        disabled={!requestText.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Send Request
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;
