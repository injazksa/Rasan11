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
// هذا الكود يضمن وجود حساب المدير في قاعدة البيانات عند تشغيل السيرفر
const initializeAdminAccount = async () => {
  try {
    const adminEmail = 'admin@rasan.app';
    const adminPassword = 'admin_rasan_2026';
    
    // التحقق من وجود حساب المدير
    const existingAdmin = await db.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      // إنشاء حساب المدير الجديد
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.query(
        'INSERT INTO users (username, email, password_hash, role, status, full_name, country, city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        ['admin', adminEmail, hashedPassword, 'admin', 'active', 'المدير العام', 'السعودية', 'الرياض']
      );
      console.log('✅ تم إنشاء حساب المدير بنجاح');
      console.log(`📧 البريد: ${adminEmail}`);
      console.log(`🔐 كلمة المرور: ${adminPassword}`);
    } else {
      console.log('✅ حساب المدير موجود بالفعل');
    }
  } catch (error) {
    console.error('⚠️ خطأ في تهيئة حساب المدير:', error.message);
  }
};

// استدعاء دالة التهيئة عند بدء السيرفر
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

// ============ Email Service (Royal Accreditation) ============

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
          نحييكم بتحية الفرسان. يسعدنا إبلاغكم بأن مدير النظام العام قد أتم مراجعة وثائقكم واعتماد حسابكم رسمياً ضمن منظومة رَسَن (Rasan) العالمية. لقد أصبحت الآن جزءاً من النخبة التي تدير مستقبل الفروسية الرقمي.
        </p>
        <div style="background-color: #2C2C2C; color: #D4AF37; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0;">ميثاق الصلاحيات (Your Mandate)</h3>
          <p>بناءً على دوركم كـ <strong>${userRole}</strong> في دولة <strong>${country}</strong>، نمنحكم السلطات التالية:</p>
          <ul style="list-style-type: none; padding: 0;">
            <li>🛡️ <strong>السيادة الإقليمية:</strong> التحكم الكامل في سجلات الخيول والملاك التابعين لنطاقكم الجغرافي فقط.</li>
            <li>📜 <strong>التوثيق الرقمي:</strong> صلاحية إصدار "الجواز الرقمي الموثق" وربطه بـ QR Code سيادي.</li>
            <li>⚖️ <strong>الرقابة والعدالة:</strong> سلطة فرض العقوبات، الغرامات، أو تعليق الأهلية للمخالفين.</li>
          </ul>
        </div>
        <p style="font-size: 14px; color: #666;">
          ID المرجع: RSN-${Math.random().toString(36).substr(2, 4).toUpperCase()}-2026<br>
          حالة الحساب: نشط (Verified) ✅
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://rasan.app/login" style="background-color: #D4AF37; color: #2C2C2C; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">الدخول إلى لوحة التحكم</a>
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
    console.log(`Accreditation email logic triggered for ${userEmail}`);
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
  
  console.log('DEBUG: Received registration request:', { username, email, role, full_name, phone, country, city });

  if (!email || !password || !full_name) {
    return res.status(400).json({ message: 'يرجى تعبئة جميع الحقول: الاسم، البريد، وكلمة المرور' });
  }
  
  const finalUsername = username || email.split('@')[0] + Math.floor(Math.random() * 1000);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Attempting to insert user with data:', { username, email, role, full_name, phone, country, city });
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role, full_name, phone, country, city, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, username, email, role, full_name, country, status',
      [finalUsername, email, hashedPassword, role || 'owner', full_name, phone, country, city || 'N/A', 'inactive']
    );
    console.log('Insert successful:', result.rows[0]);
    const newUser = result.rows[0];

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, country: newUser.country }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error('CRITICAL REGISTRATION ERROR:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
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
    console.error('Error during login:', error);
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
    console.error('Error fetching approvals:', error);
    res.status(500).json({ message: 'خطأ في جلب طلبات الموافقات.' });
  }
});

app.post('/api/admin/approve-user', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { userId, userEmail, userName, userRole, country } = req.body;
  
  try {
    await db.query('UPDATE users SET status = $1 WHERE id = $2', ['active', userId]);
    console.log(`Approving user ${userId} and sending email to ${userEmail}`);
    await sendRoyalAccreditationEmail(userEmail, userName, userRole, country);
    res.json({ message: `تم اعتماد المستخدم ${userName} وإرسال رسالة الترحيب الملكية.` });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'خطأ في اعتماد المستخدم.' });
  }
});

// God Eye Dashboard Routes
app.get('/api/admin/godeye/stats', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  try {
    const stats = await db.query('SELECT * FROM admin_dashboard_stats');
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching God Eye stats:', error);
    res.status(500).json({ message: 'خطأ في جلب إحصائيات عين الإله.' });
  }
});

