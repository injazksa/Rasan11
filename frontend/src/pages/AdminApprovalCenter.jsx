import React, { useState } from 'react';
import { UserPlus, Check, X, Globe } from 'lucide-react';

const AdminApprovalCenter = () => {
  const [pendingRequests, setPendingRequests] = useState([
    { id: 'RSN-QA-99', name: 'اتحاد قطر للفروسية', type: 'Federation', country: 'قطر' },
    { id: 'RSN-JO-44', name: 'د. سامي العلي', type: 'Doctor', country: 'الأردن' }
  ]);

  return (
    <div className="p-8 bg-white rounded-[3rem] shadow-xl border border-gray-100 text-right" dir="rtl">
      <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3 text-[#2C2C2C]">
        <UserPlus className="text-[#D4AF37]" /> طلبات بانتظار الموافقة السيادية
      </h2>

      <div className="space-y-4">
        {pendingRequests.map((req) => (
          <div key={req.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                 <Globe size={20} className="text-[#D4AF37]" />
              </div>
              <div>
                <div className="font-bold text-[#2C2C2C]">{req.name}</div>
                <div className="text-[10px] text-gray-400">ID: {req.id} | الدولة: {req.country}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="bg-[#D4AF37] text-white p-2 rounded-full hover:scale-110 transition shadow-lg">
                <Check size={20} />
              </button>
              <button className="bg-white text-red-500 p-2 rounded-full border border-red-100 hover:scale-110 transition shadow-lg">
                <X size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminApprovalCenter;
