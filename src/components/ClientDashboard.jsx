import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import {
  Briefcase, ArrowRight, Bell, Calendar, CheckSquare, MessageSquare,
  FileText, Plus, X, Send, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientDashboard = () => {
  const { projects, approvals, logs } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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

  const filteredProjects = myProjects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });



  const handleSendRequest = async () => {
    if (!requestText.trim()) return;
    // Send as global message on the first project (or generic)
    const firstProjectId = myProjects[0]?.id;
    if (firstProjectId) {
      // Message sending removed
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
      <div className="mb-6">
        <DashboardHeader />
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

      <div>
        {/* Main Content (Projects) */}
        <div className="space-y-4">
          {myProjects.length === 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  My Projects
                </h2>
                <button onClick={() => navigate('/portal/projects')} className="text-sm text-primary hover:underline font-medium">
                  View all
                </button>
              </div>
              <div className="glass-card p-8 text-center text-slate-500">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No projects assigned to you yet.</p>
              </div>
            </div>
          ) : (
            <div className="glass-card flex flex-col mt-6 overflow-hidden border border-slate-200">
              <div className="flex flex-col lg:flex-row justify-between gap-6 p-6 bg-[#e5e7eb] text-slate-900 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    My Projects
                  </h2>
                  <button onClick={() => navigate('/portal/projects')} className="text-sm text-primary hover:underline font-medium">
                    View all
                  </button>
                </div>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 items-center w-full lg:w-auto justify-end">
                  <div className="flex flex-wrap md:flex-nowrap space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center text-sm font-bold text-slate-600 overflow-x-auto">
                    {['All', 'Planning', 'In Progress', 'On Hold', 'Delayed', 'Completed'].map(status => {
                      const count = status === 'All' ? myProjects.length : myProjects.filter(p => p.status === status).length;
                      return (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`relative px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap ${
                            statusFilter === status 
                              ? 'bg-white shadow-sm text-slate-900 font-bold' 
                              : 'hover:text-slate-900 text-slate-600 font-medium'
                          }`}
                        >
                          {status} <span className="ml-1 opacity-60 font-normal">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative w-full md:w-auto h-12">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search projects..." 
                      className="pl-9 pr-4 h-full w-full md:w-64 rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm text-slate-900 placeholder:text-slate-500 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto p-6 pt-0">
                <table className="w-full text-left text-sm mt-4">
                <thead className="border-b border-slate-100 text-xs text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">Project Name</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Location</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Progress</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Start Date</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                        No projects match your current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project, idx) => (
                      <motion.tr
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/portal/projects/${project.id}`)}
                    >
                      <td className="px-6 py-5 font-bold text-slate-900">{project.name}</td>
                      <td className="px-6 py-5 text-slate-600 font-medium">{project.location || 'Location Not Specified'}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded shadow-sm w-28 inline-block text-center ${
                          project.status === 'Completed' ? 'bg-emerald-500 text-white' :
                          project.status === 'In Progress' ? 'bg-amber-500 text-white' : 
                          project.status === 'Planning' ? 'bg-purple-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-slate-900 h-1.5 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-500 font-bold">{project.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-500 font-medium whitespace-nowrap">{project.startDate || 'TBD'}</td>
                      <td className="px-6 py-5 text-slate-500 font-medium whitespace-nowrap">{project.endDate || 'TBD'}</td>
                    </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>
          )}
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
