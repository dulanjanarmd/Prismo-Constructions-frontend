import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Calendar, Edit2, Flag, Activity, CheckCircle2, Circle, ArrowRight, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const { projects, tasks, updateProject, deleteProject, users } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const isSiteEngineer = currentUser?.role === 'site_engineer';
  const isClient = currentUser?.role === 'client';
  const currentUserId = String(currentUser?.id || '');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const visibleProjects = (isSiteEngineer
    ? projects.filter(project => tasks.some(task => {
        const taskProjectId = String(task.projectId || '').replace(/^p/, '');
        const assignedTo = String(task.assignedTo || '').replace(/^u/, '');
        return taskProjectId === String(project.id) && assignedTo === currentUserId;
      }))
    : projects).filter(project => {
      const matchesSearch = project.name?.toLowerCase().includes(search.toLowerCase()) ||
                            project.client?.toLowerCase().includes(search.toLowerCase()) ||
                            project.location?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  // Modals state
  const [modalType, setModalType] = useState(null); // 'create', 'edit', 'milestones', 'status'
  const [activeProject, setActiveProject] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', client: '', location: '', startDate: '', endDate: '', description: '' });
  const [statusData, setStatusData] = useState({ status: '', progress: 0 });
  
  // Milestone state
  const [newMilestone, setNewMilestone] = useState({ title: '', date: '' });

  const openModal = (type, project = null) => {
    setActiveProject(project);
    setModalType(type);
    if (type === 'edit' && project) {
      setFormData({
        name: project.name, client: project.client, clientId: project.clientId || '', location: project.location,
        startDate: project.startDate, endDate: project.endDate, description: project.description
      });
    } else if (type === 'status' && project) {
      setStatusData({ status: project.status, progress: project.progress });
    }
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm(`Are you sure you want to completely delete the project "${project.name}"? This action cannot be undone.`)) {
      try {
        await deleteProject(project.id);
      } catch (err) {
        console.error(err);
        alert('Failed to delete project. Please check if there are any dependent records.');
      }
    }
  };

  const closeModal = () => {
    setModalType(null);
    setActiveProject(null);
  };

  const handleCreateEdit = (e) => {
    e.preventDefault();
    if (modalType === 'edit') {
      updateProject(activeProject.id, formData);
    }
    closeModal();
  };

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    updateProject(activeProject.id, { 
      status: statusData.status, 
      progress: parseInt(statusData.progress, 10) 
    });
    closeModal();
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.title || !newMilestone.date) return;

    try {
      const res = await fetch(`http://localhost:8080/api/projects/${activeProject.id}/milestones`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newMilestone.title, dueDate: newMilestone.date, status: 'Incomplete' })
      });
      if (!res.ok) throw new Error('Failed to save milestone');
      const saved = await res.json();
      const updatedMilestones = [...(activeProject.milestones || []), saved];
      updateProject(activeProject.id, { milestones: updatedMilestones });
      setActiveProject({ ...activeProject, milestones: updatedMilestones });
      setNewMilestone({ title: '', date: '' });
    } catch (err) {
      console.error('Error saving milestone:', err);
    }
  };

  const toggleMilestone = async (milestoneId) => {
    const milestone = activeProject.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    const newStatus = milestone.status === 'Complete' ? 'Incomplete' : 'Complete';
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${activeProject.id}/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update milestone');
      const updated = await res.json();
      const updatedMilestones = activeProject.milestones.map(m => m.id === milestoneId ? updated : m);
      updateProject(activeProject.id, { milestones: updatedMilestones });
      setActiveProject({ ...activeProject, milestones: updatedMilestones });
    } catch (err) {
      console.error('Error toggling milestone:', err);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {isSiteEngineer ? 'My Projects' : 'Projects Management'}
        </h1>
        {!isSiteEngineer && !isClient && (
          <button 
            onClick={() => navigate('/portal/projects/new')}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </button>
        )}
      </div>

      <div className="glass-card flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 p-5 bg-[#e5e7eb] text-slate-900 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center gap-3 ml-auto min-w-max">
            <div className="flex space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center text-sm font-bold text-slate-600">
              {['All', 'Planning', 'In Progress', 'On Hold', 'Delayed', 'Completed'].map(status => {
                const count = status === 'All' ? projects.length : projects.filter(p => p.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`relative px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap ${
                      statusFilter === status 
                        ? 'bg-white shadow-sm text-slate-900 font-bold' 
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {status} <span className="ml-1 opacity-60 font-normal">{count}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="relative w-48 shrink-0 h-12">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-9 pr-4 h-full w-full rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm text-slate-900 placeholder:text-slate-500 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Project Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Client</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Progress</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Start Date</th>
                <th className="px-6 py-4 font-semibold tracking-wider">End Date</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleProjects.map(project => (
                <tr 
                  key={project.id} 
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-5 font-bold text-slate-900">{project.name}</td>
                  <td className="px-6 py-5 text-slate-600 font-medium">{project.client}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-lg w-fit whitespace-nowrap ${
                      project.status === 'Completed' ? 'bg-[#dcfce7] text-[#166534]' :
                      project.status === 'In Progress' ? 'bg-[#ffedd5] text-[#9a3412]' : 
                      project.status === 'Planning' ? 'bg-[#f3e8ff] text-[#6b21a8]' : 'bg-[#fee2e2] text-[#991b1b]'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-slate-900 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500 font-bold">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-medium whitespace-nowrap">{project.startDate}</td>
                  <td className="px-6 py-5 text-slate-500 font-medium whitespace-nowrap">{project.endDate}</td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => navigate(`/portal/projects/${project.id}`)} 
                      className="px-4 py-1.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all ml-auto shadow-sm hover:shadow"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {visibleProjects.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No projects found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {/* Edit Project Modal */}
        {modalType === 'edit' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-lg p-6 relative">
              <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold mb-6">Edit Project Details</h2>
              <form onSubmit={handleCreateEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <input required type="text" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Client</label>
                    <select
                      required
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
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
                    <input required type="text" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input required type="date" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input required type="date" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea rows="3" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 :bg-slate-800 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Update Status / Progress Modal */}
        {modalType === 'status' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-sm p-6 relative">
              <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold mb-6">Update Status</h2>
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={statusData.status} onChange={e => setStatusData({...statusData, status: e.target.value})}>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 :bg-slate-800 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">Update</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Manage Milestones Modal */}
        {modalType === 'milestones' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold mb-6 flex items-center"><Flag className="w-5 h-5 mr-2 text-amber-500" /> Manage Milestones</h2>
              
              <div className="space-y-4 mb-6">
                {(!activeProject?.milestones || activeProject.milestones.length === 0) ? (
                  <p className="text-sm text-slate-500 text-center py-4">No milestones defined yet.</p>
                ) : (
                  activeProject?.milestones.map(m => {
                    const isComplete = m.status === 'Complete' || m.completed;
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-slate-50/50">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => toggleMilestone(m.id)} className="text-slate-400 hover:text-primary transition-colors">
                            {isComplete ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                          </button>
                          <div className={isComplete ? 'opacity-50 line-through' : ''}>
                            <p className="font-semibold text-sm">{m.name || m.title}</p>
                            <p className="text-xs text-slate-500">{m.dueDate || m.date}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-bold mb-3">Add New Milestone</h3>
                <form onSubmit={handleAddMilestone} className="space-y-3">
                  <input
                    required
                    type="text"
                    placeholder="Milestone Title (e.g. Foundation Complete)"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={newMilestone.title}
                    onChange={e => setNewMilestone({...newMilestone, title: e.target.value})}
                  />
                  <input
                    required
                    type="date"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={newMilestone.date}
                    onChange={e => setNewMilestone({...newMilestone, date: e.target.value})}
                  />
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" /> Add Milestone
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
