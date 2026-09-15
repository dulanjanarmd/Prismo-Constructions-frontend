import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Edit2, Activity, X, CheckSquare, AlertTriangle, Clock, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SummaryCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="glass-card p-4 flex items-center space-x-4">
    <div className={`p-2.5 rounded-xl ${colorClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 ">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const ProjectOverviewTab = ({ project }) => {
  const { updateProject, deleteProject, tasks, approvals, logs, users } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isClient = currentUser?.role === 'client';

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
  const [statusData, setStatusData] = useState({ status: project.status, progress: project.progress });

  const openModal = (type) => {
    setModalType(type);
    if (type === 'edit') {
      setFormData({
        name: project.name, client: project.client, clientId: project.clientId || '', location: project.location,
        startDate: project.startDate, endDate: project.endDate, description: project.description
      });
    } else if (type === 'status') {
      setStatusData({ status: project.status, progress: project.progress });
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

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    updateProject(project.id, { status: statusData.status, progress: parseInt(statusData.progress, 10) });
    closeModal();
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

  // Recent activity for this project
  const recentActivity = [
    ...projectTasks.filter(t => t.status === 'Completed').map(t => ({
      text: `Task "${t.title}" marked as completed`,
      type: 'task',
      date: t.dueDate || ''
    })),
    ...projectLogs.map(l => ({
      text: `Daily progress log submitted (+${l.percentageCompleted}%)`,
      type: 'log',
      date: l.date || ''
    })),
    ...projectApprovals.map(a => ({
      text: `Client approval "${a.title}" — ${a.status}`,
      type: 'approval',
      date: a.dateRequested || ''
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Project details + status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
              <h2 className="text-xl font-bold">Project Details</h2>
              {!isClient && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('edit')}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Edit Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-slate-800  text-sm leading-relaxed">{project.description || 'No description provided.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Client</p>
                  <p className="font-medium">{project.client}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Location</p>
                  <p className="font-medium">{project.location}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Start Date</p>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    <span>{project.startDate}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">End Date</p>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    <span>{project.endDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Progress */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" /> Status &amp; Progress
              </h2>
              {!isClient && (
                <button
                  onClick={() => openModal('status')}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Update Status"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-2">Overall Progress</p>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-slate-200  rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1 }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                    />
                  </div>
                  <span className="text-xl font-bold text-primary">{project.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold border-b border-border pb-4 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-400" /> Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No activity yet.</p>
          ) : (
            <div className="space-y-5">
              {recentActivity.map((a, idx) => (
                <div key={idx} className="flex relative">
                  {idx !== recentActivity.length - 1 && (
                    <div className="absolute top-7 left-3.5 bottom-0 w-px bg-border" />
                  )}
                  <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    a.type === 'task' ? 'bg-green-100 ' :
                    a.type === 'approval' ? 'bg-amber-100 ' :
                    'bg-blue-100 '
                  }`}>
                    {a.type === 'task' && <CheckSquare className="w-3 h-3 text-green-600" />}
                    {a.type === 'approval' && <Clock className="w-3 h-3 text-amber-600" />}
                    {a.type === 'log' && <Activity className="w-3 h-3 text-blue-600" />}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-slate-700 ">{a.text}</p>
                    {a.date && <p className="text-xs text-slate-400 mt-0.5">{a.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
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

        {modalType === 'status' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-sm p-6 relative">
              <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold mb-6">Update Status & Progress</h2>
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed" 
                    value={statusData.status} 
                    onChange={e => setStatusData({ ...statusData, status: e.target.value })}
                  >
                    <option value="Not Started" disabled={project.milestones?.length > 0 && statusData.progress > 0}>Not Started</option>
                    <option value="Planning" disabled={project.milestones?.length > 0 && statusData.progress > 0}>Planning</option>
                    <option value="In Progress" disabled={project.milestones?.length > 0 && statusData.progress === 100}>In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Overall Progress ({statusData.progress}%)</label>
                  {project.milestones && project.milestones.length > 0 ? (
                    <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="mb-2">Progress is automatically calculated based on milestone completion.</p>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            style={{ width: `${statusData.progress}%` }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                          />
                        </div>
                        <span className="font-bold text-primary">{statusData.progress}%</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input type="range" min="0" max="100" className="w-full accent-primary" value={statusData.progress} onChange={e => setStatusData({ ...statusData, progress: e.target.value })} />
                      <div className="text-center font-bold text-primary mt-1">{statusData.progress}%</div>
                    </>
                  )}
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 :bg-slate-800 rounded-md transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">Update</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectOverviewTab;
