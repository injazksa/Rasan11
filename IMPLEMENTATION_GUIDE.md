# دليل التطبيق العملي للإصلاحات والتحديثات

## 📌 نظرة عامة

هذا الدليل يشرح كيفية تطبيق جميع الإصلاحات والتحديثات على مشروع Rasan11 بشكل صحيح وآمن.

---

## 🔧 الخطوة 1: تحديث ملف App.jsx

استبدل المكونات القديمة بالمكونات الجديدة:

```javascript
// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RaceArena from './pages/RaceArena';
import Marketplace from './pages/Marketplace';
import AdminApprovalCenter from './pages/AdminApprovalCenter_Enhanced'; // ✅ تحديث
import HorsePassportPage from './pages/HorsePassportPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Import Components as Pages
import GodEyeDashboard from './components/GodEyeDashboard';
import AdminMasterDashboard from './components/AdminMasterDashboard_Complete'; // ✅ تحديث
import RasanAnalytics from './components/RasanAnalytics';
import RasanAuction from './components/RasanAuction';
import RasanCheckout from './components/RasanCheckout';
import RasanNotifications from './components/RasanNotifications_Enhanced'; // ✅ تحديث
import FederationAuthorityPortal from './components/FederationAuthorityPortal';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Import Navigation and ProtectedRoute
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen font-sans bg-[#FBFBFB]" dir="rtl">
        <Navigation />
        <Routes>
          {/* Auth Routes - No Protection */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Public Routes */}
          <Route path="/passport/:id" element={<HorsePassportPage />} />
          
          {/* Protected Main App Routes */}
          <Route 
            path="/race-arena" 
            element={
              <ProtectedRoute>
                <RaceArena />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auction" 
            element={
              <ProtectedRoute>
                <RasanAuction />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <RasanCheckout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <RasanNotifications />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Only Routes */}
          <Route 
            path="/admin/approvals" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminApprovalCenter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/federation" 
            element={
              <ProtectedRoute requiredRole="federation">
                <FederationAuthorityPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute requiredRole="admin">
                <RasanAnalytics />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/rasan-master-control" 
            element={
              <ProtectedRoute requiredRole="admin">
                <GodEyeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminMasterDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
```

---

## 🔧 الخطوة 2: تحديث ملف server.js

أضف الأكواد التالية إلى `server.js`:

### 2.1 إضافة نقطة النهاية للحصول على المستخدمين (إذا لم تكن موجودة)

```javascript
// تحقق من أن هذه النقطة موجودة في server.js
app.get('/api/admin/users', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { role, status, country, search } = req.query;
  
  try {
    let query = 'SELECT id, username, email, role, full_name, country, status, last_login, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = $' + (params.length + 1);
      params.push(role);
    }
    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }
    if (country) {
      query += ' AND country = $' + (params.length + 1);
      params.push(country);
    }
    if (search) {
      query += ' AND (full_name ILIKE $' + (params.length + 1) + ' OR email ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب المستخدمين.' });
  }
});
```

### 2.2 إضافة نقطة النهاية لحذف الإشعار

```javascript
// أضف هذه النقطة إلى server.js
app.delete('/api/notifications/:notificationId', checkCountryIsolation, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [req.params.notificationId, req.user.id]
    );
    res.json({ message: 'تم حذف الإشعار' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف الإشعار.' });
  }
});
```

### 2.3 تحديث نقطة النهاية approve-user

تأكد من أن نقطة النهاية `/api/admin/approve-user` تحتوي على الكود التالي:

```javascript
app.post('/api/admin/approve-user', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { userId, userEmail, userName, userRole, country } = req.body;
  
  try {
    // التحقق من البيانات المطلوبة
    if (!userId || !userEmail || !userName) {
      return res.status(400).json({ message: 'بيانات غير كاملة' });
    }

    // تحديث حالة المستخدم
    await db.query('UPDATE users SET status = $1 WHERE id = $2', ['active', userId]);
    
    // إرسال بريد الترحيب
    await sendRoyalAccreditationEmail(userEmail, userName, userRole, country);
    
    // إرسال إشعار حقيقي للمستخدم
    await sendRealTimeNotification(userId, {
      title: 'تم اعتماد حسابك',
      message: `تم اعتماد حسابك بنجاح من قبل مدير النظام. مرحباً بك في منظومة رَسَن!`,
      type: 'success'
    });

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'approve_user', 'users', userId]
    );

    res.json({ message: `تم اعتماد المستخدم ${userName} وإرسال رسالة الترحيب الملكية.` });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'خطأ في اعتماد المستخدم.' });
  }
});
```

