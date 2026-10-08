import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Flag, Plus, Trash2, CheckCircle2, Circle, Edit2, X, Check, Calendar, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors = {
  Completed: 'bg-green-100 text-green-700 border-green-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Incomplete: 'bg-slate-100 text-slate-600 border-slate-200'
};

const ProjectMilestonesTab = ({ project }) => {
  const { updateProject, tasks } = useData();
  const { currentUser } = useAuth();
  const isClient = currentUser?.role === 'client';
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyForm = { 
    name: '', startDate: '', dueDate: '', category: 'Civil Works', 
    subcontractor: '', inspectionRequired: false, paymentStatus: 'Unpaid', 
    description: '', budgetAllocated: '', deliverables: '' 
  };
  const [newForm, setNewForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const milestones = project.milestones || [];

  const authHeaders = {
    'Authorization': `Bearer ${currentUser?.token}`,
    'Content-Type': 'application/json'
  };

  const filteredMilestones = milestones.filter(m => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = (m.name || m.title || '').toLowerCase().includes(searchLower);
    const descMatch = (m.description || '').toLowerCase().includes(searchLower);
    const subMatch = (m.subcontractor || '').toLowerCase().includes(searchLower);
    const matchesSearch = nameMatch || descMatch || subMatch;

    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort: incomplete first, then by due date (earliest first, no date at the bottom)
  const sorted = [...filteredMilestones].sort((a, b) => {
    if ((a.status === 'Completed') !== (b.status === 'Completed')) {
      return a.status === 'Completed' ? 1 : -1;
    }
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return dateA - dateB;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newForm.name || !newForm.dueDate || !newForm.description || !newForm.budgetAllocated || !newForm.deliverables) {
      alert("Please fill in all fields.");
      return;
    }
    if (parseFloat(newForm.budgetAllocated) <= 0) {
      alert("Budget must be a positive value.");
      return;
    }

    if (newForm.startDate) {
      const msStart = new Date(newForm.startDate);
      msStart.setHours(0, 0, 0, 0);

      if (project?.startDate) {
        const projStart = new Date(project.startDate);
        projStart.setHours(0, 0, 0, 0);
        if (msStart < projStart) {
          alert("Milestone start date cannot be before the project's start date.");
          return;
        }
      }

      const todayStr = new Date(Date.now() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0];
      const today = new Date(todayStr);
      if (msStart < today) {
        alert("Milestone start date cannot be in the past.");
        return;
      }

      if (newForm.dueDate) {
        const msEnd = new Date(newForm.dueDate);
        msEnd.setHours(0, 0, 0, 0);
        if (msStart > msEnd) {
          alert("Milestone start date cannot be after its due date.");
          return;
        }
      }
    }

    if (newForm.dueDate) {
      const msDate = new Date(newForm.dueDate);
      msDate.setHours(0, 0, 0, 0);
      
      if (project?.startDate) {
        const projStart = new Date(project.startDate);
        projStart.setHours(0, 0, 0, 0);
        if (msDate < projStart) {
          alert("Milestone due date cannot be before the project's start date.");
          return;
        }
      }

      const todayStr = new Date(Date.now() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0];
      const today = new Date(todayStr);
      if (msDate < today) {
        alert("Milestone due date cannot be in the past.");
        return;
      }

      if (project?.endDate) {
        const projEnd = new Date(project.endDate);
        projEnd.setHours(0, 0, 0, 0);
        if (msDate > projEnd) {
          alert("Milestone due date cannot be after the project's end date.");
          return;
        }
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${project.id}/milestones`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ 
          name: newForm.name, 
          startDate: newForm.startDate || null,
          dueDate: newForm.dueDate || null, 
          status: 'Incomplete',
          category: newForm.category || 'Civil Works',
          subcontractor: newForm.subcontractor || null,
          inspectionRequired: newForm.inspectionRequired || false,
          paymentStatus: newForm.paymentStatus || 'Unpaid',
          description: newForm.description || null,
          budgetAllocated: newForm.budgetAllocated ? parseFloat(newForm.budgetAllocated) : null,
          deliverables: newForm.deliverables || null
        })
      });
      if (!res.ok) throw new Error('Failed to add milestone');
      const saved = await res.json();
      
      const newMilestones = [...milestones, saved];
      const completedCount = newMilestones.filter(x => x.status === 'Completed').length;
      const pct = newMilestones.length > 0 ? Math.round((completedCount / newMilestones.length) * 100) : 0;
      
      let newProjectStatus = project.status;
      if (pct === 100) {
        newProjectStatus = 'Completed';
      } else if (pct > 0 && pct < 100 && (project.status === 'Planning' || project.status === 'Not Started')) {
        newProjectStatus = 'In Progress';
      }

      updateProject(project.id, { 
        milestones: newMilestones,
        progress: pct,
        status: newProjectStatus
      });
      
      setNewForm(emptyForm);
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    const m = milestones.find(x => x.id === id);
    if (!m) return;
    const newStatus = m.status === 'Completed' ? 'Incomplete' : 'Completed';

    if (newStatus === 'Completed') {
      const milestoneTasks = tasks?.filter(t => 
        (String(t.projectId) === String(project.id) || t.projectId === `p${project.id}`) && 
        (String(t.milestoneId) === String(id) || t.milestoneId === `m${id}`)
      ) || [];
      
      const hasIncompleteTasks = milestoneTasks.some(t => t.status !== 'Completed' && t.status !== 'Closed');
      if (hasIncompleteTasks) {
        alert("Cannot mark milestone as completed. All related tasks must be either 'Completed' or 'Closed'.");
        return;
      }
    }
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${project.id}/milestones/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update milestone');
      const updated = await res.json();
      
      const newMilestones = milestones.map(x => x.id === id ? updated : x);
      const completedCount = newMilestones.filter(x => x.status === 'Completed').length;
      const pct = newMilestones.length > 0 ? Math.round((completedCount / newMilestones.length) * 100) : 0;
      
      let newProjectStatus = project.status;
      if (pct === 100) {
        newProjectStatus = 'Completed';
      } else if (pct > 0 && pct < 100) {
        newProjectStatus = 'In Progress';
      } else if (pct === 0 && project.status === 'Completed') {
        newProjectStatus = 'In Progress';
      }

      updateProject(project.id, { 
        milestones: newMilestones,
        progress: pct,
        status: newProjectStatus
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${project.id}/milestones/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) throw new Error('Failed to delete milestone');
      
      const newMilestones = milestones.filter(x => x.id !== id);
      const completedCount = newMilestones.filter(x => x.status === 'Completed').length;
      const pct = newMilestones.length > 0 ? Math.round((completedCount / newMilestones.length) * 100) : 0;
      
      let newProjectStatus = project.status;
      if (pct === 100 && newMilestones.length > 0) {
        newProjectStatus = 'Completed';
      } else if (pct > 0 && pct < 100) {
        newProjectStatus = 'In Progress';
      } else if (pct === 0 && project.status === 'Completed') {
        newProjectStatus = 'In Progress';
      }

      updateProject(project.id, { 
        milestones: newMilestones,
        progress: pct,
        status: newProjectStatus
      });
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditForm({ 
      name: m.name || m.title || '', 
      startDate: m.startDate || '',
      dueDate: m.dueDate || m.date || '',
      category: m.category || 'Civil Works',
      subcontractor: m.subcontractor || '',
      inspectionRequired: m.inspectionRequired || false,
      paymentStatus: m.paymentStatus || 'Unpaid',
      description: m.description || '',
      budgetAllocated: m.budgetAllocated || '',
      deliverables: m.deliverables || ''
    });
  };

  const handleEditSave = async (id) => {
    if (!editForm.name || !editForm.dueDate || !editForm.description || !editForm.budgetAllocated || !editForm.deliverables) {
      alert("Please fill in all fields.");
      return;
    }
    if (parseFloat(editForm.budgetAllocated) <= 0) {
      alert("Budget must be a positive value.");
      return;
    }

    if (editForm.startDate) {
      const msStart = new Date(editForm.startDate);
      msStart.setHours(0, 0, 0, 0);

      if (project?.startDate) {
        const projStart = new Date(project.startDate);
        projStart.setHours(0, 0, 0, 0);
        if (msStart < projStart) {
          alert("Milestone start date cannot be before the project's start date.");
          return;
        }
      }

      const todayStr = new Date(Date.now() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0];
      const today = new Date(todayStr);
      if (msStart < today) {
        alert("Milestone start date cannot be in the past.");
        return;
      }

      if (editForm.dueDate) {
        const msEnd = new Date(editForm.dueDate);
        msEnd.setHours(0, 0, 0, 0);
        if (msStart > msEnd) {
          alert("Milestone start date cannot be after its due date.");
          return;
        }
      }
    }

    if (editForm.dueDate) {
      const msDate = new Date(editForm.dueDate);
      msDate.setHours(0, 0, 0, 0);

      if (project?.startDate) {
        const projStart = new Date(project.startDate);
        projStart.setHours(0, 0, 0, 0);
        if (msDate < projStart) {
          alert("Milestone due date cannot be before the project's start date.");
          return;
        }
      }

      const todayStr = new Date(Date.now() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0];
      const today = new Date(todayStr);
      if (msDate < today) {
        alert("Milestone due date cannot be in the past.");
        return;
      }

      if (project?.endDate) {
        const projEnd = new Date(project.endDate);
        projEnd.setHours(0, 0, 0, 0);
        if (msDate > projEnd) {
          alert("Milestone due date cannot be after the project's end date.");
          return;
        }
      }
    }

    try {
      const res = await fetch(`http://localhost:8080/api/projects/${project.id}/milestones/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ 
          name: editForm.name, 
          startDate: editForm.startDate || null,
          dueDate: editForm.dueDate || null,
          category: editForm.category || 'Civil Works',
          subcontractor: editForm.subcontractor || null,
          inspectionRequired: editForm.inspectionRequired || false,
          paymentStatus: editForm.paymentStatus || 'Unpaid',
          description: editForm.description || null,
          budgetAllocated: editForm.budgetAllocated ? parseFloat(editForm.budgetAllocated) : null,
          deliverables: editForm.deliverables || null
        })
      });
      if (!res.ok) throw new Error('Failed to update milestone');
      const updated = await res.json();
      updateProject(project.id, { milestones: milestones.map(x => x.id === id ? updated : x) });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };


  const completedCount = milestones.filter(m => m.status === 'Completed').length;
  const pct = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const todayStr = new Date(Date.now() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0];
  let minDateStr = project?.startDate 
    ? new Date(project.startDate).toISOString().split('T')[0]
    : todayStr;

  if (minDateStr < todayStr) {
    minDateStr = todayStr;
  }
  
  const maxDateStr = project?.endDate 
    ? new Date(project.endDate).toISOString().split('T')[0]
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card flex flex-col overflow-hidden mb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6 p-6 bg-[#e5e7eb] text-slate-900 border-b border-slate-200">
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6">
            <h2 className="text-xl font-bold leading-tight shrink-0">
              Project<br />Milestones
            </h2>
          </div>
          
          <div className="flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-4 items-start xl:items-center w-full lg:w-auto justify-end">
            <div className="relative w-full lg:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-12 rounded-lg border border-slate-300 bg-white/80 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="flex space-x-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm h-12 rounded-lg p-1 items-center text-sm font-bold text-slate-600 overflow-x-auto shrink-0 max-w-full">
              {['All', 'Incomplete', 'In Progress', 'Completed'].map(s => {
                const count = s === 'All'
                  ? milestones.length
                  : milestones.filter(m => m.status === s).length;
                return (
                  <button 
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`relative px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center h-full whitespace-nowrap outline-none ${
                      statusFilter === s
                        ? 'bg-white shadow-sm text-slate-900 font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {s} <span className="ml-1 opacity-60 font-normal">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center h-12 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-lg px-2 shrink-0">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 cursor-pointer h-full"
              >
                <option value="All">All Categories</option>
                <option value="Pre-construction">Pre-construction</option>
                <option value="Civil Works">Civil Works</option>
                <option value="MEP">MEP</option>
                <option value="Finishing">Finishing</option>
                <option value="Handover">Handover</option>
              </select>
            </div>
            {!isClient && project.status !== 'Completed' && (
              <button
                onClick={() => setIsAdding(true)}
                className="h-12 flex items-center px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/30 font-bold shrink-0"
              >
                Add Milestone
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overall progress */}
      {milestones.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-700 ">Milestone Completion</span>
            <span className="font-bold text-primary">{pct}%</span>
          </div>
          <div className="w-full bg-slate-200  rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="glass-card p-4 border-2 border-primary/30 overflow-hidden"
          >
            <h3 className="font-semibold mb-3">New Milestone</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    required
                    type="text"
                    placeholder="Milestone name (e.g. Foundation Complete)"
                    className="flex-1 min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={newForm.name}
                    onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                    autoFocus
                  />
                  <select
                    className="w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={newForm.category}
                    onChange={e => setNewForm({ ...newForm, category: e.target.value })}
                  >
                    <option value="Pre-construction">Pre-construction</option>
                    <option value="Civil Works">Civil Works</option>
                    <option value="MEP">MEP</option>
                    <option value="Finishing">Finishing</option>
                    <option value="Handover">Handover</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col flex-1">
                    <label className="text-xs text-slate-500 mb-1">Start Date</label>
                    <input
                      required
                      type="date"
                      min={minDateStr}
                      max={maxDateStr}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={newForm.startDate}
                      onChange={e => setNewForm({ ...newForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="text-xs text-slate-500 mb-1">Due Date</label>
                    <input
                      required
                      type="date"
                      min={minDateStr}
                      max={maxDateStr}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={newForm.dueDate}
                      onChange={e => setNewForm({ ...newForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col w-full sm:w-32">
                    <label className="text-xs text-slate-500 mb-1">Budget (LKR)</label>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="Budget"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={newForm.budgetAllocated}
                      onChange={e => setNewForm({ ...newForm, budgetAllocated: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Subcontractor / Lead (Optional)"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={newForm.subcontractor}
                    onChange={e => setNewForm({ ...newForm, subcontractor: e.target.value })}
                  />
                  <select
                    className="w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={newForm.paymentStatus}
                    onChange={e => setNewForm({ ...newForm, paymentStatus: e.target.value })}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newForm.inspectionRequired}
                      onChange={e => setNewForm({ ...newForm, inspectionRequired: e.target.checked })}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Inspection Req.
                  </label>
                </div>
              <textarea
                required
                placeholder="Description"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                rows="2"
                value={newForm.description}
                onChange={e => setNewForm({ ...newForm, description: e.target.value })}
              />
              <textarea
                required
                placeholder="Deliverables (e.g. Approved Blueprints, Permits)"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                rows="2"
                value={newForm.deliverables}
                onChange={e => setNewForm({ ...newForm, deliverables: e.target.value })}
              />
              <div className="flex gap-2 w-full justify-end mt-1">
                <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors text-sm text-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity text-sm disabled:opacity-50">
                  {loading ? 'Saving...' : '+ Add Milestone'}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Milestones list */}
      {milestones.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">
          <Flag className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No milestones defined yet.</p>
          <p className="text-sm mt-1">Add milestones to track key stages of this project.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-border">
            {sorted.map((m, idx) => {
              const isCompleted = m.status === 'Completed';
              const isEditing = editingId === m.id;
              const displayName = m.name || m.title;
              const displayDate = m.dueDate || m.date;
              const isOverdue = !isCompleted && displayDate && new Date(displayDate) < new Date();

              return (
                <motion.div
                  key={m.id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${isCompleted ? 'bg-green-50/30 ' : 'hover:bg-slate-50/50 :bg-slate-800/30'}`}
                >
                  {/* Toggle button - only for non-clients */}
                  {!isClient ? (
                    <button
                      onClick={() => handleToggle(m.id)}
                      className={`shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-slate-300 hover:text-primary'}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                  ) : (
                    <div className="shrink-0">
                      {isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-slate-300" />}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 w-full pr-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Name"
                            className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          />
                          <select
                            className="w-full sm:w-auto rounded border border-input bg-background px-2 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={editForm.category}
                            onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                          >
                            <option value="Pre-construction">Pre-construction</option>
                            <option value="Civil Works">Civil Works</option>
                            <option value="MEP">MEP</option>
                            <option value="Finishing">Finishing</option>
                            <option value="Handover">Handover</option>
                          </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex flex-col flex-1">
                            <label className="text-[10px] text-slate-500 mb-0.5">Start Date</label>
                            <input
                              type="date"
                              min={minDateStr}
                              max={maxDateStr}
                              className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                              value={editForm.startDate}
                              onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label className="text-[10px] text-slate-500 mb-0.5">Due Date</label>
                            <input
                              type="date"
                              min={minDateStr}
                              max={maxDateStr}
                              className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                              value={editForm.dueDate}
                              onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                            />
                          </div>
                          <div className="flex flex-col w-full sm:w-32">
                            <label className="text-[10px] text-slate-500 mb-0.5">Budget (LKR)</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="Budget"
                              className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                              value={editForm.budgetAllocated}
                              onChange={e => setEditForm({ ...editForm, budgetAllocated: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Subcontractor"
                            className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={editForm.subcontractor}
                            onChange={e => setEditForm({ ...editForm, subcontractor: e.target.value })}
                          />
                          <select
                            className="w-full sm:w-auto rounded border border-input bg-background px-2 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={editForm.paymentStatus}
                            onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                          >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                          </select>
                          <label className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.inspectionRequired}
                              onChange={e => setEditForm({ ...editForm, inspectionRequired: e.target.checked })}
                              className="rounded border-slate-300 text-primary focus:ring-primary w-3 h-3"
                            />
                            Inspection Req.
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Description"
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                          value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Deliverables"
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                          value={editForm.deliverables}
                          onChange={e => setEditForm({ ...editForm, deliverables: e.target.value })}
                        />
                      </div>
                    ) : (
                      <>
                        <p className={`font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 '}`}>
                          {displayName}
                        </p>
                        {m.description && <p className={`text-sm mt-1 ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-500'}`}>{m.description}</p>}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {displayDate && (
                            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                              <Calendar className="w-3 h-3" />
                              {isOverdue ? 'Overdue · ' : ''}
                              {m.startDate ? `${m.startDate} to ${displayDate}` : displayDate}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[m.status] || statusColors.Incomplete}`}>
                            {m.status}
                          </span>
                          {m.category && (
                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {m.category}
                            </span>
                          )}
                          {m.budgetAllocated && (
                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Budget: LKR {m.budgetAllocated.toLocaleString()}
                            </span>
                          )}
                          {m.subcontractor && (
                            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                              Sub: {m.subcontractor}
                            </span>
                          )}
                          {m.paymentStatus && m.paymentStatus !== 'Unpaid' && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                              m.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                              {m.paymentStatus}
                            </span>
                          )}
                          {m.inspectionRequired && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Inspection Required
                            </span>
                          )}
                          {m.deliverables && (
                            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 max-w-[200px] sm:max-w-[300px] truncate" title={m.deliverables}>
                              Deliverables: {m.deliverables}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action buttons - hidden from clients */}
                  {!isClient && (
                    <div className="flex items-center gap-1 shrink-0">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleEditSave(m.id)} className="px-3 py-1.5 text-xs font-bold bg-primary text-slate-900 hover:brightness-105 rounded-md shadow-sm transition-all">
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-md shadow-sm transition-all">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(m)} className="px-3 py-1.5 text-xs font-bold bg-primary text-slate-900 hover:brightness-105 rounded-md shadow-sm transition-all">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(m.id)} className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-md shadow-sm transition-all">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMilestonesTab;
