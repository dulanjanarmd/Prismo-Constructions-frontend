import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Edit2, Activity, X, CheckSquare, AlertTriangle, Clock, FileText, Trash2, MapPin, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SummaryCard = ({ icon: Icon, label, value, colorClass }) => {
  const textColor = colorClass.split(' ').find(c => c.startsWith('text-')) || 'text-slate-500';
  const borderColor = textColor.replace('text-', 'border-l-');

  return (
    <div className={`glass-card p-5 border-l-4 ${borderColor} relative overflow-hidden group`}>
      <div className="relative z-10">
        <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <Icon className={`absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300 ${textColor}`} />
    </div>
  );
};

const ProjectOverviewTab = ({ project }) => {
  const { updateProject, deleteProject, tasks, approvals, logs, users } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const userRole = currentUser?.role?.toLowerCase() || '';
  const isClient = userRole === 'client';
  const isPMorCEO = userRole === 'project_manager' || userRole === 'pm' || userRole === 'ceo';

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({
    name: project.name,
    client: project.client,
    clientId: project.clientId || '',
    location: project.location,
    startDate: project.startDate,
    endDate: project.endDate,
    description: project.description
  });
  const openModal = (type) => {
    setModalType(type);
    if (type === 'edit') {
      setFormData({
        name: project.name, client: project.client, clientId: project.clientId || '', location: project.location,
        startDate: project.startDate, endDate: project.endDate, description: project.description
      });
    }
  };

  const closeModal = () => setModalType(null);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProject(project.id, formData);
      closeModal();
    } catch (error) {
      console.error('Error updating project details:', error);
      alert('Failed to update project details. Please try again.');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to completely delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await deleteProject(project.id);
        navigate('/portal/projects');
      } catch (err) {
        console.error(err);
        alert('Failed to delete project. Please check if there are any dependent records.');
      }
    }
  };

  // Summary stats
  const projectTasks = tasks.filter(t =>
    String(t.projectId) === String(project.id) || t.projectId === `p${project.id}`
  );
  const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;


  const projectLogs = logs.filter(l =>
    String(l.projectId) === String(project.id) || l.projectId === `p${project.id}`
  );
  const openIssues = projectLogs.filter(l => l.issues).length;

  const projectApprovals = approvals.filter(a =>
    String(a.projectId) === String(project.id) || a.projectId === `p${project.id}`
  );
  const pendingApprovals = projectApprovals.filter(a => a.status === 'Pending').length;



  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={CheckSquare}
          label="Total Tasks"
          value={projectTasks.length}
          colorClass="bg-blue-100  text-blue-600 "
        />
        <SummaryCard
          icon={CheckSquare}
          label="Completed Tasks"
          value={completedTasks}
          colorClass="bg-green-100  text-green-600 "
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Open Issues"
          value={openIssues}
          colorClass="bg-red-100  text-red-600 "
        />
        <SummaryCard
          icon={Clock}
          label="Pending Approvals"
          value={pendingApprovals}
          colorClass="bg-amber-100  text-amber-600 "
        />
      </div>

      <div className="space-y-6">
          {/* Details Card Summary */}
          <div className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Project Configuration</h2>
              <p className="text-sm text-slate-500">View and manage project setup, location, and dates.</p>
            </div>
            <button
              onClick={() => setIsDetailsOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-105 transition-all shadow-sm whitespace-nowrap"
            >
              View Project Details
            </button>
          </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType === 'edit' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-lg p-6 relative">
              <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold mb-6">Edit Project Details</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <input required type="text" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Client</label>
                    <select
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={formData.clientId || ''}
                      onChange={e => {
                        const selected = users.find(u => String(u.id) === e.target.value);
                        setFormData({ ...formData, clientId: e.target.value, client: selected?.name || '' });
                      }}
                    >
                      <option value="" disabled>Select a client</option>
                      {users.filter(u => u.role === 'client').map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input required type="text" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input required type="date" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input required type="date" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea rows="3" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 :bg-slate-800 rounded-md transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Slide-over Project Details */}
        {isDetailsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDetailsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[101] flex flex-col h-full max-h-[calc(100vh)]"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1 -ml-2">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm ${
                      project.status === 'Completed' ? 'bg-emerald-500 text-white' :
                      project.status === 'In Progress' ? 'bg-amber-500 text-white' : 
                      project.status === 'Planning' ? 'bg-purple-500 text-white' : 
                      project.status === 'On Hold' ? 'bg-red-500 text-white' : 'bg-slate-500 text-white'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">{project.name || 'Project Details'}</h2>
                </div>
                <div className="flex items-center shrink-0">
                  {isPMorCEO && (
                    <>
                      <button onClick={() => { setIsDetailsOpen(false); openModal('edit'); }} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-full transition-colors" title="Edit project">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={handleDeleteProject} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete project">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setIsDetailsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors ml-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Body */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {project.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{project.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Client</p>
                      <p className="text-sm font-semibold">{project.client}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="text-sm font-semibold">{project.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 col-span-2 sm:col-span-1">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Start Date</p>
                      <p className="text-sm font-semibold">{project.startDate || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 col-span-2 sm:col-span-1">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">End Date</p>
                      <p className="text-sm font-semibold">{project.endDate || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              {isPMorCEO && (
                <div className="p-6 border-t border-border bg-slate-50/50 sticky bottom-0">
                  <button
                    onClick={() => {
                      if (project.status === 'On Hold') {
                        updateProject(project.id, { status: 'Planning' });
                      } else {
                        updateProject(project.id, { status: 'On Hold' });
                      }
                    }}
                    className={`w-full py-2.5 hover:opacity-90 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${project.status === 'On Hold' ? 'bg-green-500' : 'bg-amber-500'}`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {project.status === 'On Hold' ? 'Resume Project' : 'Hold Project'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}

      </AnimatePresence>
    </div>
  );
};

export default ProjectOverviewTab;
