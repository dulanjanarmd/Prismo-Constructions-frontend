import React, { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';

const MilestoneFormList = ({ milestones, setMilestones, projectStartDate }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    
    if (projectStartDate) {
      const msDate = new Date(newDate);
      const projStart = new Date(projectStartDate);
      msDate.setHours(0, 0, 0, 0);
      projStart.setHours(0, 0, 0, 0);
      if (msDate <= projStart) {
        alert("Milestone due date must be strictly after the project's start date.");
        return;
      }
    }
    
    setMilestones([
      ...milestones, 
      { name: newTitle, dueDate: newDate, status: 'Incomplete' }
    ]);
    
    setNewTitle('');
    setNewDate('');
  };

  const handleRemove = (indexToRemove) => {
    setMilestones(milestones.filter((_, index) => index !== indexToRemove));
  };

  const minDateStr = projectStartDate 
    ? new Date(new Date(projectStartDate).getTime() + 86400000).toISOString().split('T')[0]
    : undefined;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 ">Project Milestones</h3>
      
      {milestones.length > 0 && (
        <div className="space-y-2 mb-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50  rounded-lg border border-border">
              <div>
                <p className="font-medium text-sm text-slate-900 ">{milestone.name}</p>
                <div className="flex items-center text-xs text-slate-500 mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {milestone.dueDate}
                </div>
              </div>
              <button 
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 :bg-red-900/20 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-100 p-4 rounded-lg border border-border">
        <h4 className="text-sm font-medium mb-3">Add New Milestone</h4>
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            placeholder="Milestone Title (e.g. Foundation Complete)" 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input 
            type="date" 
            min={minDateStr}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <button 
            type="button"
            onClick={handleAdd}
            className="w-full flex items-center justify-center px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Milestone
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneFormList;
