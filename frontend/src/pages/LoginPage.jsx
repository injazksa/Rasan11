import React, { useState } from 'react';
import { Lock, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = window.location.origin.includes('localhost') 
        ? 'http://localhost:5000/api/auth/login' 
        : '/api/auth/login';

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

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#D4AF37]/10">
        <div className="p-10">
          <div className="text-center mb-10">
            <img src="/rasan_logo.png" alt="Rasan Logo" className="w-48 mx-auto mb-4 drop-shadow-2xl" />
            <h1 className="text-3xl font-serif font-bold text-[#2C2C2C] tracking-widest">رَسَن</h1>
            <p className="text-[#D4AF37] text-[10px] mt-1 uppercase tracking-[0.3em] font-bold">السيادة الرقمية للفروسية</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-right animate-pulse">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 pr-12 bg-gray-50 rounded-2xl border border-transparent outline-none focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/10 text-right transition-all" 
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                placeholder="كلمة المرور" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 pr-12 bg-gray-50 rounded-2xl border border-transparent outline-none focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/10 text-right transition-all" 
              />
            </div>

            <div className="text-left">
              <a href="#" className="text-xs text-gray-400 hover:text-[#D4AF37] transition-colors">نسيت كلمة المرور؟</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#2C2C2C] text-[#D4AF37] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري التحقق...' : 'دخول الإسطبل الملكي'} <ChevronRight size={18} className="rotate-180" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">ليس لديك حساب؟ <a href="/register" className="text-[#D4AF37] font-bold hover:underline">سجل انضمامك الآن</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
