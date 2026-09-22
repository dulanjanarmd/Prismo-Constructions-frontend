import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { X, Activity, Camera, CheckSquare, FileText, Bell } from 'lucide-react';

const getActivityIcon = (type) => {
  switch (type) {
    case 'log': return <Camera className="w-4 h-4 text-blue-500" />;
    case 'task': return <CheckSquare className="w-4 h-4 text-green-500" />;
    case 'approval': return <FileText className="w-4 h-4 text-amber-500" />;
    default: return <Activity className="w-4 h-4 text-slate-500" />;
  }
};

const NotificationDrawer = ({ isOpen, onClose }) => {
  const { projects, tasks, logs, approvals, notifications, markNotificationAsRead } = useData();
  const [activeTab, setActiveTab] = useState('alerts');

  const recentActivities = useMemo(() => {
    const activities = [];
    
    // Add logs
    logs.forEach(log => {
      const project = projects.find(p => String(p.id).replace(/^[put]/, '') === String(log.projectId).replace(/^[put]/, ''));
      if (project) {
        activities.push({
          type: 'log',
          description: `Site Engineer uploaded new progress log`,
          projectName: project.name,
          timestamp: log.date,
          dateObj: new Date(log.date)
        });
      }
    });

    // Add tasks
    tasks.forEach(task => {
      const project = projects.find(p => String(p.id).replace(/^[put]/, '') === String(task.projectId).replace(/^[put]/, ''));
      if (project && task.status === 'Completed') {
        activities.push({
          type: 'task',
          description: `Task "${task.title}" marked as completed`,
          projectName: project.name,
          timestamp: task.dueDate || 'Recent',
          dateObj: new Date(task.dueDate || new Date())
        });
      }
    });

    // Add approvals
    approvals.forEach(app => {
      const project = projects.find(p => String(p.id).replace(/^[put]/, '') === String(app.projectId).replace(/^[put]/, ''));
      if (project) {
        activities.push({
          type: 'approval',
          description: app.status === 'Pending' ? `Client approval requested: ${app.title}` : `Approval ${app.status.toLowerCase()}: ${app.title}`,
          projectName: project.name,
          timestamp: app.dateRequested,
          dateObj: new Date(app.dateRequested)
        });
      }
    });

    return activities.sort((a, b) => b.dateObj - a.dateObj);
  }, [projects, tasks, logs, approvals]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-card w-full max-w-md h-full max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col"
        >
          <div className="p-6 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-border bg-slate-50/50">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'alerts' ? 'border-b-2 border-primary text-primary bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              <Bell className="w-4 h-4" /> Alerts
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'activity' ? 'border-b-2 border-primary text-primary bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              <Activity className="w-4 h-4" /> Recent Activity
            </button>
          </div>

          <div className="p-0 flex-1 overflow-y-auto">
            {activeTab === 'activity' ? (
              <div className="p-6">
                {recentActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center mt-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <Activity className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">No recent activity</h3>
                    <p className="text-xs text-slate-500">You're all caught up with project updates.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex relative">
                        {index !== recentActivities.length - 1 && (
                          <div className="absolute top-8 left-4 bottom-0 w-px bg-slate-200 -ml-px"></div>
                        )}
                        <div className="relative z-10 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {activity.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {activity.projectName} • {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {!notifications || notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center mt-16">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <Bell className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">No alerts right now</h3>
                    <p className="text-xs text-slate-500">You'll see system notifications here.</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-4 border-b border-border cursor-pointer transition-colors flex items-start gap-3 ${!notif.read ? 'bg-blue-50/30 hover:bg-blue-50/60' : 'hover:bg-slate-50/50'}`}
                        onClick={() => {
                          if (!notif.read) markNotificationAsRead(notif.id);
                        }}
                      >
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                        <div>
                          <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{notif.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationDrawer;
