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
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>

      {/* Main Container */}
      <div className="max-w-5xl w-full relative z-10 bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-[#D4AF37]/20">
        
        {/* Left Side - Branding (Consistent with Register Page) */}
        <div className="md:w-2/5 bg-[#FDFCFB] p-8 md:p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-l border-[#D4AF37]/10">
          <div
            data-logo
            onClick={handleLogoClick}
            className="cursor-pointer transition-all duration-300 hover:scale-105 inline-block"
          >
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030900418/bhxCMGsfVJBQVCWd.png"
              alt="Rasan Logo" 
              className="w-64 md:w-80 mb-8 drop-shadow-xl"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x300?text=Rasan+Logo';
              }}
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif mb-4 text-[#2C2C2C]">منظومة رَسَن</h2>
          <p className="text-sm leading-relaxed text-[#D4AF37] font-medium uppercase tracking-[0.2em]">السيادة الرقمية لعالم الفروسية</p>
          <div className="mt-12 w-16 h-1 bg-[#D4AF37]/30 rounded-full"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-3/5 p-8 md:p-16 bg-white">
          {!showAdminSecret ? (
            <>
              <div className="mb-10">
                <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-2">تسجيل الدخول</h3>
                <p className="text-gray-500">مرحباً بك مجدداً في عالم الفروسية</p>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-right">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 mr-2">البريد الإلكتروني</label>
                  <div className="relative group">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                    <input 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-4 pr-14 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-right" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 mr-2">كلمة المرور</label>
                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full p-4 pr-14 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-right" 
                    />
                  </div>
                </div>

                <div className="text-right">
                  <a href="#" className="text-xs text-[#D4AF37] hover:underline font-bold">نسيت كلمة المرور؟</a>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#D4AF37] text-white py-5 rounded-2xl font-bold shadow-xl shadow-[#D4AF37]/20 hover:bg-[#B8962E] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-6 text-lg flex items-center justify-center gap-2"
                >
                  {loading ? 'جاري التحقق...' : 'دخول الإسطبل الملكي'}
                  {!loading && <ChevronRight size={20} className="rotate-180" />}
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-sm text-gray-400">ليس لديك حساب؟ <a href="/register" className="text-[#D4AF37] font-bold hover:underline ml-1">سجل انضمامك الآن</a></p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-10">
                <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-2">بوابة المدير</h3>
                <p className="text-[#D4AF37] font-medium">الوصول إلى لوحة التحكم المطلقة</p>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-right">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleAdminLogin}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 mr-2">بريد المدير</label>
                  <input 
                    type="email" 
                    placeholder="admin@rasan.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-[#D4AF37]/30 outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-right" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 mr-2">كلمة المرور السرية</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-[#D4AF37]/30 outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-right" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#2C2C2C] text-[#D4AF37] py-5 rounded-2xl font-bold shadow-xl hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-6 text-lg"
                >
                  {loading ? 'جاري التحقق من الصلاحيات...' : 'دخول لوحة التحكم'}
                </button>

                <div className="mt-6 text-center">
                  <button 
                    type="button"
                    onClick={() => setShowAdminSecret(false)}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    العودة للدخول العادي
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
