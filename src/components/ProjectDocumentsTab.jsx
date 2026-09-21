import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, Download, Trash2, File, FileImage, FileCode } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper to pick an icon based on file type
const FileIcon = ({ name }) => {
  const ext = name?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FileImage className="w-5 h-5 text-blue-500" />;
  if (['pdf'].includes(ext)) return <FileText className="w-5 h-5 text-red-500" />;
  if (['dwg', 'dxf', 'rvt'].includes(ext)) return <FileCode className="w-5 h-5 text-purple-500" />;
  return <File className="w-5 h-5 text-slate-500" />;
};

const formatBytes = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const CATEGORY_LABELS = {
  design: 'Design & Plans',
  contract: 'Contracts',
  report: 'Reports',
  photo: 'Photos',
  other: 'Other'
};

const ProjectDocumentsTab = ({ project }) => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'design', file: null, note: '' });
  const projectId = String(project?.id || '').replace(/^p/, '');

  const isPM = currentUser?.role === 'project_manager' || currentUser?.role === 'pm';

  React.useEffect(() => {
    const loadDocuments = async () => {
      const response = await fetch(`http://localhost:8080/api/projects/${projectId}/documents`, {
        headers: { Authorization: `Bearer ${currentUser?.token}` }
      });
      if (!response.ok) return;
      const data = await response.json();
      setDocuments(data.map(doc => ({
        ...doc,
        url: `http://localhost:8080${doc.fileUrl}`,
        uploadedBy: doc.uploadedBy || 'Unknown',
        uploadedAt: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'
      })));
    };
    if (projectId && currentUser?.token) loadDocuments();
  }, [projectId, currentUser?.token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) return;
    try {
      const body = new FormData();
      body.append('file', formData.file);
      body.append('name', formData.name || formData.file.name);
      body.append('category', formData.category);
      body.append('note', formData.note);
      const response = await fetch(`http://localhost:8080/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentUser.token}` },
        body
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Upload failed (${response.status})`);
      }
      const doc = await response.json();
      setDocuments(current => [{
        ...doc,
        url: `http://localhost:8080${doc.fileUrl}`,
        uploadedBy: doc.uploadedBy || currentUser.name,
        uploadedAt: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Today'
      }, ...current]);
      setFormData({ name: '', category: 'design', file: null, note: '' });
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(error.message || 'Failed to upload document. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    const response = await fetch(`http://localhost:8080/api/projects/${projectId}/documents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${currentUser.token}` }
    });
    if (response.ok) setDocuments(current => current.filter(d => d.id !== id));
  };

  // No longer grouping by category, rendering in a single table

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Project Documents</h2>
          <p className="text-sm text-slate-500">{documents.length} file{documents.length !== 1 ? 's' : ''} shared for this project</p>
        </div>
        {isPM && (
          <button
            onClick={() => setIsUploading(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 font-bold"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Document
          </button>
        )}
      </div>

      {/* Upload Form */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-2 border-primary/30"
        >
          <h3 className="text-lg font-bold mb-4">Add New Document</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Document Name <span className="text-red-500">*</span></label>
                <input
                  required type="text"
                  placeholder="e.g. Foundation Design Plan v2.pdf"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="design">Design & Plans</option>
                  <option value="contract">Contracts</option>
                  <option value="report">Reports</option>
                  <option value="photo">Photos</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">File <span className="text-red-500">*</span></label>
              <input
                required
                type="file"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                onChange={e => setFormData({...formData, file: e.target.files?.[0] || null, name: e.target.files?.[0]?.name || formData.name})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note (optional)</label>
              <input
                type="text"
                placeholder="Brief description or revision note..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setIsUploading(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 :bg-slate-800 rounded-md transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">Add Document</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Empty State */}
      {documents.length === 0 && !isUploading && (
        <div className="glass-card p-12 text-center text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No documents uploaded yet.</p>
          <p className="text-sm mt-1">Upload design plans, contracts, and reports to share with the client.</p>
          {isPM && (
            <button
              onClick={() => setIsUploading(true)}
              className="mt-6 inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload First Document
            </button>
          )}
        </div>
      )}

      {/* Documents Table */}
      {documents.length > 0 && (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-500">Name</th>
                <th className="px-6 py-3 font-medium text-slate-500">Category</th>
                <th className="px-6 py-3 font-medium text-slate-500">Note</th>
                <th className="px-6 py-3 font-medium text-slate-500">Uploaded By</th>
                <th className="px-6 py-3 font-medium text-slate-500">Date</th>
                <th className="px-6 py-3 font-medium text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map(doc => (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <FileIcon name={doc.fileName} />
                      <span className="font-medium text-slate-900">{doc.fileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 capitalize">
                      {CATEGORY_LABELS[doc.category] || doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs max-w-[200px] truncate">{doc.note || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{doc.uploadedBy}</td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{doc.uploadedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-blue-50 rounded-md transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {isPM && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectDocumentsTab;