---

## 🔧 الخطوة 3: إنشاء مجلد الخدمات (Services)

تأكد من وجود مجلد `frontend/src/services` وأنه يحتوي على ملف `api.js`:

```bash
mkdir -p frontend/src/services
mkdir -p frontend/src/hooks
```

---

## 🔧 الخطوة 4: إنشاء مجلد الـ Hooks

تأكد من وجود مجلد `frontend/src/hooks` وأنه يحتوي على ملف `useAuth.js`.

---

## 🔧 الخطوة 5: تثبيت المتطلبات

```bash
cd frontend
npm install
```

---

## 🔧 الخطوة 6: بناء المشروع

```bash
# بناء الواجهة الأمامية
cd frontend
npm run build

# العودة إلى المجلد الرئيسي
cd ..
```

---

## 🔧 الخطوة 7: تشغيل المشروع

### الطريقة 1: تشغيل محلي (للتطوير)

```bash
# في نافذة أولى - تشغيل الخادم
npm start

# في نافذة ثانية - تشغيل الواجهة الأمامية
cd frontend
npm run dev
```

### الطريقة 2: نشر على Render

```bash
# تأكد من أن ملف render.yaml موجود
# ثم ادفع التحديثات إلى GitHub
git add .
git commit -m "Fix API gaps and improve admin dashboard"
git push origin main
```

---

## ✅ اختبار الإصلاحات

### اختبار 1: صفحة الموافقة على المستخدمين

1. سجل الدخول كمدير
2. اذهب إلى `/admin/approvals`
3. تحقق من أن الطلبات تظهر بشكل صحيح
4. جرب زر الموافقة والرفض
5. تحقق من رسائل النجاح والخطأ

### اختبار 2: الإشعارات

1. اذهب إلى `/notifications`
2. تحقق من أن الإشعارات تحمل من الخادم
3. جرب حذف إشعار
4. جرب تحديث الصفحة - يجب أن تبقى الإشعارات

### اختبار 3: لوحة التحكم

1. سجل الدخول كمدير
2. اذهب إلى `/admin/dashboard`
3. تحقق من أن الإحصائيات تظهر بشكل صحيح
4. جرب البحث والتصفية
5. جرب إجراء على مستخدم

### اختبار 4: تحديث الصفحة

1. سجل الدخول
2. اذهب إلى أي صفحة محمية
3. اضغط F5 لتحديث الصفحة
4. تحقق من أن البيانات تبقى وتحمل بشكل صحيح

---

## 🐛 استكشاف الأخطاء

### المشكلة: "خطأ في الاتصال بالخادم"

**الحل:**
1. تأكد من أن الخادم يعمل
2. تحقق من متغيرات البيئة
3. افتح console وانظر إلى رسالة الخطأ الكاملة

### المشكلة: "لا توجد إشعارات"

**الحل:**
1. تأكد من أن قاعدة البيانات تحتوي على إشعارات
2. تحقق من أن المستخدم لديه إشعارات مرتبطة به
3. افتح Network tab وتحقق من استدعاء API

### المشكلة: "الأزرار لا تستجيب"

**الحل:**
1. افتح console وتحقق من الأخطاء
2. تأكد من أن التوكن محفوظ في localStorage
3. جرب تحديث الصفحة

---

## 📊 قائمة التحقق قبل النشر

- [ ] تم تحديث ملف App.jsx
- [ ] تم تحديث ملف server.js
- [ ] تم إنشاء ملف api.js
- [ ] تم إنشاء ملف useAuth.js
- [ ] تم اختبار صفحة الموافقة
- [ ] تم اختبار الإشعارات
- [ ] تم اختبار لوحة التحكم
- [ ] تم اختبار تحديث الصفحة
- [ ] تم اختبار البحث والتصفية
- [ ] تم اختبار الأزرار والإجراءات

---

## 📝 ملاحظات مهمة

1. **النسخ الاحتياطية:** تأكد من عمل نسخة احتياطية قبل تطبيق التحديثات
2. **الاختبار:** اختبر جميع الميزات قبل النشر
3. **الأداء:** راقب أداء التطبيق بعد التحديثات
4. **الأمان:** تأكد من أن جميع الاستدعاءات محمية بالمصادقة

---

## 🎯 الخطوات التالية

1. تطبيق جميع الإصلاحات
2. اختبار شامل للمشروع
3. نشر على Render
4. مراقبة الأداء والأخطاء
5. جمع ملاحظات المستخدمين

---

**آخر تحديث:** 2026-03-16
**الحالة:** جاهز للتطبيق ✅
