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
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <p className="font-bold text-slate-800 mb-3 border-b border-slate-200/50 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: entry.color || entry.payload.fill }} />
                <span className="text-slate-500 capitalize">{entry.name}</span>
              </div>
              <span className="text-slate-800 font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PMDataAnalytics = ({ projects, tasks, approvals, issues = [], logs = [] }) => {

  // 1. Approvals Overview
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

  // 2. Portfolio Health (Radar)
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



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Chart 1: Portfolio Health (Radar) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-slate-800">Portfolio Health Index</h3>
          <span className="text-slate-400 font-bold cursor-pointer hover:text-slate-600">...</span>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={portfolioHealth}>
              <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 13, fontWeight: 700 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Health %" dataKey="A" stroke="#6366f1" strokeWidth={4} fill="url(#colorHealth)" fillOpacity={1} />
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <RechartsTooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card p-6 flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-slate-800">Approvals Bottlenecks</h3>
          <span className="text-slate-400 font-bold cursor-pointer hover:text-slate-600">...</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={approvalsData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }} barGap={4}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dx={-10} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }} verticalAlign="top" align="right" />
              <Bar dataKey="Pending" fill="#fbbf24" radius={[10, 10, 10, 10]} maxBarSize={12} />
              <Bar dataKey="Changes Req" fill="#a855f7" radius={[10, 10, 10, 10]} maxBarSize={12} />
              <Bar dataKey="Approved" fill="#34d399" radius={[10, 10, 10, 10]} maxBarSize={12} />
              <defs>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fcd34d" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorChanges" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#9333ea" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>



    </div>
  );
};

export default PMDataAnalytics;
