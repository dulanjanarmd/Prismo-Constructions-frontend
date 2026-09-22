import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import PortfolioSummaryCards from './PortfolioSummaryCards';
import PMDataAnalytics from './PMDataAnalytics';
import ProjectTable from './ProjectTable';
import CreateProjectButton from './CreateProjectButton';
import DashboardHeader from './DashboardHeader';
import { MessageSquare, Send } from 'lucide-react';

const PMDashboard = () => {
  const { projects, tasks, logs, approvals, issues, getGlobalMessages, sendGlobalMessage } = useData();
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <DashboardHeader rightElement={<CreateProjectButton />} />
      </div>

      <PortfolioSummaryCards projects={projects} />

      <ProjectTable projects={projects} />

      <PMDataAnalytics projects={projects} tasks={tasks} approvals={approvals} issues={issues} logs={logs} />
    </div>
  );
};

export default PMDashboard;
