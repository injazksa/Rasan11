# 🛡️ دليل لوحة التحكم السيادية (Sovereign Dashboard)

## 📖 نظرة عامة

لوحة التحكم السيادية هي **مركز قيادة حقيقي** لمنصة رَسَن، تمنح المدير (Super Admin) سلطة مطلقة على جميع جوانب المنصة مع تحديثات حية وفورية (Real-time).

---

## 🚀 المميزات الرئيسية

### 1. **وحدة القيادة المركزية (Command Center)**
- 📊 إحصائيات حية تتحدث كل 30 ثانية
- 👥 عدد المستخدمين النشطين
- 🐴 إجمالي الخيول المسجلة
- 💰 إجمالي المبيعات والإيرادات
- 🏆 عدد المزادات النشطة
- 📦 الطلبات المعلقة

### 2. **فيلق إدارة المستخدمين (User Legion)**
- 🔐 **انتحال الشخصية (Impersonation):** دخول الموقع كأي مستخدم
- 👤 **تغيير الصلاحيات:** تحويل المستخدم من دور لآخر فوراً
- 🚫 **حظر/فك حظر:** تجميد الحسابات مع Force Logout فوري
- 📧 **إرسال رسائل:** تنبيهات بريدية رسمية
- 🔑 **تغيير كلمات المرور:** إعادة تعيين يدوية

### 3. **خزانة التجارة والمزادات (The Vault)**
- ➕ إضافة منتجات جديدة (تظهر فوراً للجميع)
- ✏️ تعديل الأسعار والكميات
- 🗑️ حذف المنتجات
- ⚖️ إدارة النزاعات (إرجاع مبلغ أو تأكيد)

### 4. **الأركان التقنية (System Core)**
- 🔧 **وضع الصيانة:** إغلاق الموقع للجميع ما عدا المدير
- 🛍️ **تفعيل/تعطيل المتجر**
- 🏅 **تفعيل/تعطيل المزادات**
- 📝 **تفعيل/تعطيل التسجيل الجديد**
- 💸 **تعديل نسب العمولات**

### 5. **سجل العمليات السيادي (Global Audit Log)**
- 📋 تسجيل شامل لكل حركة في النظام
- 🔍 البحث والتصفية حسب الإجراء أو المستخدم
- ⏰ طوابع زمنية دقيقة
- 📊 عرض بصيغة شريط إخباري حي

---

## 🔌 التكامل مع Backend

### API Endpoints الرئيسية

#### 1. **الإحصائيات الحية**
```
GET /api/admin/live-stats
Authorization: Bearer {token}

Response:
{
  "total_active_users": 150,
  "total_horses": 320,
  "total_revenue": 45000.50,
  "active_auctions": 12,
  "active_federations": 8,
  "pending_orders": 5,
  "timestamp": "2026-03-16T10:30:00Z"
}
```

#### 2. **انتحال الشخصية**
```
POST /api/admin/impersonate/:userId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "token": "new_jwt_token",
  "message": "أنت الآن تتصفح كـ: اسم المستخدم",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "role": "owner",
    "full_name": "اسم المستخدم"
  }
}
```

#### 3. **تغيير الصلاحيات**
```
POST /api/admin/user/:userId/change-role
Authorization: Bearer {token}

Body:
{
  "role": "federation",
  "reason": "ترقية إلى مدير اتحاد"
}

Response:
{
  "success": true,
  "message": "تم تغيير دور المستخدم إلى: federation"
}
```

#### 4. **حظر المستخدم**
```
POST /api/admin/user/:userId/block
Authorization: Bearer {token}

Body:
{
  "reason": "انتهاك شروط الخدمة"
}

Response:
{
  "success": true,
  "message": "تم حظر المستخدم بنجاح"
}
```

