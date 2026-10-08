import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { X, AlertTriangle } from 'lucide-react';

const ReportIssueModal = ({ isOpen, onClose, defaultProjectId = '', assignedProjects = [], assignedTasks = [] }) => {
  const { addIssue } = useData();
  
  const [formData, setFormData] = useState({
    projectId: defaultProjectId || (assignedProjects.length > 0 ? assignedProjects[0].id : ''),
    taskId: '',
    title: '',
    description: '',
    severity: 'Medium',
    photoUrl: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newIssue = {
      projectId: formData.projectId,
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      status: 'Open',
      reportedDate: new Date(Date.now() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0],
      resolution: '',
      photoUrl: formData.photoUrl,
      relatedTaskId: formData.taskId || null
    };
    
    addIssue(newIssue);
    
    // Reset
    setFormData({
      projectId: assignedProjects.length > 0 ? assignedProjects[0].id : '',
      taskId: '',
      title: '',
      description: '',
      severity: 'Medium',
      photoUrl: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  const projectTasks = assignedTasks.filter(t => t.projectId === formData.projectId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto border-2 border-red-500/20"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Report Issue
          </h2>
          <p className="text-sm text-slate-500 mb-6">Flag a problem or safety concern on site.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project <span className="text-red-500">*</span></label>
              <select
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.projectId}
                onChange={e => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="" disabled>Select Project</option>
                {assignedProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Issue Title <span className="text-red-500">*</span></label>
              <input
                required type="text" minLength="5"
                placeholder="e.g. Material delivery delayed (min 5 chars)"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Severity <span className="text-red-500">*</span></label>
                <select
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.severity}
                  onChange={e => setFormData({ ...formData, severity: e.target.value })}
                >
                  <option value="High">High (Immediate action required)</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low (Observation)</option>
                </select>
              </div>
              
              {projectTasks.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Related Task (Optional)</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    value={formData.taskId}
                    onChange={e => setFormData({ ...formData, taskId: e.target.value })}
                  >
                    <option value="">None</option>
                    {projectTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
              <textarea
                required rows="3" minLength="15"
                placeholder="Describe the issue in detail (min 15 chars)..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Supporting Photo (Optional)</label>
              <input
                type="url"
                placeholder="Paste image URL here..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.photoUrl}
                onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
              />
              {formData.photoUrl && (
                <div className="mt-2 h-32 rounded-md overflow-hidden bg-slate-100  border border-border inline-block relative">
                  <img src={formData.photoUrl} alt="Preview" className="h-full w-auto object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photoUrl: '' })}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-border mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 :bg-slate-800 rounded-md transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-lg shadow-red-500/30">
                Submit Issue
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportIssueModal;
