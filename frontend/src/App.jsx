import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RaceArena from './pages/RaceArena';
import Marketplace from './pages/Marketplace';
import AdminApprovalCenter from './pages/AdminApprovalCenter';
import HorsePassportPage from './pages/HorsePassportPage';

// Import Components as Pages
import GodEyeDashboard from './components/GodEyeDashboard';
import RasanAnalytics from './components/RasanAnalytics';
import RasanAuction from './components/RasanAuction';
import RasanCheckout from './components/RasanCheckout';
import RasanNotifications from './components/RasanNotifications';
import FederationAuthorityPortal from './components/FederationAuthorityPortal';

const Navigation = () => {
  const location = useLocation();
  
  // Hide Navbar on Login and Register pages
  const hideNavbar = ['/login', '/register', '/'].includes(location.pathname);
  
  if (hideNavbar) return null;

  return (
    <nav className="bg-[#2C2C2C] text-[#D4AF37] p-4 flex flex-wrap justify-center items-center gap-6 sticky top-0 z-50 shadow-lg border-b border-[#D4AF37]/20" dir="rtl">
      <div className="flex items-center gap-2 ml-6">
        <img 
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030900418/bhxCMGsfVJBQVCWd.png"
          alt="Rasan" 
          className="h-8"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/50x50?text=R';
          }}
        />
        <span className="font-serif font-bold text-lg tracking-widest">رَسَن</span>
      </div>
      <Link to="/race-arena" className="hover:text-white transition-colors font-bold">ميدان السباق</Link>
      <Link to="/marketplace" className="hover:text-white transition-colors font-bold">المتجر</Link>
      <Link to="/auction" className="hover:text-white transition-colors font-bold">المزادات</Link>
      <Link to="/admin/approvals" className="hover:text-white transition-colors font-bold">مركز الاعتمادات</Link>
      <Link to="/federation" className="hover:text-white transition-colors font-bold">بوابة الاتحادات</Link>
      <Link to="/analytics" className="hover:text-white transition-colors font-bold">التقارير المالية</Link>
      <Link to="/notifications" className="hover:text-white transition-colors font-bold relative">
        التنبيهات
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">3</span>
      </Link>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen font-sans bg-[#FBFBFB]" dir="rtl">
        <Navigation />
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/passport/:id" element={<HorsePassportPage />} />
          
          {/* Main App Routes */}
          <Route path="/race-arena" element={<RaceArena />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/auction" element={<RasanAuction />} />
          <Route path="/checkout" element={<RasanCheckout />} />
          <Route path="/admin/approvals" element={<AdminApprovalCenter />} />
          <Route path="/federation" element={<FederationAuthorityPortal />} />
          <Route path="/analytics" element={<RasanAnalytics />} />
          <Route path="/notifications" element={<RasanNotifications />} />
          
          {/* Secret Admin Route */}
          <Route path="/rasan-master-control" element={<GodEyeDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
