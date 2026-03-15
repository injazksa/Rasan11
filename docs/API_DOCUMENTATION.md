# توثيق API - منصة رَسَن

## مقدمة

هذه الوثيقة تشرح جميع نقاط نهاية API (Endpoints) المتاحة في منصة رَسَن.

**Base URL:** `http://localhost:5000/api`

---

## المصادقة (Authentication)

### تسجيل الدخول

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "أحمد محمد",
    "role": "owner"
  }
}
```

### إنشاء حساب جديد

```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "محمد علي",
  "role": "owner",
  "phone": "+966501234567"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "محمد علي",
    "role": "owner"
  }
}
```

### تسجيل الخروج

```
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

## الخيول (Horses)

### الحصول على قائمة الخيول

```
GET /horses
```

**Query Parameters:**
- `page` (int): رقم الصفحة (افتراضي: 1)
- `limit` (int): عدد النتائج (افتراضي: 10)
- `owner_id` (int): معرف المالك (اختياري)
- `federation_id` (int): معرف الاتحاد (اختياري)
- `is_for_sale` (boolean): للبيع فقط (اختياري)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "كحيلان",
      "breed": "عربي أصيل",
      "age": 5,
      "gender": "male",
      "owner_id": 1,
      "federation_id": 1,
      "is_for_sale": true,
      "sale_price": 15000,
      "health_status": "healthy"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

### الحصول على تفاصيل خيل

```
GET /horses/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "كحيلان",
    "breed": "عربي أصيل",
    "age": 5,
    "gender": "male",
    "color": "بني",
    "height": 1.52,
    "weight": 450,
    "registration_number": "RSN-001",
    "pedigree": "...",
    "health_status": "healthy",
    "medical_history": "...",
    "achievements": "...",
    "image_url": "https://...",
    "qr_code_url": "https://...",
    "owner": {
      "id": 1,
      "name": "أحمد محمد"
    },
    "federation": {
      "id": 1,
      "name": "اتحاد الفروسية السعودي"
    }
  }
}
```

### إضافة خيل جديد

```
POST /horses
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "رعد",
  "breed": "عربي أصيل",
  "age": 4,
  "gender": "male",
  "color": "أسود",
  "height": 1.55,
  "weight": 480,
  "registration_number": "RSN-002",
  "federation_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "تم إضافة الخيل بنجاح",
  "data": {
    "id": 2,
    "name": "رعد",
    "owner_id": 1,
    "federation_id": 1
  }
}
```

### تحديث خيل

```
PUT /horses/:id
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "رعد الأسود",
  "age": 5,
  "health_status": "healthy"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تم تحديث الخيل بنجاح"
}
```

### حذف خيل

```
DELETE /horses/:id
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تم حذف الخيل بنجاح"
}
```

---

## المزادات (Auctions)

### الحصول على قائمة المزادات

```
GET /auctions
```

