import React, { useState, useRef } from 'react';
import { Lock, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const logoClickTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);

    // Reset counter after 3 seconds of inactivity
    if (logoClickTimeoutRef.current) {
      clearTimeout(logoClickTimeoutRef.current);
    }

    logoClickTimeoutRef.current = setTimeout(() => {
      setLogoClickCount(0);
    }, 3000);

    // Trigger admin secret on 7 clicks
    if (logoClickCount + 1 === 7) {
      setShowAdminSecret(true);
      setLogoClickCount(0);
      // Add a subtle visual feedback
      const logoElement = document.querySelector('[data-logo]');
      if (logoElement) {
        logoElement.style.filter = 'drop-shadow(0 0 20px #D4AF37)';
        setTimeout(() => {
          logoElement.style.filter = 'drop-shadow(0 0 0px #D4AF37)';
        }, 500);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = '/api/auth/login';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل تسجيل الدخول');
      }

      localStorage.setItem('rasan_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/rasan-master-control');
      } else {
        navigate('/race-arena');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ في تسجيل الدخول');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = '/api/auth/login';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل تسجيل الدخول');
      }

      // Check if user is admin
      if (data.user.role !== 'admin') {
        throw new Error('صلاحيات غير كافية. هذا الدخول مخصص للمديرين فقط.');
      }

      localStorage.setItem('rasan_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      navigate('/rasan-master-control');
    } catch (err) {
      setError(err.message || 'فشل دخول المدير');
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>

      {/* Main Container */}
      <div className="max-w-2xl w-full relative z-10">
        
        {/* Regular Login Form */}
        {!showAdminSecret && (
          <div className="bg-[#1a1a1a] rounded-[3rem] shadow-2xl overflow-hidden border border-[#D4AF37]/20 backdrop-blur-sm">
            <div className="p-12">
              
              {/* Logo Section */}
              <div className="text-center mb-12">
                <div 
                  data-logo
                  onClick={handleLogoClick}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 inline-block"
                  title={`${logoClickCount}/7 نقرات سرية`}
                >
                  <img 
                    src="/rasan_logo_v2.png?t=2026" 
                    alt="Rasan Logo" 
                    className="w-56 mx-auto mb-6 drop-shadow-2xl" 
                  />
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#D4AF37] tracking-widest mb-2">رَسَن</h1>
                <p className="text-[#D4AF37] text-[11px] uppercase tracking-[0.4em] font-bold">السيادة الرقمية لعالم الفروسية</p>
                <div className="mt-4 h-1 w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto"></div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-8 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-400 text-sm text-right backdrop-blur-sm">
                  <span className="font-bold">⚠️ </span>{error}
                </div>
              )}

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleLogin}>
                
                {/* Email Input */}
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                  <input 
                    type="email" 
                    placeholder="البريد الإلكتروني" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-4 pr-14 bg-[#0a0a0a]/50 rounded-2xl border border-[#D4AF37]/20 outline-none focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/20 text-[#E0E0E0] text-right transition-all placeholder-gray-600" 
                  />
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                  <input 
                    type="password" 
                    placeholder="كلمة المرور" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-4 pr-14 bg-[#0a0a0a]/50 rounded-2xl border border-[#D4AF37]/20 outline-none focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/20 text-[#E0E0E0] text-right transition-all placeholder-gray-600" 
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <a href="#" className="text-xs text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors font-semibold">نسيت كلمة المرور؟</a>
                </div>

                {/* Login Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0a0a0a] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-[#D4AF37]/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      دخول الإسطبل الملكي
                      <ChevronRight size={20} className="rotate-180" />
                    </>
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-10 text-center">
                <p className="text-sm text-gray-500">ليس لديك حساب؟ <a href="/register" className="text-[#D4AF37] font-bold hover:underline transition-colors">سجل انضمامك الآن</a></p>
              </div>

              {/* Secret Hint */}
              <div className="mt-8 text-center text-[10px] text-gray-700 opacity-50">
                💎 اكتشف السر... اضغط على الشعار
              </div>
            </div>
          </div>
        )}

        {/* Admin Secret Login Form */}
        {showAdminSecret && (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[3rem] shadow-2xl overflow-hidden border-2 border-[#D4AF37] backdrop-blur-sm">
            
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 p-8 border-b border-[#D4AF37]/30">
              <div className="text-center">
                <div className="text-4xl mb-2">🛡️👑</div>
                <h2 className="text-2xl font-bold text-[#D4AF37] tracking-widest">بوابة المدير الأسطوري</h2>
                <p className="text-[#D4AF37]/70 text-xs mt-2 uppercase tracking-[0.3em]">God Mode Access Only</p>
              </div>
            </div>

            {/* Admin Form */}
            <div className="p-12">
              
              {error && (
                <div className="mb-8 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-400 text-sm text-right backdrop-blur-sm">
                  <span className="font-bold">⚠️ </span>{error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleAdminLogin}>
                
                {/* Email Input */}
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                  <input 
                    type="email" 
                    placeholder="البريد الإلكتروني للمدير" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-4 pr-14 bg-[#0a0a0a]/50 rounded-2xl border border-[#D4AF37]/40 outline-none focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/30 text-[#E0E0E0] text-right transition-all placeholder-gray-600" 
                  />
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                  <input 
                    type="password" 
                    placeholder="كلمة المرور السرية" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-4 pr-14 bg-[#0a0a0a]/50 rounded-2xl border border-[#D4AF37]/40 outline-none focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/30 text-[#E0E0E0] text-right transition-all placeholder-gray-600" 
                  />
                </div>

                {/* Admin Login Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0a0a0a] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-[#D4AF37]/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      جاري التحقق من الصلاحيات...
                    </>
                  ) : (
                    <>
                      دخول لوحة التحكم المطلقة
                      <ChevronRight size={20} className="rotate-180" />
                    </>
                  )}
                </button>
              </form>

              {/* Back Button */}
              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    setShowAdminSecret(false);
                    setEmail('');
                    setPassword('');
                    setError('');
                  }}
                  className="text-sm text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors font-semibold"
                >
                  ← العودة إلى الدخول العادي
                </button>
              </div>

              {/* Security Warning */}
              <div className="mt-8 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl text-[#D4AF37] text-[11px] text-center">
                🔐 <span className="font-bold">تنبيه أمان:</span> هذه البوابة مخصصة لمديري النظام فقط. أي محاولة دخول غير مصرح بها سيتم تسجيلها.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
