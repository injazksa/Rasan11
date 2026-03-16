# دليل الترقية - من Server.js القديم إلى Server-Enhanced.js الجديد

## 📋 ملخص التغييرات

تم تطوير `server-enhanced.js` ليحتوي على جميع الميزات الجديدة والمحسّنة:

### ✅ الميزات الجديدة المضافة

1. **نظام الإشعارات الحقيقي (Real-Time Notifications)**
   - استخدام Socket.io للإشعارات الفورية
   - حفظ الإشعارات في قاعدة البيانات
   - تتبع الإشعارات المقروءة وغير المقروءة

2. **نظام إعادة تعيين كلمة المرور الآمن**
   - إرسال روابط آمنة عبر البريد الإلكتروني
   - صلاحية الرابط لمدة 24 ساعة
   - تشفير الرابط بـ bcrypt

3. **إدارة المستخدمين المتقدمة**
   - حظر وفك حظر المستخدمين
   - تغيير كلمات المرور من اللوحة
   - تصفية وبحث متقدم
   - اختيار متعدد (Bulk Actions)

4. **سجلات التدقيق (Audit Logs)**
   - تسجيل جميع إجراءات المدير
   - حفظ عنوان IP ومعلومات الجهاز
   - تتبع التغييرات على البيانات

5. **مسارات API جديدة**
   - `/api/admin/users` - جلب المستخدمين مع التصفية
   - `/api/admin/user/:userId/block` - حظر مستخدم
   - `/api/admin/user/:userId/unblock` - فك حظر
   - `/api/auth/forgot-password` - طلب إعادة تعيين
   - `/api/auth/reset-password` - تعيين كلمة جديدة
   - `/api/notifications` - جلب الإشعارات
   - وأكثر...

---

## 🔄 خطوات الترقية

### الخطوة 1: النسخ الاحتياطي
```bash
# احفظ نسخة من الملف القديم
cp server.js server.js.backup
```

### الخطوة 2: تثبيت المكتبات الجديدة
```bash
# تثبيت Socket.io إذا لم تكن مثبتة
npm install socket.io

# تثبيت crypto (عادة مثبت مع Node.js)
npm install
```

### الخطوة 3: استبدال Server.js

#### الخيار A: استخدام server-enhanced.js مباشرة
```bash
# انسخ الملف الجديد
cp server-enhanced.js server.js

# أو عدّل package.json لاستخدام الملف الجديد
# في package.json، غيّر:
# "start": "node server.js"
# إلى:
# "start": "node server-enhanced.js"
```

#### الخيار B: دمج التغييرات يدويًا
إذا كان لديك تعديلات مخصصة على server.js، قم بـ:

1. افتح `server.js` و `server-enhanced.js` جنباً إلى جنب
2. أضف الاستيرادات الجديدة:
```javascript
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import crypto from 'crypto';
```

3. غيّر إنشاء الخادم:
```javascript
// من:
app.listen(PORT, () => { ... });

// إلى:
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

httpServer.listen(PORT, () => { ... });
```

4. أضف معالج Socket.io:
```javascript
const connectedUsers = new Map();

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
  });
  
  socket.on('disconnect', () => {
    for (let [userId, socketId] of connectedUsers) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});
```

5. أضف دالة إرسال الإشعارات:
```javascript
const sendRealTimeNotification = async (userId, notification) => {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES ($1, $2, $3, $4, $5)',
      [userId, notification.title, notification.message, notification.type || 'info', false]
    );

    const socketId = connectedUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit('notification', notification);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
```

6. أضف المسارات الجديدة (انظر server-enhanced.js للتفاصيل)

### الخطوة 4: تحديث متغيرات البيئة

تأكد من وجود هذه المتغيرات في `.env`:
```bash
# البريد الإلكتروني
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# الواجهة الأمامية (لروابط إعادة التعيين)
FRONTEND_URL=http://localhost:5173
# أو في الإنتاج:
FRONTEND_URL=https://your-domain.com

# JWT
JWT_SECRET=your-secret-key

# قاعدة البيانات
DATABASE_URL=postgresql://user:password@localhost/rasan
```

### الخطوة 5: تحديث الواجهة الأمامية

#### أضف صفحة إعادة تعيين كلمة المرور
انسخ `ResetPasswordPage.jsx` إلى `frontend/src/pages/`

#### أضف لوحة التحكم الجديدة
انسخ `AdminMasterDashboard.jsx` إلى `frontend/src/components/`

