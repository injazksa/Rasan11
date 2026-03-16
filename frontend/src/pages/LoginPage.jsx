import React, { useState, useRef } from 'react';
import { Lock, Mail, ChevronRight, ShieldCheck } from 'lucide-react';
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
    if (logoClickTimeoutRef.current) clearTimeout(logoClickTimeoutRef.current);
    logoClickTimeoutRef.current = setTimeout(() => setLogoClickCount(0), 3000);

    if (logoClickCount + 1 === 7) {
      setShowAdminSecret(true);
      setLogoClickCount(0);
      const logoElement = document.querySelector('[data-logo]');
      if (logoElement) {
        logoElement.style.filter = 'drop-shadow(0 0 20px #D4AF37)';
        setTimeout(() => logoElement.style.filter = 'none', 500);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'فشل تسجيل الدخول');
      localStorage.setItem('rasan_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(data.user.role === 'admin' ? '/rasan-master-control' : '/race-arena');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      {/* Royal Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px]"></div>
      
      <div className="max-w-5xl w-full relative z-10 flex flex-col md:flex-row bg-[#141414] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-[#D4AF37]/20 overflow-hidden">
        
        {/* Left Side - Branding */}
        <div className="md:w-2/5 bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-l border-[#D4AF37]/10">
          <div data-logo onClick={handleLogoClick} className="cursor-pointer transition-transform duration-500 hover:scale-110 mb-8">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030900418/EvnnRBezIZUmGlZz.png"
              alt="Rasan Logo" 
              className="w-64 md:w-72 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-serif text-white tracking-wider">رَسَن</h2>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto"></div>
            <p className="text-[#D4AF37] text-xs font-medium uppercase tracking-[0.3em] mt-4">السيادة الرقمية لعالم الفروسية</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-3/5 p-8 md:p-16 bg-[#141414]">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-white mb-3">{showAdminSecret ? 'بوابة السيادة' : 'تسجيل الدخول'}</h3>
            <p className="text-gray-500">{showAdminSecret ? 'الوصول إلى لوحة التحكم المطلقة' : 'مرحباً بك في الإسطبل الملكي الرقمي'}</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mr-2">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="admin@rasan.app" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-5 pr-14 bg-[#1F1F1F] rounded-2xl border border-white/5 outline-none focus:border-[#D4AF37]/50 text-white transition-all text-right placeholder:text-gray-700" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mr-2">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-5 pr-14 bg-[#1F1F1F] rounded-2xl border border-white/5 outline-none focus:border-[#D4AF37]/50 text-white transition-all text-right placeholder:text-gray-700" 
                />
              </div>
            </div>

            <div className="flex justify-between items-center px-2">
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-xs text-gray-500 hover:text-[#D4AF37] transition-colors font-medium">نسيت كلمة المرور؟</button>
              {showAdminSecret && (
                <button type="button" onClick={() => setShowAdminSecret(false)} className="text-xs text-[#D4AF37] hover:underline">العودة للدخول العادي</button>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-bold shadow-2xl transition-all flex items-center justify-center gap-3 text-lg ${showAdminSecret ? 'bg-white text-black hover:bg-gray-200' : 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {loading ? 'جاري التحقق من الهوية...' : showAdminSecret ? 'دخول لوحة التحكم' : 'دخول الإسطبل الملكي'}
              {!loading && <ChevronRight size={22} className="rotate-180" />}
            </button>
          </form>

          {!showAdminSecret && (
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500">ليس لديك حساب؟ <button onClick={() => navigate('/register')} className="text-[#D4AF37] font-bold hover:underline mr-2">سجل انضمامك الآن</button></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
