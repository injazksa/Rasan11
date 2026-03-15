import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RaceArena from './pages/RaceArena';
import Marketplace from './pages/Marketplace';
import AdminApprovalCenter from './pages/AdminApprovalCenter';

// Import Components as Pages
import GodEyeDashboard from './components/GodEyeDashboard';
import RasanAnalytics from './components/RasanAnalytics';
import RasanAuction from './components/RasanAuction';
import RasanCheckout from './components/RasanCheckout';
import RasanNotifications from './components/RasanNotifications';
import FederationAuthorityPortal from './components/FederationAuthorityPortal';

const Navigation = () => (
  <nav className="bg-[#2C2C2C] text-[#D4AF37] p-4 flex flex-wrap justify-center gap-6 sticky top-0 z-50 shadow-lg border-b border-[#D4AF37]/20" dir="rtl">
    <Link to="/" className="hover:text-white transition-colors font-bold">الرئيسية</Link>
    <Link to="/race-arena" className="hover:text-white transition-colors font-bold">ميدان السباق</Link>
    <Link to="/marketplace" className="hover:text-white transition-colors font-bold">المتجر</Link>
    <Link to="/auction" className="hover:text-white transition-colors font-bold">المزادات</Link>
    <Link to="/admin/approvals" className="hover:text-white transition-colors font-bold">مركز الاعتمادات</Link>
    <Link to="/federation" className="hover:text-white transition-colors font-bold">بوابة الاتحادات</Link>
    <Link to="/analytics" className="hover:text-white transition-colors font-bold">التقارير المالية</Link>
    <Link to="/god-eye" className="hover:text-white transition-colors font-bold bg-red-900/30 px-3 py-1 rounded-full border border-red-500/30 text-red-400">عين الإله (God Eye)</Link>
    <Link to="/notifications" className="hover:text-white transition-colors font-bold relative">
      التنبيهات
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">3</span>
    </Link>
  </nav>
);

const App = () => {
  return (
    <Router>
      <div className="min-h-screen font-sans bg-[#FBFBFB]" dir="rtl">
        <Routes>
          {/* Auth Routes - No Navigation */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Main App Routes - With Navigation */}
          <Route path="/*" element={
            <>
              <Navigation />
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/race-arena" element={<RaceArena />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/auction" element={<RasanAuction />} />
                <Route path="/checkout" element={<RasanCheckout />} />
                <Route path="/admin/approvals" element={<AdminApprovalCenter />} />
                <Route path="/federation" element={<FederationAuthorityPortal />} />
                <Route path="/analytics" element={<RasanAnalytics />} />
                <Route path="/god-eye" element={<GodEyeDashboard />} />
                <Route path="/notifications" element={<RasanNotifications />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
