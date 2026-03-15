import React from 'react';
import { Trophy, Calendar, MapPin, CheckCircle } from 'lucide-react';

const RaceArena = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 font-serif text-right" dir="rtl">
      <header className="mb-12 border-b border-gray-100 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-[#2C2C2C]">ميدان السباق</h1>
          <p className="text-[#D4AF37] italic uppercase tracking-widest text-xs mt-2">البطولات الرسمية والمعتمدة</p>
        </div>
        <div className="bg-[#FAF6E9] p-4 rounded-2xl border border-[#D4AF37]/20 flex items-center gap-3">
          <Trophy className="text-[#D4AF37]" size={24} />
          <span className="text-sm font-bold">نقاطك في الميدان: 1,450</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden group">
          <div className="h-64 bg-[url('https://images.unsplash.com/photo-1598974357851-98166a9d9b5b?auto=format&fit=crop&w=800')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700"></div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-[#2C2C2C]">كأس رَسَن الدولي للجمال</h2>
              <span className="bg-[#D4AF37] text-white px-4 py-1 rounded-full text-[10px] font-bold">تسجيل مفتوح</span>
            </div>
            <div className="flex gap-6 text-gray-400 text-xs mb-8">
              <span className="flex items-center gap-1"><Calendar size={14}/> 20 رمضان 1447</span>
              <span className="flex items-center gap-1"><MapPin size={14}/> إسطبلات رَسَن الملكية</span>
            </div>
            <button className="w-full bg-[#2C2C2C] text-[#D4AF37] py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg flex justify-center items-center gap-2">
              <CheckCircle size={18} /> تسجيل خيلك في البطولة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceArena;
