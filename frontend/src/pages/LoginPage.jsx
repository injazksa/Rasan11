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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('فشل تسجيل الدخول');
      }

      const data = await response.json();
      localStorage.setItem('rasan_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // التوجيه إلى لوحة المدير للمسؤولين
      if (data.user.role === 'SUPER_ADMIN') {
        navigate('/admin/approvals');
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
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-bold text-[#2C2C2C] tracking-widest">رَسَن</h1>
            <p className="text-[#D4AF37] text-xs mt-2 uppercase tracking-[0.3em]">بوابتك لعالم الفروسية</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 ring-[#D4AF37]/50 text-right" 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                placeholder="كلمة المرور" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 ring-[#D4AF37]/50 text-right" 
              />
            </div>

            <div className="text-left">
              <a href="#" className="text-xs text-gray-400 hover:text-[#D4AF37]">نسيت كلمة المرور؟</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#2C2C2C] text-[#D4AF37] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري التحميل...' : 'دخول الإسطبل'} <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">ليس لديك حساب؟ <a href="/register" className="text-[#D4AF37] font-bold">سجل الآن</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
