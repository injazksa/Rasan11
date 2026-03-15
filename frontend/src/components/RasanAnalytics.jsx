import React from 'react';
import { TrendingUp, Users, Gavel, Wallet, ArrowUpRight, BarChart3, PieChart } from 'lucide-react';

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#D4AF37] transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-[#D4AF37] transition-colors">{icon}</div>
      <span className="text-green-500 text-xs font-bold font-sans">{trend}</span>
    </div>
    <div className="text-gray-400 text-xs uppercase tracking-tighter mb-1">{title}</div>
    <div className="text-2xl font-bold text-[#2C2C2C]">{value}</div>
  </div>
);

const RasanAnalytics = () => {
  const revenueData = [
    { source: 'مبيعات المتجر', amount: 25400, color: 'bg-[#D4AF37]' },
    { source: 'عمولات المزادات', amount: 12850, color: 'bg-[#2C2C2C]' },
    { source: 'إعلانات مميزة', amount: 5600, color: 'bg-gray-400' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 font-serif">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#2C2C2C] mb-2">تقرير السيادة المالية</h1>
            <p className="text-gray-400 italic font-sans text-sm tracking-widest uppercase">Rasan Financial Empire Monitor</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase mb-1">صافي أرباح الشهر الحالي</div>
            <div className="text-4xl font-bold text-[#D4AF37] tracking-tighter">$43,850.00</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="المستخدمين الجدد" value="+1,240" icon={<Users />} trend="+12%" />
          <StatCard title="المزادات النشطة" value="48" icon={<Gavel />} trend="+5%" />
          <StatCard title="إجمالي المبيعات" value="$128K" icon={<TrendingUp />} trend="+22%" />
          <StatCard title="محفظة المنصة" value="$15.4K" icon={<Wallet />} trend="+8%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 relative overflow-hidden">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#D4AF37]" /> تحليل تدفق الإيرادات
            </h3>
            <div className="h-64 flex items-end justify-between gap-4">
              {[60, 80, 45, 90, 70, 100, 85].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-[#FAF6E9] border-t-4 border-[#D4AF37] rounded-t-xl transition-all duration-1000" 
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-[10px] text-gray-400 font-sans">Day {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Distribution */}
          <div className="bg-[#2C2C2C] p-8 rounded-[3rem] text-white shadow-2xl relative">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-[#D4AF37]">
              <PieChart size={20} /> حصص الأرباح
            </h3>
            <div className="space-y-6">
              {revenueData.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.source}</span>
                    <span className="font-bold">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-[#D4AF37]`} style={{ width: `${(item.amount / 43850) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-sans tracking-widest">تصدير تقرير PDF</span>
              <ArrowUpRight className="text-[#D4AF37]" size={16} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RasanAnalytics;
