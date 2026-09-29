import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { X, Camera, Plus, Trash2 } from 'lucide-react';

const SubmitLogModal = ({ isOpen, onClose, defaultProjectId = '', assignedProjects = [], assignedTasks = [] }) => {
  const { addLog } = useData();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    projectId: defaultProjectId || (assignedProjects.length > 0 ? assignedProjects[0].id : ''),
    date: new Date().toISOString().split('T')[0],
    weather: 'Sunny',
    manpower: '',
    workDone: '',
    percentageCompleted: '',
    taskId: '',
    photos: []
  });

  const [newPhoto, setNewPhoto] = useState({ url: '', caption: '', uploading: false });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewPhoto(prev => ({ ...prev, uploading: true }));
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: uploadData
      });
      if (res.ok) {
        const data = await res.json();
        setNewPhoto(prev => ({ ...prev, url: data.fullUrl, uploading: false }));
      } else {
        alert('Upload failed');
        setNewPhoto(prev => ({ ...prev, uploading: false }));
      }
    } catch (err) {
      console.error("Upload failed", err);
      setNewPhoto(prev => ({ ...prev, uploading: false }));
    }
  };

  const handleAddPhoto = () => {
    if (newPhoto.url.trim()) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, { fileUrl: newPhoto.url.trim(), caption: newPhoto.caption.trim() || 'Site photo' }]
      }));
      setNewPhoto({ url: '', caption: '' });
      const fileInput = document.getElementById('modal-photo-upload');
      if (fileInput) fileInput.value = '';
    }
  };

  const removePhoto = (idx) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLog = {
      projectId: formData.projectId,
      date: formData.date,
      weather: formData.weather,
      manpower: parseInt(formData.manpower) || 0,
      workDone: formData.workDone,
      percentageCompleted: parseInt(formData.percentageCompleted) || 0,
      submittedBy: currentUser?.id,
      photos: formData.photos,
      relatedTaskId: formData.taskId || null
    };
    
    addLog(newLog);
    
    // Reset form
    setFormData({
      projectId: assignedProjects.length > 0 ? assignedProjects[0].id : '',
      date: new Date().toISOString().split('T')[0],
      weather: 'Sunny',
      manpower: '',
      workDone: '',
      percentageCompleted: '',
      taskId: '',
      photos: []
    });
    onClose();
  };

  if (!isOpen) return null;

  // Normalize both sides — project options have raw id (e.g. 3), tasks have projectId 'p3'
  const selectedProjectId = String(formData.projectId || '').replace('p', '');
  const projectTasks = selectedProjectId
    ? assignedTasks.filter(t => String(t.projectId || '').replace('p', '') === selectedProjectId)
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            Submit Daily Progress
          </h2>
          <p className="text-sm text-slate-500 mb-6">Log today's work, manpower, and site photos.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project <span className="text-red-500">*</span></label>
                <select
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
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
                <label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label>
                <input
                  required type="date"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Weather <span className="text-red-500">*</span></label>
                <select
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.weather}
                  onChange={e => setFormData({ ...formData, weather: e.target.value })}
                >
                  <option value="Sunny">Sunny</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rainy">Rainy</option>
                  <option value="Storm">Storm</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Manpower <span className="text-red-500">*</span></label>
                <input
                  required type="number" min="0" placeholder="e.g. 15"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.manpower}
                  onChange={e => setFormData({ ...formData, manpower: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Progress Made (%)</label>
                <input
                  type="number" min="0" max="100" placeholder="e.g. 5"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.percentageCompleted}
                  onChange={e => setFormData({ ...formData, percentageCompleted: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Work Done <span className="text-red-500">*</span></label>
              <textarea
                required rows="3" minLength="10"
                placeholder="Describe the work completed today (min 10 characters)..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                value={formData.workDone}
                onChange={e => setFormData({ ...formData, workDone: e.target.value })}
              />
            </div>

            {/* Related Task — always show when project is selected */}
            {formData.projectId && (
              <div>
                <label className="block text-sm font-medium mb-1">Related Task (Optional)</label>
                {projectTasks.length > 0 ? (
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.taskId}
                    onChange={e => setFormData({ ...formData, taskId: e.target.value })}
                  >
                    <option value="">— None —</option>
                    {projectTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-400 italic px-1">No tasks assigned for this project yet.</p>
                )}
              </div>
            )}

            {/* Photos */}
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-medium mb-2">Site Photos & Captions</label>
              
              {formData.photos.length > 0 && (
                <div className="space-y-3 mb-4">
                  {formData.photos.map((p, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-slate-50  p-2 rounded border border-border">
                      <img src={p.fileUrl || p.url} alt={p.caption} className="w-12 h-12 object-cover rounded" />
                      <p className="flex-1 text-sm truncate">{p.caption}</p>
                      <button type="button" onClick={() => removePhoto(idx)} className="p-1 text-red-500 hover:bg-red-100 :bg-red-900/30 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                  id="modal-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  disabled={newPhoto.uploading}
                />
                {newPhoto.uploading && <span className="text-xs text-slate-500">Uploading...</span>}
                {newPhoto.url && (
                  <span className="text-xs text-green-600 truncate w-24">✓ Uploaded</span>
                )}
                <input
                  type="text"
                  placeholder="Caption (e.g. Ground leveling)"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={newPhoto.caption}
                  onChange={e => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPhoto(); } }}
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  disabled={!newPhoto.url}
                  className="px-4 py-2 bg-slate-200  text-slate-700  rounded-md font-medium hover:bg-slate-300 :bg-slate-600 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-border mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 :bg-slate-800 rounded-md transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-lg shadow-blue-500/30">
                Submit Progress
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubmitLogModal;
