# دليل التثبيت - منصة رَسَن

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:

- **Node.js** 16.0.0 أو أعلى ([تحميل](https://nodejs.org/))
- **npm** أو **pnpm** (يأتي مع Node.js)
- **MySQL** 8.0 أو **PostgreSQL** 12+ ([تحميل MySQL](https://dev.mysql.com/downloads/mysql/))
- **Git** ([تحميل](https://git-scm.com/))

### التحقق من التثبيت

```bash
# التحقق من Node.js
node --version
npm --version

# التحقق من MySQL
mysql --version

# التحقق من Git
git --version
```

---

## خطوات التثبيت

### 1. استنساخ المشروع

```bash
git clone https://github.com/your-org/rasan.git
cd rasan
```

### 2. إعداد قاعدة البيانات

#### إنشاء قاعدة البيانات

```bash
# تسجيل الدخول إلى MySQL
mysql -u root -p

# في سطر أوامر MySQL
CREATE DATABASE rasan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rasan_user'@'localhost' IDENTIFIED BY 'rasan_password_123';
GRANT ALL PRIVILEGES ON rasan.* TO 'rasan_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### تشغيل الهجرات

```bash
# الانتقال إلى مجلد Backend
cd backend

# تثبيت المتطلبات
npm install

# تشغيل الهجرات
npm run db:migrate

# تحميل البيانات التجريبية (اختياري)
npm run db:seed
```

### 3. إعداد متغيرات البيئة

#### Backend

```bash
# نسخ ملف المثال
cp .env.example .env

# تحرير الملف بمحرر نصي
nano .env
# أو استخدم محرر آخر مثل VS Code
```

**تحديث القيم الأساسية:**

```env
DATABASE_URL=mysql://rasan_user:rasan_password_123@localhost:3306/rasan
JWT_SECRET=your-very-secure-random-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_key
FRONTEND_URL=http://localhost:3000
```

#### Frontend

```bash
# الانتقال إلى مجلد Frontend
cd ../frontend

# نسخ ملف المثال
cp .env.example .env

# تحرير الملف
nano .env
```

**تحديث القيم الأساسية:**

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
```

### 4. تثبيت المتطلبات

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 5. تشغيل التطبيق

#### تشغيل Backend (في نافذة Terminal)

```bash
cd backend
npm run dev
```

**النتيجة المتوقعة:**
```
╔════════════════════════════════════════╗
║   منصة رَسَن - Rasan Platform         ║
║   Backend Server Running              ║
╚════════════════════════════════════════╝

  🚀 Server: http://localhost:5000
  📊 Health: http://localhost:5000/health
```

#### تشغيل Frontend (في نافذة Terminal أخرى)

```bash
cd frontend
npm run dev
```

**النتيجة المتوقعة:**
```
  VITE v4.4.0  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### 6. الوصول إلى التطبيق

افتح متصفحك وانتقل إلى:
```
http://localhost:3000
```

---

## التكوين المتقدم

### إعداد Stripe (للمدفوعات)

1. انتقل إلى [Stripe Dashboard](https://dashboard.stripe.com/)
2. احصل على مفاتيح API الخاصة بك
3. أضفها إلى ملف `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### إعداد البريد الإلكتروني

لإرسال رسائل البريد الإلكتروني، أضف بيانات SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@rasan.app
```

### إعداد AWS S3 (لتخزين الملفات)

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=rasan-uploads
```

---

## استكشاف الأخطاء

### خطأ: "Connection refused" عند الاتصال بـ MySQL

**الحل:**
```bash
# تحقق من أن MySQL يعمل
sudo service mysql status

# إذا لم يكن يعمل، شغله
sudo service mysql start

# على macOS
brew services start mysql
```

### خطأ: "Port 3000 is already in use"

**الحل:**
```bash
# ابحث عن العملية التي تستخدم المنفذ
lsof -i :3000

# أوقف العملية (استبدل PID برقم العملية)
kill -9 <PID>

# أو استخدم منفذ مختلف
VITE_PORT=3001 npm run dev
```

### خطأ: "Cannot find module"

**الحل:**
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

### خطأ: "Database connection failed"

**الحل:**
```bash
# تحقق من بيانات الاتصال في .env
# تأكد من أن MySQL يعمل
# جرب الاتصال يدويًا
mysql -u rasan_user -p -h localhost rasan
```

---

## البيانات التجريبية

لتحميل بيانات تجريبية للاختبار:

```bash
cd backend
npm run db:seed
```

**البيانات المحملة:**
- 10 مستخدمين بأدوار مختلفة
- 5 اتحادات
- 20 خيل
- 5 مزادات نشطة
- 15 منتج في المتجر

---

## الأوامر المهمة

### Backend

```bash
# تشغيل الخادم في وضع التطوير
npm run dev

# تشغيل الخادم في وضع الإنتاج
npm start

# تشغيل الهجرات
npm run db:migrate

# تحميل البيانات التجريبية
npm run db:seed

# فحص الأخطاء
npm run lint

# تنسيق الكود
npm run format
```

### Frontend

```bash
# تشغيل الخادم في وضع التطوير
npm run dev

# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview

# فحص الأخطاء
npm run lint

# تنسيق الكود
npm run format
```

---

## الخطوات التالية

بعد التثبيت الناجح:

1. **قراءة التوثيق:**
   - [API Documentation](./docs/API_DOCUMENTATION.md)
   - [User Guide](./docs/USER_GUIDE.md)
   - [Design System](./docs/DESIGN_SYSTEM.md)

2. **استكشاف الميزات:**
   - جرب تسجيل الدخول بحسابات تجريبية
   - استكشف لوحات التحكم المختلفة
   - جرب نظام المزادات

3. **التطوير:**
   - اقرأ [ARCHITECTURE.md](./ARCHITECTURE.md)
   - ابدأ بإضافة ميزات جديدة
   - اتبع معايير الكود

---

## الدعم والمساعدة

إذا واجهت مشاكل:

1. **تحقق من الأخطاء الشائعة** أعلاه
2. **ابحث في Issues على GitHub**
3. **اتصل بفريق الدعم:** support@rasan.app
4. **اقرأ التوثيق:** https://docs.rasan.app

---

## الخطوات التالية للإنتاج

قبل نشر التطبيق:

1. **تحديث متغيرات البيئة:**
   ```bash
   NODE_ENV=production
   ```

2. **تفعيل HTTPS**

3. **إعداد النسخ الاحتياطية للقاعدة:**
   ```bash
   mysqldump -u rasan_user -p rasan > backup.sql
   ```

4. **إعداد مراقبة الأداء**

5. **إعداد السجلات والتنبيهات**

---

**تم آخر تحديث:** 15 مارس 2026
