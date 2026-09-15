import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus, ChevronDown, ChevronUp, X, MessageSquare, MapPin, Wrench, Clock, User as UserIcon, Calendar, UploadCloud, Video, Edit, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DetailedIssue = ({ issue, projects, tasks, users }) => {
  const { currentUser } = useAuth();
  const { getIssueComments, addIssueComment, getIssueMeetings, addIssueMeeting, updateIssueStatus, updateIssue, deleteIssue } = useData();
  
  const [comments, setComments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('GENERAL');
  
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingData, setMeetingData] = useState({ title: '', scheduledTime: '', meetingLink: '' });

  const [uploading, setUploading] = useState(false);
  const [commentPhoto, setCommentPhoto] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ ...issue });

  const project = projects.find(p => String(p.id) === String(issue.projectId));
  const task = tasks.find(t => String(t.id) === String(issue.taskId));
  
  const assigneeStr = String(issue.assignee || issue.assigneeId || '');
  const assignedUser = users.find(u => String(u.id) === assigneeStr) || { name: 'Unassigned', role: '' };
  
  const reporterStr = String(issue.reportedBy || issue.reportedById || '');
  const reporterUser = users.find(u => String(u.id) === reporterStr) || { name: 'Unknown', role: '' };
  const getFileUrl = (url) => url?.startsWith('/uploads/') ? `http://localhost:8080${url}` : url;
  const isImageFile = (url) => /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(url || '');

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
        setCommentPhoto(json.fullUrl || `http://localhost:8080${json.url}`);
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
    if (window.confirm('Are you sure you want to delete this issue?')) {
      await deleteIssue(issue.id);
    }
  };

  const handleResolve = async () => {
    if (window.confirm('Mark this issue as resolved?')) {
      await updateIssueStatus(String(issue.id).replace('i', ''), 'RESOLVED', null);
    }
  };

  const isReporterOrSE = currentUser.role === 'site_engineer' || String(currentUser.id) === reporterStr;

  return (
    <div className="border-t border-border bg-slate-50/50 px-5 py-6 relative">
      {/* Actions Toolbar */}
      {isReporterOrSE && issue.status !== 'RESOLVED' && (
        <div className="flex gap-2 justify-end mb-4">
          <button onClick={handleResolve} className="flex items-center text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md transition-colors">
            <CheckCircle className="w-3 h-3 mr-1" /> Resolve
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="flex items-center text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors">
            <Edit className="w-3 h-3 mr-1" /> Edit
          </button>
          <button onClick={handleDelete} className="flex items-center text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md transition-colors">
            <Trash2 className="w-3 h-3 mr-1" /> Delete
          </button>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-sm">
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

      <div className="flex gap-6 mb-8 flex-col lg:flex-row">
        {issue.photoUrl && (
          <div className="w-full lg:w-1/3 rounded-lg overflow-hidden shrink-0 border border-border">
            {isImageFile(issue.photoUrl) ? (
              <img src={getFileUrl(issue.photoUrl)} alt="Issue Evidence" className="w-full h-full object-cover" />
            ) : (
              <a href={getFileUrl(issue.photoUrl)} target="_blank" rel="noreferrer" className="block p-4 text-sm text-indigo-600 hover:underline">
                Open issue attachment
              </a>
            )}
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 mb-2">Description</h4>
          <p className="text-slate-600 whitespace-pre-wrap">{issue.description}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" /> Resolution Timeline
        </h4>
        
        {loading ? (
          <p className="text-slate-400 text-sm">Loading timeline...</p>
        ) : (
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
            {[...comments, ...meetings].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(item => {
              const isMeeting = !!item.meetingLink;
              
              if (isMeeting) {
                return (
                  <div key={`m${item.id}`} className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3">
                    <Video className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">{item.title}</p>
                      <p className="text-xs text-blue-700 mb-2">Organized by {item.organizer?.name || 'Unknown'} for {new Date(item.scheduledTime).toLocaleString()}</p>
                      <a href={item.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium">Join Meeting →</a>
                    </div>
                  </div>
                );
              }

              const isInfoReq = item.commentType === 'INFO_REQUEST';
              const isSolution = item.commentType === 'SOLUTION';
              
              return (
                <div key={`c${item.id}`} className={`p-3 rounded-lg border ${isSolution ? 'bg-green-50 border-green-200' : isInfoReq ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-slate-800">{item.sender?.name || 'User'} <span className="text-xs text-slate-500 font-normal">({item.sender?.role || ''})</span></span>
                    <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  {isSolution && <span className="text-xs font-bold text-green-700 uppercase mb-1 block">Solution Provided</span>}
                  {isInfoReq && <span className="text-xs font-bold text-orange-700 uppercase mb-1 block">Information Requested</span>}
                  <p className="text-sm text-slate-700">{item.message}</p>
                  {item.photoUrl && (isImageFile(item.photoUrl) ? (
                    <img src={getFileUrl(item.photoUrl)} alt="Attached" className="mt-2 rounded max-w-xs max-h-40 border border-slate-200" />
                  ) : (
                    <a href={getFileUrl(item.photoUrl)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                      Open attached file
                    </a>
                  ))}
                </div>
              );
            })}
            {comments.length === 0 && meetings.length === 0 && <p className="text-sm text-slate-400 italic">No updates yet.</p>}
          </div>
        )}

        {/* Comment Box */}
        {issue.status !== 'RESOLVED' && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex gap-2 mb-2">
              <select className="text-sm border border-slate-200 rounded px-2 py-1 outline-none bg-slate-50" value={commentType} onChange={e => setCommentType(e.target.value)}>
                <option value="GENERAL">General Comment</option>
                {(currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'CEO') && <option value="INFO_REQUEST">Request Info</option>}
                <option value="SOLUTION">Provide Solution</option>
              </select>
              <button onClick={() => setIsMeetingModalOpen(true)} className="text-sm border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded px-3 py-1 flex items-center transition-colors">
                <Calendar className="w-3 h-3 mr-1" /> Schedule Meeting
              </button>
              {(currentUser.role === 'PROJECT_MANAGER') && (
                <button onClick={handleEscalateToCEO} className="text-sm border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded px-3 py-1 transition-colors ml-auto">
                  Escalate to CEO
                </button>
              )}
            </div>
            
            <textarea
              rows="2"
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Type your message..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-2">
                <input type="file" id={`upload-${issue.id}`} className="hidden" onChange={handleFileUpload} />
                <label htmlFor={`upload-${issue.id}`} className="cursor-pointer text-slate-500 hover:text-slate-700 flex items-center text-sm font-medium transition-colors">
                  <UploadCloud className="w-4 h-4 mr-1" />
                  {uploading ? 'Uploading...' : commentPhoto ? 'File Attached' : 'Attach File'}
                </label>
              </div>
              <button onClick={submitComment} disabled={uploading || (!newComment.trim() && !commentPhoto)} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Modal */}
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
                  <input required type="text" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-indigo-500" value={meetingData.title} onChange={e => setMeetingData({...meetingData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time</label>
                  <input required type="datetime-local" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-indigo-500" value={meetingData.scheduledTime} onChange={e => setMeetingData({...meetingData, scheduledTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting Link (Zoom/Meet)</label>
                  <input required type="url" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-indigo-500" value={meetingData.meetingLink} onChange={e => setMeetingData({...meetingData, meetingLink: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-md">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md">Schedule</button>
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
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input required type="text" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-indigo-500" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea required rows="3" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-indigo-500 resize-none" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Severity</label>
                    <select className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-indigo-500" value={editData.severity} onChange={e => setEditData({...editData, severity: e.target.value})}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input type="text" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-indigo-500" value={editData.location || ''} onChange={e => setEditData({...editData, location: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Equipment</label>
                    <input type="text" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-indigo-500" value={editData.equipmentInvolved || ''} onChange={e => setEditData({...editData, equipmentInvolved: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Est. Delay (Days)</label>
                    <input type="number" min="0" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-indigo-500" value={editData.estimatedDelayDays || ''} onChange={e => setEditData({...editData, estimatedDelayDays: e.target.value ? parseInt(e.target.value) : null})} />
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
