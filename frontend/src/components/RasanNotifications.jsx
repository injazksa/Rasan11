import React, { useState } from 'react';
import { Bell, BellRing, CheckCircle, AlertTriangle, CreditCard, Syringe } from 'lucide-react';

const RasanNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'payment',
      title: 'عمولة جديدة',
      message: 'تم تحويل مبلغ $150 عمولة من بيع "سرج ملكي".',
      time: 'منذ دقيقتين',
      status: 'unread',
      icon: <CreditCard className="text-[#D4AF37]" size={18} />
    },
    {
      id: 2,
      type: 'medical',
      title: 'وصفة طبية جاهزة',
      message: 'أصدر الدكتور أحمد وصفة رقمية للحصان "كحيلان". يمكنك الشراء الآن.',
      time: 'منذ ساعة',
      status: 'read',
      icon: <Syringe className="text-blue-500" size={18} />
    },
    {
      id: 3,
      type: 'alert',
      title: 'تنبيه أمن إداري',
      message: 'الاتحاد قام بتعليق أهلية الحصان "صقر" مؤقتاً.',
      time: 'منذ 3 ساعات',
      status: 'unread',
      icon: <AlertTriangle className="text-red-500" size={18} />
    }
  ]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden font-serif">
      {/* Header */}
      <div className="bg-[#2C2C2C] p-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <BellRing className="text-[#D4AF37]" size={24} />
          <h2 className="text-xl font-bold tracking-wide">تنبيهات رَسَن</h2>
        </div>
        <span className="bg-[#D4AF37] text-[#2C2C2C] text-[10px] font-bold px-2 py-1 rounded-full">
          {notifications.filter(n => n.status === 'unread').length} جديدة
        </span>
      </div>

      {/* Notifications List */}
      <div className="max-h-[500px] overflow-y-auto">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`p-5 border-b border-gray-50 hover:bg-[#FAF6E9] transition-colors cursor-pointer relative ${n.status === 'unread' ? 'bg-[#FCFBF8]' : ''}`}
          >
            {n.status === 'unread' && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-10 bg-[#D4AF37] rounded-full"></div>
            )}
            
            <div className="flex gap-4">
              <div className="mt-1">{n.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-[#2C2C2C]">{n.title}</h4>
                  <span className="text-[10px] text-gray-400">{n.time}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 text-center bg-gray-50">
        <button className="text-[#B8962E] text-xs font-bold hover:underline">
          مشاهدة جميع النشاطات الملكية
        </button>
      </div>
    </div>
  );
};

export default RasanNotifications;
