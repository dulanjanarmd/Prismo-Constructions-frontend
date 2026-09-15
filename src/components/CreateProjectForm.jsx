import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import MilestoneFormList from './MilestoneFormList';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CreateProjectForm = () => {
  const { addProject, users } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'PLANNING',
    progressPercentage: 0
  });
  
  const [milestones, setMilestones] = useState([]);
  const [proposalDoc, setProposalDoc] = useState(null);
  const [budgetDoc, setBudgetDoc] = useState(null);

  // Filter clients
  const clients = users.filter(u => String(u.role || '').toLowerCase() === 'client');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (formData.name.length < 3) {
      setError('Project name must be at least 3 characters long.');
      return;
    }
    if (!formData.clientId) {
      setError('Please select a client.');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateObj = new Date(formData.startDate);
    const endDateObj = new Date(formData.endDate);

    if (startDateObj < today) {
      setError('Start Date cannot be in the past.');
      return;
    }

    if (endDateObj <= startDateObj) {
      setError('Expected End Date must be at least one day after Start Date.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build project payload
      const projectPayload = {
        name: formData.name,
        client: { id: parseInt(formData.clientId.replace('u', ''), 10) },
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        status: formData.status,
        progressPercentage: Number(formData.progressPercentage),
        milestones: milestones.length > 0 ? milestones : undefined
      };

      const newProject = await addProject(projectPayload);
      
      // Upload optional documents if provided
      const uploadPromises = [];
      if (newProject && newProject.id) {
        if (proposalDoc) {
          const fd = new FormData();
          fd.append('file', proposalDoc);
          fd.append('category', 'Proposal');
          uploadPromises.push(
            fetch(`http://localhost:8080/api/projects/${newProject.id}/documents`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${currentUser.token}` },
              body: fd
            })
          );
        }
        if (budgetDoc) {
          const fd = new FormData();
          fd.append('file', budgetDoc);
          fd.append('category', 'Budget');
          uploadPromises.push(
            fetch(`http://localhost:8080/api/projects/${newProject.id}/documents`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${currentUser.token}` },
              body: fd
            })
          );
        }
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
        }
      }
      
      // Navigate back to overview on success
      navigate('/portal');
    } catch (err) {
      setError(err.message || 'An error occurred while creating the project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const minEndDateStr = formData.startDate 
    ? new Date(new Date(formData.startDate).getTime() + 86400000).toISOString().split('T')[0] 
    : todayStr;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/portal')}
          className="mr-4 p-2 text-slate-500 hover:bg-slate-200 :bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600   bg-clip-text text-transparent">
            Create New Project
          </h1>
          <p className="text-slate-500 mt-1">Set up a new project after proposal acceptance.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50  text-red-600  p-4 rounded-lg border border-red-200  mb-6">
          {error}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <form id="createProjectForm" onSubmit={handleSubmit} className="glass-card space-y-8">
          <div className="p-8 space-y-6">
            <h3 className="text-xl font-semibold border-b border-border pb-3">Project Details</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name <span className="text-red-500">*</span></label>
                <input required type="text" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Horizon Residencies - Phase 1" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client <span className="text-red-500">*</span></label>
                  <select required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                    <option value="" disabled>Select a registered client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location <span className="text-red-500">*</span></label>
                  <input required type="text" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Nugegoda, Colombo" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date <span className="text-red-500">*</span></label>
                  <input required type="date" min={todayStr} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expected End Date <span className="text-red-500">*</span></label>
                  <input required type="date" min={minEndDateStr} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea rows="4" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief scope and details of the project..."></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Initial Status <span className="text-red-500">*</span></label>
                  <select required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-semibold border-b border-border pb-3 mt-6 mb-4">Attachments (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Proposal</label>
                  <div className="relative">
                    <input type="file" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={e => setProposalDoc(e.target.files[0])} accept=".pdf,.doc,.docx" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Budget Document</label>
                  <div className="relative">
                    <input type="file" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={e => setBudgetDoc(e.target.files[0])} accept=".pdf,.xls,.xlsx,.csv" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 border-t border-border bg-slate-50/50">
            <MilestoneFormList milestones={milestones} setMilestones={setMilestones} projectStartDate={formData.startDate} />
          </div>
          
          <div className="p-8 flex flex-col sm:flex-row justify-end items-center gap-4 bg-slate-50 border-t border-border rounded-b-2xl">
            <button 
              type="button" 
              onClick={() => navigate('/portal')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold border border-input text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="createProjectForm"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-2.5 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectForm;
