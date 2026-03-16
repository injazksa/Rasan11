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
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'rasan_secret_key';

// Multer setup for file uploads
const storage = multer.memoryStorage();
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

// ============ Socket.IO Real-Time Notifications ============

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('✅ مستخدم متصل:', socket.id);

  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`المستخدم ${userId} انضم إلى الإشعارات الحية`);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of connectedUsers) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`المستخدم ${userId} قطع الاتصال`);
        break;
      }
    }
  });
});

// دالة إرسال إشعار حقيقي
const sendRealTimeNotification = async (userId, notification) => {
  try {
    // حفظ الإشعار في قاعدة البيانات
    await db.query(
      'INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES ($1, $2, $3, $4, $5)',
      [userId, notification.title, notification.message, notification.type || 'info', false]
    );

    // إرسال الإشعار عبر Socket.io إذا كان المستخدم متصلاً
    const socketId = connectedUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit('notification', notification);
    }
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
  }
};

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

// دالة إرسال رابط إعادة تعيين كلمة المرور
const sendPasswordResetEmail = async (userEmail, userName, resetToken, resetLink) => {
  const mailOptions = {
    from: '"منظومة رَسَن العالمية" <no-reply@rasan.app>',
    to: userEmail,
    subject: 'إعادة تعيين كلمة المرور - منظومة رَسَن',
    html: `
      <div dir="rtl" style="font-family: 'Amiri', serif; background-color: #FBFBFB; padding: 40px; border: 1px solid #D4AF37;">
        <h2 style="color: #2C2C2C; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">إلى ${userName} المحترم،</h2>
        <p style="font-size: 16px; color: #2C2C2C; line-height: 1.6;">
          تم طلب إعادة تعيين كلمة المرور لحسابك. اضغط على الرابط أدناه لإعادة تعيين كلمة المرور:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #D4AF37; color: #2C2C2C; padding: 15px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
            إعادة تعيين كلمة المرور
          </a>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">
          أو انسخ الرابط التالي في متصفحك:<br/>
          ${resetLink}
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          ملاحظة: هذا الرابط صالح لمدة 24 ساعة فقط.
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
    console.error('Error sending password reset email:', error);
    throw error;
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

    // تحديث آخر وقت دخول
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, country: user.country }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name, country: user.country, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تسجيل الدخول.' });
  }
});

// ============ Password Reset Routes ============

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
  }

  try {
    const result = await db.query('SELECT id, full_name FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      // لا نكشف ما إذا كان البريد موجوداً أم لا لأسباب أمنية
      return res.json({ message: 'إذا كان البريد مسجلاً لدينا، فستصلك تعليمات استعادة كلمة المرور قريباً.' });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ساعات

    // حفظ توكن إعادة التعيين في قاعدة البيانات
    await db.query(
      'UPDATE users SET verification_token = $1 WHERE id = $2',
      [resetTokenHash, user.id]
    );

    // إنشاء رابط إعادة التعيين
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&userId=${user.id}`;

    // إرسال البريد الإلكتروني
    await sendPasswordResetEmail(email, user.full_name, resetToken, resetLink);

    res.json({ message: 'إذا كان البريد مسجلاً لدينا، فستصلك تعليمات استعادة كلمة المرور قريباً.' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'خطأ في معالجة طلب إعادة التعيين.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, userId, newPassword } = req.body;

  if (!token || !userId || !newPassword) {
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }

  try {
    const result = await db.query('SELECT verification_token FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'المستخدم غير موجود' });
    }

    const user = result.rows[0];
    const isTokenValid = await bcrypt.compare(token, user.verification_token);

    if (!isTokenValid) {
      return res.status(400).json({ message: 'الرابط غير صحيح أو منتهي الصلاحية' });
    }

    // تحديث كلمة المرور
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password_hash = $1, verification_token = NULL WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'تم تحديث كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({ message: 'خطأ في تحديث كلمة المرور.' });
  }
});

// Admin Approval Routes
app.get('/api/admin/approvals', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    const result = await db.query('SELECT id, full_name as name, email, role as type, country FROM users WHERE status = $1 ORDER BY created_at DESC', ['inactive']);
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
    
    // إرسال إشعار حقيقي للمستخدم
    await sendRealTimeNotification(userId, {
      title: 'تم اعتماد حسابك',
      message: `تم اعتماد حسابك بنجاح من قبل مدير النظام. مرحباً بك في منظومة رَسَن!`,
      type: 'info'
    });

    res.json({ message: `تم اعتماد المستخدم ${userName} وإرسال رسالة الترحيب الملكية.` });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في اعتماد المستخدم.' });
  }
});

