import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  X, Cloud, HardHat, TrendingUp, Wrench, AlertTriangle,
  MessageSquare, Send, CheckCircle2, ArrowRight,
  Sun, CloudRain, CloudLightning, Clock, Calendar, Camera
} from 'lucide-react';
import PhotoGallery from './PhotoGallery';

const SEVERITY_STYLES = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-blue-100 text-blue-700 border-blue-200'
};

const STATUS_STYLES = {
  Open: 'bg-red-50 text-red-600',
  'In Progress': 'bg-amber-50 text-amber-700',
  Resolved: 'bg-green-50 text-green-600'
};

const STATUS_NEXT = { Open: 'In Progress', 'In Progress': 'Resolved', Resolved: 'Open' };

const WEATHER_ICONS = {
  Sunny: Sun, Cloudy: Cloud, Rainy: CloudRain, Storm: CloudLightning
};

const ProgressLogDetailModal = ({ log, users, onClose }) => {
  const { currentUser } = useAuth();
  const isPM = currentUser?.role === 'project_manager' || currentUser?.role === 'pm';

  const [issueStatuses, setIssueStatuses] = useState({});
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(log.comments || []);

  const submitter = users.find(u =>
    u.id === log.submittedBy || `u${u.id}` === log.submittedBy ||
    String(u.id) === String(log.submittedBy)
  );

  const formattedPhotos = log.photos
    ? (typeof log.photos[0] === 'string'
        ? log.photos.map(p => ({ url: p, caption: 'Site progress photo' }))
        : log.photos)
    : [];

  const getIssueStatus = (id, defaultStatus) => issueStatuses[id] || defaultStatus || 'Open';

  const advanceIssue = (id, currentStatus) => {
    setIssueStatuses(prev => ({ ...prev, [id]: STATUS_NEXT[currentStatus] || 'Open' }));
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    const newComment = {
      id: Date.now(),
      author: currentUser?.name || 'PM',
      text: comment.trim(),
      timestamp: new Date(Date.now() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-LK')
    };
    setComments([...comments, newComment]);
    setComment('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white border border-border rounded-lg shadow-2xl w-full max-w-2xl h-full max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md px-6 py-5 border-b border-border flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Daily Progress Log</p>
              <h2 className="text-xl font-bold text-slate-900 ">
                {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Submitted by {submitter?.name || log.submittedBy || 'Site Engineer'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 :bg-slate-800 rounded-full transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 space-y-7">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 text-center border border-border">
                <div className="flex justify-center mb-2">
                  {(() => {
                    const Icon = WEATHER_ICONS[log.weather] || Sun;
                    return <Icon className="w-6 h-6 text-slate-400" />;
                  })()}
                </div>
                <p className="text-xs text-slate-500 mt-1">Weather</p>
                <p className="text-sm font-semibold">{log.weather} {log.temperature ? `(${log.temperature}°C)` : ''}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center border border-border">
                <div className="flex justify-center mb-2">
                  <Clock className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Shift & Cond.</p>
                <p className="text-sm font-semibold">{log.shiftType || 'Day'} • {log.siteConditions || 'Normal'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center border border-border">
                <div className="flex justify-center mb-2">
                  <HardHat className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Manpower</p>
                <p className="text-sm font-semibold">{log.manpower} workers</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center border border-border">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Progress Today</p>
                <p className="text-xl font-bold text-green-600">+{log.percentageCompleted}%</p>
              </div>
            </div>

            {/* Work Done */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Wrench className="w-4 h-4 text-slate-400" /> Work Completed
                </h3>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{log.workDone}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Next Day Plan
                </h3>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{log.nextDayPlan || 'Not specified'}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Equipment Used</h4>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{log.equipmentUsed || 'None'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Materials Delivered</h4>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{log.materialsDelivered || 'None'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Subcontractors</h4>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{log.subcontractors || 'None'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm">
                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Inspections</h4>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{log.inspections || 'None'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-border shadow-sm md:col-span-2">
                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Visitors</h4>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{log.visitors || 'None'}</p>
              </div>
            </div>

            {/* Photos */}
            {formattedPhotos.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <Camera className="w-4 h-4 text-slate-400" /> Site Photos ({formattedPhotos.length})
                </h3>
                <PhotoGallery photos={formattedPhotos} />
              </div>
            )}

            {/* Issues */}
            {log.issues && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Reported Issue
                </h3>
                <div className="border border-red-200  rounded-lg overflow-hidden">
                  <div className="bg-red-50  p-4 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${SEVERITY_STYLES['Medium']}`}>
                          Medium
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_STYLES[getIssueStatus(log.id, 'Open')]}`}>
                          {getIssueStatus(log.id, 'Open')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 ">{log.issues}</p>
                    </div>
                    {isPM && getIssueStatus(log.id, 'Open') !== 'Resolved' && (
                      <button
                        onClick={() => advanceIssue(log.id, getIssueStatus(log.id, 'Open'))}
                        className="text-xs px-3 py-1.5 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1 shrink-0 font-medium"
                      >
                        <ArrowRight className="w-3 h-3" />
                        {STATUS_NEXT[getIssueStatus(log.id, 'Open')]}
                      </button>
                    )}
                    {getIssueStatus(log.id, 'Open') === 'Resolved' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                <MessageSquare className="w-4 h-4" /> Comments
              </h3>

              <div className="space-y-3 mb-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No comments yet. Be the first to add one.</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-3">

                      <div className="flex-1 bg-slate-50  rounded-lg p-3 border border-border">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-700 ">{c.author}</span>
                          <span className="text-xs text-slate-400">{c.timestamp}</span>
                        </div>
                        <p className="text-sm text-slate-600 ">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {isPM && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment for the site team..."
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="p-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProgressLogDetailModal;
