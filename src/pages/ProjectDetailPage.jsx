import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, LayoutDashboard, Flag, CheckSquare, Camera, AlertTriangle, MessageSquare, FolderOpen, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import ProjectOverviewTab from '../components/ProjectOverviewTab';
import ProjectMilestonesTab from '../components/ProjectMilestonesTab';
import ProjectTasksTab from '../components/ProjectTasksTab';
import ProjectLogsTab from '../components/ProjectLogsTab';
import ProjectIssuesTab from '../components/ProjectIssuesTab';
import ProjectApprovalsTab from '../components/ProjectApprovalsTab';
import ProjectDocumentsTab from '../components/ProjectDocumentsTab';

const TABS = [
  { id: 'overview',   label: 'Overview',         icon: LayoutDashboard },
  { id: 'milestones', label: 'Milestones',        icon: Flag },
  { id: 'tasks',      label: 'Tasks',             icon: CheckSquare },
  { id: 'progress',   label: 'Progress',          icon: Camera },
  { id: 'issues',     label: 'Issues',            icon: AlertTriangle },
  { id: 'approvals',  label: 'Client Approvals',  icon: MessageSquare },
  { id: 'documents',  label: 'Documents',         icon: FolderOpen }
];

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useData();
  const { currentUser } = useAuth();
  
  const isSiteEngineer = currentUser?.role === 'site_engineer';
  const isClient = currentUser?.role === 'client';
  const isCEO = currentUser?.role === 'ceo';

  // Filter tabs based on role
  const availableTabs = isSiteEngineer 
    ? TABS.filter(t => ['overview', 'tasks', 'progress', 'issues'].includes(t.id))
    : isClient
      ? TABS.filter(t => ['overview', 'milestones', 'progress', 'documents', 'approvals'].includes(t.id))
      : isCEO
        ? TABS.filter(t => ['overview', 'milestones', 'progress', 'issues', 'approvals', 'documents'].includes(t.id))
        : TABS;

  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);

  useEffect(() => {
    const found = projects.find(p => String(p.id) === String(id) || p.id === `p${id}`);
    setProject(found);
  }, [id, projects]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p className="text-slate-500">Loading project details...</p>
      </div>
    );
  }

  const STATUS_STYLE = {
    Completed:   'bg-green-100 text-green-700',
    'In Progress':'bg-blue-100 text-blue-700',
    Planning:    'bg-purple-100 text-purple-700',
    'On Hold':   'bg-amber-100 text-amber-700',
    Delayed:     'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-0 animate-in fade-in duration-300">
      {/* ── Sticky Header ── */}
      <div className="bg-background/80 backdrop-blur-md sticky top-0 z-20 pb-0 mb-6">
        {/* Back + Title row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 pb-4 border-b border-border">
          <div className="flex items-start">
            <button
              onClick={() => navigate('/portal')}
              className="mr-3 p-2 text-slate-500 hover:bg-slate-200 :bg-slate-800 rounded-full transition-colors shrink-0 mt-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 ">
                  {project.name}
                </h1>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_STYLE[project.status] || 'bg-slate-100 text-slate-600'}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">{project.client} · {project.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold text-primary">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1" aria-label="Project tabs">
          {availableTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 mr-1.5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}

        </nav>
      </div>

      {/* ── Tab Content ── */}
      <div>
        {activeTab === 'overview'   && <ProjectOverviewTab project={project} />}
        {activeTab === 'milestones' && <ProjectMilestonesTab project={project} />}
        {activeTab === 'tasks'      && <ProjectTasksTab projectId={project.id} project={project} />}
        {activeTab === 'progress'   && <ProjectLogsTab projectId={project.id} project={project} />}
        {activeTab === 'issues'     && <ProjectIssuesTab project={project} />}
        {activeTab === 'approvals'  && <ProjectApprovalsTab projectId={project.id} project={project} />}
        {activeTab === 'documents'  && <ProjectDocumentsTab project={project} />}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
