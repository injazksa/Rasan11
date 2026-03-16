import React, { useState, useEffect } from 'react';
import { Lock, ChevronRight, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  useEffect(() => {
    // التحقق من صحة الرابط
    if (!token || !userId) {
      setError('الرابط غير صحيح أو منتهي الصلاحية');
      setTokenValid(false);
    }
  }, [token, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!newPassword || !confirmPassword) {
      setError('يرجى ملء جميع الحقول');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        userId,
        newPassword
      });

      setSuccess(true);
      setMessage('تم تحديث كلمة المرور بنجاح! سيتم تحويلك إلى صفحة الدخول...');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في تحديث كلمة المرور. يرجى المحاولة مرة أخرى.');
      setTokenValid(false);
    } finally {
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
              <Lock className="w-12 h-12 text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-serif text-white mb-2">إعادة تعيين كلمة المرور</h2>
            <p className="text-gray-400 text-sm">أدخل كلمة المرور الجديدة لحسابك</p>
          </div>

          {!tokenValid && !success && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center flex items-center gap-2 justify-center">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm text-center flex items-center gap-2 justify-center">
              <CheckCircle size={18} />
              {message}
            </div>
          )}

          {error && !success && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center flex items-center gap-2 justify-center">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {tokenValid && !success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mr-2">
                  كلمة المرور الجديدة
                </label>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="أدخل كلمة المرور الجديدة"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full p-4 pr-14 bg-[#252525] rounded-2xl border border-white/5 outline-none focus:border-[#D4AF37]/50 text-white transition-all text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mr-2">
                  تأكيد كلمة المرور
                </label>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full p-4 pr-14 bg-[#252525] rounded-2xl border border-white/5 outline-none focus:border-[#D4AF37]/50 text-white transition-all text-right"
                  />
                </div>
              </div>

              <div className="bg-[#252525] p-4 rounded-2xl border border-[#D4AF37]/20">
                <p className="text-xs text-gray-400 mb-2">متطلبات كلمة المرور:</p>
                <ul className="space-y-1 text-xs text-gray-500">
                  <li className={newPassword.length >= 6 ? 'text-green-400' : ''}>
                    ✓ 6 أحرف على الأقل
                  </li>
                  <li className={newPassword === confirmPassword && newPassword ? 'text-green-400' : ''}>
                    ✓ تطابق كلمات المرور
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || !tokenValid}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black py-5 rounded-2xl font-bold shadow-xl shadow-[#D4AF37]/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                {!loading && <ChevronRight size={20} className="rotate-180" />}
              </button>
            </form>
          )}

          {!tokenValid && (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">الرابط غير صحيح أو منتهي الصلاحية</p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-[#D4AF37] hover:text-[#B8962E] transition-colors font-bold"
              >
                طلب رابط جديد
              </button>
            </div>
          )}

          {success && (
            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowRight size={16} />
                العودة لتسجيل الدخول
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