#### 5. **إعدادات النظام**
```
GET /api/admin/system-settings
Authorization: Bearer {token}

PUT /api/admin/system-settings
Authorization: Bearer {token}

Body:
{
  "maintenance_mode": false,
  "store_enabled": true,
  "auction_enabled": true,
  "registration_enabled": true,
  "commission_rate": 5.00
}
```

#### 6. **سجل العمليات**
```
GET /api/admin/audit-logs?limit=100&offset=0&action=BLOCK_USER
Authorization: Bearer {token}

Response:
{
  "logs": [
    {
      "id": 1,
      "admin_id": 1,
      "action": "BLOCK_USER",
      "entity_type": "users",
      "entity_id": 5,
      "target_user_id": 5,
      "details": "حظر المستخدم",
      "created_at": "2026-03-16T10:30:00Z",
      "status": "completed"
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

#### 7. **إضافة منتج**
```
POST /api/admin/marketplace/products
Authorization: Bearer {token}

Body:
{
  "name": "سرج جلدي فاخر",
  "description": "سرج مصنوع من أفضل أنواع الجلد",
  "price": 1200,
  "quantity": 10,
  "category": "معدات",
  "image_url": "https://cloudinary.com/...",
  "requires_prescription": false
}

Response:
{
  "success": true,
  "product": { ... },
  "message": "تم إضافة المنتج بنجاح"
}
```

#### 8. **إدارة النزاعات**
```
POST /api/admin/disputes/:disputeId/resolve
Authorization: Bearer {token}

Body:
{
  "resolution": "إرجاع المبلغ كاملاً",
  "refund_amount": 500.00
}

Response:
{
  "success": true,
  "message": "تم حل النزاع بنجاح"
}
```

---

## 🔌 WebSockets Events

### الأحداث المبثوثة (Emitted Events)

```javascript
// تحديث الإحصائيات الحية
io.emit('liveStatsUpdate', {
  total_active_users: 150,
  total_horses: 320,
  total_revenue: 45000.50,
  timestamp: "2026-03-16T10:30:00Z"
});

// تغيير دور المستخدم
io.emit('userRoleChanged', {
  userId: 5,
  newRole: 'federation',
  message: 'تم تغيير دورك إلى: federation'
});

// حظر المستخدم (Force Logout)
io.emit('forceLogout', {
  userId: 5,
  message: 'حسابك محظور حالياً. السبب: انتهاك شروط الخدمة'
});

// تحديث إعدادات النظام
io.emit('systemSettingsChanged', {
  maintenance_mode: false,
  store_enabled: true,
  auction_enabled: true,
  commission_rate: 5.00,
  timestamp: "2026-03-16T10:30:00Z"
});

// إضافة منتج جديد
io.emit('newProductAdded', {
  product: { ... },
  message: 'تم إضافة منتج جديد: سرج جلدي فاخر'
});

// تحديث منتج
io.emit('productUpdated', {
  productId: 1,
  updates: { price: 1500 },
  message: 'تم تحديث المنتج: سرج جلدي فاخر'
});

// حذف منتج
io.emit('productDeleted', {
  productId: 1,
  message: 'تم حذف المنتج: سرج جلدي فاخر'
});

// تنبيه بث عام
io.emit('broadcast-notification', {
  id: 1,
  title: 'إعلان هام',
  message: 'سيتم إجراء صيانة الموقع غداً',
  type: 'warning',
  timestamp: "2026-03-16T10:30:00Z"
});
```

---

## 📦 جداول قاعدة البيانات الجديدة

### 1. `system_settings`
```sql
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  store_enabled BOOLEAN DEFAULT TRUE,
  auction_enabled BOOLEAN DEFAULT TRUE,
  registration_enabled BOOLEAN DEFAULT TRUE,
  commission_rate DECIMAL(5, 2) DEFAULT 5.00,
  updated_at TIMESTAMP,
  updated_by INT
);
```

### 2. `global_audit_log`
```sql
CREATE TABLE global_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  target_user_id INT,
  old_values JSONB,
  new_values JSONB,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `admin_sessions` (للـ Impersonation)
