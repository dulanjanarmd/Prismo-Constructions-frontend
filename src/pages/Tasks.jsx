import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Lock, AlertTriangle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskAnalytics from '../components/TaskAnalytics';

const PRIORITY_STYLES = {
  High: 'bg-red-500 text-white',
  Medium: 'bg-amber-500 text-white',
  Low: 'bg-emerald-500 text-white'
};

const STATUS_STYLES = {
  'To Do': 'bg-slate-500 text-white',
  'In Progress': 'bg-sky-500 text-white',
  'Completed': 'bg-emerald-500 text-white',
  'Reopened': 'bg-red-500 text-white',
  'Closed': 'bg-slate-600 text-white'
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

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(t => {
        const titleMatch = t.title?.toLowerCase().includes(s);
        
        const project = projects.find(p => String(p.id) === String(t.projectId).replace(/^p/, '') || `p${p.id}` === String(t.projectId));
        const projectMatch = project?.name?.toLowerCase().includes(s);

        const assignee = users.find(u => String(u.id) === String(t.assignedTo).replace(/^u/, '') || `u${u.id}` === String(t.assignedTo));
        const assigneeMatch = assignee?.name?.toLowerCase().includes(s);
        
        const milestoneName = t.milestoneName || (project?.milestones?.find(m => String(m.id) === String(t.milestoneId)?.replace(/^m/, ''))?.name);
        const milestoneMatch = milestoneName?.toLowerCase().includes(s);

        return titleMatch || projectMatch || assigneeMatch || milestoneMatch;
      });
    }
    if (statusFilter !== 'All') list = list.filter(t => t.status === statusFilter);
    if (projectFilter !== 'All') list = list.filter(t => String(t.projectId).replace(/^p/, '') === String(projectFilter).replace(/^p/, ''));
    if (assigneeFilter !== 'All') list = list.filter(t => String(t.assignedTo).replace(/^u/, '') === String(assigneeFilter).replace(/^u/, ''));

    return list;
  }, [tasks, projects, users, isSiteEngineer, currentUser, search, statusFilter, projectFilter, assigneeFilter]);

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isSiteEngineer ? 'My Tasks' : 'Task Management'}
          </h1>
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

      {/* Task Analytics */}
      <TaskAnalytics tasks={displayTasks} projects={projects} />

      {/* Table & Filters Card */}
      <div className="glass-card flex flex-col overflow-hidden">
        
        {/* Filters Section */}
        <div className="flex items-center gap-3 p-5 bg-[#e5e7eb] text-slate-900 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center gap-3 ml-auto min-w-max">
            <div className="flex space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center text-sm font-bold text-slate-600">
              {['All', 'To Do', 'In Progress', 'Completed', 'Reopened', 'Closed'].map(status => {
                const count = status === 'All' ? displayTasks.length : (statusCounts[status] || 0);
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

            <select
              className="h-12 w-36 shrink-0 rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm px-3 text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
            >
              <option value="All">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            {isPM && (
              <select
                className="h-12 w-36 shrink-0 rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm px-3 text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={assigneeFilter}
                onChange={e => setAssigneeFilter(e.target.value)}
              >
                <option value="All">All Assignees</option>
                {users.filter(u => u.role === 'site_engineer').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}

            <div className="relative w-48 shrink-0 h-12">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="pl-9 pr-4 h-full w-full rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm text-slate-900 placeholder:text-slate-500 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

      {/* Table */}
      {displayTasks.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <p className="text-lg font-medium">No tasks match your filters.</p>
        </div>
      ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 tracking-wider">Task</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 tracking-wider">Project</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 tracking-wider">Milestone</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 tracking-wider">Priority</th>
                  {!isSiteEngineer && <th className="px-6 py-4 text-xs font-semibold text-slate-400 tracking-wider">Assignee</th>}
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 tracking-wider text-right">Action</th>
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
                            className="text-slate-700 hover:text-primary hover:underline text-xs font-medium transition-colors text-left"
                          >
                            {project.name}
                          </button>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-5 text-slate-500 text-sm">
                        {task.milestoneName || (projects?.find(p => String(p.id) === String(task.projectId).replace('p', ''))?.milestones?.find(m => String(m.id) === String(task.milestoneId)?.replace('m', ''))?.name) || '—'}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm w-20 inline-block text-center ${PRIORITY_STYLES[task.priority] || ''}`}>
                          {task.priority}
                        </span>
                      </td>
                      {!isSiteEngineer && (
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-slate-700 ">{assignee?.name || '—'}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1.5 text-xs font-bold rounded shadow-sm w-28 inline-block text-center ${STATUS_STYLES[task.status] || ''}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-500 whitespace-nowrap">{task.dueDate || '—'}</td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="px-4 py-1.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all ml-auto shadow-sm hover:shadow"
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
