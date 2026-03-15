import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'rasan_secret_key';

// ============ Middleware ============

// Security
app.use(helmet());
app.use(cors({
  origin: '*', // For development flexibility
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Sovereignty Middleware (Country Isolation)
const checkCountryIsolation = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: "No token provided!" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized!" });
    req.user = decoded;
    
    if (decoded.role === 'SUPER_ADMIN') {
      req.countryFilter = {};
    } else {
      req.countryFilter = { country_code: decoded.country_code };
    }
    next();
  });
};

// ============ Routes ============

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth Routes (Integrated)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Mock login for any user
  const token = jwt.sign({ email, role: 'SUPER_ADMIN', country_code: 'ALL' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { email, role: 'SUPER_ADMIN', country_code: 'ALL' } });
});

// Horses Routes with Sovereignty Logic
app.get('/api/horses', checkCountryIsolation, (req, res) => {
  res.json({ 
    message: 'Horses fetched with country isolation', 
    filter: req.countryFilter,
    data: [
      { id: 1, name: 'صقر العرب', country: 'JO' },
      { id: 2, name: 'نجمة الصحراء', country: 'JO' }
    ]
  });
});

// Auctions Routes
app.get('/api/auctions', (req, res) => {
  res.json([
    { id: 1, horse: 'صقر العرب', current_bid: 55000, status: 'ACTIVE' }
  ]);
});

// Marketplace Routes
app.get('/api/marketplace', (req, res) => {
  res.json([
    { id: 1, name: 'سرج جلدي فاخر', price: 1200, category: 'Equipment' }
  ]);
});

// Admin Approval Routes
app.get('/api/admin/approvals', checkCountryIsolation, (req, res) => {
  if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ message: "Access Denied" });
  res.json([
    { id: 'RSN-QA-99', name: 'اتحاد قطر للفروسية', type: 'Federation', country: 'قطر', status: 'PENDING' },
    { id: 'RSN-JO-44', name: 'د. سامي العلي', type: 'Doctor', country: 'الأردن', status: 'PENDING' }
  ]);
});

// ============ Error Handling ============

// Serve Frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// ============ Server Startup ============

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   منصة رَسَن - Rasan Platform         ║
║   Backend Server Running              ║
╚════════════════════════════════════════╝
  
  🚀 Server: http://localhost:${PORT}
  📊 Health: http://localhost:${PORT}/health
  
  Environment: ${process.env.NODE_ENV || 'development'}
  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}
  
  `);
});

export default app;
