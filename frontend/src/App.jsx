import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RaceArena from './pages/RaceArena';
import Marketplace from './pages/Marketplace';
import AdminApprovalCenter from './pages/AdminApprovalCenter';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen font-sans bg-[#FBFBFB]" dir="rtl">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/race-arena" element={<RaceArena />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/admin/approvals" element={<AdminApprovalCenter />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
