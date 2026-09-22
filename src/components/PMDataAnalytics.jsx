import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-lg shadow-xl">
        <p className="font-bold text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm font-medium">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }} />
            <span className="text-slate-600 capitalize">{entry.name}:</span>
            <span className="text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PMDataAnalytics = ({ projects, tasks, approvals, issues = [], logs = [] }) => {

  // 1. Project Progress Data
  const projectProgressData = useMemo(() => {
    return projects.map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      fullName: p.name,
      progress: p.progress
    }));
  }, [projects]);

  // 2. Task Status Distribution
  const taskStatusData = useMemo(() => {
    const counts = { 'To Do': 0, 'In Progress': 0, 'Completed': 0, 'Reopened': 0, 'Closed': 0 };
    tasks.forEach(t => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).filter(item => item.value > 0);
  }, [tasks]);

  const TASK_COLORS = {
    'To Do': '#64748b',
    'In Progress': '#0ea5e9',
    'Completed': '#10b981',
    'Reopened': '#ef4444',
    'Closed': '#475569'
  };

  // 3. Task Priorities by Project
  const taskPriorityData = useMemo(() => {
    return projects.map(p => {
      const pTasks = tasks.filter(t => String(t.projectId).replace(/^p/, '') === String(p.id));
      return {
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        High: pTasks.filter(t => t.priority === 'High').length,
        Medium: pTasks.filter(t => t.priority === 'Medium').length,
        Low: pTasks.filter(t => t.priority === 'Low').length
      };
    }).filter(p => p.High > 0 || p.Medium > 0 || p.Low > 0);
  }, [projects, tasks]);

  // 4. Approvals Overview
  const approvalsData = useMemo(() => {
    return projects.map(p => {
      const pApprovals = approvals.filter(a => String(a.projectId).replace(/^p/, '') === String(p.id));
      return {
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        Pending: pApprovals.filter(a => a.status === 'Pending').length,
        Approved: pApprovals.filter(a => a.status === 'Approved').length,
        'Changes Req': pApprovals.filter(a => a.status === 'Changes Requested').length,
      };
    }).filter(p => p.Pending > 0 || p.Approved > 0 || p['Changes Req'] > 0);
  }, [projects, approvals]);

  // 5. Portfolio Health (Radar)
  const portfolioHealth = useMemo(() => {
    const totalProjects = projects.length || 1;
    const avgProgress = projects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjects;
    
    const totalTasks = tasks.length || 1;
    const completedTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'Closed').length;
    const taskCompletionRate = (completedTasks / totalTasks) * 100;

    const totalApprovals = approvals.length || 1;
    const resolvedApprovals = approvals.filter(a => a.status === 'Approved' || a.status === 'Closed').length;
    const approvalRate = (resolvedApprovals / totalApprovals) * 100;

    const totalIssues = issues.length || 1;
    const resolvedIssues = issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
    const issueResolutionRate = (resolvedIssues / totalIssues) * 100;

    return [
      { subject: 'Progress', A: avgProgress, fullMark: 100 },
      { subject: 'Task Velocity', A: taskCompletionRate, fullMark: 100 },
      { subject: 'Client Approvals', A: approvalRate, fullMark: 100 },
      { subject: 'Issue Resolution', A: issueResolutionRate, fullMark: 100 },
      { subject: 'Overall Health', A: (avgProgress + taskCompletionRate + approvalRate + issueResolutionRate) / 4, fullMark: 100 }
    ];
  }, [projects, tasks, approvals, issues]);

  // 6. Issue Severity Area
  const issueSeverityData = useMemo(() => {
    return projects.map(p => {
      const pIssues = issues.filter(i => String(i.projectId).replace(/^p/, '') === String(p.id));
      return {
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        High: pIssues.filter(i => i.severity === 'High' || i.severity === 'Critical').length,
        Medium: pIssues.filter(i => i.severity === 'Medium').length,
        Low: pIssues.filter(i => i.severity === 'Low').length
      };
    }).filter(p => p.High > 0 || p.Medium > 0 || p.Low > 0);
  }, [projects, issues]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Chart 1: Project Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 rounded-2xl flex flex-col"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-6">Project Progress Overview</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} angle={-25} textAnchor="end" />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="progress" name="Progress (%)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Chart 2: Task Status Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card p-6 rounded-2xl flex flex-col"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-6">Task Status Distribution</h3>
        <div className="h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TASK_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '600', color: '#475569' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Chart 3: Task Priorities by Project */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-2xl flex flex-col"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-6">Task Priorities by Project</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskPriorityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} angle={-25} textAnchor="end" />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
              <Bar dataKey="High" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Medium" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Low" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Chart 4: Approvals Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card p-6 rounded-2xl flex flex-col"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-6">Approvals Bottlenecks</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={approvalsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} angle={-25} textAnchor="end" />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Changes Req" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Approved" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Chart 5: Portfolio Health (Radar) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="glass-card p-6 rounded-2xl flex flex-col"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-6">Portfolio Health Index</h3>
        <div className="h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={portfolioHealth}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Health %" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              <RechartsTooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Chart 6: Issue Severity Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="glass-card p-6 rounded-2xl flex flex-col"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-6">Active Issues by Project</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={issueSeverityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} angle={-25} textAnchor="end" />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
              <Area type="monotone" dataKey="High" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Medium" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Low" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
};

export default PMDataAnalytics;
