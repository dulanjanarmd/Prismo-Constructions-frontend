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
  const [hasIssuesFilter, setHasIssuesFilter] = useState('All'); // 'All' | 'Yes' | 'No'
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
      // Issues filter
      if (hasIssuesFilter === 'Yes' && !log.issues) return false;
      if (hasIssuesFilter === 'No' && log.issues) return false;
      // Search
      if (search && !log.workDone?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [projectLogs, search, engineerFilter, hasIssuesFilter, dateFilter]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h2 className="text-xl font-bold">Daily Progress Feed</h2>
          <p className="text-sm text-slate-500">{projectLogs.length} logs · {totalPhotos} photos · {logsWithIssues} with issues</p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-primary">{projectLogs.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Logs</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-blue-500">{totalPhotos}</p>
          <p className="text-xs text-slate-500 mt-0.5">Photos</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className={`text-2xl font-bold ${logsWithIssues > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {logsWithIssues}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Issues Reported</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-3">
        {/* Search */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by work description..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Filter row */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />

          {/* Date range */}
          <select
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
          </select>

          {/* Engineer */}
          <select
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={engineerFilter}
            onChange={e => setEngineerFilter(e.target.value)}
          >
            <option value="All">All Engineers</option>
            {engineersInLogs.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Has Issues */}
          <select
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={hasIssuesFilter}
            onChange={e => setHasIssuesFilter(e.target.value)}
          >
            <option value="All">All Logs</option>
            <option value="Yes">Has Issues</option>
            <option value="No">No Issues</option>
          </select>

          {(search || dateFilter !== 'All' || engineerFilter !== 'All' || hasIssuesFilter !== 'All') && (
            <button
              onClick={() => { setSearch(''); setDateFilter('All'); setEngineerFilter('All'); setHasIssuesFilter('All'); }}
              className="text-xs text-red-500 hover:underline font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Log count */}
      {filtered.length !== projectLogs.length && (
        <p className="text-sm text-slate-500">Showing {filtered.length} of {projectLogs.length} logs</p>
      )}

      {/* Log Cards */}
      {filtered.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400">
          <p>No logs match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
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
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setSelectedLog(log)}
                className={`glass-card p-5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group border ${log.issues ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-transparent hover:border-l-primary'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-slate-900 ">{formattedDate}</span>
                      {log.issues && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Issue
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600  line-clamp-2 mb-3">
                      {log.workDone}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        {WEATHER_EMOJI[log.weather] || '🌤️'} {log.weather}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardHat className="w-3 h-3" /> {log.manpower} workers
                      </span>
                      {photoCount > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> {photoCount} photo{photoCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {submitter && (
                        <span className="flex items-center gap-1">
                          by <strong className="text-slate-700 ">{submitter.name}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: progress badge + action */}
                  <div className="flex flex-col items-end justify-between h-full shrink-0">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold border border-amber-200">
                      +{log.percentageCompleted}%
                    </span>
                    <button className="text-primary text-sm font-medium flex items-center gap-1 group-hover:underline mt-6">
                      View <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
