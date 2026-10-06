import React, { useState } from 'react';
import { Search, Filter, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectTable = ({ projects, title = "Projects" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="glass-card flex flex-col mt-6 overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between gap-6 p-6 bg-[#e5e7eb] text-slate-900 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        </div>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 items-center w-full justify-end">
          <div className="flex flex-wrap md:flex-nowrap space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center text-sm font-bold text-slate-600 overflow-x-auto">
            {['All', 'Planning', 'In Progress', 'On Hold', 'Delayed', 'Completed'].map(status => {
              const count = status === 'All' ? projects.length : projects.filter(p => p.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`relative px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap ${
                    statusFilter === status 
                      ? 'bg-white shadow-sm text-slate-900 font-bold' 
                      : 'hover:text-slate-900'
                  }`}
                >
                  {status} <span className="ml-1 opacity-60 font-normal">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full md:w-auto h-12">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="pl-9 pr-4 h-full w-full md:w-64 rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm text-slate-900 placeholder:text-slate-500 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="p-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <div
              key={project.id}
              className="glass-card p-4 cursor-pointer hover:shadow-lg transition-all border border-slate-200 group flex flex-col bg-white"
              onClick={() => navigate(`/portal/projects/${project.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-amber-500 transition-colors">{project.name}</h3>
                  <p className="text-sm text-slate-500">{project.client}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded shadow-sm whitespace-nowrap ml-2 ${
                  project.status === 'Completed' ? 'bg-emerald-500 text-white' :
                  project.status === 'In Progress' ? 'bg-blue-500 text-white' : 
                  project.status === 'Planning' ? 'bg-purple-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="space-y-1 mb-4 flex-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-amber-500 font-bold">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${project.progress || 0}%` }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-auto space-y-3">
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  End Date: {project.endDate || 'TBD'}
                </div>
                <button className="w-full py-2 bg-slate-50 text-slate-700 rounded-md text-sm font-semibold transition-colors flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white">
                  View Project <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No projects found matching the criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTable;
