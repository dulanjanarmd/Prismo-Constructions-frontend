import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, CheckSquare, 
  ArrowRight, Search, ChevronDown, ChevronUp 
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import { motion, AnimatePresence } from 'framer-motion';
import DetailedIssue from './DetailedIssue';

const CEODashboard = () => {
  const { projects, issues, approvals, tasks, users } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [expandedIssueId, setExpandedIssueId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // --- Summary Metrics ---
  const totalProjects = projects.length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const onHoldDelayed = projects.filter(p => ['On Hold', 'Delayed'].includes(p.status)).length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  
  const highSeverityIssues = issues.filter(i => i.severity === 'High' && i.status !== 'Resolved');
  const criticalIssuesCount = highSeverityIssues.length;

  // --- Filtered Portfolio ---
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- Recent Approvals ---
  const recentApprovals = [...approvals]
    .filter(a => ['Approved', 'Rejected', 'Changes Requested'].includes(a.status))
    .sort((a, b) => new Date(b.dateRequested) - new Date(a.dateRequested))
    .slice(0, 3);

  // Helper for project issues count
  const getProjectHighIssuesCount = (projectId) => {
    return issues.filter(i => 
      (String(i.projectId) === String(projectId) || i.projectId === `p${projectId}`) && 
      i.severity === 'High' && 
      i.status !== 'Resolved'
    ).length;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-6">
        <DashboardHeader />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 border border-border">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Projects</p>
          <p className="text-3xl font-bold text-slate-900 ">{totalProjects}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 border border-border">
          <p className="text-sm font-medium text-slate-500 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 ">{inProgress}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 border border-amber-200  bg-amber-50/50 ">
          <p className="text-sm font-medium text-amber-600  mb-1">On Hold / Delayed</p>
          <p className="text-3xl font-bold text-amber-600 ">{onHoldDelayed}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 border border-border">
          <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600 ">{completed}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5 border border-red-200  bg-red-50/50 ">
          <p className="text-sm font-medium text-red-600  mb-1">Critical Issues</p>
          <p className="text-3xl font-bold text-red-600  flex items-center gap-2">
            {criticalIssuesCount}
            {criticalIssuesCount > 0 && <span className="animate-pulse">🚨</span>}
          </p>
        </motion.div>
      </div>

      {/* Projects Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex flex-col xl:flex-row justify-between gap-4 p-4 sm:p-5 bg-[#e5e7eb] text-slate-900 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Projects</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full xl:w-auto justify-end">
            <div className="relative w-full sm:w-64 h-11 sm:h-12 shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-9 pr-4 h-full w-full rounded-lg bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm text-slate-900 placeholder:text-slate-500 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-11 sm:h-12 rounded-lg p-1 items-center text-xs sm:text-sm font-bold text-slate-600 overflow-x-auto no-scrollbar max-w-full">
              {['All', 'Planning', 'In Progress', 'On Hold', 'Delayed', 'Completed'].map(status => {
                const count = status === 'All' ? projects.length : projects.filter(p => p.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap shrink-0 ${
                      statusFilter === status 
                        ? 'bg-white shadow-sm text-slate-900 font-bold' 
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {status} <span className="ml-1 opacity-60 font-normal">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50  border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600 ">Project & Client</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 ">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 ">Progress</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 ">High Risks</th>
                    <th className="px-6 py-4 font-semibold text-slate-600  text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.map((project, idx) => {
                    const highIssues = getProjectHighIssuesCount(project.id);
                    return (
                      <motion.tr 
                        key={project.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-slate-50 :bg-slate-800/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 ">{project.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{project.client}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100  text-slate-700  border border-slate-200 `}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200  rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-600  w-8">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {highIssues > 0 ? (
                            <span className="flex items-center text-xs font-bold text-red-600  bg-red-50  px-2 py-1 rounded-md w-fit">
                              <AlertTriangle className="w-3 h-3 mr-1" /> {highIssues} Open
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/portal/projects/${project.id}`)}
                            className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-md transition-colors inline-flex items-center"
                          >
                            View <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No projects match your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

      {/* Escalated Issues & Decisions (Under Project Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Critical Issues */}
          <div className="glass-card p-5 border-t-4 border-t-red-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Escalated Issues
              </h2>
            </div>
            
            {highSeverityIssues.length > 0 ? (
              <div className="space-y-3">
                {highSeverityIssues.slice(0, 4).map(issue => {
                  const proj = projects.find(p => String(p.id) === String(issue.projectId) || `p${p.id}` === issue.projectId);
                  return (
                    <div key={issue.id} className="bg-red-50 rounded-lg border border-red-100 overflow-hidden">
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm text-slate-900 line-clamp-1 pr-2">{issue.title}</h4>
                          <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded shrink-0">High</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{proj?.name}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">{issue.reportedDate || issue.createdAt ? new Date(issue.reportedDate || issue.createdAt).toLocaleDateString() : ''}</span>
                          <div className="flex gap-2 items-center">
                            <button 
                              onClick={() => navigate(`/portal/projects/${proj?.id}`)}
                              className="font-bold text-red-700 hover:underline"
                            >
                              Go to Project &rarr;
                            </button>
                            <button
                              onClick={() => setExpandedIssueId(expandedIssueId === issue.id ? null : issue.id)}
                              className="p-1 hover:bg-red-200 rounded text-red-700 transition-colors"
                            >
                              {expandedIssueId === issue.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedIssueId === issue.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-red-200 bg-white"
                          >
                            <DetailedIssue issue={issue} projects={projects} tasks={tasks} users={users} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 bg-slate-50  rounded-lg border border-dashed border-slate-200 ">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                <p className="text-sm font-medium">No critical issues</p>
                <p className="text-xs mt-1">Portfolio health is stable.</p>
              </div>
            )}
          </div>

          {/* Recent Decisions */}
          <div className="glass-card p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Recent Client Decisions
            </h2>
            
            {recentApprovals.length > 0 ? (
              <div className="space-y-4">
                {recentApprovals.map(approval => {
                  const proj = projects.find(p => String(p.id) === String(approval.projectId) || `p${p.id}` === approval.projectId);
                  return (
                    <div key={approval.id} className="relative pl-4 border-l-2 border-slate-200 ">
                      <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                        approval.status === 'Approved' ? 'bg-green-500' :
                        approval.status === 'Rejected' ? 'bg-red-500' : 'bg-orange-500'
                      }`} />
                      <p className="text-sm text-slate-800  font-medium line-clamp-1">{approval.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{proj?.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          approval.status === 'Approved' ? 'text-green-700 bg-green-100  ' :
                          approval.status === 'Rejected' ? 'text-red-700 bg-red-100  ' : 
                          'text-orange-700 bg-orange-100  '
                        }`}>
                          {approval.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <p className="text-sm">No recent decisions recorded.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

export default CEODashboard;