app.post('/api/admin/reject-user', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { userId, reason } = req.body;
  
  try {
    const userResult = await db.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // حذف المستخدم أو تعديل حالته
    await db.query('UPDATE users SET status = $1 WHERE id = $2', ['blocked', userId]);

    // إرسال بريد رفض
    const mailOptions = {
      from: '"منظومة رَسَن العالمية" <no-reply@rasan.app>',
      to: user.email,
      subject: 'تم رفض طلب الانضمام',
      html: `
        <div dir="rtl" style="font-family: 'Amiri', serif; background-color: #FBFBFB; padding: 40px;">
          <h2 style="color: #2C2C2C;">إلى ${user.full_name} المحترم،</h2>
          <p style="font-size: 16px; color: #2C2C2C; line-height: 1.6;">
            نأسف لإبلاغك بأن طلب انضمامك إلى منظومة رَسَن قد تم رفضه.
          </p>
          <p style="color: #666;">السبب: ${reason || 'عدم استيفاء الشروط'}</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);

    res.json({ message: `تم رفض طلب المستخدم ${user.full_name}` });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في رفض المستخدم.' });
  }
});

// ============ Advanced User Management Routes ============

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
      query += ' AND (full_name ILIKE $' + (params.length + 1) + ' OR email ILIKE $' + (params.length + 1) + ' OR username ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب المستخدمين.' });
  }
});

app.post('/api/admin/user/:userId/block', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { reason, duration } = req.body;
  
  try {
    await db.query('UPDATE users SET status = $1 WHERE id = $2', ['blocked', req.params.userId]);
    
    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'block_user', 'users', req.params.userId, JSON.stringify({ reason, duration })]
    );

    res.json({ message: 'تم حظر المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حظر المستخدم.' });
  }
});

app.post('/api/admin/user/:userId/unblock', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    await db.query('UPDATE users SET status = $1 WHERE id = $2', ['active', req.params.userId]);
    
    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'unblock_user', 'users', req.params.userId]
    );

    res.json({ message: 'تم فك حظر المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في فك حظر المستخدم.' });
  }
});

app.post('/api/admin/user/:userId/password', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.params.userId]);
    
    // إرسال إشعار للمستخدم
    const userResult = await db.query('SELECT email, full_name FROM users WHERE id = $1', [req.params.userId]);
    const user = userResult.rows[0];

    const mailOptions = {
      from: '"منظومة رَسَن العالمية" <no-reply@rasan.app>',
      to: user.email,
      subject: 'تم تحديث كلمة المرور من قبل المدير',
      html: `
        <div dir="rtl" style="font-family: 'Amiri', serif; background-color: #FBFBFB; padding: 40px;">
          <h2 style="color: #2C2C2C;">إلى ${user.full_name} المحترم،</h2>
          <p style="font-size: 16px; color: #2C2C2C; line-height: 1.6;">
            تم تحديث كلمة المرور الخاصة بحسابك من قبل مدير النظام. إذا لم تطلب هذا، يرجى التواصل معنا فوراً.
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);

    res.json({ message: 'تم تحديث كلمة المرور بنجاح وإرسال إشعار للمستخدم' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث كلمة المرور.' });
  }
});

// ============ Notifications Routes ============

app.get('/api/notifications', checkCountryIsolation, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, message, notification_type, is_read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الإشعارات.' });
  }
});

