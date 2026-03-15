# البدء السريع - منصة رَسَن

## في 5 دقائق فقط!

### الخطوة 1: المتطلبات الأساسية

```bash
# تحقق من أن لديك:
node --version    # يجب أن يكون 16.0.0 أو أعلى
npm --version     # يجب أن يكون 8.0.0 أو أعلى
mysql --version   # يجب أن يكون 8.0 أو أعلى
```

### الخطوة 2: إعداد قاعدة البيانات (دقيقة واحدة)

```bash
# تسجيل الدخول إلى MySQL
mysql -u root -p

# نسخ والصق هذه الأوامر:
CREATE DATABASE rasan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rasan_user'@'localhost' IDENTIFIED BY 'rasan_pass';
GRANT ALL PRIVILEGES ON rasan.* TO 'rasan_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### الخطوة 3: استنساخ وتثبيت (دقيقة واحدة)

```bash
# استنساخ المشروع
git clone https://github.com/your-org/rasan.git
cd rasan

# تثبيت Backend
cd backend
npm install
cp .env.example .env

# تثبيت Frontend
cd ../frontend
npm install
cp .env.example .env
```

### الخطوة 4: تشغيل الهجرات (دقيقة واحدة)

```bash
cd backend
npm run db:migrate
npm run db:seed  # اختياري: تحميل بيانات تجريبية
```

### الخطوة 5: تشغيل التطبيق (دقيقة واحدة)

**نافذة Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**نافذة Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### الخطوة 6: الوصول إلى التطبيق

افتح متصفحك:
```
http://localhost:3000
```

---

## حسابات تجريبية

بعد تشغيل `npm run db:seed`، يمكنك استخدام:

| الدور | البريد | كلمة المرور |
|------|--------|-----------|
| Admin | admin@rasan.app | admin123 |
| Federation | federation@rasan.app | fed123 |
| Owner | owner@rasan.app | owner123 |
| Doctor | doctor@rasan.app | doc123 |
| Vendor | vendor@rasan.app | vendor123 |

---

## الأوامر الأساسية

```bash
# تشغيل الخادم الخلفي
cd backend && npm run dev

# تشغيل الواجهة الأمامية
cd frontend && npm run dev

# بناء للإنتاج
cd frontend && npm run build

# تشغيل الهجرات
cd backend && npm run db:migrate

# تحميل البيانات التجريبية
cd backend && npm run db:seed
```

---

## استكشاف الميزات

### 1. لوحة المدير
- انتقل إلى: `http://localhost:3000/admin`
- شاهد الإحصائيات الشاملة
- أدر المستخدمين والخيول

### 2. المزادات
- انتقل إلى: `http://localhost:3000/auctions`
- شاهد المزادات النشطة
- جرب وضع مزايدة

### 3. المتجر
- انتقل إلى: `http://localhost:3000/marketplace`
- تصفح المنتجات
- أضف إلى السلة

### 4. إسطبل المالك
- انتقل إلى: `http://localhost:3000/stable`
- أضف خيل جديد
- عرض الخيول للبيع

---

## الخطوات التالية

1. **اقرأ التوثيق الكاملة:**
   - [INSTALLATION.md](./INSTALLATION.md) - تثبيت مفصل
   - [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) - توثيق API
   - [README.md](./README.md) - نظرة عامة

2. **استكشف الكود:**
   - `frontend/src/components/` - المكونات الرئيسية
   - `backend/src/routes/` - API Routes
   - `database/schema.sql` - هيكل قاعدة البيانات

3. **ابدأ التطوير:**
   - أضف ميزات جديدة
   - خصص الألوان والتصميم
   - ربط خدماتك الخاصة

---

## استكشاف الأخطاء السريع

### المشكلة: "Cannot connect to database"
```bash
# تحقق من أن MySQL يعمل
sudo service mysql status

# إذا لم يكن يعمل:
sudo service mysql start
```

### المشكلة: "Port 3000 already in use"
```bash
# استخدم منفذ مختلف
VITE_PORT=3001 npm run dev
```

### المشكلة: "Module not found"
```bash
# أعد تثبيت المتطلبات
rm -rf node_modules package-lock.json
npm install
```

---

## الدعم

- 📧 البريد الإلكتروني: support@rasan.app
- 📚 التوثيق: https://docs.rasan.app
- 🐛 الأخطاء: https://github.com/your-org/rasan/issues

---

**مبروك! 🎉 لديك الآن نسخة عاملة من منصة رَسَن**

الآن يمكنك:
- ✅ استكشاف جميع الميزات
- ✅ تخصيص التطبيق
- ✅ إضافة ميزات جديدة
- ✅ نشر التطبيق للإنتاج

**استمتع! 🚀**
