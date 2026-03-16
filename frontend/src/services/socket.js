import { io } from 'socket.io-client';

// تحديد عنوان الـ Backend
// في الإنتاج، نستخدم نفس الدومين، وفي التطوير نستخدم localhost:5000
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');

const socket = io(SOCKET_URL, {
  autoConnect: false, // لا يتصل تلقائياً، نتصل عند تسجيل الدخول
  transports: ['websocket', 'polling'], // ضمان التوافق مع Render
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// دالة للاتصال بالـ Socket مع تمرير معرف المستخدم
export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit('join', userId);
    console.log(`🔌 محاولة الاتصال بـ Socket للمستخدم: ${userId}`);
  }
};

// دالة لقطع الاتصال
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('🔌 تم قطع الاتصال بـ Socket');
  }
};

// الاستماع للإشعارات
export const onNotification = (callback) => {
  socket.on('notification', (data) => {
    console.log('🔔 إشعار جديد مستلم:', data);
    callback(data);
  });
};

// إزالة الاستماع
export const offNotification = () => {
  socket.off('notification');
};

export default socket;
