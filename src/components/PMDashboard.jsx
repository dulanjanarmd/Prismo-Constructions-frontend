import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import PortfolioSummaryCards from './PortfolioSummaryCards';
import ProjectTable from './ProjectTable';
import RecentActivity from './RecentActivity';
import CreateProjectButton from './CreateProjectButton';
import { MessageSquare, Send } from 'lucide-react';

const PMDashboard = () => {
  const { projects, tasks, logs, approvals, getGlobalMessages, sendGlobalMessage } = useData();
  const { currentUser } = useAuth();
  const [clientRequests, setClientRequests] = useState([]);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    let cancelled = false;
    const loadClientRequests = async () => {
      const messages = (await Promise.all(projects.map(async project => {
        const projectId = String(project.id).replace(/^p/, '');
        return (await getGlobalMessages(projectId)).map(message => ({ ...message, project }));
      }))).flat()
        .filter(message => message.messageText?.startsWith('[CLIENT REQUEST]'))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (!cancelled) setClientRequests(messages);
    };
    if (projects.length) loadClientRequests();
    return () => { cancelled = true; };
  }, [projects]);

  const handleReply = async (request) => {
    const text = replyText[request.id]?.trim();
    if (!text) return;
    const saved = await sendGlobalMessage(request.project.id, text);
    if (saved) {
      setClientRequests(prev => prev.filter(message => message.id !== request.id));
      setReplyText(prev => ({ ...prev, [request.id]: '' }));
    }
  };

  const recentActivities = useMemo(() => {
    const activities = [];
    
    // Add logs
    logs.forEach(log => {
      const project = projects.find(p => p.id === log.projectId);
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
      const project = projects.find(p => p.id === task.projectId);
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
      const project = projects.find(p => p.id === app.projectId);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600   bg-clip-text text-transparent">
            Project Manager Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Welcome back, {currentUser?.name}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <CreateProjectButton />
        </div>
      </div>

      <PortfolioSummaryCards projects={projects} />

      <ProjectTable projects={projects} />

      {clientRequests.length > 0 && (
        <section className="glass-card p-5 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Client Requests</h2>
              <p className="text-sm text-slate-500">Messages sent from the client portal</p>
            </div>
          </div>
          <div className="space-y-3">
            {clientRequests.slice(0, 5).map(request => (
              <div key={request.id} className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                <div className="flex justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-slate-900">{request.project.name}</p>
                  <span className="text-xs text-slate-500">{request.sender?.name || 'Client'}</span>
                </div>
                <p className="text-sm text-slate-700 mb-3">{request.messageText.replace('[CLIENT REQUEST] ', '')}</p>
                <div className="flex gap-2">
                  <input
                    value={replyText[request.id] || ''}
                    onChange={event => setReplyText(prev => ({ ...prev, [request.id]: event.target.value }))}
                    placeholder="Reply to client..."
                    className="flex-1 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={() => handleReply(request)} disabled={!replyText[request.id]?.trim()} className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    <Send className="w-4 h-4" /> Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <RecentActivity activities={recentActivities} />
    </div>
  );
};

export default PMDashboard;
