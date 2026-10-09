import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus, ChevronDown, ChevronUp, X, MessageSquare, MapPin, Wrench, Clock, User as UserIcon, Calendar, UploadCloud, Video, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { PROJECT_ISSUE_SEVERITY_STYLES as SEVERITY_STYLES, PROJECT_ISSUE_STATUS_STYLES as STATUS_STYLES } from '../utils/constants';

import DetailedIssue from '../components/DetailedIssue';

const Issues = () => {
  const { issues, addIssue, projects, tasks, users } = useData();
  const { currentUser } = useAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    title: '',
    description: '',
    severity: 'Medium',
    location: '',
    equipmentInvolved: '',
    estimatedDelayDays: '',
    photoUrl: '',
    documentUrl: ''
  });

  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const selectedIssue = selectedIssueId ? issues.find(i => i.id === selectedIssueId) : null;
  const [lastSelectedIssue, setLastSelectedIssue] = useState(null);

  React.useEffect(() => {
    if (selectedIssue) {
      setLastSelectedIssue(selectedIssue);
    }
  }, [selectedIssue]);

  const displayIssue = selectedIssue || lastSelectedIssue;

  const handleView = (issue) => {
    setSelectedIssueId(issue.id);
    if (issue.status === 'Open' || issue.status === 'OPEN') {
      updateIssueStatus(String(issue.id).replace('i', ''), 'IN_PROGRESS', null);
    }
  };
  const [activeTab, setActiveTab] = useState(currentUser?.role === 'ceo' ? 'pm' : 'se'); // 'se' or 'pm'
  
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');

  const myProjects = projects;
  
  const getReporterRole = (issue) => {
    const reporterStr = String(issue.reportedBy || issue.reportedById || '');
    const reporter = users.find(u => String(u.id) === reporterStr);
    return reporter ? reporter.role.toLowerCase() : '';
  };

  const sortedIssues = (issues || []).sort((a, b) => new Date(b.reportedDate || b.createdAt) - new Date(a.reportedDate || a.createdAt));
  
  const seIssues = sortedIssues.filter(i => getReporterRole(i) === 'site_engineer');
  const pmIssues = sortedIssues.filter(i => getReporterRole(i) === 'project_manager' || getReporterRole(i) === 'pm');

  const myIssues = activeTab === 'se' ? seIssues : pmIssues;

  const filteredIssues = myIssues.filter(issue => {
    const matchSearch = (issue.title && issue.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
                        (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchProject = projectFilter === 'All' || String(issue.projectId).replace('p', '') === String(projectFilter).replace('p', '');
    return matchSearch && matchProject;
  });

  const openCount = myIssues.filter(i => i.status !== 'RESOLVED').length;

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
            return { ...prev, photoUrl: [...current, json.fullUrl].join(',') };
          });
        } else {
          setFormData(prev => {
            const current = prev.documentUrl ? prev.documentUrl.split(',') : [];
            if (current.length >= 5) { alert('Max 5 documents allowed'); return prev; }
            return { ...prev, documentUrl: [...current, json.fullUrl].join(',') };
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newIssue = { ...formData, status: 'OPEN' };
    addIssue(newIssue);
    setFormData({ projectId: '', taskId: '', title: '', description: '', severity: 'Medium', location: '', equipmentInvolved: '', estimatedDelayDays: '', photoUrl: '', documentUrl: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Site Issues
          </h1>
        </div>
      </div>

      {/* Tabs */}
      {(currentUser?.role === 'project_manager' || currentUser?.role === 'pm') && (
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('se')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'se' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Site Engineer Issues ({seIssues.length})
          </button>
          <button
            onClick={() => setActiveTab('pm')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'pm' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Escalated Issues ({pmIssues.length})
          </button>
        </div>
      )}

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project <span className="text-red-500">*</span></label>
                  <select required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value, taskId: '' })}>
                    <option value="" disabled>Select Project</option>
                    {myProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Related Task</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.taskId} onChange={e => setFormData({ ...formData, taskId: e.target.value })}>
                    <option value="">General Site Issue</option>
                    {tasks.filter(t => String(t.projectId).replace('p', '') === String(formData.projectId)).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
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
                  <label className="block text-sm font-medium mb-1">Est. Delay (Days)</label>
                  <input type="number" min="0" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.estimatedDelayDays} onChange={e => setFormData({ ...formData, estimatedDelayDays: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location / Area</label>
                  <input type="text" placeholder="e.g. 3rd Floor North Wing" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Equipment Involved</label>
                  <input type="text" placeholder="e.g. Tower Crane 2" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.equipmentInvolved} onChange={e => setFormData({ ...formData, equipmentInvolved: e.target.value })} />
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
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    Supporting Photo
                  </label>
                  <label className={`w-fit cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md border text-sm font-medium transition-colors flex items-center ${!formData.photoUrl && !formData.documentUrl ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300'}`}>
                    <UploadCloud className="w-4 h-4 mr-2" />
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

                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    Supporting Document
                  </label>
                  <label className={`w-fit cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md border text-sm font-medium transition-colors flex items-center ${!formData.photoUrl && !formData.documentUrl ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300'}`}>
                    <UploadCloud className="w-4 h-4 mr-2" />
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

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                <button type="submit" disabled={isUploadingImage || isUploadingDoc} className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-md transition-colors shadow-lg shadow-red-500/20">Submit Issue</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter and Issues List Container */}
      <div className="glass-card flex flex-col overflow-hidden">
        {/* Filters Section */}
        <div className="flex items-center gap-3 p-5 bg-[#e5e7eb] text-slate-900 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center gap-3 ml-auto min-w-max">
            <div className="relative w-48 shrink-0 h-12">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search issues..."
                className="pl-9 pr-4 h-full w-full rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm text-slate-900 placeholder:text-slate-500 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="h-12 w-36 shrink-0 rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm px-3 text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
            >
              <option value="All">All Projects</option>
              {myProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center h-12 px-5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm font-bold whitespace-nowrap"
            >
              Report Issue
            </button>
          </div>
        </div>

        {/* Issues list */}
        <div className="bg-slate-50/50">
          {filteredIssues.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No issues found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">Issue</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Project</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Severity</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Reported Date</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredIssues.map((issue, idx) => {
                    const project = projects.find(p => String(p.id) === String(issue.projectId));
                    const task = tasks.find(t => String(t.id) === String(issue.taskId));
                    const assigneeStr = String(issue.assignee || issue.assigneeId || '');
                    const assignedUser = users.find(u => String(u.id) === assigneeStr) || { name: 'Unassigned', role: '' };


                    return (
                      <motion.tr
                        key={issue.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        onClick={() => handleView(issue)}
                      >
                        <td className="px-6 py-5 font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {issue.title}
                          {task && <div className="text-xs font-normal text-slate-500 mt-0.5">{task.title}</div>}
                        </td>
                        <td className="px-6 py-5 text-slate-600 font-medium whitespace-nowrap">
                          {project?.name || 'Unknown Project'}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded shadow-sm w-28 inline-block text-center ${SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.Medium}`}>
                            {issue.severity || 'Medium'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded shadow-sm w-28 inline-block text-center ${STATUS_STYLES[issue.status] || STATUS_STYLES['OPEN']}`}>
                            {issue.status?.replace(/_/g, ' ') || 'OPEN'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-slate-500 font-medium whitespace-nowrap">
                          {issue.reportedDate || issue.createdAt ? new Date(issue.reportedDate || issue.createdAt).toLocaleDateString() : '—'}
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
          )}
        </div>
      </div>

      {/* View Issue Modal */}
      <AnimatePresence>
        {selectedIssue && displayIssue && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass-card w-full max-w-2xl h-full max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col"
            >
              <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{displayIssue.title}</h2>
                    <div>
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                        {(displayIssue.taskId && tasks?.find(t => String(t.id) === String(displayIssue.taskId).replace('t', '')))
                          ? tasks.find(t => String(t.id) === String(displayIssue.taskId).replace('t', '')).title
                          : "General Site Issue"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm ${
                        displayIssue.severity === 'High' ? 'bg-red-500 text-white shadow-sm' :
                        displayIssue.severity === 'Medium' ? 'bg-amber-500 text-white shadow-sm' : 'bg-blue-500 text-white shadow-sm'
                      }`}>
                        {displayIssue.severity}
                      </span>
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm ${
                        ['Resolved', 'RESOLVED'].includes(displayIssue.status) ? 'bg-emerald-500 text-white shadow-sm' :
                        ['In Progress', 'IN_PROGRESS'].includes(displayIssue.status) ? 'bg-amber-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm'
                      }`}>
                        {displayIssue.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedIssueId(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors ml-1 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                <DetailedIssue issue={displayIssue} projects={projects} tasks={tasks} users={users || []} onClose={() => setSelectedIssueId(null)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Issues;