app.post('/api/notifications/:notificationId/read', checkCountryIsolation, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [req.params.notificationId, req.user.id]);
    res.json({ message: 'تم تحديث الإشعار' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث الإشعار.' });
  }
});

// ============ Get Races ============
app.get('/api/races', checkCountryIsolation, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, date, location, status, image FROM races WHERE status = $1 ORDER BY date DESC',
      ['active']
    );
    
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

// ============ Get User Points ============
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

// ============ Get Marketplace Products ============
app.get('/api/marketplace/products', checkCountryIsolation, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, description, price, image FROM marketplace_items WHERE status = $1 ORDER BY created_at DESC',
      ['active']
    );
    
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

// ============ Admin Dashboard Routes ============

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
    const auctionsResult = await db.query('SELECT COUNT(*) as total FROM auctions WHERE status = $1', ['active']);
    const ordersResult = await db.query('SELECT COUNT(*) as total FROM marketplace_orders WHERE status = $1', ['pending']);
    
    res.json({
      total_users: parseInt(usersResult.rows[0]?.total || 0),
      total_revenue: parseFloat(revenueResult.rows[0]?.total || 0),
      active_auctions: parseInt(auctionsResult.rows[0]?.total || 0),
      pending_orders: parseInt(ordersResult.rows[0]?.total || 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الإحصائيات.' });
  }
});

// ============ Enhanced Admin Routes ============

