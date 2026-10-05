import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Camera, Search, Filter, AlertTriangle, ImageIcon, ChevronRight, TrendingUp, HardHat, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressLogDetailModal from './ProgressLogDetailModal';

const WEATHER_EMOJI = {
  Sunny: '☀️', Cloudy: '⛅', Rainy: '🌧️', Storm: '⛈️'
};

const ProjectLogsTab = ({ projectId }) => {
  const { logs, users } = useData();

  const [search, setSearch] = useState('');
  const [engineerFilter, setEngineerFilter] = useState('All');
  const [logTypeFilter, setLogTypeFilter] = useState('All'); // 'All' | 'HasIssues' | 'NoIssues' | 'WithPhotos'
  const [dateFilter, setDateFilter] = useState('All'); // 'All' | 'today' | '7days'
  const [selectedLog, setSelectedLog] = useState(null);

  // All logs for this project, newest first
  const projectLogs = logs
    .filter(l => String(l.projectId) === String(projectId) || l.projectId === `p${projectId}`)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Engineers who submitted logs for this project
  const engineersInLogs = useMemo(() => {
    const ids = [...new Set(projectLogs.map(l => l.submittedBy))];
    return ids.map(id => users.find(u =>
      u.id === id || `u${u.id}` === id || String(u.id) === String(id)
    )).filter(Boolean);
  }, [projectLogs, users]);

  const filtered = useMemo(() => {
    const now = new Date();
    return projectLogs.filter(log => {
      // Date filter
      if (dateFilter === 'today') {
        const logDate = new Date(log.date);
        if (logDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === '7days') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        if (new Date(log.date) < weekAgo) return false;
      }
      // Engineer filter
      if (engineerFilter !== 'All') {
        const match = log.submittedBy === engineerFilter ||
          `u${log.submittedBy}` === engineerFilter ||
          String(log.submittedBy) === String(engineerFilter);
        if (!match) return false;
      }
      // Type filter
      if (logTypeFilter === 'HasIssues' && !log.issues) return false;
      if (logTypeFilter === 'NoIssues' && log.issues) return false;
      if (logTypeFilter === 'WithPhotos' && (!log.photos || log.photos.length === 0)) return false;
      // Search
      if (search && !log.workDone?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [projectLogs, search, engineerFilter, logTypeFilter, dateFilter]);

  const totalPhotos = projectLogs.reduce((sum, l) => sum + (l.photos?.length || 0), 0);
  const logsWithIssues = projectLogs.filter(l => l.issues).length;

  if (projectLogs.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-slate-500">
        <Camera className="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">No progress logs submitted yet.</p>
        <p className="text-sm mt-1">Site Engineers submit daily logs from their dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Combined Header, Filters & Table */}
      <div className="glass-card flex flex-col overflow-hidden mb-6 bg-white">
        {/* Header & Filters */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 p-6 bg-[#e5e7eb] text-slate-900 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold whitespace-nowrap">Daily Progress Feed</h2>
            </div>
          </div>
          
          <div className="flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-4 items-center w-full lg:w-auto justify-end">
            
            {/* Search */}
            <div className="relative w-full xl:w-48 h-12 flex items-center bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-lg px-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Search description..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500 font-medium w-full"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="relative w-full xl:w-auto h-12">
              <select
                className="h-full w-full xl:w-32 rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm text-slate-900 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all px-4 cursor-pointer"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              >
                <option value="All">All Dates</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
              </select>
            </div>
            
            <div className="relative w-full xl:w-auto h-12">
              <select
                className="h-full w-full xl:w-36 rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm text-slate-900 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all px-4 cursor-pointer"
                value={engineerFilter}
                onChange={e => setEngineerFilter(e.target.value)}
              >
                <option value="All">All Engineers</option>
                {engineersInLogs.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Log Type Pills */}
            <div className="flex space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center text-sm font-bold text-slate-600 overflow-x-auto w-fit max-w-full shrink-0">
              {['All', 'Issues', 'Photos'].map(s => {
                let count = 0;
                if (s === 'All') count = projectLogs.length;
                else if (s === 'Issues') count = projectLogs.filter(l => l.issues).length;
                else if (s === 'Photos') count = projectLogs.filter(l => l.photos && l.photos.length > 0).length;

                const valueMap = {
                  'All': 'All',
                  'Issues': 'HasIssues',
                  'Photos': 'WithPhotos'
                };
                const val = valueMap[s];

                return (
                  <button 
                    key={s}
                    onClick={() => setLogTypeFilter(val)}
                    className={`relative px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap outline-none ${
                      logTypeFilter === val
                        ? 'bg-white shadow-sm text-slate-900 font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {s} <span className="ml-1 opacity-60 font-normal">{count}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Log count */}
        {filtered.length !== projectLogs.length && (
          <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 text-sm text-slate-500 font-medium">
            Showing {filtered.length} of {projectLogs.length} logs
          </div>
        )}

        {/* Log Table View */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white">
            <p>No logs match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Work Description</th>
                  <th className="px-6 py-4">Site Details</th>
                  <th className="px-6 py-4">Submitted By</th>
                  <th className="px-6 py-4 text-center">Progress</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((log, idx) => {
                  const submitter = users.find(u =>
                    u.id === log.submittedBy || `u${u.id}` === log.submittedBy ||
                    String(u.id) === String(log.submittedBy)
                  );
                  const photoCount = log.photos?.length || 0;
                  const formattedDate = new Date(log.date).toLocaleDateString(undefined, {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                  });

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer group ${log.issues ? 'bg-red-50/20 hover:bg-red-50/40' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{formattedDate}</span>
                          {log.issues && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                              Issue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 truncate max-w-xs xl:max-w-md">
                          {log.workDone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5" title="Weather">
                            <span className="text-sm">{WEATHER_EMOJI[log.weather] || '🌤️'}</span> {log.weather}
                          </span>
                          <span className="flex items-center gap-1.5" title="Manpower">
                            <HardHat className="w-3.5 h-3.5" /> {log.manpower}
                          </span>
                          {photoCount > 0 && (
                            <span className="flex items-center gap-1.5" title="Photos">
                              <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> {photoCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {submitter ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                {submitter.name?.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-slate-700">{submitter.name}</span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">Unknown</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                          +{log.percentageCompleted}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors ml-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <ProgressLogDetailModal
          log={selectedLog}
          users={users}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default ProjectLogsTab;