app.get('/api/admin/godeye/users', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  try {
    const federationMap = {
      'السعودية': 'الاتحاد السعودي للفروسية',
      'الأردن': 'اتحاد الفروسية الملكي الأردني',
      'قطر': 'الاتحاد القطري للفروسية',
      'البحرين': 'الاتحاد الملكي البحريني للفروسية',
      'الإمارات': 'اتحاد الإمارات للفروسية والسباق',
      'الكويت': 'الاتحاد الكويتي للفروسية',
      'عمان': 'الاتحاد العماني للفروسية',
      'مصر': 'الاتحاد المصري للفروسية',
      'المغرب': 'الجامعة الملكية المغربية للفروسية',
      'تونس': 'الجامعة التونسية للفروسية',
      'الجزائر': 'الاتحاد الجزائري للفروسية',
      'ليبيا': 'الاتحاد الليبي للفروسية',
      'سوريا': 'الاتحاد العربي السوري للفروسية',
      'لبنان': 'الاتحاد اللبناني للفروسية',
      'العراق': 'الاتحاد العراقي للفروسية',
      'فلسطين': 'الاتحاد الفلسطيني للفروسية',
      'تركيا': 'الاتحاد التركي للفروسية'
    };

    const users = await db.query('SELECT id, username, email, role, full_name, country, status, last_login FROM users');
    
    const usersWithFederation = users.rows.map(user => ({
      ...user,
      federation: federationMap[user.country] || 'بدون اتحاد'
    }));

    res.json(usersWithFederation);
  } catch (error) {
    console.error('Error fetching God Eye users:', error);
    res.status(500).json({ message: 'خطأ في جلب المستخدمين لعين الإله.' });
  }
});

app.post('/api/admin/godeye/user/:id/status', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: `تم تحديث حالة المستخدم ${id} إلى ${status}.` });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'خطأ في تحديث حالة المستخدم.' });
  }
});

app.post('/api/admin/godeye/user/:id/password', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  const { id } = req.params;
  const { password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, id]);
    res.json({ message: `تم تحديث كلمة مرور المستخدم ${id} بنجاح.` });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ message: 'خطأ في تحديث كلمة المرور.' });
  }
});

app.post('/api/admin/godeye/user/:id/role', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  const { id } = req.params;
  const { role } = req.body;
  try {
    await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    res.json({ message: `تم تحديث دور المستخدم ${id} إلى ${role}.` });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'خطأ في تحديث دور المستخدم.' });
  }
});

// Horses Routes
app.get('/api/horses', checkCountryIsolation, async (req, res) => {
  try {
    let query = 'SELECT * FROM horses';
    let params = [];
    if (req.user.role !== 'admin' && req.countryFilter.country) {
      query += ' WHERE owner_id IN (SELECT id FROM users WHERE country = $1)';
      params.push(req.countryFilter.country);
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching horses:', error);
    res.status(500).json({ message: 'خطأ في جلب الخيول.' });
  }
});

app.post('/api/horses', checkCountryIsolation, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'owner' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access Denied" });
  }

  const { name, breed, age, gender, color, height, weight, registration_number, pedigree, health_status, medical_history, achievements, federation_id } = req.body;
  const owner_id = req.user.id; // Owner is the logged-in user

  try {
    let imageUrl = null;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        resource_type: "image",
        folder: "rasan_horses"
      });
      imageUrl = uploadResponse.secure_url;
    }

    const result = await db.query(
      'INSERT INTO horses (owner_id, federation_id, name, breed, age, gender, color, height, weight, registration_number, pedigree, health_status, medical_history, achievements, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
      [owner_id, federation_id, name, breed, age, gender, color, height, weight, registration_number, pedigree, health_status, medical_history, achievements, imageUrl]
    );
    const newHorse = result.rows[0];

    // Generate QR Code for the new horse
    const qrCodeData = `${process.env.FRONTEND_URL}/passport/${newHorse.id}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);
    
    // Upload QR code to Cloudinary
    const qrUploadResponse = await cloudinary.uploader.upload(qrCodeImage, {
      resource_type: "image",
      folder: "rasan_qrcodes"
    });
    const qrCodeUrl = qrUploadResponse.secure_url;

    // Update horse with QR code URL
    await db.query('UPDATE horses SET qr_code_url = $1 WHERE id = $2', [qrCodeUrl, newHorse.id]);
    newHorse.qr_code_url = qrCodeUrl; // Update the returned object

    res.status(201).json(newHorse);
  } catch (error) {
    console.error('Error adding horse:', error);
    res.status(500).json({ message: 'خطأ في إضافة الخيل.' });
  }
});

// Route for fetching a single horse for QR Code / Passport
app.get('/api/horses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM horses WHERE id = $1', [id]);
    const horse = result.rows[0];
    if (!horse) {
      return res.status(404).json({ message: 'الخيل غير موجود.' });
    }
    res.json(horse);
  } catch (error) {
    console.error('Error fetching horse details:', error);
    res.status(500).json({ message: 'خطأ في جلب بيانات الخيل.' });
  }
});

// Marketplace Routes
app.get('/api/marketplace', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM marketplace_items WHERE status = $1', ['active']);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    res.status(500).json({ message: 'خطأ في جلب منتجات المتجر.' });
  }
});

// ============ Error Handling ============

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// ============ Server Startup ============

app.listen(PORT, () => {
  console.log(`
		╔════════════════════════════════════════╗
		║   منصة رَسَن - Rasan Platform         ║
		║   Sovereign Backend Running           ║
		╚════════════════════════════════════════╝
  
		  🚀 Server: http://localhost:${PORT}
		  Environment: ${process.env.NODE_ENV || 'production'}
  `);
});

export default app;
