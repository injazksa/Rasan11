import React from 'react';

const Marketplace = () => (
  <div className="p-10 bg-[#F9F8F6] text-right" dir="rtl">
    <h2 className="text-3xl font-serif mb-10 text-[#2C2C2C]">تجهيزات الفروسية الملكية</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition">
          <div className="h-48 bg-gray-50 rounded-3xl mb-6 flex items-center justify-center">
            <img src="https://img.icons8.com/ios/100/D4AF37/saddle.png" alt="Saddle" className="opacity-40" />
          </div>
          <h3 className="font-bold text-lg mb-2">سرج جلدي فاخر - نخب أول</h3>
          <div className="flex justify-between items-center mt-6">
            <span className="text-[#D4AF37] font-bold text-xl">$1,200</span>
            <button className="bg-[#2C2C2C] text-white px-6 py-2 rounded-full text-xs font-bold">أضف للسلة</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Marketplace;
