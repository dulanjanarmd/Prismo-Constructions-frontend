import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Camera, Plus, X, UploadCloud, AlertTriangle, MessageSquare, Download, Eye, LayoutList, Edit, Trash2, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Logs = () => {
  const { logs, addLog, updateLog, deleteLog, projects, tasks } = useData();
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  
  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    date: new Date().toISOString().split('T')[0],
    weather: 'Sunny',
    temperature: '',
    manpower: '',
    percentageCompleted: '',
    workDone: '',
    equipmentUsed: '',
    materialsDelivered: '',
    safetyIncidents: '',
    delayHours: '',
    shiftType: 'Day',
    siteConditions: 'Normal',
    visitors: '',
    nextDayPlan: '',
    subcontractors: '',
    inspections: '',
    issues: '',
    photos: [] // Array of { url, caption }
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [editingLogId, setEditingLogId] = useState(null);

  const openEditModal = (log) => {
    setEditingLogId(log.id);
    setFormData({
      projectId: String(log.projectId).replace('p', ''),
      taskId: log.task ? String(log.task.id) : '',
      date: log.date,
      weather: log.weather,
      temperature: log.temperature || '',
      manpower: log.manpower,
      percentageCompleted: log.percentageCompleted,
      workDone: log.workDone,
      equipmentUsed: log.equipmentUsed || '',
      materialsDelivered: log.materialsDelivered || '',
      safetyIncidents: log.safetyIncidents || '',
      delayHours: log.delayHours || '',
      shiftType: log.shiftType || 'Day',
      siteConditions: log.siteConditions || 'Normal',
      visitors: log.visitors || '',
      nextDayPlan: log.nextDayPlan || '',
      subcontractors: log.subcontractors || '',
      inspections: log.inspections || '',
      issues: log.issues || '',
      photos: log.photos || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      deleteLog(id);
    }
  };

  const exportToCSV = () => {
    if (logs.length === 0) return;
    
    const headers = ['Date', 'Project', 'Task', 'Weather', 'Temperature', 'Manpower', '% Completed', 'Work Done', 'Equipment Used', 'Materials Delivered', 'Delays (Hours)', 'Safety Incidents', 'Other Issues', 'Submitted By'];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    logs.forEach(log => {
      const project = projects.find(p => String(p.id) === String(log.projectId).replace('p', ''))?.name || 'Unknown';
      const task = tasks.find(t => String(t.id) === String(log.task?.id))?.title || 'General';
      const submittedBy = typeof log.submittedBy === 'string' && log.submittedBy.includes('_') ? log.submittedBy.replace(/_/g, ' ') : (log.siteEngineer?.name || String(log.submittedBy || 'Unknown'));
      
      const escapeCsv = (str) => {
        if (str === null || str === undefined) return '""';
        const stringified = String(str);
        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
          return `"${stringified.replace(/"/g, '""')}"`;
        }
        return stringified;
      };

      const row = [
        escapeCsv(log.date),
        escapeCsv(project),
        escapeCsv(task),
        escapeCsv(log.weather),
        escapeCsv(log.temperature),
        escapeCsv(log.manpower),
        escapeCsv(log.percentageCompleted),
        escapeCsv(log.workDone),
        escapeCsv(log.equipmentUsed),
        escapeCsv(log.materialsDelivered),
        escapeCsv(log.delayHours),
        escapeCsv(log.safetyIncidents),
        escapeCsv(log.issues),
        escapeCsv(submittedBy)
      ];
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `progress_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default mock photo if none provided
    const finalPhotos = formData.photos.length > 0 ? formData.photos : [{
      fileUrl: 'https://images.unsplash.com/photo-1541888081622-6323c21c7e92?q=80&w=2070&auto=format&fit=crop',
      caption: 'General site overview'
    }];
    
    if (editingLogId) {
      updateLog(editingLogId, {
        ...formData,
        submittedBy: currentUser.id,
        photos: finalPhotos
      });
    } else {
      addLog({
        ...formData,
        submittedBy: currentUser.id,
        photos: finalPhotos
      });
    }
    
    setIsModalOpen(false);
    setEditingLogId(null);
    setFormData({ 
      projectId: '', taskId: '', date: new Date().toISOString().split('T')[0], 
      weather: 'Sunny', temperature: '', manpower: '', percentageCompleted: '', 
      workDone: '', equipmentUsed: '', materialsDelivered: '', 
      safetyIncidents: '', delayHours: '', shiftType: 'Day', siteConditions: 'Normal',
      visitors: '', nextDayPlan: '', subcontractors: '', inspections: '', issues: '', photos: [] 
    });
  };

  const addPhoto = () => {
    if (newPhoto.url) {
      setFormData({ ...formData, photos: [...formData.photos, { fileUrl: newPhoto.url, caption: newPhoto.caption }] });
      setNewPhoto({ url: '', caption: '' });
      const fileInput = document.getElementById('log-photo-upload');
      if (fileInput) fileInput.value = '';
    }
  };

  const removePhoto = (index) => {
    const updatedPhotos = [...formData.photos];
    updatedPhotos.splice(index, 1);
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const isSiteEngineer = currentUser?.role === 'site_engineer';
  const currentUserId = String(currentUser?.id || '');
  const assignedProjects = isSiteEngineer
    ? projects.filter(project => tasks.some(task => {
        const taskProjectId = String(task.projectId || '').replace(/^p/, '');
        const assignedTo = String(task.assignedTo || '').replace(/^u/, '');
        return taskProjectId === String(project.id) && assignedTo === currentUserId;
      }))
    : projects;

  const filteredLogs = logs.filter(log => {
    const project = projects.find(p => String(p.id) === String(log.projectId).replace('p', ''));
    const task = tasks.find(t => String(t.id) === String(log.task?.id));
    const matchSearch = (project?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (task?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (log.weather || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = projectFilter === 'All' || String(log.projectId).replace('p', '') === String(projectFilter).replace('p', '');
    return matchSearch && matchProject;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 ">
            Site Progress Logs
          </h1>
        </div>
      </div>

      <div className="glass-card flex flex-col overflow-hidden">
        <div className="flex items-center p-6 bg-[#e5e7eb] text-slate-900 border-b border-slate-200 overflow-x-auto">
          <div className="flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-3 items-start xl:items-center w-full lg:w-auto ml-auto min-w-max">
            <div className="relative w-full lg:w-64 h-11 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full h-full pl-9 pr-4 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm text-slate-900 placeholder:text-slate-500 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all rounded-lg"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative w-full lg:w-48 h-11 shrink-0">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <select
                className="w-full h-full pl-9 pr-10 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm text-slate-900 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer rounded-lg"
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
              >
                <option value="All">All Projects</option>
                {assignedProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <button onClick={exportToCSV} className="w-full lg:w-auto flex justify-center items-center px-4 h-11 bg-white/60 backdrop-blur-xl border border-white/40 hover:bg-white text-slate-700 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap">
              Export CSV
            </button>
            {isSiteEngineer && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full lg:w-auto flex justify-center items-center px-6 h-11 bg-primary text-primary-foreground rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 font-bold shrink-0 whitespace-nowrap"
              >
                Submit Daily Log
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Project</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Task</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Weather</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Manpower</th>
                <th className="px-6 py-4 font-semibold tracking-wider">% Complete</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map(log => {
                const project = projects.find(p => String(p.id) === String(log.projectId).replace('p', ''));
                const task = tasks.find(t => String(t.id) === String(log.task?.id));
                return (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5 font-bold text-slate-900">{log.date}</td>
                    <td className="px-6 py-5 text-slate-600 font-medium">{project?.name || '-'}</td>
                    <td className="px-6 py-5 text-slate-600 font-medium">{task?.title || 'General'}</td>
                    <td className="px-6 py-5 text-slate-600">{log.weather}</td>
                    <td className="px-6 py-5 text-slate-600">{log.manpower}</td>
                    <td className="px-6 py-5">
                      <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">{log.percentageCompleted}%</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => setSelectedLog(log)} 
                          className="px-4 py-1.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all ml-auto shadow-sm hover:shadow"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <LayoutList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-lg font-medium">No progress logs submitted yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white  border border-border w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto rounded shadow-2xl"
            >
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingLogId(null);
                  setFormData({ 
                    projectId: '', taskId: '', date: new Date().toISOString().split('T')[0], 
                    weather: 'Sunny', temperature: '', manpower: '', percentageCompleted: '', 
                    workDone: '', equipmentUsed: '', materialsDelivered: '', 
                    safetyIncidents: '', delayHours: '', shiftType: 'Day', siteConditions: 'Normal',
                    visitors: '', nextDayPlan: '', subcontractors: '', inspections: '', issues: '', photos: [] 
                  });
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingLogId ? 'Edit Daily Progress Log' : 'Submit Daily Progress Log'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700  mb-1">Project</label>
                    <select required className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.projectId} onChange={e => {
                        setFormData({...formData, projectId: e.target.value, taskId: ''});
                    }}>
                      <option value="" disabled>Select a project</option>
                      {assignedProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Related Task (Optional)</label>
                    <select className="w-full rounded border border-input bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.taskId} onChange={e => setFormData({...formData, taskId: e.target.value})}>
                      <option value="">General Site Progress</option>
                      {tasks.filter(t => String(t.projectId).replace('p', '') === String(formData.projectId)).map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700  mb-1">Date</label>
                    <input required type="date" className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700  mb-1">Temperature (°C)</label>
                    <input required type="number" step="0.1" placeholder="e.g. 28.5" className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700  mb-1">Shift</label>
                    <select required className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.shiftType} onChange={e => setFormData({...formData, shiftType: e.target.value})}>
                      <option>Day</option>
                      <option>Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700  mb-1">Site Conditions</label>
                    <select required className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.siteConditions} onChange={e => setFormData({...formData, siteConditions: e.target.value})}>
                      <option>Normal</option>
                      <option>Dry</option>
                      <option>Wet</option>
                      <option>Muddy</option>
                      <option>Dusty</option>
                    </select>
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700  mb-1">Weather</label>
                      <select required className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.weather} onChange={e => setFormData({...formData, weather: e.target.value})}>
                        <option>Sunny</option>
                        <option>Cloudy</option>
                        <option>Rainy</option>
                        <option>Storm</option>
                        <option>Snow</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700  mb-1">Manpower</label>
                      <input required type="number" min="0" placeholder="e.g. 15" className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.manpower} onChange={e => setFormData({...formData, manpower: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700  mb-1">% Completed Today</label>
                      <input required type="number" min="0" max="100" placeholder="e.g. 2" className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.percentageCompleted} onChange={e => setFormData({...formData, percentageCompleted: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700  mb-1">Work Done</label>
                    <textarea required rows="2" placeholder="Describe the work completed today..." className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.workDone} onChange={e => setFormData({...formData, workDone: e.target.value})}></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700  mb-1">Equipment Used (Optional)</label>
                      <textarea rows="2" placeholder="e.g. Excavator (2hrs), Crane..." className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.equipmentUsed} onChange={e => setFormData({...formData, equipmentUsed: e.target.value})}></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700  mb-1">Materials Delivered (Optional)</label>
                      <textarea rows="2" placeholder="e.g. 50 bags of cement..." className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.materialsDelivered} onChange={e => setFormData({...formData, materialsDelivered: e.target.value})}></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700  mb-1">Visitors (Optional)</label>
                      <textarea rows="2" placeholder="List any site visitors..." className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.visitors} onChange={e => setFormData({...formData, visitors: e.target.value})}></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700  mb-1">Next Day Plan (Optional)</label>
                      <textarea rows="2" placeholder="What is planned for tomorrow?" className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.nextDayPlan} onChange={e => setFormData({...formData, nextDayPlan: e.target.value})}></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700  mb-1">Subcontractors (Optional)</label>
                      <textarea rows="2" placeholder="List subcontractors & headcount..." className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.subcontractors} onChange={e => setFormData({...formData, subcontractors: e.target.value})}></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700  mb-1">Inspections (Optional)</label>
                      <textarea rows="2" placeholder="Any QA/QC inspections performed?" className="w-full rounded border border-input bg-slate-50  px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.inspections} onChange={e => setFormData({...formData, inspections: e.target.value})}></textarea>
                    </div>
                  </div>



                <div className="border-t border-border pt-4">
                  <label className="block text-sm font-bold text-slate-700  mb-2">Progress Photos & Captions</label>
                  
                  {formData.photos.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {formData.photos.map((p, idx) => (
                        <div key={idx} className="flex items-center space-x-3 bg-slate-50  p-2 rounded border border-border">
                          <img src={p.fileUrl || p.url} alt={p.caption} className="w-12 h-12 object-cover rounded" />
                          <p className="flex-1 text-sm truncate">{p.caption}</p>
                          <button type="button" onClick={() => removePhoto(idx)} className="p-1 text-red-500 hover:bg-red-100 :bg-red-900/30 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <input 
                      id="log-photo-upload"
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={newPhoto.uploading}
                      className="flex-1 rounded border border-input bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
                    />
                    {newPhoto.uploading && <span className="text-xs text-slate-500">Uploading...</span>}
                    {newPhoto.url && (
                      <span className="text-xs text-green-600 truncate w-24">✓ Uploaded</span>
                    )}
                    <input 
                      type="text" 
                      placeholder="Caption (e.g. Ground leveling)" 
                      className="flex-1 rounded border border-input bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
                      value={newPhoto.caption} 
                      onChange={e => setNewPhoto({...newPhoto, caption: e.target.value})} 
                    />
                    <button 
                      type="button" 
                      onClick={addPhoto} 
                      disabled={!newPhoto.url || newPhoto.uploading} 
                      className="px-4 py-2 bg-slate-200 text-slate-800 rounded font-medium disabled:opacity-50 hover:bg-slate-300 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3 border-t border-border">
                  <button type="button" onClick={() => {
                    setIsModalOpen(false);
                    setEditingLogId(null);
                    setFormData({ 
                      projectId: '', taskId: '', date: new Date().toISOString().split('T')[0], 
                      weather: 'Sunny', temperature: '', manpower: '', percentageCompleted: '', 
                      workDone: '', equipmentUsed: '', materialsDelivered: '', 
                      safetyIncidents: '', delayHours: '', shiftType: 'Day', siteConditions: 'Normal',
                      visitors: '', nextDayPlan: '', subcontractors: '', inspections: '', issues: '', photos: [] 
                    });
                  }} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
                  <button type="submit" className="btn-primary">{editingLogId ? 'Update Log' : 'Submit Daily Log'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass-card w-full max-w-2xl h-full max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col p-6 relative"
            >
              <button onClick={() => setSelectedLog(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6 flex justify-between items-start pr-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Daily Progress Log Details</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    {new Date(selectedLog.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {isSiteEngineer && (
                  <div className="flex items-center space-x-2">
                    <button onClick={() => { setSelectedLog(null); openEditModal(selectedLog); }} className="px-4 py-1.5 text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-lg transition-all shadow-sm hover:shadow">
                      Edit
                    </button>
                    <button onClick={() => { setSelectedLog(null); handleDelete(selectedLog.id); }} className="px-4 py-1.5 text-sm font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all shadow-sm hover:shadow">
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border mb-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Weather</p>
                  <p className="font-medium text-slate-800">{selectedLog.weather}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Temp</p>
                  <p className="font-medium text-slate-800">{selectedLog.temperature || '-'} °C</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Manpower</p>
                  <p className="font-medium text-slate-800">{selectedLog.manpower} Workers</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Completed</p>
                  <p className="font-medium text-green-600">+{selectedLog.percentageCompleted}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Shift</p>
                  <p className="font-medium text-slate-800">{selectedLog.shiftType || 'Day'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Conditions</p>
                  <p className="font-medium text-slate-800">{selectedLog.siteConditions || 'Normal'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Work Done</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{selectedLog.workDone}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Next Day Plan</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{selectedLog.nextDayPlan || 'Not specified'}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Equipment Used</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{selectedLog.equipmentUsed || 'None'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Materials Delivered</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{selectedLog.materialsDelivered || 'None'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Subcontractors</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{selectedLog.subcontractors || 'None'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Inspections</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{selectedLog.inspections || 'None'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm md:col-span-2">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Site Visitors</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{selectedLog.visitors || 'None'}</p>
                  </div>
                </div>

                {(selectedLog.issues || selectedLog.safetyIncidents || selectedLog.delayHours) && (
                  <div className="bg-red-50/50 border border-red-200 rounded p-4 space-y-4">
                    <div className="flex items-center text-red-600 font-bold mb-2">
                      <AlertTriangle className="w-5 h-5 mr-2" /> Issues & Delays
                    </div>
                    {selectedLog.delayHours && (
                      <p className="text-sm text-red-700"><strong>Delays:</strong> {selectedLog.delayHours} hours lost.</p>
                    )}
                    {selectedLog.safetyIncidents && (
                      <p className="text-sm text-red-700"><strong>Safety Incidents:</strong> {selectedLog.safetyIncidents}</p>
                    )}
                    {selectedLog.issues && (
                      <p className="text-sm text-red-700"><strong>Other Issues:</strong> {selectedLog.issues}</p>
                    )}
                  </div>
                )}

                {selectedLog.photos && selectedLog.photos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center">
                      <Camera className="w-4 h-4 mr-2" /> Field Captures
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedLog.photos.map((photo, i) => (
                        <div key={i} className="group relative rounded overflow-hidden border border-border bg-slate-100 aspect-video">
                          <img src={photo.fileUrl || photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 to-transparent p-2 pt-6">
                            <p className="text-white text-xs font-medium truncate">{photo.caption || 'Site photo'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Logs;
