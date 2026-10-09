import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, LayoutDashboard, Flag, CheckSquare, Camera, AlertTriangle, MessageSquare, FolderOpen, X, MapPin, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
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
  const location = useLocation();
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

  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [project, setProject] = useState(null);

  useEffect(() => {
    const found = projects.find(p => String(p.id) === String(id) || p.id === `p${id}`);
    setProject(found);
  }, [id, projects]);

  useEffect(() => {
    if (location.state?.tab && availableTabs.some(t => t.id === location.state.tab)) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab, availableTabs]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p className="text-slate-500">Loading project details...</p>
      </div>
    );
  }

  const STATUS_STYLE = {
    Completed:   'text-green-600',
    'In Progress':'text-primary',
    Planning:    'text-purple-600',
    'On Hold':   'text-amber-600',
    Delayed:     'text-red-600'
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
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-3">
              {project.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border-white/40 shadow-sm">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">{project.client}</span>
              </div>
              <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border-white/40 shadow-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">{project.location}</span>
              </div>
              <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border-white/40 shadow-sm">
                <span className={`text-sm font-bold ${STATUS_STYLE[project.status] ? STATUS_STYLE[project.status] : 'text-slate-600'}`}>
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-xl border-white/40 shadow-sm w-48 sm:w-64">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                  />
                </div>
                <span className="text-sm font-bold text-primary">{project.progress}%</span>
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
