import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  X, User, Calendar, Flag, Tag, ListTodo, CheckCircle2,
  RotateCcw, Lock, Image as ImageIcon, AlertTriangle, MessageSquare, Send, UploadCloud, Edit, Trash2
} from 'lucide-react';

import { PRIORITY_STYLES, STATUS_STYLES } from '../utils/constants';

const TaskDetailModal = ({ task, project, onClose, onEdit, onDelete }) => {
  const { updateTask, users } = useData();
  const { currentUser } = useAuth();
  const parsedInitialEvidence = useMemo(() => {
    if (!task.evidence) return [];
    try {
      const parsed = JSON.parse(task.evidence);
      return Array.isArray(parsed) ? parsed : [{ url: task.evidence, name: 'Evidence', type: '' }];
    } catch (e) {
      return [{ url: task.evidence, name: 'Evidence', type: '' }];
    }
  }, [task.evidence]);
  
  const [evidenceFiles, setEvidenceFiles] = useState(parsedInitialEvidence);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [completionComment, setCompletionComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentFileUrl, setCommentFileUrl] = useState('');
  const [commentFileName, setCommentFileName] = useState('');
  const [uploadingCommentFile, setUploadingCommentFile] = useState(false);
  const [reAssignId, setReAssignId] = useState('');
  const [showReAssign, setShowReAssign] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [activeActionCommentId, setActiveActionCommentId] = useState(null);

  const isPM = currentUser?.role === 'project_manager' || currentUser?.role === 'pm';
  const isSiteEngineer = currentUser?.role === 'site_engineer';
  const isAssigned = isSiteEngineer && (task.assignedTo === currentUser.id || task.assignedTo === `u${currentUser.id}`);

  const assignee = users.find(u => u.id === task.assignedTo || `u${u.id}` === task.assignedTo);
  const milestone = (project?.milestones || []).find(m => m.id === task.milestoneId);
  const siteEngineers = users.filter(u => u.role === 'site_engineer');

  const handleStatusChange = async (newStatus) => {
    try {
      const updates = { status: newStatus };
      if (newStatus === 'Reopened') {
        const hasEvidence = evidenceFiles.length > 0;
        if (hasEvidence) {
          const reopenComment = {
            id: Date.now(),
            text: "Evidence requires revision. Please update.",
            author: currentUser?.name || 'System',
            timestamp: new Date().toISOString(),
            isCompletionNote: false
          };
          updates.comments = [...(task.comments || []), reopenComment];
        }
      }
      await updateTask(task.id, updates);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  const handleEvidenceSubmit = () => {
    if (evidenceFiles.length === 0) return;
    
    const updates = { 
      evidence: JSON.stringify(evidenceFiles), 
      status: 'Completed' 
    };
    
    const newComments = (task.comments || []).filter(c => !c.isCompletionNote);
    
    if (completionComment) {
      const commentObj = {
        id: Date.now(),
        text: completionComment,
        author: currentUser.name,
        role: currentUser.role,
        date: new Date().toISOString(),
        isCompletionNote: true
      };
      updates.comments = [...newComments, commentObj];
    } else {
      // If they didn't write a new note, just keep whatever comments are left (which have completion notes stripped)
      // Actually, if we strip them unconditionally, old completion notes are wiped on resubmit. This is exactly what we want.
      updates.comments = newComments;
    }
    
    updateTask(task.id, updates);
    onClose();
  };

  const handleEvidenceUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    if (evidenceFiles.length + files.length > 5) {
      alert('You can only upload up to 5 files for evidence.');
      return;
    }

    setUploadingEvidence(true);
    const newFiles = [];
    
    for (const file of files) {
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
        newFiles.push({
          url: uploaded.fullUrl || `http://localhost:8080${uploaded.url}`,
          name: uploaded.originalName || file.name,
          type: file.type || ''
        });
      } catch (error) {
        console.error('Error uploading evidence:', error);
        alert(error.message || 'Failed to upload evidence. Please try again.');
      }
    }
    
    setEvidenceFiles(prev => [...prev, ...newFiles]);
    setUploadingEvidence(false);
  };
  
  const handleRemoveEvidence = (index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCommentFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCommentFile(true);
    const body = new FormData();
    body.append('file', file);
    try {
      const response = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentUser.token}` },
        body
      });
      if (!response.ok) throw new Error('Upload failed');
      const uploaded = await response.json();
      setCommentFileUrl(uploaded.fullUrl || `http://localhost:8080${uploaded.url}`);
      setCommentFileName(uploaded.originalName || file.name);
    } catch (error) {
      console.error(error);
      alert('Failed to upload attachment');
    } finally {
      setUploadingCommentFile(false);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() && !commentFileUrl) return;
    
    const commentObj = {
      id: Date.now(),
      text: newComment,
      author: currentUser.name,
      role: currentUser.role,
      date: new Date().toISOString(),
      fileUrl: commentFileUrl,
      fileName: commentFileName
    };
    
    updateTask(task.id, {
      comments: [...(task.comments || []), commentObj]
    });
    setNewComment('');
    setCommentFileUrl('');
    setCommentFileName('');
  };

  const handleReAssign = () => {
    if (!reAssignId) return;
    updateTask(task.id, { assignedTo: reAssignId, status: 'To Do' });
    setShowReAssign(false);
    onClose();
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    const updatedComments = task.comments.filter(c => c.id !== commentId);
    updateTask(task.id, { comments: updatedComments });
  };

  const handleEditCommentSubmit = (e, commentId) => {
    e.preventDefault();
    if (!editCommentText.trim()) return;
    const updatedComments = task.comments.map(c => 
      c.id === commentId ? { ...c, text: editCommentText } : c
    );
    updateTask(task.id, { comments: updatedComments });
    setEditingCommentId(null);
    setEditCommentText('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-card w-full max-w-5xl h-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border z-10 shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">{task.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm ${STATUS_STYLES[task.status] || STATUS_STYLES['To Do']}`}>
                  {task.status}
                </span>
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES['Medium']}`}>
                  {task.priority}
                </span>
              </div>
            </div>
            <div className="flex items-center shrink-0">

              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors ml-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Split View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Column: Details */}
            <div className="w-1/2 p-6 space-y-6 overflow-y-auto border-r border-border">
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

            </div>

            {/* Right Column: Activity & Comments */}
            <div className="w-1/2 flex flex-col bg-slate-50/50">
              
              <div className="flex-1 overflow-y-auto">
                {/* Evidence section */}
                <div className="p-6 bg-white border-b border-border">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Completion Evidence
                  </h3>

                  {/* View/Edit Evidence */}
                  <div className="space-y-3">
                    {evidenceFiles.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {evidenceFiles.map((file, idx) => (
                          <div key={idx} className="relative rounded-lg overflow-hidden border border-border p-2 group bg-slate-50">
                            {file.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-24 object-cover rounded"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <a href={file.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center h-24 gap-2 text-primary hover:underline bg-white rounded">
                                <UploadCloud className="w-6 h-6" />
                                <span className="text-xs text-center px-2 truncate w-full">{file.name}</span>
                              </a>
                            )}
                            {(isSiteEngineer && isAssigned && (task.status === 'In Progress' || task.status === 'Reopened')) && (
                              <button 
                                onClick={() => handleRemoveEvidence(idx)}
                                className="absolute top-3 right-3 p-1 bg-white/80 hover:bg-red-100 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Completion Notes displayed here */}
                    {task.comments && task.comments.filter(c => c.isCompletionNote).map(comment => (
                      <div key={comment.id} className="relative mt-3 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800 group">
                        <div className="font-semibold text-xs mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completion Note from {comment.author}</div>
                        {comment.text}
                        {(isSiteEngineer && isAssigned && (task.status === 'In Progress' || task.status === 'Reopened')) && (
                          <button 
                            onClick={() => handleDeleteComment(comment.id)}
                            className="absolute top-2 right-2 p-1 text-green-600 hover:bg-green-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete this note"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    {(isSiteEngineer && isAssigned && (task.status === 'In Progress' || task.status === 'Reopened')) ? (
                      <div className="space-y-3 mt-4 border-t border-slate-100 pt-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Upload Evidence (Max 5 images/docs) <span className="text-red-500">*</span></label>
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            onChange={handleEvidenceUpload}
                            disabled={uploadingEvidence || evidenceFiles.length >= 5}
                          />
                          {uploadingEvidence && <p className="text-xs text-slate-400 mt-1">Uploading evidence...</p>}
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
                          disabled={evidenceFiles.length === 0 || uploadingEvidence}
                          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                        >
                          {task.status === 'Reopened' ? 'Re-Submit Evidence & Mark Complete' : 'Submit Evidence & Mark Complete'}
                        </button>
                      </div>
                    ) : (
                      evidenceFiles.length === 0 && <p className="text-sm text-slate-400 italic mt-2">No evidence submitted yet.</p>
                    )}
                  </div>
                </div>

                <div className="p-6 pb-2">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Activity & Comments
                  </h3>
                </div>
                
                <div className="p-4 pt-0 space-y-4 flex flex-col">
                {(() => {
                  const chatComments = task.comments ? task.comments.filter(c => !c.isCompletionNote) : [];
                  if (chatComments.length === 0) {
                    return <p className="text-[13px] text-slate-400 italic text-center py-8">No comments yet.</p>;
                  }

                  let lastDateStr = null;
                  
                  return chatComments.map((comment) => {
                    const commentDate = new Date(comment.date);
                    const currentDateStr = commentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                    const showDateHeader = currentDateStr !== lastDateStr;
                    lastDateStr = currentDateStr;

                    const isPMComment = comment.role === 'pm' || comment.role === 'project_manager';
                    const isSEComment = comment.role === 'site_engineer';
                    const isOwnComment = currentUser.name === comment.author;

                    const alignmentClass = isOwnComment ? 'self-end items-end' : 'self-start items-start';
                    const bubbleBg = isOwnComment ? 'bg-primary text-white shadow-sm border border-transparent' : 'bg-slate-100 text-slate-800 border border-slate-200 shadow-sm';
                    const textColor = isOwnComment ? 'text-white' : 'text-slate-800';

                    return (
                    <React.Fragment key={comment.id}>
                      {showDateHeader && (
                        <div className="flex justify-center my-3 w-full">
                          <span className="glass-card px-4 py-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            {currentDateStr}
                          </span>
                        </div>
                      )}
                      <div className={`max-w-[85%] flex flex-col ${alignmentClass}`}>
                        <div 
                          className={`p-3 rounded-lg text-[13px] leading-relaxed flex flex-col ${bubbleBg} select-none`}
                          onDoubleClick={() => {
                            if (isOwnComment) {
                              setActiveActionCommentId(activeActionCommentId === comment.id ? null : comment.id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`font-bold text-[11px] ${isOwnComment ? 'text-white' : 'text-slate-700'}`}>{comment.author}</span>
                          </div>
                          {editingCommentId === comment.id ? (
                            <form onSubmit={(e) => handleEditCommentSubmit(e, comment.id)} className="flex flex-col gap-2 min-w-[200px]">
                              <textarea
                                rows="2"
                                className="w-full rounded border border-input bg-white px-2 py-1 text-[13px] outline-none resize-none text-slate-800"
                                value={editCommentText}
                                onChange={e => setEditCommentText(e.target.value)}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setEditingCommentId(null)} className="text-[10px] text-slate-500 hover:underline">Cancel</button>
                                <button type="submit" className="text-[10px] text-primary hover:underline font-medium bg-white px-2 py-0.5 rounded">Save</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              {comment.text && <p className={`${textColor} whitespace-pre-wrap break-words`}>{comment.text}</p>}
                              {comment.fileUrl && (
                                <div className="mt-1.5">
                                  {comment.fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                                    <img src={comment.fileUrl} alt="Attached" className="max-h-32 rounded-lg object-cover border border-slate-200" />
                                  ) : (
                                    <a href={comment.fileUrl} target="_blank" rel="noreferrer" className={`text-xs hover:underline flex items-center gap-1 ${isOwnComment ? 'text-white' : 'text-primary'}`}>
                                      <UploadCloud className="w-3 h-3" /> {comment.fileName || 'View Attachment'}
                                    </a>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                          <div className={`text-[9px] mt-1.5 text-right ${isOwnComment ? 'text-white/80' : 'text-slate-400'}`}>
                            {commentDate.toLocaleTimeString([], { timeStyle: 'short' })}
                          </div>
                        </div>

                        {isOwnComment && activeActionCommentId === comment.id && editingCommentId !== comment.id && !comment.isCompletionNote && (
                          <div className={`flex gap-2 px-2 mt-1 justify-end`}>
                            <button onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.text); setActiveActionCommentId(null); }} className="text-[10px] text-slate-400 hover:text-primary transition-colors flex items-center gap-0.5"><Edit className="w-3 h-3" /> Edit</button>
                            <button onClick={() => { handleDeleteComment(comment.id); setActiveActionCommentId(null); }} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-0.5"><Trash2 className="w-3 h-3" /> Delete</button>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Add Comment Form */}
              <div className="p-4 bg-white border-t border-border shrink-0">
                <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a comment..."
                      className="flex-1 rounded-md border border-input bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                    />
                    <label className={`flex items-center justify-center px-3 py-2 border border-input bg-slate-50 rounded-md cursor-pointer hover:bg-slate-100 transition-colors ${uploadingCommentFile ? 'opacity-50' : ''}`}>
                      <UploadCloud className="w-4 h-4 text-slate-500" />
                      <input type="file" className="hidden" onChange={handleCommentFileUpload} disabled={uploadingCommentFile} />
                    </label>
                    <button
                      type="submit"
                      disabled={(!newComment.trim() && !commentFileUrl) || uploadingCommentFile}
                      className="px-4 py-2 bg-primary text-white rounded-md transition-all disabled:opacity-50 hover:opacity-90 shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  {commentFileUrl && (
                    <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Attached: {commentFileName}
                      <button type="button" onClick={() => { setCommentFileUrl(''); setCommentFileName(''); }} className="text-red-500 hover:underline ml-2">Remove</button>
                    </div>
                  )}
                  {uploadingCommentFile && <p className="text-xs text-slate-400 mt-1">Uploading...</p>}
                </form>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-slate-50 shrink-0 flex items-center justify-between gap-4 flex-wrap">
            {/* Left side: Management Actions (Edit, Delete, Reassign) */}
            <div className="flex items-center gap-2">
              {isPM && task.status !== 'Closed' && task.status !== 'Completed' && (
                <div className="relative">
                  {showReAssign ? (
                    <div className="flex gap-2 items-center">
                      <select
                        className="rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
                        value={reAssignId}
                        onChange={e => setReAssignId(e.target.value)}
                      >
                        <option value="" disabled>Select Engineer</option>
                        {siteEngineers.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                      <button onClick={handleReAssign} disabled={!reAssignId} className="px-3 py-2 bg-primary text-white rounded-md text-sm font-medium disabled:opacity-50 hover:bg-blue-600 transition-colors shadow-sm">
                        Assign
                      </button>
                      <button onClick={() => setShowReAssign(false)} className="px-3 py-2 text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-md text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReAssign(true)}
                      className="px-4 py-2 text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Re-assign
                    </button>
                  )}
                </div>
              )}

              {onEdit && !showReAssign && task.status !== 'Closed' && task.status !== 'Completed' && (
                <button onClick={onEdit} className="px-4 py-2 text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </button>
              )}
              {onDelete && task.status === 'To Do' && !showReAssign && (
                <button onClick={onDelete} className="px-4 py-2 text-sm font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>

            {/* Right side: Status Workflow Actions */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Site Engineer actions */}
              {isSiteEngineer && isAssigned && (
                <>
                  {task.status === 'To Do' && (
                    <button onClick={() => handleStatusChange('In Progress')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2">
                      Start Work
                    </button>
                  )}
                  {task.status === 'Reopened' && (
                    <button onClick={() => handleStatusChange('In Progress')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow">
                      <AlertTriangle className="w-4 h-4" /> Restart Work
                    </button>
                  )}
                </>
              )}

              {/* PM actions */}
              {isPM && task.status === 'Completed' && (
                <>
                  <button
                    onClick={() => handleStatusChange('Closed')}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept & Close
                  </button>
                  <button
                    onClick={() => handleStatusChange('Reopened')}
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <RotateCcw className="w-4 h-4" /> Reopen
                  </button>
                </>
              )}

              {task.status === 'Closed' && (
                <div className="flex items-center justify-center gap-2 text-slate-600 font-semibold px-5 py-2.5 bg-slate-100 rounded-lg shadow-sm text-sm border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Task Closed
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDetailModal;
