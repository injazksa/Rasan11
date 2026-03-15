import React, { useState } from 'react';
import { Gavel, Clock, TrendingUp, Trophy } from 'lucide-react';

const RasanAuction = () => {
  const [bid, setBid] = useState(12000);

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 font-serif">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="md:flex">
          {/* Horse Image */}
          <div className="md:w-1/2 bg-[#2C2C2C] relative">
            <img 
              src="https://images.unsplash.com/photo-1534445867742-43195f401962?auto=format&fit=crop&w=600" 
              className="w-full h-full object-cover opacity-80" 
              alt="Auction Horse"
            />
            <div className="absolute top-6 left-6 bg-[#D4AF37] text-[#2C2C2C] px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg">
              <Clock size={14} className="animate-pulse" /> 04:22:15 متبقي
            </div>
          </div>

          {/* Auction Details */}
          <div className="md:w-1/2 p-10">
            <div className="flex items-center gap-2 text-[#D4AF37] mb-2">
              <Trophy size={18} />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">مزاد ملكي حصري</span>
            </div>
            <h2 className="text-3xl font-bold text-[#2C2C2C] mb-6">الأصيل "رعد"</h2>
            
            <div className="bg-[#FAF6E9] p-6 rounded-3xl mb-8 border border-[#D4AF37]/20">
              <p className="text-gray-500 text-xs mb-1">أعلى مزايدة حالياً</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#2C2C2C]">${bid.toLocaleString()}</span>
                <span className="text-[#B8962E] text-sm">USD</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="أدخل مبلغ المزايدة..." 
                  className="flex-1 p-4 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none"
                />
                <button 
                  onClick={() => setBid(bid + 500)}
                  className="bg-[#2C2C2C] text-[#D4AF37] px-6 rounded-2xl hover:bg-black transition"
                >
                  <TrendingUp size={20} />
                </button>
              </div>
              
              <button className="w-full bg-[#D4AF37] text-[#2C2C2C] py-5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition transform">
                <Gavel size={20} /> وضع مزايدة الآن
              </button>
              <p className="text-[10px] text-gray-400 text-center uppercase tracking-tighter">
                * يتم حجز 5% من المبلغ كتأمين لضمان الجدية (يذهب للمدير في حال التراجع)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RasanAuction;
