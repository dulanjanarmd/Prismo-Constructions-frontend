import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  X, FileText, Calendar, CheckCircle2, XCircle, RotateCcw,
  Lock, Send, MessageSquare, Clock, ListTodo, Paperclip, Image as ImageIcon
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

const ApprovalDetailModal = ({ approval, project, onClose, onUpdate }) => {
  const { currentUser } = useAuth();
  const { logs } = useData();

  const isPM = currentUser?.role === 'project_manager' || currentUser?.role === 'pm';
  const isClient = currentUser?.role === 'client';

  const [clientDecision, setClientDecision] = useState('');
  const [clientComment, setClientComment] = useState('');
  const [pmReply, setPmReply] = useState('');
  const [showPmReply, setShowPmReply] = useState(false);

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
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 :bg-slate-800 rounded-full transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 space-y-7">
            {/* Description */}
            {approval.description && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Request Details
                </h3>
                <div className="bg-slate-50  rounded-lg p-4 border border-border">
                  <p className="text-sm text-slate-700  leading-relaxed">{approval.description}</p>
                </div>
              </div>
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
          <div className="sticky bottom-0 bg-slate-50/80  backdrop-blur-md px-6 py-5 border-t border-border space-y-3">
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
