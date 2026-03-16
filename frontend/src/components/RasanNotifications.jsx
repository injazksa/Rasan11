import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle, AlertTriangle, CreditCard, Syringe, Info, Trash2 } from 'lucide-react';
import { notificationsAPI, getCurrentUser } from '../services/api.js';
import { connectSocket, onNotification, offNotification } from '../services/socket.js';

const RasanNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  // جلب الإشعارات من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationsAPI.getNotifications();
        setNotifications(response.data || []);
      } catch (error) {
        console.error('خطأ في جلب الإشعارات:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
      
      // الاتصال بـ Socket للإشعارات الحية
      connectSocket(user.id);
      
      // الاستماع للإشعارات الجديدة
      onNotification((newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        // تشغيل صوت تنبيه بسيط إذا أردت
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Audio play blocked'));
      });
    }

    return () => {
      offNotification();
    };
  }, [user]);

  const getIcon = (type) => {
    switch (type) {
      case 'payment': return <CreditCard className="text-[#D4AF37]" size={20} />;
      case 'medical': return <Syringe className="text-blue-500" size={20} />;
      case 'alert': return <AlertTriangle className="text-red-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-orange-500" size={20} />;
      case 'info': return <Info className="text-blue-400" size={20} />;
      default: return <Bell className="text-gray-400" size={20} />;
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعار:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#FBFBFB] to-white rounded-[2rem] shadow-2xl border border-[#D4AF37]/20 overflow-hidden font-serif">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2C2C2C] p-8 flex justify-between items-center text-white border-b border-[#D4AF37]/30">
        <div className="flex items-center gap-4">
          <div className="bg-[#D4AF37]/20 p-3 rounded-full">
            <BellRing className="text-[#D4AF37]" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-wide">تنبيهات رَسَن</h2>
            <p className="text-[#D4AF37]/70 text-sm mt-1">منصة الفرسان الملكية</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="bg-gradient-to-r from-[#D4AF37] to-yellow-500 text-[#1A1A1A] text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-[#D4AF37]/30">
            {unreadCount} جديدة
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37]"></div>
            </div>
            <p className="text-gray-400 mt-4">جاري تحميل التنبيهات الملكية...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-400 text-lg">لا توجد تنبيهات حالياً في سجلاتك.</p>
            <p className="text-gray-300 text-sm mt-2">ستظهر التنبيهات الجديدة هنا فوراً</p>
          </div>
        ) : (
          notifications.map((n, index) => (
            <div 
              key={n.id} 
              className={`p-6 border-b border-[#D4AF37]/10 hover:bg-[#F5F1E8] transition-all duration-300 relative group ${!n.is_read ? 'bg-[#FFFBF0]' : 'bg-white'}`}
            >
              {!n.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#D4AF37] to-yellow-500 rounded-full"></div>
              )}
              
              <div className="flex gap-5 items-start">
                <div className={`mt-1 p-2 rounded-lg ${!n.is_read ? 'bg-[#D4AF37]/15' : 'bg-gray-100'}`}>
                  {getIcon(n.notification_type || n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h4 className="font-bold text-base text-[#2C2C2C]">{n.title}</h4>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {n.created_at ? new Date(n.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : n.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-[#B8962E] text-xs font-bold mt-3 hover:text-[#D4AF37] transition-colors"
                    >
                      ✓ تم القراءة
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteNotification(n.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-700"
                  title="حذف الإشعار"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-6 text-center bg-gradient-to-r from-[#FBFBFB] to-[#F5F1E8] border-t border-[#D4AF37]/10">
          <button className="text-[#B8962E] text-sm font-bold hover:text-[#D4AF37] transition-colors hover:underline">
            مشاهدة جميع النشاطات الملكية →
          </button>
        </div>
      )}
    </div>
  );
};

export default RasanNotifications;
