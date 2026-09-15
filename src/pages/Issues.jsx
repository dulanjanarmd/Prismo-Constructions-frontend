import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus, ChevronDown, ChevronUp, X, MessageSquare, MapPin, Wrench, Clock, User as UserIcon, Calendar, UploadCloud, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SEVERITY_STYLES = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-blue-100 text-blue-700 border-blue-200'
};

const STATUS_STYLES = {
  OPEN: 'bg-red-50 text-red-600',
  INFO_REQUESTED_SE: 'bg-orange-50 text-orange-600',
  INFO_REQUESTED_PM: 'bg-orange-50 text-orange-600',
  PENDING_PM: 'bg-amber-50 text-amber-600',
  PENDING_CEO: 'bg-purple-50 text-purple-600',
  CLIENT_REVIEW: 'bg-blue-50 text-blue-600',
  RESOLVED: 'bg-green-50 text-green-600'
};

import DetailedIssue from '../components/DetailedIssue';

const Issues = () => {
  const { issues, addIssue, projects, tasks, users } = useData();
  const { currentUser } = useAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    title: '',
    description: '',
    severity: 'Medium',
    location: '',
    equipmentInvolved: '',
    estimatedDelayDays: '',
    photoUrl: ''
  });

  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState(currentUser?.role === 'ceo' ? 'pm' : 'se'); // 'se' or 'pm'

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

  const openCount = myIssues.filter(i => i.status !== 'RESOLVED').length;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
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
        setFormData(prev => ({ ...prev, photoUrl: json.fullUrl }));
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
    }
    setIsUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newIssue = { ...formData, status: 'OPEN' };
    addIssue(newIssue);
    setFormData({ projectId: '', taskId: '', title: '', description: '', severity: 'Medium', location: '', equipmentInvolved: '', estimatedDelayDays: '', photoUrl: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Site Issues
          </h1>
          <p className="text-slate-500 mt-1">{openCount} active issues require attention.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/30 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Report Issue
        </button>
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

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  Supporting Photo / Document
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md border border-slate-300 text-sm font-medium transition-colors flex items-center">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Choose File'}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                  {formData.photoUrl && <span className="text-sm text-green-600 font-medium flex items-center">✓ File Attached</span>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-md transition-colors shadow-lg shadow-red-500/20">Submit Issue</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Issues list */}
      {myIssues.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No issues reported yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myIssues.map((issue, idx) => {
            const project = projects.find(p => String(p.id) === String(issue.projectId));
            const task = tasks.find(t => String(t.id) === String(issue.taskId));
            
            const assigneeStr = String(issue.assignee || issue.assigneeId || '');
            const assignedUser = users.find(u => String(u.id) === assigneeStr) || { name: 'Unassigned', role: '' };

            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`glass-card overflow-hidden border-l-4 ${
                  issue.severity === 'High' ? 'border-l-red-500' :
                  issue.severity === 'Medium' ? 'border-l-amber-400' : 'border-l-blue-400'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.Medium}`}>
                          {issue.severity || 'Medium'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_STYLES[issue.status] || STATUS_STYLES.OPEN}`}>
                          {issue.status?.replace(/_/g, ' ') || 'OPEN'}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {project?.name || 'Project'} {task ? `› ${task.title}` : ''}
                        </span>
                        <span className="text-xs text-slate-400">{issue.reportedDate || issue.createdAt ? new Date(issue.reportedDate || issue.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 ">{issue.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-1">{issue.description}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <button
                        onClick={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                      >
                        {expandedId === issue.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === issue.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <DetailedIssue issue={issue} projects={projects} tasks={tasks} users={users} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Issues;
