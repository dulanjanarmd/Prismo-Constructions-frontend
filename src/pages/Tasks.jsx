import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Lock, AlertTriangle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import TaskDetailModal from '../components/TaskDetailModal';

const PRIORITY_STYLES = {
  High: 'bg-rose-100 text-rose-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-teal-100 text-teal-700'
};

const STATUS_STYLES = {
  'To Do': 'bg-slate-100 text-slate-600',
  'In Progress': 'bg-sky-100 text-sky-700',
  'Completed': 'bg-emerald-100 text-emerald-700',
  'Reopened': 'bg-rose-100 text-rose-700',
  'Closed': 'bg-slate-200 text-slate-700'
};

const Tasks = () => {
  const { tasks, projects, users } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);

  const isPM = currentUser?.role === 'project_manager' || currentUser?.role === 'pm';
  const isSiteEngineer = currentUser?.role === 'site_engineer';

  const displayTasks = useMemo(() => {
    const userId = String(currentUser.id);
    let list = isSiteEngineer
      ? tasks.filter(t => String(t.assignedTo || '').replace('u', '') === userId || String(t.assignedTo) === userId || `u${userId}` === String(t.assignedTo))
      : tasks;

    if (search) list = list.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'All') list = list.filter(t => t.status === statusFilter);
    if (projectFilter !== 'All') list = list.filter(t => String(t.projectId) === String(projectFilter));
    if (assigneeFilter !== 'All') list = list.filter(t => t.assignedTo === assigneeFilter);

    return list;
  }, [tasks, isSiteEngineer, currentUser, search, statusFilter, projectFilter, assigneeFilter]);

  const statusCounts = ['To Do', 'In Progress', 'Completed', 'Reopened', 'Closed'].reduce((acc, s) => {
    acc[s] = tasks.filter(t => {
      if (isSiteEngineer) {
        const userId = String(currentUser.id);
        return (String(t.assignedTo || '').replace('u', '') === userId || String(t.assignedTo) === userId) && t.status === s;
      }
      return t.status === s;
    }).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600   bg-clip-text text-transparent">
            {isSiteEngineer ? 'My Tasks' : 'Task Management'}
          </h1>
          <p className="text-slate-500 mt-1">{displayTasks.length} tasks shown</p>
        </div>
        {isPM && (
          <button
            onClick={() => navigate('/portal/projects')}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Go to Project to Create Task
          </button>
        )}
      </div>

      {/* Status summary chips */}
      <div className="flex gap-2 flex-wrap bg-white p-1.5 rounded-full w-fit shadow-sm border border-slate-100">
        {Object.entries(statusCounts).filter(([, v]) => v > 0).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
              statusFilter === status 
                ? 'bg-primary text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {status}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              statusFilter === status ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {['To Do', 'In Progress', 'Completed', 'Reopened', 'Closed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
            >
              <option value="All">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            {isPM && (
              <select
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={assigneeFilter}
                onChange={e => setAssigneeFilter(e.target.value)}
              >
                <option value="All">All Assignees</option>
                {users.filter(u => u.role === 'site_engineer').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {displayTasks.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">
          <p className="text-lg font-medium">No tasks match your filters.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Milestone</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                  {!isSiteEngineer && <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignee</th>}
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                  {displayTasks.map((task, idx) => {
                    const project = projects.find(p =>
                      String(p.id) === String(task.projectId).replace('p', '') || `p${p.id}` === String(task.projectId)
                    );
                    const assignee = users.find(u => u.id === task.assignedTo || `u${u.id}` === task.assignedTo);
                    const needsReview = isPM && task.status === 'Completed';

                    console.log('DEBUG TASKS ROW:', {
                      taskId: task.id,
                      taskMilestoneId: task.milestoneId,
                      projectId: project?.id,
                      milestones: project?.milestones
                    });

                    return (
                      <motion.tr
                        key={task.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`hover:bg-slate-50/50 transition-colors group ${needsReview ? 'bg-amber-50/40 ' : ''}`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-2">
                          {needsReview && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" title="Needs PM review" />}
                          {task.status === 'Closed' && <Lock className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
                          <div>
                            <p className="font-semibold text-slate-900 ">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {project ? (
                          <button
                            onClick={() => navigate(`/portal/projects/${project.id}`)}
                            className="text-primary hover:underline text-xs font-medium"
                          >
                            {project.name}
                          </button>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-5 text-slate-500 text-sm">
                        {task.milestoneName || (projects?.find(p => String(p.id) === String(task.projectId).replace('p', ''))?.milestones?.find(m => String(m.id) === String(task.milestoneId)?.replace('m', ''))?.name) || '—'}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${PRIORITY_STYLES[task.priority] || ''}`}>
                          {task.priority}
                        </span>
                      </td>
                      {!isSiteEngineer && (
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5">
                            {assignee && (
                              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                {assignee.name?.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm text-slate-700 ">{assignee?.name || '—'}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[task.status] || ''}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-500 whitespace-nowrap">{task.dueDate || '—'}</td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="flex items-center gap-1 text-primary hover:text-blue-600 font-medium text-sm transition-colors ml-auto"
                        >
                          <Eye className="w-4 h-4" /> View
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

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          project={projects.find(p =>
            String(p.id) === String(selectedTask.projectId) || p.id === `p${selectedTask.projectId}`
          )}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default Tasks;
