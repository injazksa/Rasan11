import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Globe, Loader2 } from 'lucide-react';
import axios from 'axios';

const AdminApprovalCenter = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/approvals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req) => {
    setProcessingId(req.id);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/approve-user', {
        userId: req.id,
        userEmail: req.email || 'user@example.com', // In real app, this comes from DB
        userName: req.name,
        userRole: req.type,
        country: req.country
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from list after success
      setPendingRequests(prev => prev.filter(item => item.id !== req.id));
      alert(`تم اعتماد ${req.name} وإرسال رسالة الترحيب الملكية بنجاح.`);
    } catch (error) {
      console.error('Error approving user:', error);
      alert('حدث خطأ أثناء عملية الاعتماد.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-[3rem] shadow-xl border border-gray-100 text-right" dir="rtl">
      <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3 text-[#2C2C2C]">
        <UserPlus className="text-[#D4AF37]" /> طلبات بانتظار الموافقة السيادية
      </h2>

      {pendingRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-serif italic">
          لا توجد طلبات معلقة حالياً. الميدان تحت السيطرة.
        </div>
      ) : (
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
                <button 
                  onClick={() => handleApprove(req)}
                  disabled={processingId === req.id}
                  className="bg-[#D4AF37] text-white p-2 rounded-full hover:scale-110 transition shadow-lg disabled:opacity-50"
                >
                  {processingId === req.id ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                </button>
                <button className="bg-white text-red-500 p-2 rounded-full border border-red-100 hover:scale-110 transition shadow-lg">
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApprovalCenter;
