import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plus, X, MessageSquare, ChevronDown, ChevronUp, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DetailedIssue from './DetailedIssue';

const SEVERITY_STYLES = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-blue-100 text-blue-700 border-blue-200'
};

const STATUS_STYLES = {
  Open: 'bg-red-50 text-red-600',
  'In Progress': 'bg-amber-50 text-amber-600',
  Resolved: 'bg-green-50 text-green-600'
};

const STATUS_NEXT = {
  Open: 'In Progress',
  'In Progress': 'Resolved',
  Resolved: 'Open'
};

const ProjectIssuesTab = ({ project }) => {
  const { issues, updateIssueStatus, tasks, addIssue } = useData();
  const { currentUser } = useAuth();
  
  const isCEO = currentUser?.role === 'ceo';

  // Filter global issues to only those belonging to this project
  const projectIssues = issues.filter(i => 
    String(i.projectId) === String(project.id) || i.projectId === `p${project.id}`
  ).sort((a, b) => new Date(b.reportedDate || b.createdAt) - new Date(a.reportedDate || a.createdAt));

  const navigate = useNavigate();
  const { users } = useData();

  const getReporterRole = (issue) => {
    const reporterStr = String(issue.reportedBy || issue.reportedById || '');
    const reporter = users?.find(u => String(u.id) === reporterStr);
    return reporter ? reporter.role.toLowerCase() : '';
  };

  const seIssues = projectIssues.filter(i => getReporterRole(i) === 'site_engineer');
  const pmIssues = projectIssues.filter(i => getReporterRole(i) === 'project_manager' || getReporterRole(i) === 'pm');

  const [activeTab, setActiveTab] = useState(currentUser?.role === 'ceo' ? 'pm' : 'se'); // 'se' or 'pm'
  const [statusFilter, setStatusFilter] = useState('All');
  
  const baseActiveIssues = activeTab === 'se' ? seIssues : pmIssues;
  const activeIssues = statusFilter === 'All' 
    ? baseActiveIssues 
    : baseActiveIssues.filter(i => i.status?.replace('_', ' ').toUpperCase() === statusFilter.toUpperCase());

  const [selectedIssue, setSelectedIssue] = useState(null);

  const handleView = (issue) => {
    setSelectedIssue(issue);
    if (issue.status === 'Open' || issue.status === 'OPEN') {
      updateIssueStatus(String(issue.id).replace('i', ''), 'IN_PROGRESS', null);
    }
  };
  const [isAdding, setIsAdding] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', severity: 'Medium', location: '', equipmentInvolved: '', estimatedDelayDays: '', taskId: '', photoUrl: '', documentUrl: ''
  });

  const openCount = baseActiveIssues.filter(i => i.status === 'Open' || i.status === 'OPEN').length;
  const inProgressCount = baseActiveIssues.filter(i => i.status === 'In Progress' || i.status === 'IN_PROGRESS').length;
  const resolvedCount = baseActiveIssues.filter(i => i.status === 'Resolved' || i.status === 'RESOLVED').length;

  const advanceStatus = (id) => {
    const issue = projectIssues.find(i => i.id === id);
    if (issue) {
      updateIssueStatus(id, STATUS_NEXT[issue.status] || 'In Progress');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.equipmentInvolved || !formData.estimatedDelayDays) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!formData.photoUrl && !formData.documentUrl) {
      alert("Please upload at least one supporting photo or document.");
      return;
    }
    const newIssue = { ...formData, projectId: project.id, status: 'OPEN' };
    try {
      await addIssue(newIssue);
      setFormData({ taskId: '', title: '', description: '', severity: 'Medium', location: '', equipmentInvolved: '', estimatedDelayDays: '', photoUrl: '', documentUrl: '' });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert('Failed to report issue');
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image') setIsUploadingImage(true);
    else setIsUploadingDoc(true);

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
        if (type === 'image') {
          setFormData(prev => {
            const current = prev.photoUrl ? prev.photoUrl.split(',') : [];
            if (current.length >= 5) { alert('Max 5 images allowed'); return prev; }
            return { ...prev, photoUrl: [...current, json.fullUrl || json.url].join(',') };
          });
        } else {
          setFormData(prev => {
            const current = prev.documentUrl ? prev.documentUrl.split(',') : [];
            if (current.length >= 5) { alert('Max 5 documents allowed'); return prev; }
            return { ...prev, documentUrl: [...current, json.fullUrl || json.url].join(',') };
          });
        }
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
    }
    
    if (type === 'image') setIsUploadingImage(false);
    else setIsUploadingDoc(false);
  };

  const removeFile = (type, index) => {
    setFormData(prev => {
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

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="glass-card flex flex-col overflow-hidden mb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6 p-6 bg-[#e5e7eb] text-slate-900 border-b border-slate-200">
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6">
            <h2 className="text-xl font-bold leading-tight shrink-0">
              Issues &<br />Problems
            </h2>
          </div>
          
          <div className="flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-6 items-start xl:items-center w-full lg:w-auto justify-end">
            <div className="flex space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center text-sm font-bold text-slate-600 overflow-x-auto w-fit max-w-full shrink-0">
              {['All', 'Open', 'In Progress', 'Resolved'].map(s => {
                const count = s === 'All'
                  ? baseActiveIssues.length
                  : baseActiveIssues.filter(i => i.status?.replace('_', ' ').toUpperCase() === s.toUpperCase()).length;
                return (
                  <button 
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`relative px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap outline-none ${
                      statusFilter === s
                        ? 'bg-white shadow-sm text-slate-900 font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {s} <span className="ml-1 opacity-60 font-normal">{count}</span>
                  </button>
                );
              })}
            </div>

            {(currentUser?.role === 'project_manager' || currentUser?.role === 'pm') && (
              <div className="flex space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center text-sm font-bold text-slate-600 overflow-x-auto w-fit max-w-full shrink-0">
                <button
                  onClick={() => setActiveTab('se')}
                  className={`relative px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap ${
                    activeTab === 'se' ? 'bg-white shadow-sm text-slate-900' : 'hover:text-slate-900'
                  }`}
                >
                  Site Engineer Issues <span className="ml-1 opacity-60 font-normal">({seIssues.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('pm')}
                  className={`relative px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap ${
                    activeTab === 'pm' ? 'bg-white shadow-sm text-slate-900' : 'hover:text-slate-900'
                  }`}
                >
                  My Escalated Issues <span className="ml-1 opacity-60 font-normal">({pmIssues.length})</span>
                </button>
              </div>
            )}
            
            {!isCEO && (
              <button
                onClick={() => setIsAdding(true)}
                className="h-12 flex items-center px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/30 font-bold shrink-0"
              >
                Report Issue
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 border-2 border-red-300/40 overflow-hidden"
          >
            <h3 className="font-semibold mb-4 flex items-center text-lg">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Report New Issue
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Related Task</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.taskId} onChange={e => setFormData({ ...formData, taskId: e.target.value })}>
                    <option value="">General Site Issue</option>
                    {tasks.filter(t => String(t.projectId).replace('p', '') === String(project.id)).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Severity <span className="text-red-500">*</span></label>
                  <select required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })}>
                    <option value="High">High (Immediate action required)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low (Observation)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Est. Delay (Days) <span className="text-red-500">*</span></label>
                  <input required type="number" min="0" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.estimatedDelayDays} onChange={e => setFormData({ ...formData, estimatedDelayDays: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location / Area <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. 3rd Floor North Wing" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Equipment Involved <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Tower Crane 2" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.equipmentInvolved} onChange={e => setFormData({ ...formData, equipmentInvolved: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Issue Title <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="e.g. Material delivery delayed" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
                <textarea required rows="3" placeholder="Describe the issue in detail..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    Supporting Photo
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className={`w-fit cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md border text-sm font-medium transition-colors flex items-center ${!formData.photoUrl && !formData.documentUrl ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300'}`}>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {isUploadingImage ? 'Uploading...' : 'Choose Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={isUploadingImage || isUploadingDoc || (formData.photoUrl && formData.photoUrl.split(',').length >= 5)} />
                    </label>
                    {formData.photoUrl && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.photoUrl.split(',').map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img src={url} alt="upload" className="h-16 w-16 object-cover rounded border border-slate-200" />
                            <button type="button" onClick={() => removeFile('image', idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    Supporting Document
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className={`w-fit cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md border text-sm font-medium transition-colors flex items-center ${!formData.photoUrl && !formData.documentUrl ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300'}`}>
                      <FileText className="w-4 h-4 mr-2" />
                      {isUploadingDoc ? 'Uploading...' : 'Choose Document'}
                      <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'doc')} disabled={isUploadingImage || isUploadingDoc || (formData.documentUrl && formData.documentUrl.split(',').length >= 5)} />
                    </label>
                    {formData.documentUrl && (
                      <div className="flex flex-col gap-1 mt-2">
                        {formData.documentUrl.split(',').map((url, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-2 py-1">
                            <span className="text-xs truncate max-w-[200px] text-slate-600">Doc {idx + 1}</span>
                            <button type="button" onClick={() => removeFile('doc', idx)} className="text-red-500 hover:text-red-700 p-0.5">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                <button type="submit" disabled={isUploadingImage || isUploadingDoc} className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50">Submit Issue</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Issues list */}
      {activeIssues.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No issues reported yet.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider">Issue</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider">Severity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider">Reported Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
              {activeIssues.map((issue, idx) => {
                const assigneeStr = String(issue.assignee || issue.assigneeId || '');
                const assignedUser = users?.find(u => String(u.id) === assigneeStr) || { name: 'Unassigned', role: '' };

                return (
                  <motion.tr
                    key={issue.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => handleView(issue)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-10 rounded-full shrink-0 ${
                          issue.severity === 'High' ? 'bg-red-500' :
                          issue.severity === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'
                        }`} />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{issue.title}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{issue.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${SEVERITY_STYLES[issue.severity]}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${STATUS_STYLES[issue.status]}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-500 text-sm whitespace-nowrap">
                      {issue.reportedDate}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleView(issue); }}
                        className="px-4 py-1.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all ml-auto shadow-sm hover:shadow inline-flex items-center justify-center"
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
      </div>
      )}

      {/* View Issue Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass-card w-full max-w-2xl h-full max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <h2 className="text-xl font-bold">Issue Details</h2>
                <button onClick={() => setSelectedIssue(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors ml-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <DetailedIssue issue={selectedIssue} projects={[project]} tasks={tasks} users={users || []} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>    </div>
  );
};

export default ProjectIssuesTab;
