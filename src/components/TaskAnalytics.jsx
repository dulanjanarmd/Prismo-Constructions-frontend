import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#64748b'];
const TASK_COLORS = {
  'To Do': '#64748b',
  'In Progress': '#0ea5e9',
  'Completed': '#10b981',
  'Reopened': '#ef4444',
  'Closed': '#475569'
};

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

      {/* Chart 2: Task Priorities by Project */}
      {taskPriorityData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
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
      )}
    </div>
  );
};

export default TaskAnalytics;