// تحديث بيانات المستخدم
app.put('/api/admin/user/:userId', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { full_name, email, phone, country, city } = req.body;
  const userId = req.params.userId;
  
  try {
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (full_name !== undefined) {
      updateFields.push(`full_name = $${paramCount++}`);
      updateValues.push(full_name);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramCount++}`);
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount++}`);
      updateValues.push(phone);
    }
    if (country !== undefined) {
      updateFields.push(`country = $${paramCount++}`);
      updateValues.push(country);
    }
    if (city !== undefined) {
      updateFields.push(`city = $${paramCount++}`);
      updateValues.push(city);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'لا توجد حقول للتحديث' });
    }

    updateValues.push(userId);
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount}`;
    
    await db.query(query, updateValues);
    
    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update_user', 'users', userId, JSON.stringify(req.body)]
    );

    res.json({ message: 'تم تحديث بيانات المستخدم بنجاح' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'خطأ في تحديث بيانات المستخدم.' });
  }
});

// إرسال إيميل للمستخدم
app.post('/api/admin/user/:userId/send-email', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { email, type, subject, message } = req.body;
  const userId = req.params.userId;
  
  try {
    const userResult = await db.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const mailOptions = {
      from: '"منظومة رَسَن العالمية" <no-reply@rasan.app>',
      to: user.email,
      subject: subject || 'رسالة من مدير النظام',
      html: `
        <div dir="rtl" style="font-family: 'Amiri', serif; background-color: #FBFBFB; padding: 40px; border: 1px solid #D4AF37;">
          <h2 style="color: #2C2C2C; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">إلى ${user.full_name} المحترم،</h2>
          <p style="font-size: 16px; color: #2C2C2C; line-height: 1.6; margin: 20px 0;">
            ${message || 'لديك رسالة جديدة من مدير النظام'}
          </p>
          <div style="background-color: #2C2C2C; color: #D4AF37; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <p style="margin: 0;">منظومة رَسَن العالمية</p>
          </div>
          <p style="text-align: center; margin-top: 40px; font-style: italic; color: #2C2C2C; font-size: 12px;">
            "رَسَن.. حيث تلتقي أصالة الخيل بذكاء التكنولوجيا."
          </p>
        </div>
      `
    };

    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    } else {
      let info = await transporter.sendMail(mailOptions);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    // حفظ الإشعار في قاعدة البيانات
    await sendRealTimeNotification(userId, {
      title: 'رسالة من مدير النظام',
      message: message || 'لديك رسالة جديدة',
      type: type || 'info'
    });

    res.json({ message: 'تم إرسال الإيميل بنجاح' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'خطأ في إرسال الإيميل.' });
  }
});

// إرسال طلب مستند
app.post('/api/admin/user/:userId/request-document', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { email, documentType, notes } = req.body;
  const userId = req.params.userId;
  
  try {
    const userResult = await db.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const documentTypeArabic = {
      'registration': 'شهادة تسجيل',
      'identity': 'وثيقة هوية',
      'ownership': 'شهادة ملكية',
      'other': 'وثيقة أخرى'
    };

    const mailOptions = {
      from: '"منظومة رَسَن العالمية" <no-reply@rasan.app>',
      to: user.email,
      subject: 'طلب مستند من منظومة رَسَن',
      html: `
        <div dir="rtl" style="font-family: 'Amiri', serif; background-color: #FBFBFB; padding: 40px; border: 1px solid #D4AF37;">
          <h2 style="color: #2C2C2C; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">إلى ${user.full_name} المحترم،</h2>
          <p style="font-size: 16px; color: #2C2C2C; line-height: 1.6;">
            يطلب منك مدير النظام تقديم المستند التالي:
          </p>
          <div style="background-color: #2C2C2C; color: #D4AF37; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">نوع المستند: ${documentTypeArabic[documentType] || documentType}</h3>
            ${notes ? `<p style="margin: 10px 0;">ملاحظات: ${notes}</p>` : ''}
          </div>
          <p style="color: #666; margin-top: 20px;">
            يرجى تحميل المستند المطلوب في حسابك على منظومة رَسَن في أقرب وقت ممكن.
          </p>
        </div>
      `
    };

    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    } else {
      let info = await transporter.sendMail(mailOptions);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    // حفظ الإشعار في قاعدة البيانات
    await sendRealTimeNotification(userId, {
      title: 'طلب مستند جديد',
      message: `يطلب منك تقديم: ${documentTypeArabic[documentType] || documentType}`,
      type: 'warning'
    });

    res.json({ message: 'تم إرسال طلب المستند بنجاح' });
  } catch (error) {
    console.error('Error requesting document:', error);
    res.status(500).json({ message: 'خطأ في إرسال طلب المستند.' });
  }
});

// إرسال رابط إعادة تعيين كلمة المرور
app.post('/api/admin/user/:userId/send-password-reset', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const userId = req.params.userId;
  
  try {
    const userResult = await db.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // إنشاء توكن إعادة التعيين
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&userId=${userId}`;

    const mailOptions = {
      from: '"منظومة رَسَن العالمية" <no-reply@rasan.app>',
      to: user.email,
      subject: 'رابط إعادة تعيين كلمة المرور - منظومة رَسَن',
      html: `
        <div dir="rtl" style="font-family: 'Amiri', serif; background-color: #FBFBFB; padding: 40px; border: 1px solid #D4AF37;">
          <h2 style="color: #2C2C2C; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">إلى ${user.full_name} المحترم،</h2>
          <p style="font-size: 16px; color: #2C2C2C; line-height: 1.6;">
            تم إرسال هذا الرابط من قبل مدير النظام لإعادة تعيين كلمة المرور الخاصة بك.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #D4AF37; color: #2C2C2C; padding: 15px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            أو انسخ الرابط التالي في متصفحك:<br/>
            ${resetLink}
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            ملاحظة: هذا الرابط صالح لمدة 24 ساعة فقط.
          </p>
        </div>
      `
    };

    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    } else {
      let info = await transporter.sendMail(mailOptions);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    // حفظ الإشعار في قاعدة البيانات
    await sendRealTimeNotification(userId, {
      title: 'طلب إعادة تعيين كلمة المرور',
      message: 'تم إرسال رابط لإعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
      type: 'info'
    });

    res.json({ message: 'تم إرسال رابط إعادة التعيين بنجاح' });
  } catch (error) {
    console.error('Error sending password reset link:', error);
    res.status(500).json({ message: 'خطأ في إرسال رابط إعادة التعيين.' });
  }
});

