import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RaceArena from './pages/RaceArena';
import Marketplace from './pages/Marketplace';
import AdminApprovalCenter from './pages/AdminApprovalCenter';
import HorsePassportPage from './pages/HorsePassportPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Import Components as Pages
import GodEyeDashboard from './components/GodEyeDashboard';
import AdminMasterDashboard from './components/AdminMasterDashboard';
import RasanAnalytics from './components/RasanAnalytics';
import RasanAuction from './components/RasanAuction';
import RasanCheckout from './components/RasanCheckout';
import RasanNotifications from './components/RasanNotifications';
import FederationAuthorityPortal from './components/FederationAuthorityPortal';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Import Navigation and ProtectedRoute
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen font-sans bg-[#FBFBFB]" dir="rtl">
        <Navigation />
        <Routes>
          {/* Auth Routes - No Protection */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Public Routes */}
          <Route path="/passport/:id" element={<HorsePassportPage />} />
          
          {/* Protected Main App Routes */}
          <Route 
            path="/race-arena" 
            element={
              <ProtectedRoute>
                <RaceArena />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auction" 
            element={
              <ProtectedRoute>
                <RasanAuction />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <RasanCheckout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <RasanNotifications />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Only Routes */}
          <Route 
            path="/admin/approvals" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminApprovalCenter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/federation" 
            element={
              <ProtectedRoute requiredRole="federation">
                <FederationAuthorityPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute requiredRole="admin">
                <RasanAnalytics />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/rasan-master-control" 
            element={
              <ProtectedRoute requiredRole="admin">
                <GodEyeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminMasterDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
