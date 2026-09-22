import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, imgSrc, delay, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-4 flex items-center space-x-4"
  >
    <div className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm ${colorClass}`}>
      <img src={imgSrc} alt={title} className="w-7 h-7 object-contain" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 ">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </motion.div>
);

const PortfolioSummaryCards = ({ projects }) => {
  const totalProjects = projects.length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const onHold = projects.filter(p => p.status === 'On Hold' || p.status === 'Delayed').length;
  const completed = projects.filter(p => p.status === 'Completed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Projects" 
        value={totalProjects} 
        emoji="🏢" 
        imgSrc="/icons/building.svg"
        delay={0.1} 
        colorClass="bg-blue-50"
      />
      <StatCard 
        title="In Progress" 
        value={inProgress} 
        imgSrc="/icons/trending.svg"
        delay={0.2} 
        colorClass="bg-green-50"
      />
      <StatCard 
        title="On Hold / Delayed" 
        value={onHold} 
        imgSrc="/icons/alert.svg"
        delay={0.3} 
        colorClass="bg-orange-50"
      />
      <StatCard 
        title="Completed" 
        value={completed} 
        imgSrc="/icons/check.svg"
        delay={0.4} 
        colorClass="bg-slate-50"
      />
    </div>
  );
};

export default PortfolioSummaryCards;
