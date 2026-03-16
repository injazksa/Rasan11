import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // الحصول على بيانات المستخدم من localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('rasan_token');

  // إخفاء شريط التنقل في صفحات المصادقة
  const hideNavbar = ['/login', '/register', '/', '/forgot-password', '/unauthorized'].includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem('rasan_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (hideNavbar || !token) return null;

  // تحديد العناصر المرئية بناءً على دور المستخدم
  const getMenuItems = () => {
    const commonItems = [
      { label: 'ميدان السباق', path: '/race-arena', roles: ['owner', 'federation', 'doctor', 'vendor', 'admin'] },
      { label: 'المتجر', path: '/marketplace', roles: ['owner', 'federation', 'doctor', 'vendor', 'admin'] },
      { label: 'المزادات', path: '/auction', roles: ['owner', 'federation', 'vendor', 'admin'] },
      { label: 'التنبيهات', path: '/notifications', roles: ['owner', 'federation', 'doctor', 'vendor', 'admin'] },
    ];

    const adminItems = [
      { label: 'مركز الاعتمادات', path: '/admin/approvals', roles: ['admin'] },
      { label: 'بوابة الاتحادات', path: '/federation', roles: ['federation', 'admin'] },
      { label: 'التقارير المالية', path: '/analytics', roles: ['admin'] },
    ];

    const allItems = [...commonItems, ...adminItems];

    // تصفية العناصر بناءً على دور المستخدم
    return allItems.filter(item => item.roles.includes(user?.role));
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-[#2C2C2C] text-[#D4AF37] p-4 flex flex-wrap justify-between items-center sticky top-0 z-50 shadow-lg border-b border-[#D4AF37]/20" dir="rtl">
      {/* Logo and Brand */}
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

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-[#D4AF37] hover:text-white transition-colors"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`hover:text-white transition-colors font-bold text-sm ${
              location.pathname === item.path ? 'text-white border-b-2 border-[#D4AF37] pb-1' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* User Info and Logout - Desktop */}
      <div className="hidden md:flex items-center gap-4">
        {user && (
          <div className="text-xs text-gray-300">
            <div className="font-bold">{user.full_name || user.username}</div>
            <div className="text-[#D4AF37]">{user.role === 'admin' ? 'مدير النظام' : user.role}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
          title="تسجيل الخروج"
        >
          <LogOut size={18} />
          خروج
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full mt-4 space-y-2 border-t border-[#D4AF37]/20 pt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block py-2 px-4 rounded-lg hover:bg-[#D4AF37]/10 transition-colors ${
                location.pathname === item.path ? 'bg-[#D4AF37]/20 text-white' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <hr className="border-[#D4AF37]/20 my-2" />
          {user && (
            <div className="py-2 px-4 text-xs">
              <div className="font-bold">{user.full_name || user.username}</div>
              <div className="text-[#D4AF37]">{user.role === 'admin' ? 'مدير النظام' : user.role}</div>
            </div>
          )}
          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={18} />
            خروج
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
