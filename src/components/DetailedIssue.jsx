import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus, ChevronDown, ChevronUp, X, MessageSquare, MapPin, Wrench, Clock, User as UserIcon, Calendar, UploadCloud, Video, Edit, Trash2, CheckCircle, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DetailedIssue = ({ issue, projects, tasks, users, onClose }) => {
  const { currentUser } = useAuth();
  const { getIssueComments, addIssueComment, getIssueMeetings, addIssueMeeting, updateIssueStatus, updateIssue, deleteIssue } = useData();
  
  const [comments, setComments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('GENERAL');
  
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingData, setMeetingData] = useState({ title: '', scheduledTime: '', meetingLink: '' });
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [commentPhoto, setCommentPhoto] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ ...issue });
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [isUploadingEditDoc, setIsUploadingEditDoc] = useState(false);

  const handleEditFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (type === 'image') setIsUploadingEditImage(true);
    else setIsUploadingEditDoc(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentUser?.token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const finalUrl = data.fullUrl || data.url;
      
      if (type === 'image') {
        setEditData(prev => {
          const current = prev.photoUrl ? prev.photoUrl.split(',') : [];
          if (current.length >= 5) { alert('Max 5 images allowed'); return prev; }
          return { ...prev, photoUrl: [...current, finalUrl].join(',') };
        });
      } else {
        setEditData(prev => {
          const current = prev.documentUrl ? prev.documentUrl.split(',') : [];
          if (current.length >= 5) { alert('Max 5 documents allowed'); return prev; }
          return { ...prev, documentUrl: [...current, finalUrl].join(',') };
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload file');
    } finally {
      if (type === 'image') setIsUploadingEditImage(false);
      else setIsUploadingEditDoc(false);
    }
  };

  const removeEditFile = (type, index) => {
    setEditData(prev => {
      if (type === 'image') {
        const urls = prev.photoUrl.split(',');
        urls.splice(index, 1);
        return { ...prev, photoUrl: urls.join(',') };
      } else {
        const urls = prev.documentUrl.split(',');
        urls.splice(index, 1);
        return { ...prev, documentUrl: urls.join(',') };
      }
    });
  };

  const project = projects.find(p => String(p.id) === String(issue.projectId));
  const task = tasks.find(t => String(t.id) === String(issue.taskId));
  
  const assigneeStr = String(issue.assignee || issue.assigneeId || '');
  const assignedUser = users.find(u => String(u.id) === assigneeStr) || { name: 'Unassigned', role: '' };
  
  const reporterStr = String(issue.reportedBy || issue.reportedById || '');
  const reporterUser = users.find(u => String(u.id) === reporterStr) || { name: 'Unknown', role: '' };
  
  const isReporter = String(currentUser.id).replace(/^u/, '') === reporterStr.replace(/^u/, '');

  useEffect(() => {
    if ((issue.status === 'OPEN' || issue.status === 'Open') && !isReporter) {
      updateIssueStatus(String(issue.id).replace('i', ''), 'IN_PROGRESS', null);
    }
  }, [issue.status, issue.id, isReporter, updateIssueStatus]);
  const getFileUrl = (url) => url?.startsWith('/uploads/') ? `http://localhost:8080${url}` : url;
  const isImageFile = (url) => /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(url || '');

  const getMinMaxDates = () => {
    let min = null;
    let max = null;
    
    const parseLocalDate = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      if (typeof dateStr === 'string' && dateStr.length === 10) {
        const [y, m, day] = dateStr.split('-');
        return new Date(y, m - 1, day);
      }
      return d;
    };

    if (project?.startDate) min = parseLocalDate(project.startDate);
    if (project?.endDate) max = parseLocalDate(project.endDate);

    if (task) {
      if (task.startDate) {
        const ts = parseLocalDate(task.startDate);
        if (!min || ts > min) min = ts;
      }
      if (task.dueDate) {
        const td = parseLocalDate(task.dueDate);
        if (!max || td < max) max = td;
      }
    }
    
    const format = (d, isMax) => {
      if (!d || isNaN(d.getTime())) return undefined;
      const clone = new Date(d.getTime());
      if (isMax) clone.setHours(23, 59, 59);
      else clone.setHours(0, 0, 0);
      
      const pad = (n) => String(n).padStart(2, '0');
      return `${clone.getFullYear()}-${pad(clone.getMonth()+1)}-${pad(clone.getDate())}T${pad(clone.getHours())}:${pad(clone.getMinutes())}`;
    };

    return { min: format(min, false), max: format(max, true) };
  };

  const { min: minMeetingDate, max: maxMeetingDate } = getMinMaxDates();

  useEffect(() => {
    const fetchData = async () => {
      const c = await getIssueComments(String(issue.id).replace('i', ''));
      const m = await getIssueMeetings(String(issue.id).replace('i', ''));
      setComments(c);
      setMeetings(m);
      setLoading(false);
    };
    fetchData();
  }, [issue.id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const currentUrls = commentPhoto ? commentPhoto.split(',') : [];
    if (currentUrls.length >= 5) {
      alert('Maximum 5 files allowed per comment.');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentUser?.token}` },
        body: data
      });
      if (res.ok) {
        const json = await res.json();
        const newUrl = json.fullUrl || `http://localhost:8080${json.url}`;
        setCommentPhoto([...currentUrls, newUrl].join(','));
      } else {
        const message = await res.text();
        alert(message || `File upload failed (${res.status})`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'File upload failed. Please try again.');
    }
    setUploading(false);
  };

  const removeCommentFile = (index) => {
    const urls = commentPhoto.split(',');
    urls.splice(index, 1);
    setCommentPhoto(urls.join(','));
  };

  const submitComment = async () => {
    if (!newComment.trim() && !commentPhoto) return;
    const body = {
      message: newComment.trim() || 'File attachment',
      commentType,
      photoUrl: commentPhoto || null
    };
    const saved = await addIssueComment(String(issue.id).replace('i', ''), body);
    if (saved) {
      setComments([...comments, { ...saved, sender: currentUser }]);
      setNewComment('');
      setCommentPhoto('');
    } else {
      alert('Failed to add resolution note. Please try again.');
    }
    
    // Auto status update logic based on comment type and role
    if (commentType === 'INFO_REQUEST') {
      if (currentUser.role === 'PROJECT_MANAGER') updateIssueStatus(String(issue.id).replace('i', ''), 'INFO_REQUESTED_SE', reporterUser.id);
      else if (currentUser.role === 'CEO') updateIssueStatus(String(issue.id).replace('i', ''), 'INFO_REQUESTED_PM', null);
    } else if (commentType === 'SOLUTION') {
      updateIssueStatus(String(issue.id).replace('i', ''), 'RESOLVED', null);
    }
  };

  const submitMeeting = async (e) => {
    e.preventDefault();
    const saved = await addIssueMeeting(String(issue.id).replace('i', ''), meetingData);
    if (saved) {
      setMeetings([...meetings, { ...saved, organizer: currentUser }]);
      setIsMeetingModalOpen(false);
    }
  };

  const handleEscalateToCEO = () => {
    updateIssueStatus(String(issue.id).replace('i', ''), 'PENDING_CEO', null); // Ideally find CEO id
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateIssue(String(issue.id).replace(/^i/, ''), editData);
      if (!updated) throw new Error('Failed to update issue');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating issue:', error);
      alert(error.message || 'Failed to update issue. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      const success = await deleteIssue(issue.id);
      if (success !== false && onClose) {
        onClose();
      }
    }
  };

  const handleResolve = async () => {
    await updateIssueStatus(String(issue.id).replace('i', ''), 'RESOLVED', null);
  };



  return (
    <div className="flex flex-col h-full relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 flex flex-col gap-6">
        {/* Description Section */}
        <div className="glass-card p-6">
          <h4 className="font-bold text-slate-800 mb-2">Description</h4>
          <p className="text-slate-600 whitespace-pre-wrap">{issue.description}</p>
        </div>

        {/* Details Grid */}
        <div className="glass-card p-6">
          <h4 className="font-bold text-slate-800 mb-4">Issue Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-2">
              <UserIcon className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700">Reported By</p>
                <p className="text-slate-600">{users?.find(u => String(u.id) === String(issue.reportedBy || issue.reportedById || ''))?.name || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700">Reported Date</p>
                <p className="text-slate-600">{issue.reportedDate || (issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : '—')}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700">Status</p>
                <p className="text-slate-600">{issue.status}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700">Issue Type</p>
                <p className="text-slate-600">{issue.issueType || 'Safety'}</p>
              </div>
            </div>
            {issue.tradeInvolved && (
              <div className="flex items-start gap-2">
                <Wrench className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700">Subcontractor / Trade</p>
                  <p className="text-slate-600">{issue.tradeInvolved}</p>
                </div>
              </div>
            )}
            {issue.costImpact && (
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-bold mt-0.5 text-sm">Rs.</span>
                <div>
                  <p className="font-semibold text-slate-700">Est. Cost Impact</p>
                  <p className="text-slate-600">LKR {Number(issue.costImpact).toLocaleString('en-LK')}</p>
                </div>
              </div>
            )}
            {issue.location && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700">Location</p>
                  <p className="text-slate-600">{issue.location}</p>
                </div>
              </div>
            )}
            {issue.equipmentInvolved && (
              <div className="flex items-start gap-2">
                <Wrench className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700">Equipment</p>
                  <p className="text-slate-600">{issue.equipmentInvolved}</p>
                </div>
              </div>
            )}
            {issue.estimatedDelayDays && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700">Estimated Delay</p>
                  <p className="text-slate-600">{issue.estimatedDelayDays} days</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Media & Documents */}
        {(issue.photoUrl || issue.documentUrl) && (
          <div className="glass-card p-6">
            <h4 className="font-bold text-slate-800 mb-4">Supporting Evidence</h4>
            <div className="flex flex-col gap-3">
              {issue.photoUrl && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {issue.photoUrl.split(',').map((url, idx) => (
                    <div key={`photo-${idx}`} className="w-full rounded-lg overflow-hidden border border-border bg-slate-50 flex items-center justify-center">
                      {isImageFile(url) ? (
                        <img src={getFileUrl(url)} alt={`Issue Evidence ${idx + 1}`} className="w-full h-32 object-cover" />
                      ) : (
                        <a href={getFileUrl(url)} target="_blank" rel="noreferrer" className="block p-4 text-sm text-amber-600 hover:underline w-full text-center">
                          Attachment {idx + 1}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {issue.documentUrl && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {issue.documentUrl.split(',').map((url, idx) => (
                    <a key={`doc-${idx}`} href={getFileUrl(url)} target="_blank" rel="noreferrer" className="inline-flex p-3 text-sm text-amber-600 hover:underline bg-amber-50 border border-amber-100 rounded-lg font-medium">
                      View Document {idx + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      {/* Timeline */}
      <div className="glass-card p-6">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          Resolution Timeline
        </h4>
        
        {loading ? (
          <p className="text-slate-400 text-sm">Loading timeline...</p>
        ) : (
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
            {(() => {
              const sortedItems = [...comments, ...meetings].sort((a, b) => new Date(a.createdAt || a.scheduledTime) - new Date(b.createdAt || b.scheduledTime));
              let lastDate = null;

              return sortedItems.map(item => {
                const itemDate = new Date(item.createdAt || item.scheduledTime);
                const dateString = itemDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const timeString = itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const showDateHeader = lastDate !== dateString;
                lastDate = dateString;
                
                const isMeeting = !!item.meetingLink;
                
                const renderItem = () => {
                  if (isMeeting) {
                    return (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 w-full">
                        <Video className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900">{item.title}</p>
                          <p className="text-xs text-blue-700 mb-2">Organized by {item.organizer?.name || 'Unknown'} for {timeString}</p>
                          <a href={item.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium">Join Meeting →</a>
                        </div>
                        <span className="text-xs text-blue-400 mt-auto">{timeString}</span>
                      </div>
                    );
                  }

                  const isInfoReq = item.commentType === 'INFO_REQUEST';
                  const isSolution = item.commentType === 'SOLUTION';
                  const isOwn = String(item.sender?.id) === String(currentUser?.id) || String(item.senderId) === String(currentUser?.id);
                  
                  return (
                    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-lg shadow-sm border max-w-[85%] min-w-[120px] relative pb-6 ${
                        isSolution ? 'bg-green-50 border-green-200' : 
                        isInfoReq ? 'bg-orange-50 border-orange-200' : 
                        isOwn ? 'bg-amber-100 border-amber-200' : 'bg-slate-100 border-slate-200'
                      }`}>
                        <div className="flex justify-between items-center mb-1 gap-4">
                          <span className="font-semibold text-sm text-slate-800">{isOwn ? 'You' : item.sender?.name || 'User'} {!isOwn && <span className="text-xs text-slate-500 font-normal">({item.sender?.role || ''})</span>}</span>
                        </div>
                        {isSolution && <span className="text-xs font-bold text-green-700 uppercase mb-1 block">Solution Provided</span>}
                        {isInfoReq && <span className="text-xs font-bold text-orange-700 uppercase mb-1 block">Information Requested</span>}
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                        {item.photoUrl && (
                          <div className={`flex flex-wrap gap-2 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            {item.photoUrl.split(',').map((url, idx) => (
                              isImageFile(url) ? (
                                <img key={idx} src={getFileUrl(url)} alt={`Attached ${idx+1}`} className="rounded max-w-xs max-h-40 border border-slate-200" />
                              ) : (
                                <a key={idx} href={getFileUrl(url)} target="_blank" rel="noreferrer" className="inline-block text-sm text-amber-600 hover:underline bg-amber-50 px-3 py-1.5 rounded border border-amber-100 font-medium">
                                  View Attached File {idx + 1}
                                </a>
                              )
                            ))}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 absolute bottom-1.5 right-3 whitespace-nowrap">{timeString}</span>
                      </div>
                    </div>
                  );
                };

                return (
                  <React.Fragment key={`${isMeeting ? 'm' : 'c'}${item.id}`}>
                    {showDateHeader && (
                      <div className="flex justify-center my-4">
                        <span className="bg-slate-50 border border-slate-200 text-slate-500 text-xs px-3 py-1 rounded shadow-sm font-medium">
                          {dateString}
                        </span>
                      </div>
                    )}
                    {renderItem()}
                  </React.Fragment>
                );
              });
            })()}
            {comments.length === 0 && meetings.length === 0 && <p className="text-sm text-slate-400 italic">No updates yet.</p>}
          </div>
        )}

        {/* Comment Box */}
        {issue.status !== 'RESOLVED' && (
          <div className="border-t border-slate-100 pt-4">
            <div className="border border-slate-300 rounded-lg bg-white overflow-visible focus-within:ring-2 focus-within:ring-amber-500 transition-all shadow-sm relative">
              <textarea
                rows="2"
                className="w-full p-3 text-sm outline-none resize-none bg-transparent"
                placeholder="Type your message..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              
              {commentPhoto && (
                <div className="flex flex-wrap gap-2 px-3 pb-2">
                  {commentPhoto.split(',').map((url, idx) => (
                    <div key={idx} className="relative group flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1 pr-7">
                      {isImageFile(url) ? (
                        <img src={getFileUrl(url)} alt="upload" className="h-6 w-6 object-cover rounded mr-2" />
                      ) : (
                        <UploadCloud className="w-4 h-4 text-slate-400 mr-2" />
                      )}
                      <span className="text-xs truncate max-w-[150px] text-slate-600">File {idx + 1}</span>
                      <button type="button" onClick={() => removeCommentFile(idx)} className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 p-0.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center p-2 bg-slate-50 border-t border-slate-100 rounded-b-lg">
                <div className="flex items-center relative">
                  <button 
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className={`p-2 rounded-md transition-colors ${showAttachMenu ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                    title="Attach"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <AnimatePresence>
                    {showAttachMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-20"
                      >
                        <div className="flex flex-col">
                          <label htmlFor={`upload-${issue.id}`} className="cursor-pointer px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-sm text-slate-700 transition-colors border-b border-slate-100">
                            <UploadCloud className="w-4 h-4 text-amber-500" />
                            Upload File
                          </label>
                          <input type="file" id={`upload-${issue.id}`} className="hidden" onChange={(e) => { handleFileUpload(e); setShowAttachMenu(false); }} disabled={uploading || (commentPhoto && commentPhoto.split(',').length >= 5)} />
                          
                          <button type="button" onClick={() => { setIsMeetingModalOpen(true); setShowAttachMenu(false); }} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-sm text-slate-700 transition-colors text-left border-b border-slate-100">
                            <Calendar className="w-4 h-4 text-amber-500" />
                            Schedule Meeting
                          </button>

                          {(currentUser.role === 'PROJECT_MANAGER') && (
                            <button type="button" onClick={() => { handleEscalateToCEO(); setShowAttachMenu(false); }} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-sm text-slate-700 transition-colors text-left">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              Escalate to CEO
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {uploading && <span className="text-xs text-amber-600 ml-3 font-medium">Uploading...</span>}
                </div>
                
                <div className="flex items-center gap-2">
                  <select className="text-xs border border-slate-200 rounded px-2 py-1.5 outline-none bg-white text-slate-700 font-medium shadow-sm cursor-pointer" value={commentType} onChange={e => setCommentType(e.target.value)}>
                    <option value="GENERAL">General Comment</option>
                    {(currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'CEO') && <option value="INFO_REQUEST">Request Info</option>}
                    <option value="SOLUTION">Provide Solution</option>
                  </select>
                  <button onClick={submitComment} disabled={uploading || (!newComment.trim() && !commentPhoto)} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-5 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div> {/* End scrollable area */}

      {/* Sticky Footer for Actions */}
      {isReporter && issue.status !== 'RESOLVED' && issue.status !== 'Resolved' && (
        <div className="p-4 border-t border-border bg-slate-50/50 flex w-full gap-4 shrink-0">
          <button onClick={handleResolve} className="flex-1 flex justify-center items-center px-6 py-3 text-sm font-bold bg-green-500 text-white hover:bg-green-600 rounded-lg transition-all shadow-sm hover:shadow">
            Resolved
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="flex-1 flex justify-center items-center px-6 py-3 text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-lg transition-all shadow-sm hover:shadow">
            Edit
          </button>
          <button onClick={handleDelete} className="flex-1 flex justify-center items-center px-6 py-3 text-sm font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all shadow-sm hover:shadow">
            Delete
          </button>
        </div>
      )}      {/* Meeting Modal */}
      <AnimatePresence>
        {isMeetingModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">Schedule Meeting</h2>
                <button onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={submitMeeting} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting Title</label>
                  <input required type="text" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-amber-500" value={meetingData.title} onChange={e => setMeetingData({...meetingData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time</label>
                  <input required type="datetime-local" min={minMeetingDate} max={maxMeetingDate} className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-amber-500" value={meetingData.scheduledTime} onChange={e => setMeetingData({...meetingData, scheduledTime: e.target.value})} />
                  <p className="text-xs text-slate-500 mt-1">
                    {minMeetingDate && maxMeetingDate ? `Must be between ${new Date(minMeetingDate).toLocaleDateString()} and ${new Date(maxMeetingDate).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting Link (Zoom/Meet)</label>
                  <input required type="url" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-amber-500" value={meetingData.meetingLink} onChange={e => setMeetingData({...meetingData, meetingLink: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-md">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-md">Schedule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">Edit Issue</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium mb-1">Related Task</label>
                  <select className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-amber-500" value={editData.taskId || ''} onChange={e => setEditData({...editData, taskId: e.target.value})}>
                    <option value="">General Site Issue</option>
                    {tasks.filter(t => String(t.projectId).replace('p', '') === String(issue.projectId).replace('p', '')).map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input required type="text" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-amber-500" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea required rows="3" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-amber-500 resize-none" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Severity</label>
                    <select className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-amber-500" value={editData.severity} onChange={e => setEditData({...editData, severity: e.target.value})}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input type="text" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-amber-500" value={editData.location || ''} onChange={e => setEditData({...editData, location: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Equipment</label>
                    <input type="text" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-amber-500" value={editData.equipmentInvolved || ''} onChange={e => setEditData({...editData, equipmentInvolved: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Est. Delay (Days)</label>
                    <input type="number" min="0" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-amber-500" value={editData.estimatedDelayDays || ''} onChange={e => setEditData({...editData, estimatedDelayDays: e.target.value ? parseInt(e.target.value) : null})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium mb-1 flex items-center">Supporting Photo</label>
                    <label className="w-fit cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md border text-sm font-medium transition-colors flex items-center border-slate-300">
                      {isUploadingEditImage ? 'Uploading...' : 'Choose Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleEditFileUpload(e, 'image')} disabled={isUploadingEditImage || isUploadingEditDoc || (editData.photoUrl && editData.photoUrl.split(',').length >= 5)} />
                    </label>
                    {editData.photoUrl && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editData.photoUrl.split(',').map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img src={url} alt="upload" className="h-16 w-16 object-cover rounded border border-slate-200" />
                            <button type="button" onClick={() => removeEditFile('image', idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium mb-1 flex items-center">Supporting Document</label>
                    <label className="w-fit cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md border text-sm font-medium transition-colors flex items-center border-slate-300">
                      {isUploadingEditDoc ? 'Uploading...' : 'Choose Document'}
                      <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => handleEditFileUpload(e, 'doc')} disabled={isUploadingEditImage || isUploadingEditDoc || (editData.documentUrl && editData.documentUrl.split(',').length >= 5)} />
                    </label>
                    {editData.documentUrl && (
                      <div className="flex flex-col gap-1 mt-2">
                        {editData.documentUrl.split(',').map((url, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-2 py-1">
                            <span className="text-xs truncate max-w-[150px] text-slate-600">Doc {idx + 1}</span>
                            <button type="button" onClick={() => removeEditFile('doc', idx)} className="text-red-500 hover:text-red-700 p-0.5">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DetailedIssue;
