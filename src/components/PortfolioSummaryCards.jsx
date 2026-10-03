import React from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, delay, colorClass, iconColorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`glass-card p-5 border-l-4 ${colorClass} relative overflow-hidden group`}
  >
    <div className="relative z-10">
      <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-800 ">{value}</p>
    </div>
    <Icon className={`absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 ${iconColorClass} opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300`} />
  </motion.div>
);

const PortfolioSummaryCards = ({ projects }) => {
  const totalProjects = projects.length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const onHold = projects.filter(p => p.status === 'On Hold' || p.status === 'Delayed').length;
  const completed = projects.filter(p => p.status === 'Completed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Total Projects" 
        value={totalProjects} 
        icon={Building2}
        delay={0.1} 
        colorClass="border-l-blue-500"
        iconColorClass="text-blue-500"
      />
      <StatCard 
        title="In Progress" 
        value={inProgress} 
        icon={TrendingUp}
        delay={0.2} 
        colorClass="border-l-emerald-500"
        iconColorClass="text-emerald-500"
      />
      <StatCard 
        title="On Hold / Delayed" 
        value={onHold} 
        icon={AlertTriangle}
        delay={0.3} 
        colorClass="border-l-orange-500"
        iconColorClass="text-orange-500"
      />
      <StatCard 
        title="Completed" 
        value={completed} 
        icon={CheckCircle2}
        delay={0.4} 
        colorClass="border-l-slate-500"
        iconColorClass="text-slate-500"
      />
    </div>
  );
};

export default PortfolioSummaryCards;