// تغيير صلاحيات المستخدم
app.post('/api/admin/user/:userId/permissions', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { role } = req.body;
  const userId = req.params.userId;
  
  try {
    const validRoles = ['admin', 'federation', 'owner', 'doctor', 'vendor', 'moderator'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'دور غير صحيح' });
    }

    await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
    
    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'change_permissions', 'users', userId, JSON.stringify({ role })]
    );

    // إرسال إشعار للمستخدم
    const userResult = await db.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const roleArabic = {
      'admin': 'مدير نظام',
      'federation': 'مدير اتحاد',
      'owner': 'مالك',
      'doctor': 'طبيب بيطري',
      'vendor': 'بائع',
      'moderator': 'مشرف'
    };

    const mailOptions = {
      from: '"منظومة رَسَن العالمية" <no-reply@rasan.app>',
      to: user.email,
      subject: 'تحديث الصلاحيات - منظومة رَسَن',
      html: `
        <div dir="rtl" style="font-family: 'Amiri', serif; background-color: #FBFBFB; padding: 40px; border: 1px solid #D4AF37;">
          <h2 style="color: #2C2C2C; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">إلى ${user.full_name} المحترم،</h2>
          <p style="font-size: 16px; color: #2C2C2C; line-height: 1.6;">
            تم تحديث صلاحياتك في منظومة رَسَن.
          </p>
          <div style="background-color: #2C2C2C; color: #D4AF37; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">الدور الجديد: ${roleArabic[role]}</h3>
          </div>
        </div>
      `
    };

    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    } else {
      let info = await transporter.sendMail(mailOptions);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    res.json({ message: 'تم تحديث الصلاحيات بنجاح' });
  } catch (error) {
    console.error('Error changing permissions:', error);
    res.status(500).json({ message: 'خطأ في تحديث الصلاحيات.' });
  }
});

// جلب طلبات الموافقة
app.get('/api/admin/approvals', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    const result = await db.query(
      'SELECT id, full_name as name, email, role as type, country, created_at FROM users WHERE status = $1 ORDER BY created_at DESC',
      ['inactive']
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب طلبات الموافقة.' });
  }
});

// جلب المزادات (للمدير)
app.get('/api/admin/auctions', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { status } = req.query;
  
  try {
    let query = 'SELECT a.id, a.status, a.starting_price, a.current_highest_bid, a.end_time, h.name as horse_name, h.image_url as horse_image FROM auctions a JOIN horses h ON a.horse_id = h.id WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND a.status = $' + (params.length + 1);
      params.push(status);
    }

    query += ' ORDER BY a.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب المزادات.' });
  }
});

// جلب المنتجات (للمدير)
app.get('/api/admin/products', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { status, category } = req.query;
  
  try {
    let query = 'SELECT id, name, description, price, quantity, category, status FROM marketplace_items WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }
    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب المنتجات.' });
  }
});

// إنشاء/تحديث المنتج (للمدير)
app.post('/api/admin/products', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { name, description, price, quantity, category, status } = req.body;
  
  try {
    const result = await db.query(
      'INSERT INTO marketplace_items (vendor_id, name, description, price, quantity, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, name, description, price, quantity, category, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إنشاء المنتج.' });
  }
});

// تحديث المنتج (للمدير)
app.put('/api/admin/products/:productId', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { name, description, price, quantity, category, status } = req.body;
  
  try {
    await db.query(
      'UPDATE marketplace_items SET name = $1, description = $2, price = $3, quantity = $4, category = $5, status = $6 WHERE id = $7',
      [name, description, price, quantity, category, status, req.params.productId]
    );
    res.json({ message: 'تم تحديث المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث المنتج.' });
  }
});

// حذف المنتج (للمدير)
app.delete('/api/admin/products/:productId', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    await db.query('DELETE FROM marketplace_items WHERE id = $1', [req.params.productId]);
    res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف المنتج.' });
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Real-time notifications enabled via Socket.io`);
});
