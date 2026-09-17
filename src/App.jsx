import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import AnimatedBackground from './components/AnimatedBackground';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Logs from './pages/Logs';
import Approvals from './pages/Approvals';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import AdminPortal from './pages/AdminPortal';
import Consultations from './pages/Consultations';
import Issues from './pages/Issues';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import AboutPage from './pages/AboutPage';
import RecentActivityPage from './pages/RecentActivityPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

const RequireAuth = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/portal" replace />;
  }

  return children;
};

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={currentUser ? <Navigate to="/portal" replace /> : <Login />} />
        <Route path="/register" element={currentUser ? <Navigate to="/portal" replace /> : <Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Portal Routes */}
        <Route path="/portal" element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route index element={
            currentUser?.role === 'admin' ? <Navigate to="/portal/admin" replace /> : <Dashboard />
          } />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={
            <RequireAuth allowedRoles={['project_manager', 'admin']}>
              <CreateProjectPage />
            </RequireAuth>
          } />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="logs" element={<Logs />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="consultations" element={
            <RequireAuth allowedRoles={['ceo', 'project_manager']}>
              <Consultations />
            </RequireAuth>
          } />
          <Route path="issues" element={<Issues />} />
          <Route path="activity" element={<RecentActivityPage />} />
          <Route path="admin" element={
            <RequireAuth allowedRoles={['admin']}>
              <AdminPortal />
            </RequireAuth>
          } />
        </Route>
        
        {/* Catch all redirect to public page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
