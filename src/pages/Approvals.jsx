import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, RotateCcw, Lock, Filter, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import ApprovalDetailModal from '../components/ApprovalDetailModal';

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  'Changes Requested': 'bg-orange-100 text-orange-700',
  Closed: 'bg-slate-100 text-slate-600'
};

const STATUS_ICON = {
  Pending: Clock,
  Approved: CheckCircle2,
  Rejected: XCircle,
  'Changes Requested': RotateCcw,
  Closed: Lock
};

const Approvals = () => {
  const { approvals, projects, updateApproval } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [selectedApproval, setSelectedApproval] = useState(null);

  const isPM = currentUser?.role === 'project_manager' || currentUser?.role === 'pm';
  const isClient = currentUser?.role === 'client';

  // For client: only show approvals for their projects
  const displayApprovals = useMemo(() => {
    let list = [...approvals].sort((a, b) => new Date(b.dateRequested) - new Date(a.dateRequested));
    if (statusFilter !== 'All') list = list.filter(a => a.status === statusFilter);
    if (projectFilter !== 'All') list = list.filter(a => String(a.projectId).replace(/^p/, '') === String(projectFilter).replace(/^p/, ''));
    return list;
  }, [approvals, statusFilter, projectFilter]);

  const statusCounts = ['Pending', 'Approved', 'Changes Requested', 'Rejected', 'Closed'].reduce((acc, s) => {
    acc[s] = approvals.filter(a => a.status === s).length;
    return acc;
  }, {});

  const handleUpdate = async (id, updates) => {
    const result = await updateApproval(id, updates);
    setSelectedApproval(prev => prev ? { ...prev, ...updates } : null);
    return result;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {isClient ? 'Approval Requests' : 'Client Approvals'}
        </h1>
      </div>



      {/* Table & Filters Card */}
      <div className="glass-card flex flex-col overflow-hidden">
        
        {/* Filters Section */}
        <div className="flex items-center gap-3 p-5 bg-[#e5e7eb] text-slate-900 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center gap-3 ml-auto min-w-max">
            <div className="flex space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center text-sm font-bold text-slate-600">
              {['All', 'Pending', 'Approved', 'Changes Requested', 'Rejected', 'Closed'].map(status => {
                const count = status === 'All' ? displayApprovals.length : (statusCounts[status] || 0);
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`relative px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap ${
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
            <select
              className="h-12 w-36 shrink-0 rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm px-3 text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
            >
              <option value="All">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

      {/* Table */}
      {displayApprovals.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <p className="text-lg font-medium">No approval requests match your filters.</p>
        </div>
      ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Requested</th>
                  <th className="px-6 py-3 font-medium">Due</th>
                  <th className="px-6 py-3 font-medium">Client Feedback</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayApprovals.map((approval, idx) => {
                  const project = projects.find(p =>
                    String(p.id) === String(approval.projectId) || p.id === `p${approval.projectId}`
                  );
                  const StatusIcon = STATUS_ICON[approval.status] || Clock;
                  const needsAction = (isPM && approval.status === 'Changes Requested') ||
                    (isClient && approval.status === 'Pending');

                  return (
                    <motion.tr
                      key={approval.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`hover:bg-slate-50/50 :bg-slate-800/30 transition-colors ${needsAction ? 'bg-amber-50/40 ' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 ">{approval.title}</p>
                        {approval.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{approval.description}</p>
                        )}
                        {needsAction && (
                          <span className="text-xs font-bold text-amber-600 animate-pulse">⚡ Action needed</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {project ? (
                          <button
                            onClick={() => navigate(`/portal/projects/${project.id}`)}
                            className="text-slate-700 hover:text-primary hover:underline text-xs font-medium transition-colors text-left"
                          >
                            {project.name}
                          </button>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 w-fit ${STATUS_STYLES[approval.status] || ''}`}>
                          <StatusIcon className="w-3 h-3" />
                          {approval.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">{approval.dateRequested}</td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">{approval.dueDate || '—'}</td>
                      <td className="px-6 py-4">
                        {approval.feedback ? (
                          <p className="text-xs text-slate-500 italic max-w-[160px] truncate">"{approval.feedback}"</p>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedApproval(approval)}
                          className="px-4 py-1.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all ml-auto shadow-sm hover:shadow"
                        >
                          View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      )}
      </div>

      {/* Detail Modal */}
      {selectedApproval && (
        <ApprovalDetailModal
          approval={selectedApproval}
          project={projects.find(p =>
            String(p.id) === String(selectedApproval.projectId) || p.id === `p${selectedApproval.projectId}`
          )}
          onClose={() => setSelectedApproval(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default Approvals;
