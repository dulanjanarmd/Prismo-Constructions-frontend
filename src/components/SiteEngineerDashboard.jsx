import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Camera, AlertTriangle, ChevronRight, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import RecentActivity from './RecentActivity';
import SubmitLogModal from './SubmitLogModal';
import ReportIssueModal from './ReportIssueModal';

const SiteEngineerDashboard = () => {
  const { projects, tasks, logs, issues } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isSubmitLogOpen, setIsSubmitLogOpen] = useState(false);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);

  // Task's assignedTo is 'u3' (prefixed in DataContext), but currentUser.id is raw number 3
  const myTasks = useMemo(() => {
    const userId = String(currentUser?.id);
    return tasks.filter(t => {
      const assignedTo = String(t.assignedTo || '').replace('u', '');
      return assignedTo === userId || String(t.assignedTo) === userId || `u${userId}` === String(t.assignedTo);
    });
  }, [tasks, currentUser]);

  const openTasks = myTasks.filter(t => t.status === 'To Do' || t.status === 'In Progress');
  
  const tasksDueToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return myTasks.filter(t => t.dueDate === today && t.status !== 'Completed' && t.status !== 'Closed').length;
  }, [myTasks]);

  // 2. My Projects (Projects where SE has tasks or logs)
  const myProjects = useMemo(() => {
    const projectIds = new Set();
    myTasks.forEach(t => projectIds.add(String(t.projectId).replace('p', '')));
    return projects.filter(p => projectIds.has(String(p.id)));
  }, [projects, myTasks, logs, currentUser]);

  // For Progress Logs This Week
  const logsThisWeek = useMemo(() => {
    // simplified for demo: just count my logs
    return logs.filter(l => String(l.submittedBy) === String(currentUser?.id) || `u${l.submittedBy}` === currentUser?.id).length;
  }, [logs, currentUser]);

  const openIssuesCount = useMemo(() => {
    const myProjIds = myProjects.map(p => String(p.id));
    return (issues || []).filter(i => myProjIds.includes(String(i.projectId)) && i.status === 'Open').length;
  }, [issues, myProjects]);

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  // 3. Recent Activity (Filtered to SE's projects)
  const recentActivities = useMemo(() => {
    const activities = [];
    myTasks.forEach(task => {
      const project = projects.find(p => String(p.id) === String(task.projectId).replace('p', '') || `p${p.id}` === String(task.projectId));
      if (project) {
        activities.push({
          type: 'task',
          description: `Task "${task.title}" is ${task.status}`,
          projectName: project.name,
          timestamp: task.dueDate || 'Recent',
          dateObj: new Date(task.dueDate || new Date())
        });
      }
    });

    logs.forEach(log => {
      if (String(log.submittedBy) === String(currentUser?.id) || `u${log.submittedBy}` === currentUser?.id) {
        const project = projects.find(p => String(p.id) === String(log.projectId).replace('p', '') || `p${p.id}` === String(log.projectId));
        if (project) {
          activities.push({
            type: 'log',
            description: `You submitted a progress log`,
            projectName: project.name,
            timestamp: log.date,
            dateObj: new Date(log.date)
          });
        }
      }
    });

    return activities.sort((a, b) => b.dateObj - a.dateObj).slice(0, 10);
  }, [myTasks, logs, projects, currentUser]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600   bg-clip-text text-transparent">
            Site Engineer Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Welcome back, {currentUser?.name}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-blue-500">
          <p className="text-sm font-semibold text-slate-500 mb-1">My Open Tasks</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-slate-800 ">{openTasks.length}</p>
            <div className="p-2 bg-blue-50  rounded-full text-blue-500">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="glass-card p-5 border-l-4 border-l-orange-500">
          <p className="text-sm font-semibold text-slate-500 mb-1">Due Today</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-slate-800 ">{tasksDueToday}</p>
            <div className="p-2 bg-orange-50  rounded-full text-orange-500">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-green-500">
          <p className="text-sm font-semibold text-slate-500 mb-1">Logs This Week</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-slate-800 ">{logsThisWeek}</p>
            <div className="p-2 bg-green-50  rounded-full text-green-500">
              <Camera className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-red-500">
          <p className="text-sm font-semibold text-slate-500 mb-1">Open Issues</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-slate-800 ">{openIssuesCount}</p>
            <div className="p-2 bg-red-50  rounded-full text-red-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>


      {/* Active Tasks List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">My Active Tasks</h2>
          <button 
            onClick={() => navigate('/portal/tasks')}
            className="text-sm font-semibold text-primary hover:underline flex items-center"
          >
            View All Tasks <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {openTasks.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-60" />
            <p>You have no open tasks. Great job!</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50  border-b border-border text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Task Title</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Milestone</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Due Date</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {openTasks.slice(0, 5).map(task => {
                    const project = projects.find(p => String(p.id) === String(task.projectId).replace('p', '') || `p${p.id}` === String(task.projectId));
                    return (
                      <tr key={task.id} className="hover:bg-slate-50/50 :bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 ">{task.title}</td>
                        <td className="px-4 py-3 text-slate-600 ">{project?.name || '—'}</td>
                        <td className="px-4 py-3 text-slate-600 ">{task.milestoneName || (projects?.find(p => String(p.id) === String(task.projectId).replace('p', ''))?.milestones?.find(m => String(m.id) === String(task.milestoneId)?.replace('m', ''))?.name) || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${
                            task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {task.priority || 'Medium'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-xs uppercase tracking-wider text-slate-600 ">
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 ">{task.dueDate || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => navigate('/portal/tasks')} className="text-primary hover:text-primary/80 font-semibold flex items-center justify-end gap-1 ml-auto">
                            View <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        <RecentActivity activities={recentActivities} />
      </div>

      {/* Modals */}
      <SubmitLogModal 
        isOpen={isSubmitLogOpen} 
        onClose={() => setIsSubmitLogOpen(false)} 
        assignedProjects={myProjects.length > 0 ? myProjects : projects}
        assignedTasks={tasks}
      />
      
      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        assignedProjects={myProjects}
        assignedTasks={myTasks}
      />
    </div>
  );
};

export default SiteEngineerDashboard;
