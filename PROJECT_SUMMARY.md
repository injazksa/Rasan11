# ملخص المشروع - منصة رَسَن

## نظرة عامة

**منصة رَسَن** هي نظام متكامل لإدارة قطاع الفروسية والخيول، يجمع بين:
- 🏛️ السلطة التنظيمية (الاتحادات)
- 🏪 التجارة الحصرية (المتجر)
- 🛒 السوق المفتوح (الملاك)
- 💼 الخدمات الطبية (الأطباء البيطريون)
- 🎯 المزادات الحية

---

## الميزات الرئيسية

### 1. نظام المصادقة والصلاحيات (RBAC)
- **5 أدوار:** Admin, Federation, Owner, Doctor, Vendor
- تحكم كامل بالصلاحيات لكل دور
- نظام جلسات آمن مع JWT

### 2. لوحات التحكم المتخصصة
- **لوحة المدير:** إحصائيات شاملة، إدارة المستخدمين
- **لوحة الاتحاد:** إدارة الخيول والملاك، السباقات
- **لوحة الطبيب:** الوصفات الطبية، السجلات الصحية
- **إسطبل المالك:** إدارة الخيول، الوثائق
- **متجر البائع:** عرض المنتجات، إدارة الطلبات

### 3. نظام المزادات الحية
- مزايدة فورية مع تحديث لحظي
- تأمين الجدية (5% من المبلغ)
- عمولات متغيرة للمدير

### 4. السوق والتجارة
- متجر مركزي حصري
- نظام الإعلانات المميزة
- بحث وفلترة متقدمة

### 5. الجواز الرقمي للخيول
- صفحة عامة فخمة مع QR Code
- سجل كامل للحصان
- ختم رقمي موثق

### 6. النظام المالي
- بوابة دفع آمنة (Stripe + Apple Pay)
- تقسيم عمولة آلي
- نظام Escrow للحجز المؤقت

### 7. إدارة الوصفات الطبية
- إصدار وصفات رقمية
- تفعيل شراء الأدوية المقيدة
- تتبع العلاجات

### 8. نظام الإشعارات الذكية
- إشعارات فورية
- WebSocket للتحديثات المباشرة
- تصنيفات حسب نوع الحساب

---

## البنية التقنية

### Frontend (الواجهة الأمامية)
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Routing:** React Router

### Backend (الخادم الخلفي)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Authentication:** JWT
- **Payment:** Stripe API
- **Real-time:** Socket.io

### Database (قاعدة البيانات)
- **DBMS:** MySQL 8.0
- **Schema:** 15+ جدول
- **Relationships:** Foreign Keys
- **Indexes:** محسّنة للأداء

---

## الجداول الرئيسية

| الجدول | الوصف | الحقول الرئيسية |
|--------|-------|-----------------|
| `users` | المستخدمون | id, email, role, status |
| `horses` | الخيول | id, owner_id, federation_id, name |
| `federations` | الاتحادات | id, name, country, admin_user_id |
| `prescriptions` | الوصفات الطبية | id, doctor_id, horse_id, is_active |
| `marketplace_items` | منتجات المتجر | id, vendor_id, name, price |
| `auctions` | المزادات | id, horse_id, starting_price, status |
| `bids` | المزايدات | id, auction_id, bidder_id, bid_amount |
| `transactions` | المعاملات المالية | id, user_id, amount, status |
| `marketplace_orders` | طلبات المتجر | id, buyer_id, total_amount, status |
| `notifications` | الإشعارات | id, user_id, title, is_read |
| `audit_logs` | سجل التدقيق | id, user_id, action, created_at |
| `penalties` | العقوبات والغرامات | id, owner_id, penalty_type, status |

---

## API Endpoints الرئيسية

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - إنشاء حساب
- `POST /api/auth/logout` - تسجيل الخروج

### الخيول
- `GET /api/horses` - قائمة الخيول
- `POST /api/horses` - إضافة خيل
- `GET /api/horses/:id` - تفاصيل الخيل
- `PUT /api/horses/:id` - تحديث الخيل
- `DELETE /api/horses/:id` - حذف الخيل

### المزادات
- `GET /api/auctions` - قائمة المزادات
- `POST /api/auctions` - إنشاء مزاد
- `POST /api/auctions/:id/bid` - وضع مزايدة

### الوصفات
- `GET /api/prescriptions` - قائمة الوصفات
- `POST /api/prescriptions` - إصدار وصفة

### المتجر
- `GET /api/marketplace` - قائمة المنتجات
- `POST /api/marketplace/orders` - إنشاء طلب

### المعاملات المالية
- `GET /api/transactions` - سجل المعاملات
- `POST /api/transactions/payment` - معالجة الدفع

---

## معايير الأمان

