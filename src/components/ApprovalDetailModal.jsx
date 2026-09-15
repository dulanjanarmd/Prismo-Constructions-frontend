import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  X, FileText, Calendar, CheckCircle2, XCircle, RotateCcw,
  Lock, Send, MessageSquare, Clock, ListTodo, Paperclip, Image as ImageIcon, Edit
} from 'lucide-react';

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Approved: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
  'Changes Requested': 'bg-orange-100 text-orange-700 border-orange-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200'
};

const STATUS_ICON = {
  Pending: Clock,
  Approved: CheckCircle2,
  Rejected: XCircle,
  'Changes Requested': RotateCcw,
  Closed: Lock
};

const ApprovalDetailModal = ({ approval, project, minDateStr, maxDateStr, onClose, onUpdate }) => {
  const { currentUser } = useAuth();
  const { logs } = useData();

  const isPM = currentUser?.role === 'project_manager' || currentUser?.role === 'pm';
  const isClient = currentUser?.role === 'client';

  const [clientDecision, setClientDecision] = useState('');
  const [clientComment, setClientComment] = useState('');
  const [pmReply, setPmReply] = useState('');
  const [showPmReply, setShowPmReply] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editData, setEditData] = useState({
    title: approval.title || '',
    description: approval.description || '',
    dueDate: approval.dueDate || '',
    attachments: typeof approval.attachments === 'string' ? JSON.parse(approval.attachments || '[]') : (approval.attachments || []),
    linkedLogIds: approval.linkedLogIds || []
  });

  const handleFileUpload = async (e, category) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setIsUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('http://localhost:8080/api/files/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${currentUser.token}` },
          body
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        uploaded.push({ ...data, category });
      }
      setEditData(prev => ({ ...prev, attachments: [...prev.attachments, ...uploaded] }));
    } catch (err) {
      alert('File upload failed');
    }
    setIsUploading(false);
  };

  const removeAttachment = (index) => {
    setEditData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const toggleLog = (logId) => {
    setEditData(prev => ({
      ...prev,
      linkedLogIds: prev.linkedLogIds.includes(logId)
        ? prev.linkedLogIds.filter(id => id !== logId)
        : [...prev.linkedLogIds, logId]
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await onUpdate(approval.id, editData);
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update approval');
    }
  };

  const storedAuditTrail = typeof approval.auditTrail === 'string'
    ? (() => {
        try { return JSON.parse(approval.auditTrail); } catch { return []; }
      })()
    : approval.auditTrail;
  const [auditTrail, setAuditTrail] = useState(storedAuditTrail?.length ? storedAuditTrail : [
    {
      actor: 'Project Manager',
      action: 'Created approval request',
      timestamp: approval.dateRequested
        ? new Date(approval.dateRequested).toLocaleString()
        : new Date().toLocaleString(),
      type: 'create'
    }
  ]);

  // Linked progress logs
  const linkedLogs = (approval.linkedLogIds || [])
    .map(id => logs.find(l => String(l.id) === String(id)))
    .filter(Boolean);

  const attachments = typeof approval.attachments === 'string'
    ? (() => { try { return JSON.parse(approval.attachments); } catch { return []; } })()
    : (approval.attachments || []);

  const handleClientResponse = () => {
    if (!clientDecision) return;
    const entry = {
      actor: currentUser?.name || 'Client',
      action: `${clientDecision}${clientComment ? `: "${clientComment}"` : ''}`,
      timestamp: new Date().toLocaleString(),
      type: clientDecision === 'Approved' ? 'approve' : clientDecision === 'Rejected' ? 'reject' : 'changes'
    };
    const newTrail = [...auditTrail, entry];
    setAuditTrail(newTrail);
    onUpdate(approval.id, {
      status: clientDecision,
      feedback: clientComment,
      auditTrail: newTrail
    });
    setClientDecision('');
    setClientComment('');
  };

  const handlePmReply = () => {
    if (!pmReply.trim()) return;
    const entry = {
      actor: currentUser?.name || 'Project Manager',
      action: `PM Reply: "${pmReply.trim()}"`,
      timestamp: new Date().toLocaleString(),
      type: 'reply'
    };
    const newTrail = [...auditTrail, entry];
    setAuditTrail(newTrail);
    onUpdate(approval.id, { auditTrail: newTrail, pmReply: pmReply.trim() });
    setPmReply('');
    setShowPmReply(false);
  };

  const handleClose = async () => {
    const entry = {
      actor: 'Project Manager',
      action: 'Approval closed — cycle complete',
      timestamp: new Date().toLocaleString(),
      type: 'close'
    };
    const newTrail = [...auditTrail, entry];
    setAuditTrail(newTrail);
    try {
      await onUpdate(approval.id, { status: 'Closed', auditTrail: newTrail });
    } catch (error) {
      setAuditTrail(auditTrail);
      alert(error.message || 'Could not close approval.');
    }
  };

  const StatusIcon = STATUS_ICON[approval.status] || Clock;

  const AUDIT_COLORS = {
    create: 'bg-blue-500',
    approve: 'bg-green-500',
    reject: 'bg-red-500',
    changes: 'bg-orange-500',
    reply: 'bg-purple-500',
    close: 'bg-slate-500'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-card w-full max-w-2xl h-full max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md px-6 py-5 border-b border-border flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 ${STATUS_STYLES[approval.status] || STATUS_STYLES.Pending}`}>
                  <StatusIcon className="w-3 h-3" />
                  {approval.status}
                </span>
                {approval.dueDate && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due: {approval.dueDate}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900  leading-tight">{approval.title}</h2>
              {project && <p className="text-sm text-slate-500 mt-0.5">{project.name}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isPM && !isEditing && approval.status !== 'Closed' && (
                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Edit Request">
                  <Edit className="w-5 h-5" />
                </button>
              )}
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 space-y-7">
            {/* Edit Form or Description */}
            {isEditing ? (
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-200 shadow-sm space-y-4">
                <h3 className="font-bold text-lg mb-2 text-slate-800 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" /> Edit Approval Request
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Title <span className="text-red-500">*</span></label>
                  <input required type="text" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Description</label>
                  <textarea rows="3" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Response Due Date</label>
                  <input type="date" min={minDateStr} max={maxDateStr} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={editData.dueDate} onChange={e => setEditData({...editData, dueDate: e.target.value})} />
                  <p className="text-xs text-slate-500 mt-1">Must be within 1 week and project timeline.</p>
                </div>

                {/* Edit Attachments */}
                <div className="pt-2 border-t border-blue-200/50">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-slate-700">
                    <Paperclip className="w-4 h-4 text-slate-500" /> Attachments
                  </label>
                  <label className="flex items-center justify-center w-full border-2 border-dashed border-blue-300 rounded-lg py-3 px-4 cursor-pointer hover:border-blue-400 hover:bg-white transition-colors bg-white/50">
                    <span className="text-sm text-blue-600 font-medium">
                      {isUploading ? 'Uploading...' : 'Click to add files or photos'}
                    </span>
                    <input type="file" multiple className="hidden" disabled={isUploading} onChange={e => handleFileUpload(e, 'document')} />
                  </label>
                  {editData.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {editData.attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-blue-200 rounded px-3 py-2 shadow-sm">
                          <span className="text-sm text-slate-700 truncate flex items-center gap-2">
                            {file.category === 'image' || file.type?.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" /> : <FileText className="w-4 h-4 text-blue-500 shrink-0" />} 
                            {file.originalName || file.name || 'Attachment'}
                          </span>
                          <button type="button" onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500 shrink-0 p-1 rounded hover:bg-red-50">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Edit Linked Logs */}
                <div className="pt-2 border-t border-blue-200/50">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-slate-700">
                    <ListTodo className="w-4 h-4 text-slate-500" /> Linked Progress Logs
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {logs.filter(l => String(l.projectId) === String(project?.id) || l.projectId === `p${project?.id}`).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No progress logs available for this project.</p>
                    ) : (
                      logs.filter(l => String(l.projectId) === String(project?.id) || l.projectId === `p${project?.id}`).map(log => {
                        const isLinked = editData.linkedLogIds.includes(log.id);
                        return (
                          <div
                            key={log.id}
                            onClick={() => toggleLog(log.id)}
                            className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-colors ${
                              isLinked ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-slate-800">{log.date}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isLinked ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                +{log.percentageCompleted}%
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">{log.workDone}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button onClick={() => setIsEditing(false)} disabled={isUploading} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={handleSaveEdit} disabled={isUploading} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-sm disabled:opacity-50">Save Changes</button>
                </div>
              </div>
            ) : (
              approval.description && (
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Request Details
                  </h3>
                  <div className="bg-slate-50  rounded-lg p-4 border border-border">
                    <p className="text-sm text-slate-700  leading-relaxed">{approval.description}</p>
                  </div>
                </div>
              )
            )}

            {attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" /> Attachments ({attachments.length})
                </h3>
                <div className="space-y-3">
                  {attachments.map((attachment, index) => {
                    const url = attachment.fullUrl || `http://localhost:8080${attachment.url || ''}`;
                    const isImage = attachment.category === 'image' || attachment.type?.startsWith('image/');
                    return (
                      <div key={`${url}-${index}`} className="border border-border rounded-lg p-3 bg-slate-50">
                        {isImage && <img src={url} alt={attachment.originalName || 'Approval attachment'} className="max-h-56 w-full object-contain rounded mb-2" />}
                        <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-2">
                          {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          {attachment.originalName || 'Open attachment'}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Linked Progress Logs */}
            {linkedLogs.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ListTodo className="w-4 h-4" /> Linked Progress Logs ({linkedLogs.length})
                </h3>
                <div className="space-y-2">
                  {linkedLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50  border border-border text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span className="font-medium">{log.date}</span>
                      <span className="text-slate-500 truncate">{log.workDone}</span>
                      <span className="ml-auto text-primary font-semibold shrink-0">+{log.percentageCompleted}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client feedback (if responded) */}
            {approval.feedback && (
              <div className={`rounded-lg p-4 border ${
                approval.status === 'Approved' ? 'bg-green-50 border-green-200  ' :
                approval.status === 'Rejected' ? 'bg-red-50 border-red-200  ' :
                'bg-orange-50 border-orange-200  '
              }`}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-600  flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Client Feedback
                </p>
                <p className="text-sm text-slate-700 ">{approval.feedback}</p>
              </div>
            )}

            {/* PM Reply (if exists) */}
            {approval.pmReply && (
              <div className="bg-blue-50  border border-blue-200  rounded-lg p-4">
                <p className="text-xs font-bold uppercase tracking-wider mb-1 text-blue-700  flex items-center gap-1">
                  <Send className="w-3 h-3" /> PM Reply
                </p>
                <p className="text-sm text-slate-700 ">{approval.pmReply}</p>
              </div>
            )}

            {/* Audit Trail */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Audit Trail
              </h3>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {auditTrail.map((entry, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${AUDIT_COLORS[entry.type] || 'bg-slate-400'}`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      <div className="flex-1 pb-1">
                        <p className="text-sm font-semibold text-slate-900 ">{entry.actor}</p>
                        <p className="text-sm text-slate-600 ">{entry.action}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{entry.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer — Actions */}
          <div className="sticky bottom-0 z-20 bg-slate-50/80 backdrop-blur-md px-6 py-5 border-t border-border space-y-3">
            {/* CLIENT: Respond */}
            {isClient && approval.status === 'Pending' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-600 ">Your Response</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['Approved', 'Rejected', 'Changes Requested'].map(decision => (
                    <button
                      key={decision}
                      onClick={() => setClientDecision(decision)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border-2 transition-all ${
                        clientDecision === decision
                          ? decision === 'Approved' ? 'bg-green-500 text-white border-green-500' :
                            decision === 'Rejected' ? 'bg-red-500 text-white border-red-500' :
                            'bg-orange-500 text-white border-orange-500'
                          : 'border-border text-slate-600  hover:border-slate-400'
                      }`}
                    >
                      {decision === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                      {decision === 'Rejected' && <XCircle className="w-3.5 h-3.5 inline mr-1" />}
                      {decision === 'Changes Requested' && <RotateCcw className="w-3.5 h-3.5 inline mr-1" />}
                      {decision}
                    </button>
                  ))}
                </div>
                {clientDecision && (
                  <textarea
                    rows="2"
                    placeholder="Add a comment (optional)..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    value={clientComment}
                    onChange={e => setClientComment(e.target.value)}
                  />
                )}
                <button
                  disabled={!clientDecision}
                  onClick={handleClientResponse}
                  className="w-full py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Response
                </button>
              </div>
            )}

            {/* PM: Reply when changes requested */}
            {isPM && approval.status === 'Changes Requested' && !approval.pmReply && (
              <div className="space-y-2">
                {showPmReply ? (
                  <>
                    <textarea
                      rows="2"
                      placeholder="Reply to the client's change request..."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                      value={pmReply}
                      onChange={e => setPmReply(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button onClick={handlePmReply} disabled={!pmReply.trim()} className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-40">
                        Send Reply
                      </button>
                      <button onClick={() => setShowPmReply(false)} className="px-4 py-2 text-sm hover:bg-slate-100 :bg-slate-800 rounded-lg transition-colors">
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => setShowPmReply(true)} className="w-full py-2.5 border-2 border-orange-400 text-orange-600 hover:bg-orange-50 :bg-orange-900/20 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Reply to Changes Request
                  </button>
                )}
              </div>
            )}

            {/* PM: Close approval */}
            {isPM && ['Approved', 'Rejected', 'Changes Requested'].includes(approval.status) && (
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-800  :bg-slate-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Close Approval
              </button>
            )}

            {approval.status === 'Closed' && (
              <div className="flex items-center justify-center gap-2 text-green-600  font-semibold py-2">
                <Lock className="w-4 h-4" /> Approval Closed
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApprovalDetailModal;
