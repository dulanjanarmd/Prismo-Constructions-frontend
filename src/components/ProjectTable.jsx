import React, { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectTable = ({ projects }) => {
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
    <div className="glass-card flex flex-col mt-6 p-6">
      <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">Projects</h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{projects.length}</span>
        </div>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 items-center">
          <div className="flex space-x-1 bg-slate-50 p-1 rounded-full">
            {['All', 'Planning', 'In Progress', 'On Hold', 'Delayed', 'Completed'].map(status => {
              const count = status === 'All' ? projects.length : projects.filter(p => p.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    statusFilter === status 
                      ? 'bg-white shadow-sm text-slate-900' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {status} <span className="ml-1 opacity-60 font-normal">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full md:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="pl-9 pr-4 py-2 w-full md:w-64 rounded-full border-0 bg-slate-50 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs bg-orange-50 text-orange-800 border-b border-orange-100">
              <th className="px-4 py-3 font-medium">Project Name</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Start Date</th>
              <th className="px-4 py-3 font-medium">End Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredProjects.map(project => (
              <tr 
                key={project.id} 
                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/portal/projects/${project.id}`)}
              >
                <td className="px-4 py-5 font-bold text-slate-900 group-hover:text-primary transition-colors">{project.name}</td>
                <td className="px-4 py-5 text-slate-600 font-medium">{project.client}</td>
                <td className="px-4 py-5">
                  <span className={`px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-lg w-fit whitespace-nowrap ${
                    project.status === 'Completed' ? 'bg-[#dcfce7] text-[#166534]' :
                    project.status === 'In Progress' ? 'bg-[#ffedd5] text-[#9a3412]' : 
                    project.status === 'Planning' ? 'bg-[#f3e8ff] text-[#6b21a8]' : 'bg-[#fee2e2] text-[#991b1b]'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-slate-900 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-500 font-bold">{project.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-5 text-slate-500 font-medium whitespace-nowrap">{project.startDate}</td>
                <td className="px-4 py-5 text-slate-500 font-medium whitespace-nowrap">{project.endDate}</td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                  No projects found matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