✅ **تشفير البيانات:** AES-256
✅ **تشفير كلمات المرور:** bcrypt
✅ **المصادقة:** JWT
✅ **HTTPS:** إلزامي
✅ **CORS:** محدود
✅ **Rate Limiting:** 100 طلب/15 دقيقة
✅ **SQL Injection Prevention:** Prepared Statements
✅ **XSS Protection:** Input Sanitization
✅ **سجل التدقيق:** Audit Logs شامل

---

## الهوية البصرية

### الألوان الأساسية
- **Off-White:** #FBFBFB (الخلفيات)
- **Royal Black:** #2C2C2C (النصوص والحدود)
- **Brushed Gold:** #D4AF37 (العناصر التفاعلية)

### الخطوط
- **Serif:** للعناوين والنصوص الرسمية
- **Sans-serif:** للواجهات والأزرار

### الأيقونات المخصصة
- 🐴 سرج (Saddle) - للمتجر
- 🎯 لجام (Bridle) - للتحكم
- 🔗 رسن (Reins) - للربط
- 📜 ختم شمعي - للتوثيق

---

## ملفات المشروع الرئيسية

```
rasan-final/
├── README.md                      # الملف الرئيسي
├── QUICK_START.md                 # البدء السريع
├── INSTALLATION.md                # دليل التثبيت
├── PROJECT_SUMMARY.md             # هذا الملف
│
├── frontend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── components/            # المكونات الرئيسية
│       │   ├── RasanCheckout.jsx
│       │   ├── RasanNotifications.jsx
│       │   ├── RasanAuction.jsx
│       │   ├── RasanAnalytics.jsx
│       │   ├── FederationAuthorityPortal.jsx
│       │   └── GodEyeDashboard.jsx
│       ├── pages/                 # الصفحات
│       ├── stores/                # إدارة الحالة
│       ├── hooks/                 # Hooks مخصصة
│       ├── utils/                 # دوال مساعدة
│       └── styles/                # أنماط CSS
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js              # نقطة الدخول
│       ├── routes/                # المسارات
│       ├── middleware/            # البرامج الوسيطة
│       ├── models/                # نماذج البيانات
│       └── services/              # الخدمات
│
├── database/
│   ├── schema.sql                 # هيكل قاعدة البيانات
│   ├── migrations/                # ملفات الهجرات
│   └── seed.sql                   # بيانات تجريبية
│
└── docs/
    ├── API_DOCUMENTATION.md       # توثيق API
    ├── USER_GUIDE.md              # دليل المستخدم
    └── DESIGN_SYSTEM.md           # نظام التصميم
```

---

## خطوات التثبيت السريعة

```bash
# 1. استنساخ المشروع
git clone <repo-url>
cd rasan-final

# 2. إعداد قاعدة البيانات
mysql -u root -p < database/schema.sql

# 3. تثبيت المتطلبات
cd frontend && npm install
cd ../backend && npm install

# 4. إعداد متغيرات البيئة
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# 5. تشغيل الهجرات
cd backend && npm run db:migrate

# 6. تشغيل التطبيق
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev

# 7. الوصول إلى التطبيق
# http://localhost:3000
```

---

## الإحصائيات

- **عدد الملفات:** 50+
- **عدد المكونات:** 6 رئيسية
- **عدد الجداول:** 15+
- **عدد API Endpoints:** 30+
- **عدد الأدوار:** 5
- **عدد الميزات:** 8 رئيسية

---

## الأداء

- **وقت التحميل:** < 2 ثانية
- **استجابة API:** < 500ms
- **حجم Bundle:** < 500KB (gzipped)
- **Database Queries:** محسّنة مع Indexes

---

## الدعم والتوثيق

- 📖 **README.md** - نظرة عامة
- 🚀 **QUICK_START.md** - البدء السريع
- 📚 **INSTALLATION.md** - دليل التثبيت
- 🔌 **docs/API_DOCUMENTATION.md** - توثيق API
- 👤 **docs/USER_GUIDE.md** - دليل المستخدم
- 🎨 **docs/DESIGN_SYSTEM.md** - نظام التصميم

---

## الخطوات التالية

1. **التثبيت:** اتبع [INSTALLATION.md](./INSTALLATION.md)
2. **البدء السريع:** اتبع [QUICK_START.md](./QUICK_START.md)
3. **استكشاف الميزات:** جرب جميع الأدوار والميزات
4. **التطوير:** ابدأ بإضافة ميزات جديدة
5. **النشر:** انشر التطبيق للإنتاج

---

## المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push إلى الفرع
5. فتح Pull Request

---

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

---

## معلومات الاتصال

- 📧 **البريد الإلكتروني:** support@rasan.app
- 🌐 **الموقع:** https://rasan.app
- 📱 **الهاتف:** +966 XX XXX XXXX
- 💬 **الدعم:** support@rasan.app

---

**تم إنشاؤه بواسطة:** فريق تطوير رَسَن
**آخر تحديث:** 15 مارس 2026
**الإصدار:** 1.0.0 (Beta)
