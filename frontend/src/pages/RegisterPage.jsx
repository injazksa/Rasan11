import React from 'react';

const RoleCard = ({ label, active }) => (
  <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center ${active ? 'border-[#D4AF37] bg-[#FAF6E9]' : 'border-gray-100 bg-gray-50'}`}>
    <span className={`text-xs font-bold ${active ? 'text-[#D4AF37]' : 'text-gray-500'}`}>{label}</span>
  </div>
);

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/3 bg-[#2C2C2C] p-10 text-[#D4AF37] flex flex-col justify-center border-l-8 border-[#D4AF37]">
          <h2 className="text-3xl font-serif mb-4">انضم للنخبة</h2>
          <p className="text-xs leading-relaxed opacity-70 uppercase tracking-widest">كن جزءاً من أكبر نظام رقمي للفروسية في العالم.</p>
        </div>

        <div className="md:w-2/3 p-12">
          <h3 className="text-xl font-bold mb-8 text-[#2C2C2C] text-right">إنشاء حساب جديد</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <RoleCard label="مالك خيل" active />
            <RoleCard label="اتحاد رسمي" />
            <RoleCard label="طبيب معتمد" />
            <RoleCard label="تاجر معدات" />
          </div>
          <form className="space-y-4">
            <input type="text" placeholder="الاسم الكامل" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 ring-[#D4AF37]/20 text-right" />
            <input type="email" placeholder="البريد الإلكتروني" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 ring-[#D4AF37]/20 text-right" />
            <input type="password" placeholder="كلمة المرور" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 ring-[#D4AF37]/20 text-right" />
            <button className="w-full bg-[#D4AF37] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#B8962E]">تأكيد الانضمام</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
