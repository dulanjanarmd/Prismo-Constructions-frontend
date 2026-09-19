import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle2, ArrowRight, User, Phone, Mail, Building2, UploadCloud, X, Send, ShieldAlert, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Consultations = () => {
  const { consultations, updateConsultation, addProject } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [proposalUrl, setProposalUrl] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState({
    date: '',
    time: '',
    link: '',
    details: ''
  });

  const isPM = currentUser?.role === 'project_manager';
  const isCEO = currentUser?.role === 'ceo';

  const handleUpdateStatus = (id, newStatus) => {
    updateConsultation(id, { status: newStatus });
    if (selectedConsultation && selectedConsultation.id === id) {
      setSelectedConsultation({ ...selectedConsultation, status: newStatus });
    }
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('consultationId', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('consultationId');
    if (id) {
      updateConsultation(id, { status: newStatus });
    }
  };

  const handleAttachProposal = (e) => {
    e.preventDefault();
    if (!proposalUrl) return;
    updateConsultation(selectedConsultation.id, { 
      proposalUrl, 
      status: 'Proposal Sent' 
    });
    setSelectedConsultation({ ...selectedConsultation, proposalUrl, status: 'Proposal Sent' });
    setProposalUrl('');
  };

  const handleSendSchedule = (e) => {
    e.preventDefault();
    const { date, time, link, details } = meetingSchedule;
    if (!date || !time) return;

    const subject = encodeURIComponent(`Consultation Meeting - ${selectedConsultation.service} - Prismo Construction`);
    const body = encodeURIComponent(`Hello ${selectedConsultation.clientName},\n\nWe would like to schedule a consultation meeting regarding your inquiry.\n\nDate: ${date}\nTime: ${time}\n${link ? `Meeting Link: ${link}\n\n` : ''}${details ? `Details: ${details}\n\n` : ''}Best regards,\nPrismo Construction Team`);
    
    window.open(`mailto:${selectedConsultation.email}?subject=${subject}&body=${body}`);
    
    updateConsultation(selectedConsultation.id, { status: 'Meeting Scheduled' });
    setSelectedConsultation({ ...selectedConsultation, status: 'Meeting Scheduled' });
  };

  const handleConvertToProject = (consultation) => {
    // Generate new project from consultation details
    addProject({
      name: consultation.clientName + ' - ' + consultation.service,
      client: consultation.clientName,
      location: 'TBD', // Would be gathered during consultation
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 15552000000).toISOString().split('T')[0], // 6 months later approx
      description: consultation.description,
      status: 'Planning',
      progress: 0,
      milestones: []
    });
    
    // Mark consultation as converted
    updateConsultation(consultation.id, { status: 'Converted' });
    setSelectedConsultation(null);
    
    // Navigate to projects
    navigate('/portal/projects');
  };

  const columns = ['New Inquiry', 'Meeting Scheduled', 'Proposal Sent', 'Accepted', 'Pending CEO Approval', 'CEO Approved', 'Converted'];

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 ">
            Consultations & Inquiries
          </h1>
          <p className="text-slate-500 mt-1">Manage public inquiries, proposals, and convert them to projects.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-6 items-start w-full">
        {/* Kanban Board Columns */}
        {columns.map(status => {
          const colConsultations = consultations.filter(c => c.status === status);
          return (
            <div 
              key={status} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              className="bg-slate-50/50 rounded-2xl p-4 min-h-[60vh] border border-slate-100 min-w-[300px] w-[320px] flex-shrink-0 transition-colors hover:bg-slate-50/80"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500">{status}</h3>
                <span className="bg-white border border-slate-100 text-slate-500 text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                  {colConsultations.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {colConsultations.map(c => (
                  <div 
                    key={c.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <motion.div 
                      layoutId={c.id}
                      onClick={() => setSelectedConsultation(c)}
                      className="glass-card p-5 hover:border-slate-200 transition-colors group"
                      whileHover={{ scale: 1.02 }}
                    >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-1 rounded-md">
                        {c.service}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{new Date(c.dateSubmitted).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-slate-900  mb-1 group-hover:text-primary transition-colors">{c.clientName}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{c.description}</p>
                    
                    {c.proposalUrl && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center text-xs text-slate-500">
                        <FileText className="w-3 h-3 mr-1" /> Proposal Attached
                      </div>
                    )}
                  </motion.div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedConsultation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white  border border-border w-full max-w-2xl p-6 relative rounded shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedConsultation(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 :text-slate-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 ">{selectedConsultation.clientName}</h2>
                  <p className="text-sm text-slate-500 font-semibold">{selectedConsultation.service}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50  p-4 rounded border border-border">
                <div className="flex items-center text-sm text-slate-600 ">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" /> {selectedConsultation.email}
                </div>
                <div className="flex items-center text-sm text-slate-600 ">
                  <Phone className="w-4 h-4 mr-2 text-slate-400" /> {selectedConsultation.phone}
                </div>
                <div className="flex items-center text-sm text-slate-600 ">
                  <User className="w-4 h-4 mr-2 text-slate-400" /> Web Lead
                </div>
                <div className="flex items-center text-sm text-slate-600 ">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-slate-400" /> Status: <span className="font-bold ml-1">{selectedConsultation.status}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-900  uppercase tracking-wider mb-2">Inquiry Details</h4>
                <p className="text-slate-600  text-sm leading-relaxed">{selectedConsultation.description}</p>
              </div>

              {selectedConsultation.proposalUrl && (
                <div className="mb-6 bg-blue-50  border border-blue-200  p-4 rounded flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 ">Proposal Document</p>
                      <a href={selectedConsultation.proposalUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600  hover:underline">{selectedConsultation.proposalUrl}</a>
                    </div>
                  </div>
                </div>
              )}

              {(selectedConsultation.status === 'New Inquiry' || selectedConsultation.status === 'Meeting Scheduled') && (
                <div className="space-y-6 border-t border-border pt-6 mt-6">
                  {selectedConsultation.status === 'New Inquiry' && (
                    <form onSubmit={handleSendSchedule} className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                        <Send className="w-4 h-4 mr-2 text-primary" /> Schedule Meeting
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                          <input type="date" required className="w-full rounded border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
                            value={meetingSchedule.date} onChange={e => setMeetingSchedule({...meetingSchedule, date: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
                          <input type="time" required className="w-full rounded border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
                            value={meetingSchedule.time} onChange={e => setMeetingSchedule({...meetingSchedule, time: e.target.value})} />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Meeting Link (Optional)</label>
                        <input type="url" placeholder="Zoom/Meet URL" className="w-full rounded border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
                          value={meetingSchedule.link} onChange={e => setMeetingSchedule({...meetingSchedule, link: e.target.value})} />
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Additional Details</label>
                        <textarea rows="2" placeholder="Agenda or notes..." className="w-full rounded border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none transition-all" 
                          value={meetingSchedule.details} onChange={e => setMeetingSchedule({...meetingSchedule, details: e.target.value})}></textarea>
                      </div>
                      <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors flex justify-center items-center shadow-md">
                        <Mail className="w-4 h-4 mr-2" /> Open in Email App
                      </button>
                    </form>
                  )}

                  <form onSubmit={handleAttachProposal} className="pt-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-slate-500" /> Attach Proposal & Budget
                    </h4>
                    <div className="flex space-x-2">
                      <input 
                        required type="url" 
                        placeholder="Google Drive link or PDF URL" 
                        className="flex-1 rounded border border-input bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={proposalUrl}
                        onChange={e => setProposalUrl(e.target.value)}
                      />
                      <button type="submit" className="px-5 py-2 bg-slate-800 text-white rounded text-sm font-bold hover:bg-slate-700 transition-colors flex items-center whitespace-nowrap shadow-md">
                        <UploadCloud className="w-4 h-4 mr-2" /> Attach & Send
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {selectedConsultation.status === 'Proposal Sent' && isPM && (
                <div className="mb-6 border-t border-border pt-6 flex justify-between items-center bg-slate-50  p-4 rounded">
                  <p className="text-sm font-medium">Has the client accepted the proposal?</p>
                  <button 
                    onClick={() => handleUpdateStatus(selectedConsultation.id, 'Accepted')}
                    className="px-4 py-2 bg-green-500 text-white rounded text-sm font-bold hover:bg-green-600 transition-colors"
                  >
                    Mark as Accepted
                  </button>
                </div>
              )}

              {selectedConsultation.status === 'Accepted' && isPM && (
                <div className="mb-6 border border-primary/50 bg-primary/5 p-6 rounded text-center">
                  <h3 className="text-xl font-bold mb-2">Client Accepted!</h3>
                  <p className="text-slate-500 text-sm mb-6">Review the project details. You can request CEO approval before creating the project, or create it directly if approval is not needed.</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <button 
                      onClick={() => handleUpdateStatus(selectedConsultation.id, 'Pending CEO Approval')}
                      className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors font-medium shadow-md text-sm"
                    >
                      <ShieldAlert className="w-4 h-4 mr-2" /> Request CEO Approval
                    </button>
                    <button 
                      onClick={() => handleConvertToProject(selectedConsultation)}
                      className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-md transition-colors font-medium shadow-md shadow-blue-500/30 text-sm"
                    >
                      Create Project Directly <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {selectedConsultation.status === 'Pending CEO Approval' && isCEO && (
                <div className="mb-6 border border-amber-500/50 bg-amber-50  p-6 rounded text-center">
                  <h3 className="text-xl font-bold text-amber-700  mb-2">CEO Approval Required</h3>
                  <p className="text-slate-600  text-sm mb-6">The project manager has requested approval to create this project.</p>
                  <div className="flex space-x-3 justify-center">
                    <button 
                      onClick={() => handleUpdateStatus(selectedConsultation.id, 'CEO Approved')}
                      className="flex items-center justify-center px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors font-medium shadow-md text-sm"
                    >
                      <Check className="w-4 h-4 mr-2" /> Approve Project
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedConsultation.id, 'Accepted')}
                      className="flex items-center justify-center px-6 py-2 bg-white  border border-border text-red-500 hover:bg-red-50 :bg-red-900/20 rounded-md transition-colors font-medium text-sm"
                    >
                      <X className="w-4 h-4 mr-2" /> Reject
                    </button>
                  </div>
                </div>
              )}
              
              {selectedConsultation.status === 'Pending CEO Approval' && !isCEO && (
                <div className="mb-6 border border-amber-500/50 bg-amber-50  p-4 rounded text-center">
                  <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-bold text-amber-700 ">Waiting for CEO</h3>
                  <p className="text-xs text-slate-600  mt-1">This project is pending review and approval from the CEO.</p>
                </div>
              )}

              {selectedConsultation.status === 'CEO Approved' && isPM && (
                <div className="mb-6 border border-green-500/50 bg-green-50  p-6 rounded text-center">
                  <div className="w-12 h-12 bg-green-100  text-green-600  rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-green-700  mb-2">CEO Approved!</h3>
                  <p className="text-slate-600  text-sm mb-6">You have permission to convert this consultation into an active project.</p>
                  <button 
                    onClick={() => handleConvertToProject(selectedConsultation)}
                    className="btn-primary flex items-center justify-center mx-auto"
                  >
                    Convert to Project <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Consultations;