#### حدّث App.jsx
```javascript
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminMasterDashboard from './components/AdminMasterDashboard';

// أضف المسارات:
<Route path="/reset-password" element={<ResetPasswordPage />} />
<Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminMasterDashboard />
    </ProtectedRoute>
  } 
/>
```

#### حدّث ForgotPasswordPage.jsx
```javascript
import axios from 'axios';

// غيّر handleSubmit لاستخدام API الحقيقي:
const response = await axios.post('/api/auth/forgot-password', { email });
```

#### حدّث Navigation.jsx
أضف رابط لوحة التحكم الجديدة:
```javascript
const adminItems = [
  { label: 'لوحة التحكم المطلقة', path: '/admin/dashboard', roles: ['admin'] },
  // ...
];
```

### الخطوة 6: اختبار التطبيق

#### اختبر في بيئة التطوير
```bash
# ابدأ الخادم
npm start

# في نافذة أخرى، ابدأ الواجهة الأمامية
cd frontend
npm run dev
```

#### اختبر المسارات الجديدة
```bash
# اختبر إعادة تعيين كلمة المرور
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# اختبر جلب المستخدمين
curl -X GET "http://localhost:5000/api/admin/users?role=owner" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### اختبر الإشعارات الحقيقية
1. افتح لوحة التحكم
2. افتح console المتصفح
3. يجب أن ترى رسالة: "مستخدم متصل" في سجل الخادم

### الخطوة 7: النشر على الإنتاج

```bash
# بناء الواجهة الأمامية
cd frontend
npm run build
cd ..

# تأكد من متغيرات البيئة
# حدّث FRONTEND_URL في .env إلى عنوان الإنتاج

# ابدأ الخادم
npm start
```

---

## 🔍 التحقق من النجاح

بعد الترقية، تأكد من:

### ✅ الخادم
- [ ] يبدأ الخادم بدون أخطاء
- [ ] يظهر: "Server running on port 5000"
- [ ] يظهر: "Real-time notifications enabled via Socket.io"

### ✅ الواجهة الأمامية
- [ ] تظهر لوحة التحكم الجديدة
- [ ] يعمل البحث والتصفية
- [ ] تظهر الإشعارات في الوقت الفعلي

### ✅ المسارات الجديدة
- [ ] `/api/auth/forgot-password` يعمل
- [ ] `/api/auth/reset-password` يعمل
- [ ] `/api/admin/users` يعمل
- [ ] `/api/admin/user/:id/block` يعمل
- [ ] `/api/notifications` يعمل

### ✅ البريد الإلكتروني
- [ ] يتم إرسال رسائل إعادة التعيين
- [ ] يتم إرسال رسائل الموافقة
- [ ] يتم إرسال رسائل الرفض

---

## 🚨 استكشاف الأخطاء

### المشكلة: "Socket.io not found"
```bash
npm install socket.io
```

### المشكلة: "Cannot find module 'crypto'"
```bash
# crypto مثبت مع Node.js، لكن تأكد من النسخة:
node --version  # يجب أن تكون 18+
```

### المشكلة: "Email not sending"
تحقق من:
1. متغيرات البيئة صحيحة
2. كلمة المرور التطبيق صحيحة (إذا كنت تستخدم Gmail)
3. السماح بالتطبيقات الأقل أماناً (Gmail)

### المشكلة: "Database connection error"
```bash
# تأكد من أن قاعدة البيانات تعمل
psql -U user -d rasan -c "SELECT 1"
```

---

## 📊 مقارنة الإصدارات

| الميزة | server.js القديم | server-enhanced.js الجديد |
|-------|-----------------|------------------------|
| الإشعارات | وهمية | حقيقية (Socket.io) |
| إعادة تعيين كلمة المرور | وهمية | حقيقية (Email) |
| إدارة المستخدمين | أساسية | متقدمة |
| سجلات التدقيق | غير موجودة | موجودة |
| حظر المستخدمين | بسيط | متقدم |
| البحث والتصفية | محدود | شامل |
| Bulk Actions | غير موجود | موجود |

---

## 📞 الدعم

إذا واجهت مشكلة:

1. تحقق من سجلات الخادم
2. تحقق من سجلات المتصفح (F12)
3. تحقق من قاعدة البيانات
4. راجع هذا الدليل

---

**آخر تحديث**: 16 مارس 2026
**الإصدار**: 1.0.0
