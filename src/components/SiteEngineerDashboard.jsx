import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, AlertTriangle, FileText, Activity, Clock, LogOut, Calendar, Camera, ChevronRight, CheckCircle2 } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import SubmitLogModal from './SubmitLogModal';
import ReportIssueModal from './ReportIssueModal';
import ProjectTable from './ProjectTable';

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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <DashboardHeader />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-blue-500 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">My Open Tasks</p>
            <p className="text-3xl font-bold text-slate-800 ">{openTasks.length}</p>
          </div>
          <CheckSquare className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 text-blue-500 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
        </div>
        
        <div className="glass-card p-5 border-l-4 border-l-orange-500 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">Due Today</p>
            <p className="text-3xl font-bold text-slate-800 ">{tasksDueToday}</p>
          </div>
          <Calendar className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 text-orange-500 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
        </div>

        <div className="glass-card p-5 border-l-4 border-l-green-500 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">Logs This Week</p>
            <p className="text-3xl font-bold text-slate-800 ">{logsThisWeek}</p>
          </div>
          <Camera className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 text-green-500 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
        </div>

        <div className="glass-card p-5 border-l-4 border-l-red-500 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">Open Issues</p>
            <p className="text-3xl font-bold text-slate-800 ">{openIssuesCount}</p>
          </div>
          <AlertTriangle className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 text-red-500 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
        </div>
      </div>

      {/* My Projects */}
      <div className="mt-8">
        <ProjectTable projects={myProjects} title="My Assigned Projects" />
      </div>

      {/* Active Tasks List */}
      <div className="glass-card flex flex-col mt-6 overflow-hidden">
        <div className="flex justify-between items-center p-6 bg-[#e5e7eb] border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">My Active Tasks</h2>
          <button 
            onClick={() => navigate('/portal/tasks')}
            className="text-sm font-semibold text-primary hover:underline flex items-center"
          >
            View All Tasks <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {openTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-60" />
            <p>You have no open tasks. Great job!</p>
          </div>
        ) : (
          <div className="overflow-x-auto p-6 pt-0 mt-6">
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
                          <span className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded shadow-sm w-20 inline-block text-center ${
                            task.priority === 'High' ? 'bg-red-500 text-white' :
                            task.priority === 'Medium' ? 'bg-amber-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {task.priority || 'Medium'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded shadow-sm w-28 inline-block text-center ${
                            task.status === 'Completed' || task.status === 'Closed' ? 'bg-emerald-500 text-white' :
                            task.status === 'In Progress' ? 'bg-amber-500 text-white' : 
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 ">{task.dueDate || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => navigate('/portal/tasks')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1 ml-auto">
                            View <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        )}
      </div>



      {/* Modals */}
      <SubmitLogModal 
        isOpen={isSubmitLogOpen} 
        onClose={() => setIsSubmitLogOpen(false)} 
        assignedProjects={myProjects}
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
