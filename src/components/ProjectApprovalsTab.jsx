import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, FileText, Send, Clock, RotateCcw, Lock, Plus, X, Paperclip, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ApprovalDetailModal from './ApprovalDetailModal';

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

const ProjectApprovalsTab = ({ projectId, project }) => {
  const { approvals, updateApproval, addApprovalRequest, deleteApprovalRequest, logs } = useData();
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
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
        dateRequested: new Date().toISOString().split('T')[0],
        auditTrail: [{
          actor: currentUser?.name || 'Project Manager',
          action: 'Created approval request',
          timestamp: new Date().toLocaleString(),
          type: 'create'
        }]
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', dueDate: '', linkedLogIds: [], attachedDocuments: [], attachedPhotos: [] });
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Client Approvals</h2>
          <p className="text-sm text-slate-500">
            {projectApprovals.length} total
            {pendingCount > 0 && <span className="ml-2 text-amber-600 font-semibold">· {pendingCount} pending</span>}
            {changesCount > 0 && <span className="ml-2 text-orange-600 font-semibold">· {changesCount} need changes</span>}
          </p>
        </div>
        {isPM && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Request Approval
          </button>
        )}
      </div>

      {/* Alert banner */}
      {(pendingCount > 0 || changesCount > 0) && isPM && (
        <div className={`rounded-lg p-4 border flex items-center gap-3 ${
          changesCount > 0 ? 'bg-orange-50 border-orange-200  ' :
          'bg-amber-50 border-amber-200  '
        }`}>
          <Clock className={`w-5 h-5 shrink-0 ${changesCount > 0 ? 'text-orange-500' : 'text-amber-500'}`} />
          <p className="text-sm font-medium text-slate-700 ">
            {changesCount > 0
              ? `${changesCount} approval${changesCount > 1 ? 's' : ''} need your attention — client requested changes.`
              : `${pendingCount} approval${pendingCount > 1 ? 's' : ''} awaiting client response.`
            }
          </p>
        </div>
      )}

      {/* Approvals list */}
      {projectApprovals.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No approval requests yet.</p>
          <p className="text-sm mt-1">Create requests to get formal client sign-off.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projectApprovals.map((approval, idx) => {
            const StatusIcon = STATUS_ICON[approval.status] || Clock;
            const needsAction = isPM && (approval.status === 'Pending' || approval.status === 'Changes Requested');
            return (
              <motion.div
                key={approval.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedApproval(approval)}
                className={`glass-card p-5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group border-l-4 ${
                  approval.status === 'Changes Requested' ? 'border-l-orange-400' :
                  approval.status === 'Pending' ? 'border-l-amber-400' :
                  approval.status === 'Approved' ? 'border-l-green-500' :
                  approval.status === 'Rejected' ? 'border-l-red-500' :
                  'border-l-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${STATUS_STYLES[approval.status] || STATUS_STYLES.Pending}`}>
                        <StatusIcon className="w-3 h-3" />
                        {approval.status}
                      </span>
                      {approval.dueDate && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          Due: {approval.dueDate}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900  mb-1">{approval.title}</h3>
                    {approval.description && (
                      <p className="text-sm text-slate-500 line-clamp-1">{approval.description}</p>
                    )}
                    {approval.feedback && (
                      <p className="text-xs text-slate-500 mt-2 italic">
                        Client: "{approval.feedback}"
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{approval.dateRequested}</span>
                      {isPM && (
                        <button 
                          onClick={(e) => handleDelete(e, approval.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Delete Request"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      )}
                    </div>
                    {needsAction && (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                        Action needed
                      </span>
                    )}
                    <span className="text-primary text-sm font-medium group-hover:underline">View →</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Additional context for the client..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Response Due Date</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
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
                {projectLogs.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Link Progress Logs (optional)</label>
                    <div className="space-y-2 max-h-36 overflow-y-auto border border-border rounded-md p-2 bg-slate-50 ">
                      {projectLogs.map(log => (
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
                      ))}
                    </div>
                    {formData.linkedLogIds.length > 0 && (
                      <p className="text-xs text-primary mt-1">{formData.linkedLogIds.length} log{formData.linkedLogIds.length > 1 ? 's' : ''} selected</p>
                    )}
                  </div>
                )}

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
          onClose={() => setSelectedApproval(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default ProjectApprovalsTab;
