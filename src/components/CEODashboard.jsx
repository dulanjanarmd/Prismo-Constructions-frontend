import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, CheckSquare, 
  Search, ChevronDown, ChevronUp 
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

  const getApprovalTimestamp = (item) => {
    if (Array.isArray(item.auditTrail) && item.auditTrail.length > 0) {
      for (let i = item.auditTrail.length - 1; i >= 0; i--) {
        const entry = item.auditTrail[i];
        if (entry?.timestamp) {
          const t = new Date(entry.timestamp).getTime();
          if (!isNaN(t)) return t;
        }
      }
    }
    if (item.dateRequested) {
      const t = new Date(item.dateRequested).getTime();
      if (!isNaN(t)) return t;
    }
    return Number(String(item.id).replace(/\D/g, '')) || 0;
  };

  const getDecisionDate = (item) => {
    if (Array.isArray(item.auditTrail) && item.auditTrail.length > 0) {
      for (let i = item.auditTrail.length - 1; i >= 0; i--) {
        const entry = item.auditTrail[i];
        if (entry?.timestamp) return entry.timestamp;
      }
    }
    if (item.dateRequested) {
      try {
        const d = new Date(item.dateRequested);
        if (!isNaN(d.getTime())) return d.toLocaleDateString();
      } catch (_) {}
      return String(item.dateRequested);
    }
    return '';
  };

  // --- Recent Approvals / Decisions ---
  const recentApprovals = [...approvals]
    .filter(a => {
      if (!a.status) return false;
      const st = a.status.toLowerCase().replace(/_/g, ' ').trim();
      return ['approved', 'rejected', 'changes requested', 'pending'].includes(st);
    })
    .sort((a, b) => {
      const aIsDecided = ['approved', 'rejected', 'changes requested'].includes((a.status || '').toLowerCase().replace(/_/g, ' '));
      const bIsDecided = ['approved', 'rejected', 'changes requested'].includes((b.status || '').toLowerCase().replace(/_/g, ' '));
      if (aIsDecided && !bIsDecided) return -1;
      if (!aIsDecided && bIsDecided) return 1;
      return getApprovalTimestamp(b) - getApprovalTimestamp(a);
    })
    .slice(0, 4);

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
          <p className="text-3xl font-bold text-red-600">
            {criticalIssuesCount}
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
                          <span className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded shadow-sm w-28 inline-block text-center ${
                            project.status === 'Completed' ? 'bg-emerald-500 text-white' :
                            project.status === 'In Progress' ? 'bg-amber-500 text-white' : 
                            project.status === 'Planning' ? 'bg-purple-500 text-white' : 
                            project.status === 'On Hold' ? 'bg-amber-600 text-white' : 'bg-red-500 text-white'
                          }`}>
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
                            className="px-4 py-1.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all ml-auto shadow-sm hover:shadow"
                          >
                            View
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Critical Issues Table */}
          <div className="glass-card overflow-hidden border-t-4 border-t-red-500 h-full flex flex-col justify-between min-h-[280px]">
            <div className="flex-1 flex flex-col">
              <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Escalated Issues
                </h2>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>
                      <th className="px-5 py-3 font-semibold text-slate-600 text-xs">Issue & Project</th>
                      <th className="px-5 py-3 font-semibold text-slate-600 text-xs">Severity</th>
                      <th className="px-5 py-3 font-semibold text-slate-600 text-xs">Date</th>
                      <th className="px-5 py-3 font-semibold text-slate-600 text-xs text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {highSeverityIssues.length > 0 ? (
                      highSeverityIssues.slice(0, 4).map(issue => {
                        const proj = projects.find(p => String(p.id) === String(issue.projectId) || `p${p.id}` === issue.projectId);
                        return (
                          <React.Fragment key={issue.id}>
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5">
                                <p className="font-bold text-slate-900 text-sm line-clamp-1">{issue.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{proj?.name || 'Project'}</p>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded shadow-sm bg-red-500 text-white inline-block">
                                  High
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-xs text-slate-500">
                                {issue.reportedDate || issue.createdAt ? new Date(issue.reportedDate || issue.createdAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button 
                                    onClick={() => navigate(`/portal/projects/${proj?.id}`)}
                                    className="px-3.5 py-1.5 text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all shadow-sm hover:shadow"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => setExpandedIssueId(expandedIssueId === issue.id ? null : issue.id)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                                    title="Toggle details"
                                  >
                                    {expandedIssueId === issue.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedIssueId === issue.id && (
                              <tr>
                                <td colSpan="4" className="p-0 border-t border-red-200 bg-white">
                                  <DetailedIssue issue={issue} projects={projects} tasks={tasks} users={users} />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                          <CheckSquare className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                          <p className="text-sm font-medium">No critical issues</p>
                          <p className="text-xs mt-1">Portfolio health is stable.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Decisions Table */}
          <div className="glass-card overflow-hidden border-t-4 border-t-blue-500 h-full flex flex-col justify-between min-h-[280px]">
            <div className="flex-1 flex flex-col">
              <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Client Decisions
                </h2>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>
                      <th className="px-5 py-3 font-semibold text-slate-600 text-xs">Decision & Project</th>
                      <th className="px-5 py-3 font-semibold text-slate-600 text-xs">Status</th>
                      <th className="px-5 py-3 font-semibold text-slate-600 text-xs">Date</th>
                      <th className="px-5 py-3 font-semibold text-slate-600 text-xs text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentApprovals.length > 0 ? (
                      recentApprovals.map(approval => {
                        const projId = approval.projectId ? String(approval.projectId).replace(/^p/, '') : (approval.project?.id ? String(approval.project.id) : '');
                        const proj = projects.find(p => String(p.id).replace(/^p/, '') === projId);
                        const projName = proj?.name || approval.project?.name || 'Project';
                        const st = (approval.status || 'Pending').toLowerCase().replace(/_/g, ' ').trim();
                        const isApproved = st === 'approved';
                        const isRejected = st === 'rejected';
                        const isChanges = st === 'changes requested';
                        const decisionDate = getDecisionDate(approval);

                        return (
                          <tr key={approval.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="font-bold text-slate-900 text-sm line-clamp-1">{approval.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{projName}</p>
                              {approval.feedback && (
                                <p className="text-xs text-slate-400 italic line-clamp-1 mt-0.5">"{approval.feedback}"</p>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded shadow-sm inline-block ${
                                isApproved ? 'bg-emerald-500 text-white' :
                                isRejected ? 'bg-red-500 text-white' :
                                isChanges ? 'bg-amber-500 text-white' :
                                'bg-blue-500 text-white'
                              }`}>
                                {approval.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-500">
                              {decisionDate || '—'}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button 
                                onClick={() => navigate(`/portal/projects/${projId}?tab=approvals`)}
                                className="px-3.5 py-1.5 text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all shadow-sm hover:shadow ml-auto"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                          <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-400/50" />
                          <p className="text-sm font-medium">No recent decisions recorded</p>
                          <p className="text-xs mt-1">Client approval responses will appear here.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

export default CEODashboard;
