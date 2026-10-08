import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { UserPlus, Shield, Mail, Trash2, X, Edit, Key, Users, Briefcase, AlertCircle, FileText, Activity, LayoutDashboard, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';


const AdminPortal = () => {
  const { users, projects, tasks, issues, logs, addUser, deleteUser, updateUser, resetUserPassword, suspendUser, activateUser } = useData();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  
  // User Management State
  const [usersList, setUsersList] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'CLIENT' });
  const [editUser, setEditUser] = useState({ name: '', email: '', role: 'CLIENT' });
  const [newPassword, setNewPassword] = useState('');

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const displayUsers = useMemo(() => {
    const baseList = users && users.length > 0 ? users : usersList;
    
    const filteredList = baseList.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || (user.status || 'ACTIVE') === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

    return filteredList.sort((a, b) => {
      const isAPinned = a.role === 'ceo' || a.role === 'admin';
      const isBPinned = b.role === 'ceo' || b.role === 'admin';
      
      if (isAPinned && !isBPinned) return -1;
      if (!isAPinned && isBPinned) return 1;
      
      // Secondary sort for pinned users (CEO first, then Admin)
      if (isAPinned && isBPinned) {
        if (a.role === 'ceo' && b.role === 'admin') return -1;
        if (a.role === 'admin' && b.role === 'ceo') return 1;
      }
      
      return 0; // Maintain original order for others
    });
  }, [users, usersList, searchTerm, roleFilter, statusFilter]);

  // --- Handlers ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await addUser(newUser);
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'CLIENT' });
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (user && (user.role === 'admin' || user.role === 'ceo')) {
      alert('Cannot delete Admin or CEO users.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role.toUpperCase()
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: editUser.name,
        email: editUser.email
      };
      
      if (selectedUser?.role !== 'admin' && selectedUser?.role !== 'ceo') {
        updateData.role = editUser.role;
      }

      await updateUser(selectedUser.id, updateData);
      setShowEditUserModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      const userId = String(selectedUser.id).replace('u', '');
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
      
      setShowPasswordModal(false);
      alert('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Content */}
      <AnimatePresence mode="wait">

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-card flex flex-col overflow-hidden"
          >
            {/* Header & Filters Section */}
            <div className="flex flex-col lg:flex-row justify-between gap-6 p-6 bg-[#e5e7eb] text-slate-900 border-b border-slate-200">
              
              <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold leading-tight shrink-0">
                    System Administration
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage users and configure access control. Welcome back, {currentUser?.name || 'Admin'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-3 items-start xl:items-center w-full lg:w-auto justify-end">
                <div className="relative w-full lg:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 h-12 rounded-lg border border-slate-300 bg-white/80 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-sm text-sm"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-12 w-40 shrink-0 rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm px-3 text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="ALL">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="ceo">CEO</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="SITE_ENGINEER">Site Engineer</option>
                  <option value="QUANTITY_SURVEYOR">Quantity Surveyor</option>
                  <option value="CLIENT">Client</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-12 w-36 shrink-0 rounded-lg bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm px-3 text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>

                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="h-12 flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-lg shadow-amber-500/30 font-bold shrink-0"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add User
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayUsers.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{user.name}</td>
                        <td className="px-6 py-4 text-slate-500">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-2 text-slate-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 flex items-center w-fit capitalize">
                            <Shield className="w-3 h-3 mr-1" />
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center w-fit capitalize ${
                            user.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user.status === 'SUSPENDED' ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="px-4 py-1.5 text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-lg transition-all shadow-sm hover:shadow"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleResetPassword(user)}
                              className="px-4 py-1.5 text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-all shadow-sm hover:shadow"
                            >
                              Reset Pass
                            </button>
                            {user.role !== 'admin' && user.role !== 'ceo' && (
                              <>
                                {user.status === 'SUSPENDED' ? (
                                  <button 
                                    onClick={async () => {
                                      try {
                                        await activateUser(user.id);
                                      } catch (error) {
                                        console.error('Error activating user:', error);
                                        alert('Failed to activate user. Please try again.');
                                      }
                                    }}
                                    className="px-4 py-1.5 text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-all shadow-sm hover:shadow"
                                  >
                                    Activate
                                  </button>
                                ) : (
                                  <button 
                                    onClick={async () => {
                                      try {
                                        await suspendUser(user.id);
                                      } catch (error) {
                                        console.error('Error suspending user:', error);
                                        alert('Failed to suspend user. Please try again.');
                                      }
                                    }}
                                    className="px-4 py-1.5 text-xs font-bold bg-slate-500 text-white hover:bg-slate-600 rounded-lg transition-all shadow-sm hover:shadow"
                                  >
                                    Suspend
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all shadow-sm hover:shadow"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </motion.div>
        )}


      </AnimatePresence>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New User</h2>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CLIENT">Client</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="SITE_ENGINEER">Site Engineer</option>
                  <option value="QUANTITY_SURVEYOR">Quantity Surveyor</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button 
                onClick={() => setShowEditUserModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {(selectedUser?.role !== 'admin' && selectedUser?.role !== 'ceo') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="SITE_ENGINEER">Site Engineer</option>
                    <option value="QUANTITY_SURVEYOR">Quantity Surveyor</option>
                  </select>
                </div>
              )}

              {(selectedUser?.role === 'admin' || selectedUser?.role === 'ceo') && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-600">
                    <strong>Note:</strong> CEO and Admin roles cannot be changed. Use the password reset button to update password.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Reset Password</h2>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User</label>
                <input
                  type="text"
                  value={selectedUser?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
