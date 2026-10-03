import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

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

const ProjectAnalytics = ({ projects }) => {
  // 1. Project Progress Data
  const projectProgressData = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return projects.map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      fullName: p.name,
      progress: p.progress || 0
    }));
  }, [projects]);

  if (projects.length === 0) return null;

  return (
    <div className="mb-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 flex flex-col w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-slate-800">Project Progress</h3>
          <span className="text-slate-400 font-bold cursor-pointer hover:text-slate-600">...</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }} barGap={6}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dx={-10} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="progress" name="Progress (%)" fill="#34d399" radius={[10, 10, 10, 10]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectAnalytics;