**Query Parameters:**
- `status` (string): الحالة (active, closed, sold)
- `federation_id` (int): معرف الاتحاد

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "horse_id": 1,
      "horse_name": "كحيلان",
      "starting_price": 10000,
      "current_highest_bid": 15000,
      "highest_bidder": "محمد علي",
      "status": "active",
      "start_time": "2026-03-15T10:00:00Z",
      "end_time": "2026-03-16T10:00:00Z",
      "time_remaining": "23:45:30"
    }
  ]
}
```

### إنشاء مزاد

```
POST /auctions
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "horse_id": 1,
  "starting_price": 10000,
  "duration_hours": 24,
  "security_deposit_percentage": 5
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "تم إنشاء المزاد بنجاح",
  "data": {
    "id": 1,
    "horse_id": 1,
    "status": "active"
  }
}
```

### وضع مزايدة

```
POST /auctions/:id/bid
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "bid_amount": 16000
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تم قبول المزايدة بنجاح",
  "data": {
    "auction_id": 1,
    "bid_amount": 16000,
    "status": "accepted"
  }
}
```

---

## الوصفات الطبية (Prescriptions)

### الحصول على الوصفات

```
GET /prescriptions
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "horse_id": 1,
      "horse_name": "كحيلان",
      "doctor_id": 5,
      "doctor_name": "د. محمد علي",
      "prescription_text": "...",
      "medications": ["دواء أ", "دواء ب"],
      "dosage": "مرتين يوميًا",
      "duration": "7 أيام",
      "is_active": true,
      "created_at": "2026-03-15T10:00:00Z"
    }
  ]
}
```

### إصدار وصفة طبية

```
POST /prescriptions
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "horse_id": 1,
  "prescription_text": "...",
  "medications": ["دواء أ", "دواء ب"],
  "dosage": "مرتين يوميًا",
  "duration": "7 أيام"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "تم إصدار الوصفة بنجاح",
  "data": {
    "id": 1,
    "horse_id": 1,
    "is_active": true
  }
}
```

---

## المتجر (Marketplace)

### الحصول على المنتجات

```
GET /marketplace
```

**Query Parameters:**
- `category` (string): الفئة
- `search` (string): البحث
- `page` (int): رقم الصفحة

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "سرج ملكي",
      "description": "...",
      "category": "معدات",
      "price": 500,
      "quantity": 10,
      "requires_prescription": false,
      "image_url": "https://...",
      "vendor": {
        "id": 6,
        "name": "متجر المعدات"
      }
    }
  ]
}
```

### إنشاء طلب

```
POST /marketplace/orders
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "item_id": 1,
      "quantity": 2
    }
  ],
  "shipping_address": "..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "تم إنشاء الطلب بنجاح",
  "data": {
    "order_id": 1,
    "order_number": "ORD-001",
    "total_amount": 1000,
    "status": "pending"
  }
}
```

---

## المعاملات المالية (Transactions)

### الحصول على سجل المعاملات

```
GET /transactions
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (string): الحالة (completed, pending, failed)
- `type` (string): النوع (payment, refund, commission)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "transaction_id": "TXN-001",
      "amount": 15000,
      "currency": "USD",
      "type": "payment",
      "status": "completed",
      "payment_method": "stripe",
      "description": "شراء خيل",
      "created_at": "2026-03-15T10:00:00Z"
    }
  ]
}
```

### معالجة الدفع

```
POST /transactions/payment
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 15000,
  "currency": "USD",
  "payment_method": "stripe",
  "stripe_token": "tok_...",
  "description": "شراء خيل"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "تمت المعاملة بنجاح",
  "data": {
    "transaction_id": "TXN-001",
    "status": "completed",
    "amount": 15000
  }
}
```

---

## الإشعارات (Notifications)

### الحصول على الإشعارات

```
GET /notifications
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "عمولة جديدة",
      "message": "تم تحويل مبلغ $150",
      "type": "payment",
      "is_read": false,
      "created_at": "2026-03-15T10:00:00Z"
    }
  ]
}
```

### تحديد إشعار كمقروء

```
PUT /notifications/:id/read
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تم تحديد الإشعار كمقروء"
}
```

---

## الأخطاء

### رموز الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 400 | طلب غير صحيح (Bad Request) |
| 401 | غير مصرح (Unauthorized) |
| 403 | ممنوع (Forbidden) |
| 404 | غير موجود (Not Found) |
| 409 | تضارب (Conflict) |
| 500 | خطأ في الخادم (Server Error) |

### مثال على رسالة خطأ

```json
{
  "success": false,
  "error": "البريد الإلكتروني موجود بالفعل",
  "code": 409
}
```

---

## معدل الحد (Rate Limiting)

- **الحد الأقصى:** 100 طلب لكل 15 دقيقة
- **رسالة الخطأ:** "Too many requests from this IP"

---

## الترتيب والفلترة

### مثال على الفلترة

```
GET /horses?breed=عربي&age=5&is_for_sale=true
```

### مثال على الترتيب

```
GET /horses?sort=age&order=asc
```

---

**آخر تحديث:** 15 مارس 2026
