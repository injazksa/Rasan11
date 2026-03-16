import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import db from './utils/db.js';
import cloudinary from './config/cloudinaryConfig.js';
import multer from 'multer';
import QRCode from 'qrcode';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'rasan_secret_key';

// Multer setup for file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

// ============ Middleware ============

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: '*',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, './public')));

// ============ Auto-Seed Admin Account ============
const initializeAdminAccount = async () => {
  try {
    const adminEmail = 'admin@rasan.app';
    const adminPassword = 'admin_rasan_2026';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const existingAdmin = await db.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      await db.query(
        'INSERT INTO users (username, email, password_hash, role, status, full_name, country, city, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        ['admin', adminEmail, hashedPassword, 'admin', 'active', 'المدير العام', 'السعودية', 'الرياض', '0500000000']
      );
      console.log('✅ تم إنشاء حساب المدير بنجاح');
    } else {
      await db.query('UPDATE users SET password_hash = $1, role = $2, status = $3 WHERE email = $4', [hashedPassword, 'admin', 'active', adminEmail]);
      console.log('✅ تم تحديث بيانات حساب المدير لضمان الدخول');
    }
  } catch (error) {
    console.error('⚠️ خطأ في تهيئة حساب المدير:', error.message);
  }
};

setTimeout(() => {
  initializeAdminAccount();
}, 2000);

// Sovereignty Middleware (Country Isolation)
const checkCountryIsolation = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ message: "No token provided!" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized!" });
    req.user = decoded;
    
    if (decoded.role === 'admin') {
      req.countryFilter = {};
    } else {
      req.countryFilter = { country: decoded.country };
    }
    next();
  });
};

// ============ Email Service ============

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'test@ethereal.email',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

const sendRoyalAccreditationEmail = async (userEmail, userName, userRole, country) => {
  const mailOptions = {
    from: '"منظومة رَسَن العالمية" <no-reply@rasan.app>',
    to: userEmail,
    subject: 'تم اعتماد انضمامكم إلى إمبراطورية "رَسَن" الرقمية 🛡️',
    html: `
      <div dir="rtl" style="font-family: 'Amiri', serif; background-color: #FBFBFB; padding: 40px; border: 1px solid #D4AF37;">
        <h2 style="color: #2C2C2C; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">إلى مقام ${userName} المحترم،</h2>
        <p style="font-size: 18px; color: #2C2C2C; line-height: 1.6;">
          نحييكم بتحية الفرسان. يسعدنا إبلاغكم بأن مدير النظام العام قد أتم مراجعة وثائقكم واعتماد حسابكم رسمياً ضمن منظومة رَسَن (Rasan) العالمية.
        </p>
        <div style="background-color: #2C2C2C; color: #D4AF37; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0;">ميثاق الصلاحيات (Your Mandate)</h3>
          <p>بناءً على دوركم كـ <strong>${userRole}</strong> في دولة <strong>${country}</strong>، نمنحكم السلطات اللازمة.</p>
        </div>
        <p style="text-align: center; margin-top: 40px; font-style: italic; color: #2C2C2C;">
          "رَسَن.. حيث تلتقي أصالة الخيل بذكاء التكنولوجيا."
        </p>
      </div>
    `
  };

  try {
    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    } else {
      let info = await transporter.sendMail(mailOptions);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// ============ Routes ============

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, role, full_name, phone, country, city } = req.body;
  
  if (!email || !password || !full_name) {
    return res.status(400).json({ message: 'يرجى تعبئة جميع الحقول المطلوبة' });
  }
  
  const finalUsername = username || email.split('@')[0] + Math.floor(Math.random() * 1000);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role, full_name, phone, country, city, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, username, email, role, full_name, country, status',
      [finalUsername, email, hashedPassword, role || 'owner', full_name, phone, country, city || 'N/A', 'inactive']
    );
    const newUser = result.rows[0];
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, country: newUser.country }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل.' });
    }
    res.status(500).json({ message: 'خطأ في التسجيل.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة.' });
    }

    if (user.status !== 'active' && user.role !== 'admin') {
      return res.status(403).json({ message: 'حسابك غير نشط. يرجى انتظار موافقة المدير.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, country: user.country }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name, country: user.country, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تسجيل الدخول.' });
  }
});

