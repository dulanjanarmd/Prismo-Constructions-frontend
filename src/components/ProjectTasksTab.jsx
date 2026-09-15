import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, Eye, AlertTriangle, Lock, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskDetailModal from './TaskDetailModal';

const STATUS_COLUMNS = ['To Do', 'In Progress', 'Completed', 'Reopened', 'Closed'];

const STATUS_DOT = {
  'To Do': 'bg-slate-400',
  'In Progress': 'bg-amber-400',
  'Completed': 'bg-blue-500',
  'Reopened': 'bg-red-500',
  'Closed': 'bg-green-500'
};

const PRIORITY_STYLES = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-green-100 text-green-700'
};

const ProjectTasksTab = ({ projectId, project }) => {
  const { tasks, addTask, updateTask, deleteTask, users } = useData();
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');

  const [formData, setFormData] = useState({
    title: '', description: '', assignedTo: '',
    priority: 'Medium', dueDate: '', milestoneId: ''
  });

  const isPM = currentUser?.role === 'project_manager' || currentUser?.role === 'pm';
  const isSiteEngineer = currentUser?.role === 'site_engineer';
  const isClient = currentUser?.role === 'client';

  const siteEngineers = users.filter(u => u.role === 'site_engineer');
  const milestones = project?.milestones || [];

  // Filter tasks for this project
  const projectTasks = tasks.filter(t =>
    String(t.projectId) === String(projectId) || t.projectId === `p${projectId}`
  );

  // Apply filters
  const filtered = useMemo(() => {
    return projectTasks.filter(t => {
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchAssignee = assigneeFilter === 'All' || t.assignedTo === assigneeFilter;
      // Site Engineers only see their own tasks
      if (isSiteEngineer) {
        return t.assignedTo === currentUser.id || t.assignedTo === `u${currentUser.id}`;
      }
      return matchStatus && matchAssignee;
    });
  }, [projectTasks, statusFilter, assigneeFilter, isSiteEngineer, currentUser]);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.dueDate) {
      const taskDate = new Date(formData.dueDate);
      taskDate.setHours(0, 0, 0, 0);

      if (project?.startDate) {
        const projStart = new Date(project.startDate);
        projStart.setHours(0, 0, 0, 0);
        if (taskDate <= projStart) {
          alert("Task due date must be strictly after the project's start date.");
          return;
        }
      }

      if (project?.endDate) {
        const projEnd = new Date(project.endDate);
        projEnd.setHours(0, 0, 0, 0);
        if (taskDate > projEnd) {
          alert("Task due date cannot be after the project's end date.");
          return;
        }
      }

      if (formData.milestoneId) {
        const milestoneIdStr = String(formData.milestoneId).replace('m', '');
        const milestone = milestones.find(m => String(m.id) === milestoneIdStr);
        if (milestone && (milestone.dueDate || milestone.date)) {
          const msDate = new Date(milestone.dueDate || milestone.date);
          msDate.setHours(0, 0, 0, 0);
          if (taskDate > msDate) {
            alert("Task due date cannot be after its linked milestone's delivery date.");
            return;
          }
        }
      }
    }

    setSubmitting(true);

    // Extract raw user ID (strip the 'u' prefix added by DataContext)
    const rawAssigneeId = formData.assignedTo.toString().replace(/^u/, '');

    try {
      if (isEditing) {
        await updateTask(selectedTask.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate || null
        });
        setIsModalOpen(false);
        setIsEditing(false);
        setSelectedTask(null);
        return;
      }

      const res = await fetch('http://localhost:8080/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          projectId: projectId,
          assigneeId: rawAssigneeId,
          milestoneId: formData.milestoneId ? formData.milestoneId.toString().replace('m', '') : null
        })
      });

      if (!res.ok) throw new Error('Failed to create task');
      const saved = await res.json();

      // Add to local state with mapped fields for compatibility
      const mapTaskStatus = (s) => {
        if (s === 'TO_DO') return 'To Do';
        if (s === 'IN_PROGRESS') return 'In Progress';
        if (s === 'COMPLETED') return 'Completed';
        return s || 'To Do';
      };

      addTask({
        ...saved,
        id: saved.id,
        status: mapTaskStatus(saved.status),
        projectId: `p${saved.project?.id || projectId}`,
        assignedTo: `u${saved.assignee?.id || rawAssigneeId}`,
        milestoneId: saved.milestone?.id || formData.milestoneId || null,
        milestoneName: saved.milestone?.name || saved.milestone?.title || (formData.milestoneId ? milestones.find(m => String(m.id) === String(formData.milestoneId).replace('m', ''))?.name : null),
        evidence: saved.completionEvidence || null
      });

      setIsModalOpen(false);
      setIsEditing(false);
      setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '', milestoneId: '' });
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to save task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditTask = (task) => {
    setSelectedTask(task);
    setIsEditing(true);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate || '',
      milestoneId: task.milestoneId || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!isSiteEngineer) return;
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    const task = tasks.find(t => String(t.id) === String(taskId));
    if (!task || task.status === newStatus) return;

    try {
      await updateTask(task.id, { status: newStatus });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  // Count per column
  const columnCounts = STATUS_COLUMNS.reduce((acc, s) => {
    acc[s] = projectTasks.filter(t => t.status === s).length;
    return acc;
  }, {});

  // Determine min and max dates for the task due date input
  let minDate = project?.startDate 
    ? new Date(new Date(project.startDate).getTime() + 86400000).toISOString().split('T')[0]
    : undefined;
  let maxDate = project?.endDate || undefined;
  if (formData.milestoneId) {
    const milestoneIdStr = String(formData.milestoneId).replace('m', '');
    const milestone = milestones.find(m => String(m.id) === milestoneIdStr);
    if (milestone && (milestone.dueDate || milestone.date)) {
      maxDate = milestone.dueDate || milestone.date;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Task Board</h2>
          <p className="text-sm text-slate-500">{projectTasks.length} tasks — {columnCounts['Closed']} closed</p>
        </div>
        {isPM && (
          <button
            onClick={() => { setIsEditing(false); setSelectedTask(null); setIsModalOpen(true); }}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 font-bold shrink-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Task
          </button>
        )}
      </div>

      {/* Filters */}
      {isPM && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {STATUS_COLUMNS.map(s => (
                <option key={s} value={s}>{s} ({columnCounts[s]})</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
            >
              <option value="All">All Assignees</option>
              {siteEngineers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 xl:grid-cols-5">
        {STATUS_COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col);
          return (
            <div 
              key={col} 
              className={`glass-card p-4 flex flex-col bg-slate-50/50 min-h-[200px] ${isSiteEngineer ? 'transition-colors hover:bg-slate-100/50' : ''}`}
              onDragOver={(e) => { if (isSiteEngineer) e.preventDefault(); }}
              onDrop={(e) => handleDrop(e, col)}
            >
              <h3 className="font-bold text-sm mb-4 flex items-center border-b border-border pb-3">
                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${STATUS_DOT[col]}`} />
                {col}
                <span className="ml-auto text-xs font-medium text-slate-400 bg-white  px-1.5 py-0.5 rounded-full border border-border">
                  {colTasks.length}
                </span>
              </h3>

              <div className="space-y-3 flex-1">
                {colTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Empty</p>
                ) : (
                  colTasks.map((task, index) => {
                    const assignee = users.find(u => u.id === task.assignedTo || `u${u.id}` === task.assignedTo);
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white p-3 rounded-lg shadow-sm border border-border cursor-pointer hover:shadow-md hover:border-primary/30 transition-all ${isSiteEngineer ? 'cursor-grab active:cursor-grabbing' : ''}`}
                        onClick={() => setSelectedTask(task)}
                        draggable={isSiteEngineer}
                        onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES['Medium']}`}>
                            {task.priority}
                          </span>
                          {task.status === 'Completed' && !task.evidence && isPM && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" title="Needs review" />
                          )}
                          {task.status === 'Closed' && (
                            <Lock className="w-3.5 h-3.5 text-green-500" title="Closed" />
                          )}
                        </div>

                        <h4 className="font-semibold text-sm text-slate-900  leading-tight mb-2">{task.title}</h4>

                        {task.description && (
                          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                          <div className="flex items-center gap-1.5">
                            {assignee && (
                              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold">
                                {assignee.name?.charAt(0)}
                              </div>
                            )}
                            <span className="text-xs text-slate-500 truncate max-w-[80px]">{assignee?.name || '—'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {isPM && (
                              <>
                                <button type="button" onClick={e => { e.stopPropagation(); openEditTask(task); }} className="p-1 text-slate-400 hover:text-primary" title="Edit task">
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {task.status === 'To Do' && (
                                  <button type="button" onClick={e => { e.stopPropagation(); handleDeleteTask(task); }} className="p-1 text-slate-400 hover:text-red-500" title="Delete task">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-slate-400">{task.dueDate}</span>
                            )}
                            <Eye className="w-3.5 h-3.5 text-slate-300 hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <span className="text-xl">×</span>
              </button>
              <h2 className="text-xl font-bold mb-1">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
              <p className="text-sm text-slate-500 mb-5">For: <span className="font-semibold text-slate-700 ">{project?.name}</span></p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Task Title <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Install foundation shuttering" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea required rows="3" placeholder="Detailed instructions for the site engineer..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                {/* Milestone link */}
                {milestones.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Link to Milestone (optional)</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.milestoneId} onChange={e => setFormData({ ...formData, milestoneId: e.target.value })}>
                      <option value="">No milestone link</option>
                      {milestones.map(m => (
                        <option key={m.id} value={m.id}>{m.name || m.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Assign To <span className="text-red-500">*</span></label>
                    <select required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.assignedTo} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}>
                      <option value="" disabled>Select Engineer</option>
                      {siteEngineers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Due Date <span className="text-red-500">*</span></label>
                  <input required type="date" min={minDate} max={maxDate} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => { setIsModalOpen(false); setIsEditing(false); }} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50">
                    {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create & Assign')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          project={project}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default ProjectTasksTab;
