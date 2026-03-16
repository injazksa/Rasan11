import React, { useState } from 'react';
import { Mail, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Mock API call for password reset
      setTimeout(() => {
        setMessage('إذا كان البريد مسجلاً لدينا، فستصلك تعليمات استعادة كلمة المرور قريباً.');
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-10">
            <div className="inline-block p-4 rounded-full bg-[#D4AF37]/10 mb-6">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030900418/NqhgRwKrGgFGgVhB.png"
                alt="Rasan Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <h2 className="text-3xl font-serif text-white mb-2">استعادة الوصول</h2>
            <p className="text-gray-400 text-sm">أدخل بريدك الإلكتروني لإرسال رابط الاستعادة</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mr-2">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-4 pr-14 bg-[#252525] rounded-2xl border border-white/5 outline-none focus:border-[#D4AF37]/50 text-white transition-all text-right" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black py-5 rounded-2xl font-bold shadow-xl shadow-[#D4AF37]/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              {!loading && <ChevronRight size={20} className="rotate-180" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowRight size={16} />
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