// Admin Approval Routes
app.get('/api/admin/approvals', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    const result = await db.query('SELECT id, full_name as name, email, role as type, country FROM users WHERE status = $1', ['inactive']);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب طلبات الموافقات.' });
  }
});

app.post('/api/admin/approve-user', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { userId, userEmail, userName, userRole, country } = req.body;
  
  try {
    await db.query('UPDATE users SET status = $1 WHERE id = $2', ['active', userId]);
    await sendRoyalAccreditationEmail(userEmail, userName, userRole, country);
    res.json({ message: `تم اعتماد المستخدم ${userName} وإرسال رسالة الترحيب الملكية.` });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في اعتماد المستخدم.' });
  }
});

// ============ New Routes for Dynamic Data ============

// Get Races
app.get('/api/races', checkCountryIsolation, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, date, location, status, image FROM races WHERE status = $1 ORDER BY date DESC',
      ['active']
    );
    
    // إذا لم تكن هناك سباقات في قاعدة البيانات، أرجع بيانات افتراضية
    if (result.rows.length === 0) {
      return res.json([
        {
          id: 1,
          name: 'كأس رَسَن الدولي للجمال',
          date: '20 رمضان 1447',
          location: 'إسطبلات رَسَن الملكية',
          status: 'open',
          image: 'https://images.unsplash.com/photo-1598974357851-98166a9d9b5b?auto=format&fit=crop&w=800'
        }
      ]);
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({ message: 'خطأ في جلب السباقات.' });
  }
});

// Get User Points
app.get('/api/user/:userId/points', checkCountryIsolation, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT COALESCE(SUM(points), 0) as points FROM user_points WHERE user_id = $1',
      [req.params.userId]
    );
    
    res.json({ points: result.rows[0]?.points || 0 });
  } catch (error) {
    console.error('Error fetching user points:', error);
    res.json({ points: 0 });
  }
});

// Get Marketplace Products
app.get('/api/marketplace/products', checkCountryIsolation, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, description, price, image FROM products WHERE status = $1 ORDER BY created_at DESC',
      ['active']
    );
    
    // إذا لم تكن هناك منتجات في قاعدة البيانات، أرجع بيانات افتراضية
    if (result.rows.length === 0) {
      return res.json([
        {
          id: 1,
          name: 'سرج جلدي فاخر - نخب أول',
          description: 'سرج مصنوع من أفضل أنواع الجلد الإيطالي',
          price: 1200,
          image: 'https://img.icons8.com/ios/100/D4AF37/saddle.png'
        },
        {
          id: 2,
          name: 'لجام ملكي مزخرف',
          description: 'لجام مزخرف بالذهب والفضة',
          price: 800,
          image: 'https://img.icons8.com/ios/100/D4AF37/bridle.png'
        },
        {
          id: 3,
          name: 'أغطية خيل حريرية',
          description: 'أغطية حريرية فاخرة لحماية الخيل',
          price: 500,
          image: 'https://img.icons8.com/ios/100/D4AF37/blanket.png'
        }
      ]);
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'خطأ في جلب المنتجات.' });
  }
});

// Get God Eye Dashboard Data (Admin Only)
app.get('/api/admin/godeye/users', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    const result = await db.query(
      'SELECT id, username, email, role, full_name, country, status, last_login FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب بيانات المستخدمين.' });
  }
});

app.get('/api/admin/godeye/stats', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    const usersResult = await db.query('SELECT COUNT(*) as total FROM users');
    const revenueResult = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = $1', ['completed']);
    
    res.json({
      total_users: parseInt(usersResult.rows[0]?.total || 0),
      total_revenue: parseFloat(revenueResult.rows[0]?.total || 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الإحصائيات.' });
  }
});

// Admin Password Reset
app.post('/api/admin/godeye/user/:userId/password', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.params.userId]);
    res.json({ message: 'تم تحديث كلمة المرور بنجاح.' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث كلمة المرور.' });
  }
});

// Admin User Status Change
app.post('/api/admin/godeye/user/:userId/status', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { status } = req.body;
  
  try {
    await db.query('UPDATE users SET status = $1 WHERE id = $2', [status, req.params.userId]);
    res.json({ message: 'تم تحديث حالة المستخدم بنجاح.' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث حالة المستخدم.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
