import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle, AlertTriangle, CreditCard, Syringe, Loader2, X, Trash2 } from 'lucide-react';
import { notificationsAPI, handleApiError } from '../services/api';

const RasanNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // تحميل الإشعارات عند تحميل المكون
  useEffect(() => {
    fetchNotifications();
    
    // تحديث الإشعارات كل 30 ثانية
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setError('');
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data || []);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      // تحديث الإشعارات محلياً
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      // حذف الإشعار محلياً
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="text-[#D4AF37]" size={18} />;
      case 'medical':
        return <Syringe className="text-blue-500" size={18} />;
      case 'alert':
        return <AlertTriangle className="text-red-500" size={18} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={18} />;
      default:
        return <Bell className="text-[#D4AF37]" size={18} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden font-serif">
        <div className="bg-[#2C2C2C] p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <BellRing className="text-[#D4AF37]" size={24} />
            <h2 className="text-xl font-bold tracking-wide">تنبيهات رَسَن</h2>
          </div>
        </div>
        <div className="p-8 flex items-center justify-center min-h-[300px]">
          <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden font-serif">
      {/* Header */}
      <div className="bg-[#2C2C2C] p-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <BellRing className="text-[#D4AF37]" size={24} />
          <h2 className="text-xl font-bold tracking-wide">تنبيهات رَسَن</h2>
        </div>
        {unreadCount > 0 && (
          <span className="bg-[#D4AF37] text-[#2C2C2C] text-[10px] font-bold px-2 py-1 rounded-full">
            {unreadCount} جديدة
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-[500px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={32} className="mx-auto mb-4 opacity-30" />
            <p>لا توجد إشعارات حالياً</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 border-b border-gray-50 hover:bg-[#FAF6E9] transition-colors cursor-pointer relative group ${
                n.is_read ? '' : 'bg-[#FCFBF8]'
              }`}
              onClick={() => !n.is_read && handleMarkAsRead(n.id)}
            >
              {!n.is_read && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-10 bg-[#D4AF37] rounded-full"></div>
              )}

              <div className="flex gap-4 justify-between items-start">
                <div className="mt-1 flex-shrink-0">
                  {getNotificationIcon(n.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-[#2C2C2C]">{n.title}</h4>
                    <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">
                      {new Date(n.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(n.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg flex-shrink-0"
                  title="حذف الإشعار"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center bg-gray-50 border-t border-gray-100">
        <button
          onClick={fetchNotifications}
          className="text-[#B8962E] text-xs font-bold hover:underline transition-colors"
        >
          تحديث الإشعارات
        </button>
      </div>
    </div>
  );
};

export default RasanNotifications;
