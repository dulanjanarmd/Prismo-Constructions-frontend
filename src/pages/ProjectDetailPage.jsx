import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, LayoutDashboard, Flag, CheckSquare, Camera, AlertTriangle, MessageSquare, FolderOpen, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="space-y-0 animate-in fade-in duration-300 bg-[#f0f4f8] min-h-screen py-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          
          {/* Back Button */}
          <button
            onClick={() => navigate('/portal')}
            className="group flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          {/* Title & Meta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                  {project.name}
                </h1>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${STATUS_STYLE[project.status] ? STATUS_STYLE[project.status] + ' border-transparent' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {project.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center text-slate-500 text-sm gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Client:</span>
                  <span className="font-medium text-slate-700">{project.client}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-medium text-slate-700">{project.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <nav className="flex items-center space-x-1 bg-slate-200/60 p-1.5 rounded-xl w-fit overflow-x-auto scrollbar-none mb-8" aria-label="Project tabs">
            {availableTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#f5a623] shadow-sm ring-1 ring-slate-200/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* ── Tab Content ── */}
          <div className="mt-2">
            {activeTab === 'overview'   && <ProjectOverviewTab project={project} />}
            {activeTab === 'milestones' && <ProjectMilestonesTab project={project} />}
            {activeTab === 'tasks'      && <ProjectTasksTab projectId={project.id} project={project} />}
            {activeTab === 'progress'   && <ProjectLogsTab projectId={project.id} project={project} />}
            {activeTab === 'issues'     && <ProjectIssuesTab project={project} />}
            {activeTab === 'approvals'  && <ProjectApprovalsTab projectId={project.id} project={project} />}
            {activeTab === 'documents'  && <ProjectDocumentsTab project={project} />}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