```sql
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL,
  impersonated_user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
```

### 4. `dispute_resolutions`
```sql
CREATE TABLE dispute_resolutions (
  id SERIAL PRIMARY KEY,
  order_id INT,
  auction_id INT,
  dispute_type VARCHAR(100),
  reported_by INT NOT NULL,
  admin_id INT,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  resolution TEXT,
  refund_amount DECIMAL(15, 2),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 التصميم والألوان

### Color Palette
- **الأسود العميق:** `#0B0B0B`
- **الذهب الملكي:** `#D4AF37`
- **الذهب الفاتح:** `#F9E29B`
- **الرمادي الداكن:** `#1a1a1a`

### CSS Classes
```css
.sovereign-dark { background-color: #0B0B0B; }
.sovereign-gold { color: #D4AF37; }
.glass-effect {
  background: rgba(11, 11, 11, 0.8);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(212, 175, 55, 0.2);
}
.gold-glow {
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}
```

---

## 🚀 خطوات التطبيق

### 1. **تطبيق جداول قاعدة البيانات**
```bash
psql -h your-host -U your-user -d your-db < database/sovereign_dashboard_schema.sql
```

### 2. **إضافة APIs إلى server.js**
- استيراد `sovereign-dashboard-api.js`
- استدعاء `setupSovereignDashboardAPIs(app, db, io)`

### 3. **إضافة المكون إلى Frontend**
- نسخ `SovereignDashboard.jsx` إلى `frontend/src/components/`
- إضافة Route في `App.jsx`

### 4. **تحديث Tailwind و CSS**
- تحديث `tailwind.config.js` بالألوان الجديدة
- إضافة الأنماط إلى `index.css`

### 5. **تثبيت Framer Motion**
```bash
npm install framer-motion
```

---

## 🔐 الأمان

### Authentication
- جميع الـ APIs محمية بـ `adminAuth` middleware
- يتم التحقق من الدور (role) قبل أي عملية
- جميع العمليات تُسجل في `global_audit_log`

### Authorization
- فقط `admin` و `super_admin` يمكنهم الوصول
- كل عملية تتطلب توكن JWT صحيح

---

## 📊 مثال على الاستخدام

### تغيير صلاحية مستخدم
```javascript
const changeUserRole = async (userId, newRole) => {
  const token = localStorage.getItem('rasan_token');
  const response = await axios.post(
    `/api/admin/user/${userId}/change-role`,
    { role: newRole, reason: 'ترقية' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
```

### الاستماع لأحداث WebSockets
```javascript
useEffect(() => {
  const socket = io(process.env.REACT_APP_API_URL);
  
  socket.on('liveStatsUpdate', (stats) => {
    setStats(stats);
  });

  socket.on('userRoleChanged', (data) => {
    console.log(`تم تغيير دور المستخدم: ${data.message}`);
  });

  return () => socket.disconnect();
}, []);
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الإحصائيات لا تتحدث
**الحل:** تأكد من:
- اتصال WebSocket نشط
- جدول `system_settings` موجود
- الـ interval في `setupLiveStatisticsAPI` يعمل

### المشكلة: Force Logout لا يعمل
**الحل:** تأكد من:
- المستخدم متصل عبر WebSocket
- الـ event `forceLogout` يُستقبل في Frontend
- جلسة المستخدم تُحذف من localStorage

### المشكلة: Impersonation لا يعمل
**الحل:** تأكد من:
- جدول `admin_sessions` موجود
- التوكن الجديد يُحفظ في localStorage
- الـ Frontend يستخدم التوكن الجديد

---

## 📞 الدعم

للمزيد من المعلومات أو الدعم، يرجى التواصل مع فريق التطوير.

---

**آخر تحديث:** 16 مارس 2026
**الإصدار:** 1.0.0
**الحالة:** ✅ جاهز للإنتاج
