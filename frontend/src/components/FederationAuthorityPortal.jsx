import React from 'react';
import { ShieldAlert, Gavel, Bell, MessageSquare, CreditCard, LayoutDashboard } from 'lucide-react';

const NavItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition ${active ? 'bg-[#D4AF37] text-[#2C2C2C]' : 'hover:bg-white/5 text-gray-400'}`}>
    {icon} <span className="text-sm font-bold">{label}</span>
  </div>
);

const FederationAuthorityPortal = () => {
  return (
    <div className="min-h-screen bg-[#F4F1EA] flex font-serif">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1A1A1A] p-6 text-white border-l-4 border-[#D4AF37]">
        <div className="mb-10 text-[#D4AF37] font-serif font-bold text-xl uppercase tracking-widest">
          سلطة الاتحاد الملكي
        </div>
        <nav className="space-y-2">
          <NavItem icon={<ShieldAlert />} label="الرقابة والعقوبات" active />
          <NavItem icon={<Bell />} label="إرسال تعميمات للملاك" />
          <NavItem icon={<LayoutDashboard />} label="نشر محتوى السباقات" />
          <NavItem icon={<CreditCard />} label="رسوم التسجيل والغرامات" />
          <NavItem icon={<MessageSquare />} label="الاتصال الدبلوماسي (اتحادات)" />
        </nav>
      </aside>

      <main className="flex-1 p-10">
        {/* Penalties Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border-t-8 border-red-700">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-700">
               <Gavel size={24} /> لوحة إنفاذ العقوبات
            </h3>
            <div className="space-y-4">
               <input type="text" placeholder="البحث عن ID (خيل/مالك)..." className="w-full p-3 bg-gray-50 rounded-xl border" />
               <div className="flex gap-2">
                  <button className="flex-1 bg-red-700 text-white py-3 rounded-xl font-bold hover:bg-red-800 transition">حظر نهائي</button>
                  <button className="flex-1 bg-[#2C2C2C] text-white py-3 rounded-xl font-bold">فرض غرامة مالية</button>
               </div>
            </div>
          </div>

          {/* Diplomatic Communication */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border-t-8 border-[#D4AF37]">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#D4AF37]">
               <MessageSquare size={24} /> القناة الدبلوماسية الرسمية
            </h3>
            <div className="p-4 bg-[#FAF6E9] rounded-2xl mb-4 text-xs italic">
               "طلب استعلام عن الحصان (RSN-55) للمشاركة في بطولة دولية..."
            </div>
            <button className="w-full py-3 border-2 border-[#D4AF37] text-[#D4AF37] rounded-xl font-bold hover:bg-[#D4AF37] hover:text-white transition">
               فتح مراسلة مع اتحاد دولة أخرى
            </button>
          </div>
        </div>

        {/* Content Publishing */}
        <div className="bg-white p-8 rounded-[3rem] shadow-lg">
           <h3 className="font-bold mb-4 text-lg">نشر تحديثات الميدان</h3>
           <textarea className="w-full h-32 p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 ring-[#D4AF37]" placeholder="اكتب تفاصيل السباق أو التعليمات الجديدة هنا..."></textarea>
           <div className="flex justify-between mt-4">
              <div className="flex gap-2">
                 <button className="p-3 bg-gray-100 rounded-full text-gray-500 hover:text-[#D4AF37] transition">📹 فيديو</button>
                 <button className="p-3 bg-gray-100 rounded-full text-gray-500 hover:text-[#D4AF37] transition">🌐 موقع</button>
              </div>
              <button className="bg-[#D4AF37] text-[#2C2C2C] px-10 py-2 rounded-full font-bold shadow-lg">نشر للعموم</button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default FederationAuthorityPortal;
