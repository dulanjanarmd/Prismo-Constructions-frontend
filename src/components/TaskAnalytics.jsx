import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const TASK_COLORS = {
  'To Do': '#cbd5e1',         // light gray
  'In Progress': '#a855f7',   // purple
  'Completed': '#34d399',     // bright green
  'Reopened': '#fbbf24',      // yellow
  'Closed': '#3b82f6'         // blue
};

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
                <span className="text-slate-500 capitalize">{entry.name}:</span>
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

const TaskAnalytics = ({ tasks, projects }) => {
  // 1. Task Status Distribution
  const taskStatusData = useMemo(() => {
    const counts = { 'To Do': 0, 'In Progress': 0, 'Completed': 0, 'Reopened': 0, 'Closed': 0 };
    tasks.forEach(t => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).filter(item => item.value > 0);
  }, [tasks]);

  // 2. Task Priorities by Project
  const taskPriorityData = useMemo(() => {
    if (!projects || projects.length === 0) return [];
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

  if (tasks.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Chart 1: Task Status Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 flex flex-col relative"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-slate-800">Task Status</h3>
          <span className="text-slate-400 font-bold cursor-pointer hover:text-slate-600">...</span>
        </div>
        
        <div className="relative h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TASK_COLORS[entry.name] || '#ccc'} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-500 font-medium">Total Tasks</span>
            <span className="text-2xl font-bold text-slate-900">{tasks.length}</span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {taskStatusData.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TASK_COLORS[entry.name] || '#ccc' }} />
              <span className="text-xs font-medium text-slate-600">{entry.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Chart 2: Task Priorities by Project */}
      {taskPriorityData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Task Priorities</h3>
            <span className="text-slate-400 font-bold cursor-pointer hover:text-slate-600">...</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskPriorityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }} barGap={6}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }} verticalAlign="top" align="right" />
                
                <Bar dataKey="High" fill="#a855f7" radius={[10, 10, 10, 10]} maxBarSize={12} />
                <Bar dataKey="Medium" fill="#3b82f6" radius={[10, 10, 10, 10]} maxBarSize={12} />
                <Bar dataKey="Low" fill="#cbd5e1" radius={[10, 10, 10, 10]} maxBarSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TaskAnalytics;
