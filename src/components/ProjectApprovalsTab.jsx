import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, FileText, Send, Clock, RotateCcw, Lock, Plus, X, Paperclip, ImageIcon, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ApprovalDetailModal from './ApprovalDetailModal';

import { APPROVAL_STATUS_STYLES as STATUS_STYLES } from '../utils/constants';

const STATUS_ICON = {
  Pending: Clock,
  Approved: CheckCircle2,
  Rejected: XCircle,
  'Changes Requested': RotateCcw,
  Closed: Lock
};

const ProjectApprovalsTab = ({ projectId, project }) => {
  const { approvals, updateApproval, addApprovalRequest, deleteApprovalRequest, logs } = useData();
  const { currentUser } = useAuth();

  const getApprovalDates = (proj) => {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const minDateStr = toDateStr(today);
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    let maxDateStr = toDateStr(sevenDaysFromNow);

    if (proj?.endDate) {
      const projEnd = new Date(proj.endDate);
      if (!isNaN(projEnd.getTime()) && projEnd < sevenDaysFromNow) {
        maxDateStr = toDateStr(projEnd);
      }
    }
    
    if (new Date(maxDateStr) < new Date(minDateStr)) {
      maxDateStr = minDateStr;
    }

    return { minDateStr, maxDateStr };
  };

  const { minDateStr, maxDateStr } = getApprovalDates(project);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: maxDateStr,
    linkedLogIds: [],
    attachedDocuments: [],
    attachedPhotos: []
  });

  const handleFileChange = (e, field) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ...files] }));
  };

  const removeFile = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const isClient = currentUser?.role === 'client';
  const isPM = currentUser?.role === 'project_manager' || currentUser?.role === 'pm';

  // Filter approvals for this project
  const projectApprovals = approvals.filter(a =>
    String(a.projectId) === String(projectId) || a.projectId === `p${projectId}`
  ).sort((a, b) => new Date(b.dateRequested) - new Date(a.dateRequested));

  const filteredApprovals = projectApprovals.filter(a => {
    const matchesSearch = a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Progress logs for this project (for linking)
  const projectLogs = logs.filter(l =>
    String(l.projectId) === String(projectId) || l.projectId === `p${projectId}`
  );

  const pendingCount = projectApprovals.filter(a => a.status === 'Pending').length;
  const changesCount = projectApprovals.filter(a => a.status === 'Changes Requested').length;

  const toggleLog = (logId) => {
    setFormData(prev => ({
      ...prev,
      linkedLogIds: prev.linkedLogIds.includes(logId)
        ? prev.linkedLogIds.filter(id => id !== logId)
        : [...prev.linkedLogIds, logId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addApprovalRequest({
        ...formData,
        projectId,
        status: 'Pending',
        feedback: '',
        dateRequested: new Date(Date.now() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0],
        auditTrail: [{
          actor: currentUser?.name || 'Project Manager',
          action: 'Created approval request',
          timestamp: new Date(Date.now() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-LK'),
          type: 'create'
        }]
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', dueDate: maxDateStr, linkedLogIds: [], attachedDocuments: [], attachedPhotos: [] });
    } catch (error) {
      alert(error.message || 'Could not create approval request.');
    }
  };

  const handleUpdate = async (id, updates) => {
    const result = await updateApproval(id, updates);
    setSelectedApproval(prev => prev ? { ...prev, ...updates } : null);
    return result;
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this approval request?')) {
      try {
        await deleteApprovalRequest(id);
      } catch (err) {
        alert('Failed to delete approval request.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card flex flex-col overflow-hidden">
        {/* Header & Filters */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 p-6 bg-[#e5e7eb] text-slate-900 border-b border-slate-200">
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6">
            <h2 className="text-xl font-bold leading-tight shrink-0">
              Client<br />Approvals
            </h2>
          </div>
          
          <div className="flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-3 items-start xl:items-center w-full lg:w-auto justify-end">
            <div className="relative w-full lg:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search approvals..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-12 rounded-lg border border-slate-300 bg-white/80 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-sm text-sm"
              />
            </div>
            
            <div className="flex space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center text-sm font-bold text-slate-600 overflow-x-auto w-fit max-w-full shrink-0">
              {['All', 'Pending', 'Approved', 'Rejected', 'Changes Requested', 'Closed'].map(s => {
                const count = s === 'All'
                  ? projectApprovals.length
                  : projectApprovals.filter(a => a.status === s).length;
                const displayLabel = s === 'Changes Requested' ? 'Changes' : s;
                return (
                  <button 
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`relative px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap outline-none ${
                      statusFilter === s
                        ? 'bg-white shadow-sm text-slate-900 font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {displayLabel} <span className="ml-1 opacity-60 font-normal">{count}</span>
                  </button>
                );
              })}
            </div>
            
            {isPM && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-12 flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-lg shadow-amber-500/30 font-bold shrink-0"
              >
                Request Approval
              </button>
            )}
          </div>
        </div>

        {/* Approvals list */}
        {filteredApprovals.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">No approval requests yet.</p>
            <p className="text-sm mt-1">Create requests to get formal client sign-off.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Requested</th>
                  <th className="px-6 py-3 font-medium">Due</th>
                  <th className="px-6 py-3 font-medium">Client Feedback</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredApprovals.map((approval, idx) => {
                  const StatusIcon = STATUS_ICON[approval.status] || Clock;
                  const needsAction = isPM && (approval.status === 'Pending' || approval.status === 'Changes Requested');
                  return (
                    <motion.tr
                      key={approval.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`hover:bg-slate-50/50 transition-colors ${needsAction ? 'bg-amber-50/40' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{approval.title}</p>
                        {approval.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{approval.description}</p>
                        )}
                        {needsAction && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-red-500">Action needed</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1.5 text-xs font-bold rounded shadow-sm flex items-center justify-center w-36 ${STATUS_STYLES[approval.status] || ''}`}>
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
                          className="px-4 py-1.5 text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-lg transition-all ml-auto shadow-sm hover:shadow"
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

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold mb-1">Request Client Approval</h2>
              <p className="text-sm text-slate-500 mb-5">For: <span className="font-semibold text-slate-700 ">{project?.name}</span></p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    required type="text"
                    placeholder="e.g. Progress Report – September Week 1"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Additional context for the client..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Response Due Date <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="date"
                    min={minDateStr}
                    max={maxDateStr}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Must be within 1 week and project timeline.
                  </p>
                </div>

                {/* Document Attachments */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-500" /> Attach Documents
                    <span className="text-xs text-slate-400 font-normal">(PDF, Word, Excel)</span>
                  </label>
                  <label className="flex items-center justify-center w-full border-2 border-dashed border-border rounded-lg py-3 px-4 cursor-pointer hover:border-primary/50 hover:bg-slate-50 transition-colors">
                    <span className="text-sm text-slate-500">Click to upload documents</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                      className="hidden"
                      onChange={e => handleFileChange(e, 'attachedDocuments')}
                    />
                  </label>
                  {formData.attachedDocuments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.attachedDocuments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 border border-border rounded px-3 py-1.5">
                          <span className="text-xs text-slate-700 truncate flex items-center gap-1">
                            <FileText className="w-3 h-3 shrink-0 text-slate-400" /> {file.name}
                          </span>
                          <button type="button" onClick={() => removeFile('attachedDocuments', i)} className="text-slate-400 hover:text-red-500 ml-2 shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Photo Attachments */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-500" /> Attach Site Photos
                    <span className="text-xs text-slate-400 font-normal">(JPG, PNG, WEBP)</span>
                  </label>
                  <label className="flex items-center justify-center w-full border-2 border-dashed border-border rounded-lg py-3 px-4 cursor-pointer hover:border-primary/50 hover:bg-slate-50 transition-colors">
                    <span className="text-sm text-slate-500">Click to upload site photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileChange(e, 'attachedPhotos')}
                    />
                  </label>
                  {formData.attachedPhotos.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {formData.attachedPhotos.map((file, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-20 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('attachedPhotos', i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Link progress logs */}
                {/* Link progress logs */}
                <div>
                  <label className="block text-sm font-medium mb-2">Link Progress Logs (optional)</label>
                  <div className="space-y-2 max-h-36 overflow-y-auto border border-border rounded-md p-2 bg-slate-50 ">
                    {projectLogs.length === 0 ? (
                      <p className="text-sm text-slate-500 italic px-2 py-1">No progress logs available for this project.</p>
                    ) : (
                      projectLogs.map(log => (
                        <label key={log.id} className="flex items-center gap-2 cursor-pointer py-1 px-2 hover:bg-slate-100 :bg-slate-800 rounded">
                          <input
                            type="checkbox"
                            checked={formData.linkedLogIds.includes(log.id)}
                            onChange={() => toggleLog(log.id)}
                            className="accent-primary"
                          />
                          <span className="text-sm text-slate-700 ">{log.date}</span>
                          <span className="text-xs text-slate-500 truncate">{log.workDone}</span>
                          <span className="ml-auto text-xs text-primary font-semibold shrink-0">+{log.percentageCompleted}%</span>
                        </label>
                      ))
                    )}
                  </div>
                  {formData.linkedLogIds.length > 0 && (
                    <p className="text-xs text-primary mt-1">{formData.linkedLogIds.length} log{formData.linkedLogIds.length > 1 ? 's' : ''} selected</p>
                  )}
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 :bg-slate-800 rounded-md transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
                    <Send className="w-4 h-4" /> Send to Client
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approval Detail Modal */}
      {selectedApproval && (
        <ApprovalDetailModal
          approval={selectedApproval}
          project={project}
          minDateStr={minDateStr}
          maxDateStr={maxDateStr}
          onClose={() => setSelectedApproval(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default ProjectApprovalsTab;
