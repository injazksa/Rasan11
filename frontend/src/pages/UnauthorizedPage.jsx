import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      {/* Royal Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px]"></div>

      <div className="max-w-2xl w-full relative z-10 text-center">
        <div className="mb-8 flex justify-center">
          <ShieldAlert size={80} className="text-[#D4AF37]" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">وصول مرفوع</h1>
        <p className="text-gray-400 text-lg mb-8">
          عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة. يرجى التواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/race-arena')}
            className="bg-[#D4AF37] text-black px-8 py-4 rounded-2xl font-bold hover:bg-[#B8962E] transition flex items-center gap-2"
          >
            العودة إلى الصفحة الرئيسية
            <ArrowRight size={20} className="rotate-180" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition border border-white/20"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
