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

      <RecentActivity activities={recentActivities} />
    </div>
  );
};

export default PMDashboard;
