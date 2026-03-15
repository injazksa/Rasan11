-- بيانات تجريبية لمنصة رَسَن (نسخة مصححة)

-- 1. المستخدمون
INSERT INTO users (id, username, email, password_hash, role, status, full_name) VALUES
(1, 'admin', 'admin@rasan.app', '$2b$10$K7Z.oG6rF7n.x6y.x6y.x6y.x6y.x6y.x6y.x6y.x6y.x6y', 'admin', 'active', 'المدير العام'),
(2, 'jordan_fed', 'jordan.federation@rasan.app', '$2b$10$K7Z.oG6rF7n.x6y.x6y.x6y.x6y.x6y.x6y.x6y.x6y.x6y', 'federation', 'active', 'اتحاد الأردن'),
(3, 'saudi_fed', 'saudi.federation@rasan.app', '$2b$10$K7Z.oG6rF7n.x6y.x6y.x6y.x6y.x6y.x6y.x6y.x6y.x6y', 'federation', 'active', 'اتحاد السعودية'),
(4, 'owner1', 'owner1@gmail.com', '$2b$10$K7Z.oG6rF7n.x6y.x6y.x6y.x6y.x6y.x6y.x6y.x6y.x6y', 'owner', 'active', 'أحمد المالك'),
(5, 'doctor1', 'doctor1@rasan.app', '$2b$10$K7Z.oG6rF7n.x6y.x6y.x6y.x6y.x6y.x6y.x6y.x6y.x6y', 'doctor', 'active', 'د. خالد');

-- 2. الاتحادات
INSERT INTO federations (id, name, country, admin_user_id) VALUES
(1, 'اتحاد الفروسية الملكي الأردني', 'الأردن', 2),
(2, 'الاتحاد السعودي للفروسية', 'السعودية', 3);

-- 3. الخيول
INSERT INTO horses (id, owner_id, federation_id, name, breed, age, gender, health_status) VALUES
(1, 4, 1, 'صقر العرب', 'عربي أصيل', 5, 'male', 'healthy'),
(2, 4, 1, 'نجمة الصحراء', 'عربي أصيل', 3, 'female', 'healthy');

-- 4. المنتجات في المتجر
INSERT INTO marketplace_items (id, vendor_id, name, description, price, quantity) VALUES
(1, 1, 'سرج جلدي فاخر', 'نخب أول صناعة يدوية', 1200.00, 10),
(2, 1, 'لجام ملكي مطلي بالذهب', 'تصميم حصري لمنصة رَسَن', 850.00, 5);

-- 5. المزادات
INSERT INTO auctions (id, horse_id, owner_id, starting_price, current_highest_bid, status, end_time) VALUES
(1, 1, 4, 50000.00, 55000.00, 'active', '2026-04-01 20:00:00');
