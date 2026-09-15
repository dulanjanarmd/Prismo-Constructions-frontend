import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Send, MessageCircle, X, MessageSquare, Paperclip, Image as ImageIcon, Calendar, List, Smile, Edit2, Trash2, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const FloatingChatWidget = () => {
  const { projects, getGlobalMessages, sendGlobalMessage, users, notifications, tasks, logs, issues, approvals, editGlobalMessage, deleteGlobalMessage } = useData();
  const { currentUser } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const scrollRef = useRef(null);

  const unreadCount = notifications?.filter(n => !n.read && n.referenceId?.startsWith('message-'))?.length || 0;

  // If user is admin, maybe no projects, or we don't show it?
  if (currentUser?.role === 'admin') return null;

  // Filter projects if needed, or assume all in `projects` are assigned
  // Here we use all projects available to the user.
  // Derive project members
  const projectMembers = useMemo(() => {
    if (!selectedProjectId) return [];
    const currentProj = projects?.find(p => String(p.id) === String(selectedProjectId));
    if (!currentProj) return [];

    const memberIds = new Set();
    if (currentProj.client) memberIds.add(currentProj.client.replace('u', ''));
    
    tasks?.forEach(t => {
      if (String(t.projectId) === String(selectedProjectId) && t.assignee) {
        memberIds.add(String(t.assignee.id || t.assignee).replace('u', ''));
      }
    });

    logs?.forEach(l => {
      if (String(l.projectId) === String(selectedProjectId) && l.siteEngineer) {
        memberIds.add(String(l.siteEngineer.id || l.siteEngineer).replace('u', ''));
      }
    });

    issues?.forEach(i => {
      if (String(i.projectId) === String(selectedProjectId)) {
        if (i.reportedBy) memberIds.add(String(i.reportedBy.id || i.reportedBy).replace('u', ''));
        if (i.assignee) memberIds.add(String(i.assignee.id || i.assignee).replace('u', ''));
      }
    });

    approvals?.forEach(a => {
      if (String(a.projectId) === String(selectedProjectId)) {
        if (a.clientId) memberIds.add(String(a.clientId.id || a.clientId).replace('u', ''));
      }
    });

    // Add global admins and CEO since they oversee all projects, 
    // but DO NOT add all project managers (only those related to the project will be added via tasks/issues/logs)
    users?.forEach(u => {
      if (['ceo', 'admin'].includes(u.role)) {
        memberIds.add(String(u.id));
      }
    });

    return users?.filter(u => memberIds.has(String(u.id)) && String(u.id) !== String(currentUser?.id)) || [];
  }, [selectedProjectId, projects, tasks, logs, issues, approvals, users, currentUser]);

  useEffect(() => {
    if (projects?.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const fetchMessages = async () => {
    if (!selectedProjectId) return;
    const rawId = String(selectedProjectId).replace('p', '');
    const data = await getGlobalMessages(rawId);
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && selectedProjectId) {
      setLoading(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, selectedProjectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProjectId) return;

    const rawId = String(selectedProjectId).replace('p', '');
    const payload = {
      messageText: newMessage,
      recipientId: selectedRecipientId || null,
      messageType: 'TEXT' // Simulating just text for now
    };
    
    const savedMsg = await sendGlobalMessage(rawId, payload);
    if (savedMsg) {
      setMessages([...(messages || []), { ...savedMsg, sender: currentUser }]);
      setNewMessage('');
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  };

  const handleEdit = async (msgId) => {
    const updated = await editGlobalMessage(msgId, editMessageText);
    if (updated) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, messageText: editMessageText } : m));
      setEditingMessageId(null);
      setEditMessageText('');
    }
  };

  const handleDelete = async (msgId) => {
    const success = await deleteGlobalMessage(msgId);
    if (success) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary hover:opacity-90 text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-transform ${isOpen ? 'scale-0' : 'scale-100 hover:scale-110'} z-50`}
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-border"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-bold">Project Chat</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-primary/80 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project & Recipient Selectors */}
            <div className="bg-slate-50 border-b border-border px-3 py-2 space-y-2">
              <select
                className="w-full text-xs rounded-md border-input focus:border-primary focus:ring-1 focus:ring-primary bg-white py-1.5"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="" disabled>Select Project</option>
                {projects?.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                className="w-full text-xs rounded-md border-input focus:border-primary focus:ring-1 focus:ring-primary bg-white py-1.5"
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
              >
                <option value="">Everyone in Project</option>
                {projectMembers.map(u => (
                  <option key={u.id} value={u.id}>Direct to: {u.name} ({u.role.replace('_', ' ')})</option>
                ))}
              </select>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {!selectedProjectId ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">Select a project to start chatting</p>
                </div>
              ) : loading ? (
                <p className="text-center text-slate-400 text-sm mt-4">Loading messages...</p>
              ) : !messages || messages.length === 0 ? (
                <p className="text-center text-slate-400 text-sm mt-4 italic">No messages yet. Start the conversation!</p>
              ) : (
                messages.map(msg => {
                  const isMe = String(msg?.sender?.id) === String(currentUser?.id);
                  return (
                    <div key={msg.id} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        {!isMe && <span className="text-xs font-semibold text-slate-700">{msg.sender?.name}</span>}
                        <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.recipient && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded-sm">Private</span>}
                      </div>
                      <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                        isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-white text-slate-800 rounded-bl-sm border border-border'
                      }`}>
                        {msg.messageType === 'IMAGE' && msg.fileUrl && (
                          <img src={msg.fileUrl} alt="attachment" className="rounded-md max-w-full mb-2" />
                        )}
                        
                        {editingMessageId === msg.id ? (
                          <div className="flex gap-2 items-center mt-1">
                            <input 
                              type="text" 
                              className="text-slate-900 px-2 py-1 rounded text-xs w-full"
                              value={editMessageText}
                              onChange={e => setEditMessageText(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleEdit(msg.id)}
                              autoFocus
                            />
                            <button onClick={() => handleEdit(msg.id)} className="text-primary hover:text-primary/80 bg-white p-1 rounded-full"><Check className="w-3 h-3" /></button>
                            <button onClick={() => setEditingMessageId(null)} className="text-red-500 hover:text-red-600 bg-white p-1 rounded-full"><X className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          msg.messageText
                        )}
                      </div>
                      
                      {isMe && editingMessageId !== msg.id && (
                        <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingMessageId(msg.id); setEditMessageText(msg.messageText); }} 
                            className="text-slate-400 hover:text-primary"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDelete(msg.id)} 
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-white flex flex-col gap-2">
              {/* Toolbar */}
              <div className="flex gap-2 text-slate-400 px-1">
                <button type="button" className="hover:text-primary transition-colors" title="Attach Document"><Paperclip className="w-4 h-4" /></button>
                <button type="button" className="hover:text-primary transition-colors" title="Attach Image"><ImageIcon className="w-4 h-4" /></button>
                <button type="button" className="hover:text-primary transition-colors" title="Schedule Event"><Calendar className="w-4 h-4" /></button>
                <button type="button" className="hover:text-primary transition-colors" title="Create Poll"><List className="w-4 h-4" /></button>
                <button type="button" className="hover:text-primary transition-colors ml-auto" title="Add Emoji"><Smile className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSend} className="flex gap-2 relative">
                <input
                  type="text"
                  className="flex-1 rounded-full border border-input pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!selectedProjectId}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !selectedProjectId}
                  className="absolute right-1 top-1 bottom-1 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-full w-8 flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4 mr-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatWidget;
