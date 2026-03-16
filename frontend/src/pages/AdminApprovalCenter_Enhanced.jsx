import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Globe, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { adminAPI, handleApiError } from '../services/api';

const AdminApprovalCenter = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchApprovals();
    // تحديث الطلبات كل 30 ثانية
    const interval = setInterval(fetchApprovals, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchApprovals = async () => {
    try {
      setError('');
      const response = await adminAPI.getApprovals();
      setPendingRequests(response.data || []);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      console.error('Error fetching approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req) => {
    setProcessingId(req.id);
    setError('');
    setSuccessMessage('');

    try {
      // التحقق من البيانات المطلوبة
      if (!req.id || !req.email || !req.full_name) {
        throw new Error('بيانات المستخدم غير كاملة');
      }

      await adminAPI.approveUser({
        userId: req.id,
        userEmail: req.email,
        userName: req.full_name,
        userRole: req.role || 'owner',
        country: req.country || 'Unknown',
      });

      // إزالة المستخدم من قائمة الانتظار
      setPendingRequests(prev => prev.filter(item => item.id !== req.id));
      setSuccessMessage(`✅ تم اعتماد ${req.full_name} وإرسال رسالة الترحيب الملكية بنجاح.`);

      // إخفاء رسالة النجاح بعد 3 ثوان
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(`❌ خطأ في اعتماد المستخدم: ${apiError.message}`);
      console.error('Error approving user:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req) => {
    const reason = prompt('أدخل سبب الرفض:');
    if (!reason) return;

    setProcessingId(req.id);
    setError('');
    setSuccessMessage('');

    try {
      await adminAPI.rejectUser({
        userId: req.id,
        reason,
      });

      // إزالة المستخدم من قائمة الانتظار
      setPendingRequests(prev => prev.filter(item => item.id !== req.id));
      setSuccessMessage(`✅ تم رفض طلب ${req.full_name} وإرسال إشعار له.`);

      // إخفاء رسالة النجاح بعد 3 ثوان
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(`❌ خطأ في رفض المستخدم: ${apiError.message}`);
      console.error('Error rejecting user:', err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-4" size={48} />
          <p className="text-gray-400">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-[3rem] shadow-xl border border-gray-100 text-right" dir="rtl">
      <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3 text-[#2C2C2C]">
        <UserPlus className="text-[#D4AF37]" /> طلبات بانتظار الموافقة السيادية
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3 text-green-700">
          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Requests List */}
      {pendingRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-serif italic">
          <CheckCircle size={48} className="mx-auto mb-4 opacity-30 text-[#D4AF37]" />
          <p>لا توجد طلبات معلقة حالياً. الميدان تحت السيطرة.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 hover:border-[#D4AF37] transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Globe size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <div className="font-bold text-[#2C2C2C]">{req.full_name}</div>
                  <div className="text-[10px] text-gray-400">
                    ID: {req.id} | البريد: {req.email} | الدولة: {req.country || 'N/A'}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    الدور: {req.role || 'owner'} | التاريخ: {new Date(req.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleApprove(req)}
                  disabled={processingId === req.id}
                  className="bg-[#D4AF37] text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                  title="الموافقة على الطلب"
                >
                  {processingId === req.id ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Check size={20} />
                  )}
                </button>
                <button
                  onClick={() => handleReject(req)}
                  disabled={processingId === req.id}
                  className="bg-white text-red-500 p-3 rounded-full border border-red-100 hover:scale-110 transition-transform shadow-lg disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                  title="رفض الطلب"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto-refresh Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-xs text-center">
        ℹ️ يتم تحديث الطلبات تلقائياً كل 30 ثانية
      </div>
    </div>
  );
};

export default AdminApprovalCenter;
