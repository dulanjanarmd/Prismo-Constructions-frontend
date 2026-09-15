import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const formatProjectStatus = (status) => {
  const labels = {
    NOT_STARTED: 'Not Started',
    PLANNING: 'Planning',
    IN_PROGRESS: 'In Progress',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  };
  return labels[status] || status || 'Planning';
};

const toProjectStatus = (status) => {
  const values = {
    'Not Started': 'NOT_STARTED',
    Planning: 'PLANNING',
    'In Progress': 'IN_PROGRESS',
    'On Hold': 'ON_HOLD',
    Completed: 'COMPLETED',
    Cancelled: 'CANCELLED'
  };
  return values[status] || status;
};

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    
    const headers = {
      'Authorization': `Bearer ${currentUser.token}`,
      'Content-Type': 'application/json'
    };

    const loadData = async () => {
      try {
        const pRes = await fetch('http://localhost:8080/api/projects', { headers });
        if (pRes.ok) {
          const rawP = await pRes.json();
          setProjects(rawP.map(p => ({
            ...p,
            progress: p.progressPercentage,
            status: formatProjectStatus(p.status),
            client: p.client?.name || 'Unknown',
            clientId: p.client?.id ? `u${p.client.id}` : null
          })));
        }

        const uRes = await fetch('http://localhost:8080/api/users', { headers });
        if (uRes.ok) {
          const rawU = await uRes.json();
          setUsers(rawU.map(u => ({
            ...u,
            id: `u${u.id}`,
            role: u.role.toLowerCase()
          })));
        }

        const tRes = await fetch('http://localhost:8080/api/tasks', { headers });
        if (tRes.ok) {
          const rawT = await tRes.json();
          const mapTaskStatus = (s) => {
            if (s === 'TO_DO') return 'To Do';
            if (s === 'IN_PROGRESS') return 'In Progress';
            if (s === 'COMPLETED') return 'Completed';
            if (s === 'REOPENED') return 'Reopened';
            if (s === 'CLOSED') return 'Closed';
            return s || 'To Do';
          };
          setTasks(rawT.map(t => ({
            ...t,
            status: mapTaskStatus(t.status),
            projectId: `p${t.project?.id}`,
            assignedTo: `u${t.assignee?.id}`,
            milestoneId: t.milestone?.id,
            milestoneName: t.milestone?.name || t.milestone?.title || null,
            evidence: t.completionEvidence
          })));
        }

        const lRes = await fetch('http://localhost:8080/api/progress', { headers });
        if (lRes.ok) {
          const rawL = await lRes.json();
          setLogs(rawL.map(l => ({
            ...l,
            projectId: `p${l.project?.id}`,
            submittedBy: `u${l.siteEngineer?.id}`,
            photos: l.photos || []
          })));
        }

        const aRes = await fetch('http://localhost:8080/api/client/approvals', { headers });
        if (aRes.ok) {
          const rawA = await aRes.json();
          setApprovals(rawA.map(a => ({
            ...a,
            projectId: `p${a.project?.id}`,
            clientId: a.client?.id ? `u${a.client.id}` : null,
            auditTrail: typeof a.auditTrail === 'string' ? JSON.parse(a.auditTrail) : (a.auditTrail || []),
            status: a.status ? (a.status.charAt(0) + a.status.slice(1).toLowerCase()) : 'Pending',
            attachments: typeof a.attachments === 'string' ? JSON.parse(a.attachments) : (a.attachments || [])
          })));
        }

        const iRes = await fetch('http://localhost:8080/api/issues', { headers });
        if (iRes.ok) {
          const rawI = await iRes.json();
          setIssues(rawI.map(i => ({
            ...i,
            projectId: `p${i.project?.id}`,
            reportedBy: `u${i.reportedBy?.id}`
          })));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    loadData();
  }, [currentUser]);

  const addProject = async (projectData) => {
    try {
      const response = await fetch('http://localhost:8080/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      const newProject = await response.json();
      
      setProjects([...projects, { 
        ...newProject, 
        progress: newProject.progressPercentage,
        client: newProject.client?.name || 'Unknown' 
      }]);
      
      return newProject;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  const updateProject = async (id, updates) => {
    const projectId = String(id).replace(/^p/, '');
    const currentProject = projects.find(project => project.id === id);
    const status = toProjectStatus(updates.status || currentProject?.status);
    const progress = updates.progress ?? currentProject?.progress ?? 0;
    const payload = {
      name: updates.name ?? currentProject?.name,
      location: updates.location ?? currentProject?.location,
      startDate: updates.startDate ?? currentProject?.startDate,
      endDate: updates.endDate ?? currentProject?.endDate,
      description: updates.description ?? currentProject?.description,
      status,
      progressPercentage: Number(progress),
      budget: currentProject?.budget,
      client: (updates.clientId ?? currentProject?.clientId)
        ? { id: String(updates.clientId ?? currentProject.clientId).replace(/^u/, '') }
        : undefined
    };

    const response = await fetch(`http://localhost:8080/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${currentUser.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to update project');

    setProjects(projects.map(project => project.id === id ? {
      ...project,
      ...updates,
      status: formatProjectStatus(status),
      progress: Number(progress)
    } : project));
  };
  const deleteProject = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete project');
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addUser = async (userData) => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      const newUser = await response.json();
      
      setUsers([...users, { 
        ...newUser, 
        id: `u${newUser.id}`,
        role: newUser.role.toLowerCase()
      }]);
      
      return newUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      const userId = String(id).replace('u', '');
      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const userId = String(id).replace('u', '');
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === id ? { 
        ...updatedUser, 
        id: `u${updatedUser.id}`,
        role: updatedUser.role.toLowerCase()
      } : u));
      
      return updatedUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const resetUserPassword = async (id, newPassword) => {
    try {
      const userId = String(id).replace('u', '');
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset password');
      }
      
      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  
  const addTask = (task) => setTasks([...tasks, task]);
  const updateTask = async (id, updates) => {
    const taskId = String(id).replace(/^t/, '');
    const currentTask = tasks.find(task => String(task.id) === String(id));
    const statusValues = {
      'To Do': 'TO_DO',
      'In Progress': 'IN_PROGRESS',
      Completed: 'COMPLETED',
      Reopened: 'REOPENED',
      Closed: 'CLOSED'
    };
    const payload = {
      title: updates.title ?? currentTask?.title,
      description: updates.description ?? currentTask?.description,
      priority: updates.priority ?? currentTask?.priority,
      dueDate: updates.dueDate ?? currentTask?.dueDate ?? null,
      status: statusValues[updates.status] || updates.status,
      completionEvidence: updates.evidence ?? currentTask?.evidence ?? null
    };
    const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${currentUser.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to update task');
    setTasks(tasks.map(task => String(task.id) === String(id) ? {
      ...task,
      ...updates,
      status: updates.status || task.status,
      evidence: updates.evidence ?? task.evidence
    } : task));
  };
  const deleteTask = async (id) => {
    const taskId = String(id).replace(/^t/, '');
    const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${currentUser.token}` }
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to delete task (${response.status})`);
    }
    setTasks(tasks.filter(task => String(task.id) !== String(id)));
  };

  const addLog = async (log) => {
    try {
      const projectId = String(log.projectId).replace('p', '');
      const body = {
        date: log.date,
        weather: log.weather,
        manpower: log.manpower,
        workDone: log.workDone,
        percentageCompleted: log.percentageCompleted,
        issues: log.issues || null,
        equipmentUsed: log.equipmentUsed || null,
        materialsDelivered: log.materialsDelivered || null,
        safetyIncidents: log.safetyIncidents || null,
        delayHours: log.delayHours ? parseInt(log.delayHours) : null,
        temperature: log.temperature ? parseFloat(log.temperature) : null,
        projectId: parseInt(projectId),
        photos: log.photos ? log.photos.map(p => ({
          fileUrl: p.url || p.fileUrl,
          caption: p.caption
        })) : []
      };
      
      let url = `http://localhost:8080/api/progress?projectId=${projectId}`;
      if (log.taskId) {
        url += `&taskId=${String(log.taskId).replace('t', '')}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const newLog = await res.json();
        setLogs(prev => [...prev, {
          ...newLog,
          projectId: `p${newLog.project?.id}`,
          submittedBy: `u${newLog.siteEngineer?.id}`,
          photos: log.photos || []
        }]);
      } else {
        setLogs(prev => [...prev, { ...log, id: `l${Date.now()}`, photos: log.photos || [] }]);
      }
    } catch (err) {
      console.error('Failed to save log:', err);
      setLogs(prev => [...prev, { ...log, id: `l${Date.now()}`, photos: log.photos || [] }]);
    }
  };

  const updateLog = async (id, updatedLog) => {
    try {
      const projectId = String(updatedLog.projectId).replace('p', '');
      const rawId = String(id).replace('l', '');
      const body = {
        date: updatedLog.date,
        weather: updatedLog.weather,
        manpower: updatedLog.manpower,
        workDone: updatedLog.workDone,
        percentageCompleted: updatedLog.percentageCompleted,
        issues: updatedLog.issues || null,
        equipmentUsed: updatedLog.equipmentUsed || null,
        materialsDelivered: updatedLog.materialsDelivered || null,
        safetyIncidents: updatedLog.safetyIncidents || null,
        delayHours: updatedLog.delayHours ? parseInt(updatedLog.delayHours) : null,
        temperature: updatedLog.temperature ? parseFloat(updatedLog.temperature) : null,
        projectId: parseInt(projectId),
        photos: updatedLog.photos ? updatedLog.photos.map(p => ({
          fileUrl: p.url || p.fileUrl,
          caption: p.caption
        })) : []
      };
      
      let url = `http://localhost:8080/api/progress/${rawId}`;
      if (updatedLog.taskId) {
        url += `?taskId=${String(updatedLog.taskId).replace('t', '')}`;
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const savedLog = await res.json();
        setLogs(logs.map(l => l.id === id ? {
          ...savedLog,
          projectId: `p${savedLog.project?.id}`,
          submittedBy: `u${savedLog.siteEngineer?.id}`,
          photos: updatedLog.photos || []
        } : l));
      } else {
        setLogs(logs.map(l => l.id === id ? { ...l, ...updatedLog } : l));
      }
    } catch (err) {
      console.error('Failed to update log:', err);
      setLogs(logs.map(l => l.id === id ? { ...l, ...updatedLog } : l));
    }
  };

  const deleteLog = async (id) => {
    try {
      const rawId = String(id).replace('l', '');
      await fetch(`http://localhost:8080/api/progress/${rawId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      setLogs(logs.filter(l => l.id !== id));
    } catch (err) {
      console.error('Failed to delete log:', err);
      setLogs(logs.filter(l => l.id !== id));
    }
  };

  const addIssue = async (issue) => {
    try {
      const projectId = String(issue.projectId).replace('p', '');
      const body = {
        title: issue.title,
        description: issue.description,
        severity: issue.severity || 'Medium',
        status: issue.status || 'OPEN',
        location: issue.location || null,
        equipmentInvolved: issue.equipmentInvolved || null,
        estimatedDelayDays: issue.estimatedDelayDays ? parseInt(issue.estimatedDelayDays) : null,
        photoUrl: issue.photoUrl || null
      };
      
      let url = `http://localhost:8080/api/issues?projectId=${projectId}`;
      if (issue.taskId) {
        url += `&taskId=${String(issue.taskId).replace('t', '')}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const newIssue = await res.json();
        setIssues([...issues, {
          ...newIssue,
          projectId: `p${newIssue.project?.id}`,
          reportedBy: `u${newIssue.reportedBy?.id}`
        }]);
      } else {
        setIssues([...issues, { ...issue, id: `i${Date.now()}` }]);
      }
    } catch (err) {
      console.error('Failed to report issue:', err);
      setIssues([...issues, { ...issue, id: `i${Date.now()}` }]);
    }
  };
  
  const updateIssue = async (id, updates) => {
    try {
      const rawId = String(id).replace('i', '');
      const body = {
        title: updates.title,
        description: updates.description,
        severity: updates.severity,
        location: updates.location || null,
        equipmentInvolved: updates.equipmentInvolved || null,
        estimatedDelayDays: updates.estimatedDelayDays == null || updates.estimatedDelayDays === ''
          ? null
          : Number(updates.estimatedDelayDays)
      };
      const res = await fetch(`http://localhost:8080/api/issues/${rawId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setIssues(prev => prev.map(i => String(i.id) === String(id) || String(i.id) === `i${rawId}` ? {
          ...i,
          ...updates,
          id: i.id,
          projectId: i.projectId,
          taskId: i.taskId,
          reportedBy: i.reportedBy,
          assignee: i.assignee
        } : i));
        return true;
      }
      const message = await res.text();
      throw new Error(message || `Failed to update issue (${res.status})`);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteIssue = async (id) => {
    try {
      const rawId = String(id).replace('i', '');
      const res = await fetch(`http://localhost:8080/api/issues/${rawId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      if (res.ok) {
        setIssues(prev => prev.filter(i => String(i.id) !== String(id) && String(i.id) !== `i${rawId}`));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getIssueComments = async (issueId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/issues/${issueId}/comments`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      return res.ok ? await res.json() : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const addIssueComment = async (issueId, comment) => {
    try {
      const res = await fetch(`http://localhost:8080/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
      });
      return res.ok ? await res.json() : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const getIssueMeetings = async (issueId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/issues/${issueId}/meetings`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      return res.ok ? await res.json() : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const addIssueMeeting = async (issueId, meeting) => {
    try {
      const res = await fetch(`http://localhost:8080/api/issues/${issueId}/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meeting)
      });
      return res.ok ? await res.json() : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const updateIssueStatus = async (issueId, status, assigneeId = null) => {
    try {
      let url = `http://localhost:8080/api/issues/${issueId}/status?status=${status}`;
      if (assigneeId) url += `&assigneeId=${assigneeId}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setIssues(prev => prev.map(i => String(i.id) === String(issueId) || String(i.id) === `i${issueId}` ? { ...i, status: updated.status, assignee: updated.assignee } : i));
      }
    } catch (err) { console.error(err); }
  };

  const updateApproval = async (id, updates) => {
    const currentApproval = approvals.find(a => String(a.id) === String(id));
    // Optimistically update local state
    setApprovals(prev => prev.map(a => String(a.id) === String(id) ? { ...a, ...updates } : a));
    try {
      // Mirror to backend (strip prefix if any)
      const numId = typeof id === 'string' ? id.replace('a', '') : id;
      const response = await fetch(`http://localhost:8080/api/client/approvals/${numId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: updates.status,
          auditTrail: updates.auditTrail,
          feedback: updates.feedback,
          pmReply: updates.pmReply,
          dueDate: updates.dueDate ?? currentApproval?.dueDate,
          attachments: updates.attachments ?? currentApproval?.attachments
        })
      });
      if (!response.ok) {
        throw new Error(await response.text() || `Approval update failed (${response.status})`);
      }
      const saved = await response.json();
      setApprovals(prev => prev.map(a => String(a.id) === String(id) ? {
        ...a,
        ...updates,
        id: saved.id,
        status: saved.status ? saved.status.charAt(0) + saved.status.slice(1).toLowerCase() : a.status,
        auditTrail: typeof saved.auditTrail === 'string' ? JSON.parse(saved.auditTrail) : (saved.auditTrail || []),
        attachments: typeof saved.attachments === 'string' ? JSON.parse(saved.attachments) : (saved.attachments || [])
      } : a));
      return saved;
    } catch (err) {
      setApprovals(prev => prev.map(a => String(a.id) === String(id) ? currentApproval : a));
      console.error('updateApproval:', err);
      throw err;
    }
  };

  const addApprovalRequest = async (request) => {
    const uploadAttachment = async (file) => {
      const body = new FormData();
      body.append('file', file);
      const uploadResponse = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentUser.token}` },
        body
      });
      if (!uploadResponse.ok) throw new Error(await uploadResponse.text() || 'Attachment upload failed');
      return uploadResponse.json();
    };

    const files = [
      ...(request.attachedDocuments || []).map(file => ({ file, category: 'document' })),
      ...(request.attachedPhotos || []).map(file => ({ file, category: 'image' }))
    ];
    const attachments = await Promise.all(files.map(async ({ file, category }) => ({
      ...(await uploadAttachment(file)),
      category
    })));
    try {
      const numProjectId = typeof request.projectId === 'string'
        ? parseInt(request.projectId.replace('p', ''))
        : request.projectId;
      const res = await fetch('http://localhost:8080/api/client/approvals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: request.title,
          description: request.description,
          projectId: numProjectId,
          status: 'PENDING',
          dueDate: request.dueDate || null,
          dateRequested: new Date().toISOString().split('T')[0],
          auditTrail: request.auditTrail || [],
          attachments
        })
      });
      if (res.ok) {
        const saved = await res.json();
        setApprovals(prev => [...prev, {
          ...saved,
          projectId: `p${saved.project?.id}`,
          clientId: saved.client?.id ? `u${saved.client.id}` : null,
          auditTrail: typeof saved.auditTrail === 'string' ? JSON.parse(saved.auditTrail) : (saved.auditTrail || []),
          status: saved.status ? (saved.status.charAt(0) + saved.status.slice(1).toLowerCase()) : 'Pending',
          attachments: typeof saved.attachments === 'string' ? JSON.parse(saved.attachments) : (saved.attachments || [])
        }]);
        return saved;
      }
      throw new Error(await res.text() || `Approval creation failed (${res.status})`);
    } catch (err) { console.error('addApprovalRequest:', err); throw err; }
  };

  const deleteApprovalRequest = async (id) => {
    try {
      const numId = typeof id === 'string' ? id.replace('a', '') : id;
      const res = await fetch(`http://localhost:8080/api/client/approvals/${numId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete approval request');
      setApprovals(prev => prev.filter(a => String(a.id) !== String(id) && String(a.id) !== `a${numId}`));
    } catch (err) {
      console.error('Failed to delete approval:', err);
      throw err;
    }
  };

  const addConsultation = (consultation) => setConsultations([...consultations, { ...consultation, id: `c${Date.now()}` }]);
  const updateConsultation = (id, updates) => setConsultations(consultations.map(c => c.id === id ? { ...c, ...updates } : c));

  const getGlobalMessages = async (projectId) => {
    try {
      const numProjectId = typeof projectId === 'string' ? projectId.replace(/^p/, '') : projectId;
      const res = await fetch(`http://localhost:8080/api/messages/${numProjectId}`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      return res.ok ? await res.json() : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const sendGlobalMessage = async (projectId, messageText) => {
    try {
      const numProjectId = typeof projectId === 'string' ? projectId.replace(/^p/, '') : projectId;
      const res = await fetch(`http://localhost:8080/api/messages/${numProjectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageText })
      });
      return res.ok ? await res.json() : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const value = {
    projects,
    tasks,
    logs,
    approvals,
    consultations,
    users,
    issues,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addLog,
    updateLog,
    deleteLog,
    addApprovalRequest,
    updateApproval,
    deleteApprovalRequest,
    addConsultation,
    updateConsultation,
    addUser,
    deleteUser,
    updateUser,
    resetUserPassword,
    addIssue,
    updateIssue,
    deleteIssue,
    getIssueComments,
    addIssueComment,
    getIssueMeetings,
    addIssueMeeting,
    updateIssueStatus,
    getGlobalMessages,
    sendGlobalMessage
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
