import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  X, User, Calendar, Flag, Tag, ListTodo, CheckCircle2,
  RotateCcw, Lock, Image as ImageIcon, AlertTriangle, MessageSquare, Send, UploadCloud, Edit, Trash2
} from 'lucide-react';

const PRIORITY_STYLES = {
  High: 'bg-red-500 text-white',
  Medium: 'bg-amber-500 text-white',
  Low: 'bg-blue-500 text-white'
};

const STATUS_STYLES = {
  'To Do': 'bg-[#a855f7] text-white',
  'In Progress': 'bg-[#06b6d4] text-white',
  'Completed': 'bg-[#22c55e] text-white',
  'Reopened': 'bg-[#f59e0b] text-white',
  'Closed': 'bg-[#64748b] text-white'
};

const TaskDetailModal = ({ task, project, onClose, onEdit, onDelete }) => {
  const { updateTask, users } = useData();
  const { currentUser } = useAuth();
  const [evidenceUrl, setEvidenceUrl] = useState(task.evidence || '');
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [completionComment, setCompletionComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reAssignId, setReAssignId] = useState('');
  const [showReAssign, setShowReAssign] = useState(false);

  const isPM = currentUser?.role === 'project_manager' || currentUser?.role === 'pm';
  const isSiteEngineer = currentUser?.role === 'site_engineer';
  const isAssigned = isSiteEngineer && (task.assignedTo === currentUser.id || task.assignedTo === `u${currentUser.id}`);

  const assignee = users.find(u => u.id === task.assignedTo || `u${u.id}` === task.assignedTo);
  const milestone = (project?.milestones || []).find(m => m.id === task.milestoneId);
  const siteEngineers = users.filter(u => u.role === 'site_engineer');

  const handleStatusChange = (newStatus) => {
    updateTask(task.id, { status: newStatus });
    onClose();
  };

  const handleEvidenceSubmit = () => {
    // Evidence is strongly recommended but we can allow it without if needed, 
    // though the spec says "require evidence" or "forces photo upload (recommended)".
    // We'll require it for the UI.
    if (!evidenceUrl) return;
    
    const updates = { evidence: evidenceUrl, status: 'Completed' };
    
    // Add completion comment as a comment if provided
    if (completionComment) {
      const commentObj = {
        id: Date.now(),
        text: completionComment,
        author: currentUser.name,
        date: new Date().toISOString(),
        isCompletionNote: true
      };
      updates.comments = [...(task.comments || []), commentObj];
    }
    
    updateTask(task.id, updates);
    onClose();
  };

  const handleEvidenceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEvidence(true);
    const body = new FormData();
    body.append('file', file);
    try {
      const response = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentUser.token}` },
        body
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Upload failed (${response.status})`);
      }
      const uploaded = await response.json();
      setEvidenceUrl(uploaded.fullUrl || `http://localhost:8080${uploaded.url}`);
    } catch (error) {
      console.error('Error uploading evidence:', error);
      alert(error.message || 'Failed to upload evidence. Please try again.');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const commentObj = {
      id: Date.now(),
      text: newComment,
      author: currentUser.name,
      date: new Date().toISOString()
    };
    
    updateTask(task.id, {
      comments: [...(task.comments || []), commentObj]
    });
    setNewComment('');
  };

  const handleReAssign = () => {
    if (!reAssignId) return;
    updateTask(task.id, { assignedTo: reAssignId, status: 'To Do' });
    setShowReAssign(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-card w-full max-w-lg h-full max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 flex-wrap mb-1 -ml-2">
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm ${STATUS_STYLES[task.status] || STATUS_STYLES['To Do']}`}>
                  {task.status}
                </span>
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES['Medium']}`}>
                  {task.priority}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900  leading-tight">{task.title}</h2>
            </div>
            <div className="flex items-center shrink-0">
              {onEdit && (
                <button onClick={onEdit} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-full transition-colors" title="Edit task">
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && task.status === 'To Do' && (
                <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete task">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors ml-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 space-y-6">
            {/* Description */}
            {task.description && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-slate-700  text-sm leading-relaxed">{task.description}</p>
              </div>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Assigned To</p>
                  <p className="text-sm font-semibold">{assignee?.name || 'Unassigned'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Due Date</p>
                  <p className="text-sm font-semibold">{task.dueDate || '—'}</p>
                </div>
              </div>
              {milestone && (
                <div className="flex items-start gap-2 col-span-2">
                  <Flag className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Linked Milestone</p>
                    <p className="text-sm font-semibold">{milestone.name || milestone.title}</p>
                  </div>
                </div>
              )}
              {project && (
                <div className="flex items-start gap-2 col-span-2">
                  <ListTodo className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Project</p>
                    <p className="text-sm font-semibold">{project.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence section */}
            <div className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Completion Evidence
              </h3>

              {task.evidence ? (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={task.evidence}
                    alt="Task completion evidence"
                    className="w-full object-cover max-h-48"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="p-2 bg-green-50  text-xs text-green-700  font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Evidence submitted
                  </div>
                </div>
              ) : (
                <div>
                  {(isSiteEngineer && isAssigned && task.status === 'In Progress') ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Evidence Photo <span className="text-red-500">*</span></label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                          onChange={handleEvidenceUpload}
                          disabled={uploadingEvidence}
                        />
                        {uploadingEvidence && <p className="text-xs text-slate-400 mt-1">Uploading evidence...</p>}
                        {evidenceUrl && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><UploadCloud className="w-3 h-3" /> Evidence uploaded</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Completion Note (Optional)</label>
                        <textarea
                          rows="2"
                          placeholder="Add a note about the completion..."
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                          value={completionComment}
                          onChange={e => setCompletionComment(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={handleEvidenceSubmit}
                        disabled={!evidenceUrl || uploadingEvidence}
                        className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                      >
                        Submit Evidence & Mark Complete
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No evidence submitted yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Activity & Comments
              </h3>
              
              <div className="space-y-4 mb-4">
                {(task.comments && task.comments.length > 0) ? (
                  task.comments.map((comment) => (
                    <div key={comment.id} className={`p-3 rounded-lg text-sm ${comment.isCompletionNote ? 'bg-green-50  border border-green-200 ' : 'bg-slate-50 '}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-900 ">{comment.author}</span>
                        <span className="text-xs text-slate-400">{new Date(comment.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <p className="text-slate-700 ">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No comments yet.</p>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a comment..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-3 py-2 bg-primary text-white rounded-md transition-colors disabled:opacity-50 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Re-assign section (PM only) */}
            {isPM && (
              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Re-assign Task</h3>
                {showReAssign ? (
                  <div className="flex gap-2">
                    <select
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={reAssignId}
                      onChange={e => setReAssignId(e.target.value)}
                    >
                      <option value="" disabled>Select Engineer</option>
                      {siteEngineers.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    <button onClick={handleReAssign} disabled={!reAssignId} className="px-3 py-2 bg-primary text-white rounded-md text-sm font-medium disabled:opacity-50 hover:bg-blue-600 transition-colors">
                      Assign
                    </button>
                    <button onClick={() => setShowReAssign(false)} className="px-3 py-2 text-slate-500 hover:bg-slate-100 :bg-slate-800 rounded-md text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowReAssign(true)}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Change assignee →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border bg-slate-50/50  sticky bottom-0">
            {/* Site Engineer actions */}
            {isSiteEngineer && isAssigned && (
              <div className="space-y-2">
                {task.status === 'To Do' && (
                  <button onClick={() => handleStatusChange('In Progress')} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors">
                    Start Work → In Progress
                  </button>
                )}
                {task.status === 'Reopened' && (
                  <button onClick={() => handleStatusChange('In Progress')} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Restart Work
                  </button>
                )}
              </div>
            )}

            {/* PM actions */}
            {isPM && task.status === 'Completed' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange('Closed')}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Accept & Close
                </button>
                <button
                  onClick={() => handleStatusChange('Reopened')}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reopen
                </button>
              </div>
            )}

            {task.status === 'Closed' && (
              <div className="flex items-center justify-center gap-2 text-green-600 font-semibold py-2">
                <CheckCircle2 className="w-5 h-5" />
                Task Closed — All Done!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDetailModal;
