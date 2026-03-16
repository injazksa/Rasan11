/**
 * ============================================
 * تعليمات دمج لوحة التحكم السيادية
 * Sovereign Dashboard Integration Instructions
 * ============================================
 * 
 * أضف الأكواد التالية إلى ملف server.js
 */

// ============ في أعلى الملف، أضف الاستيرادات ============
import { setupSovereignDashboardAPIs } from './sovereign-dashboard-api.js';

// ============ بعد إنشاء httpServer و io ============
// أضف هذا الكود بعد:
// const io = new SocketIOServer(httpServer, { ... });

// تحديث إعدادات Socket.io
io.on('connection', (socket) => {
  console.log('✅ مستخدم متصل:', socket.id);

  socket.on('join-admin', (userId) => {
    socket.join(`admin-${userId}`);
    console.log(`المدير ${userId} انضم إلى غرفة الإدارة`);
  });

  socket.on('disconnect', () => {
    console.log('❌ مستخدم قطع الاتصال:', socket.id);
  });
});

// ============ بعد تعريف جميع Routes الأخرى ============
// أضف هذا الكود قبل httpServer.listen:

// تطبيق جميع APIs لوحة التحكم السيادية
setupSovereignDashboardAPIs(app, db, io);

// ============ إضافة Middleware لفحص وضع الصيانة ============
// أضف هذا الكود في قسم Middleware:

const checkMaintenanceMode = async (req, res, next) => {
  try {
    const result = await db.query('SELECT maintenance_mode FROM system_settings WHERE id = 1');
    const settings = result.rows[0];

    if (settings?.maintenance_mode && req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      return res.status(503).json({
        message: 'الموقع تحت الصيانة حالياً. يرجى المحاولة لاحقاً.',
        maintenance: true
      });
    }

    next();
  } catch (error) {
    next();
  }
};

// استخدم هذا الـ Middleware في جميع Routes العامة:
// app.use('/api/marketplace', checkMaintenanceMode, ...);
// app.use('/api/auctions', checkMaintenanceMode, ...);

// ============ إضافة WebSocket Events للتحديثات الحية ============
// أضف هذا الكود في قسم Socket.IO:

io.on('connection', (socket) => {
  // الاستماع لطلبات الإحصائيات الحية
  socket.on('request-live-stats', async () => {
    try {
      const usersResult = await db.query('SELECT COUNT(*) as total FROM users WHERE status = $1', ['active']);
      const horsesResult = await db.query('SELECT COUNT(*) as total FROM horses');
      const revenueResult = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = $1', ['completed']);

      socket.emit('live-stats-update', {
        total_users: parseInt(usersResult.rows[0]?.total || 0),
        total_horses: parseInt(horsesResult.rows[0]?.total || 0),
        total_revenue: parseFloat(revenueResult.rows[0]?.total || 0),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('خطأ في إرسال الإحصائيات:', error);
    }
  });

  // الاستماع لأحداث تحديث المنتجات
  socket.on('marketplace-refresh', () => {
    io.emit('marketplace-updated', {
      message: 'تم تحديث المتجر',
      timestamp: new Date().toISOString()
    });
  });
});

// ============ إضافة Route للتحقق من وضع الصيانة ============
app.get('/api/system/maintenance-status', async (req, res) => {
  try {
    const result = await db.query('SELECT maintenance_mode, store_enabled, auction_enabled FROM system_settings WHERE id = 1');
    const settings = result.rows[0];
    res.json(settings || {});
  } catch (error) {
    res.json({ maintenance_mode: false, store_enabled: true, auction_enabled: true });
  }
});

// ============ إضافة Route للتحقق من صلاحيات المستخدم ============
app.get('/api/user/permissions', checkCountryIsolation, async (req, res) => {
  try {
    const userResult = await db.query('SELECT role, status FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const permissionsResult = await db.query('SELECT permissions FROM admin_permissions_matrix WHERE role = $1', [user.role]);
    const permissions = permissionsResult.rows[0]?.permissions || [];

    res.json({
      role: user.role,
      status: user.status,
      permissions: permissions
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الصلاحيات' });
  }
});

// ============ إضافة Route لتسجيل خروج جميع جلسات المستخدم ============
app.post('/api/admin/user/:userId/logout-all', adminAuth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // إرسال أمر Force Logout عبر WebSockets
    io.emit('forceLogout', {
      userId: userId,
      message: 'تم تسجيل خروجك من جميع الأجهزة'
    });

    // تسجيل في Audit Log
    await db.query(
      'INSERT INTO global_audit_log (admin_id, action, entity_type, entity_id, target_user_id) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'FORCE_LOGOUT_ALL', 'users', userId, userId]
    );

    res.json({
      success: true,
      message: 'تم تسجيل الخروج القسري لجميع الجلسات'
    });
  } catch (error) {
    console.error('خطأ في تسجيل الخروج القسري:', error);
    res.status(500).json({ message: 'خطأ في تسجيل الخروج' });
  }
});

// ============ إضافة Route لإرسال تنبيهات البث (Broadcast) ============
app.post('/api/admin/broadcast-notification', adminAuth, async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;

    // حفظ التنبيه في قاعدة البيانات
    const result = await db.query(
      'INSERT INTO system_notifications (title, message, notification_type, is_broadcast) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, message, type, true]
    );

    // بث التنبيه لجميع المتصلين
    io.emit('broadcast-notification', {
      id: result.rows[0].id,
      title: title,
      message: message,
      type: type,
      timestamp: new Date().toISOString()
    });

    // تسجيل في Audit Log
    await db.query(
      'INSERT INTO global_audit_log (admin_id, action, entity_type, new_values) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'BROADCAST_NOTIFICATION', 'notifications', JSON.stringify({ title, message, type })]
    );

    res.json({
      success: true,
      message: 'تم إرسال التنبيه لجميع المستخدمين'
    });
  } catch (error) {
    console.error('خطأ في إرسال التنبيه:', error);
    res.status(500).json({ message: 'خطأ في إرسال التنبيه' });
  }
});

// ============ تحديث App.jsx لإضافة SovereignDashboard ============
/*
في ملف frontend/src/App.jsx، أضف:

import SovereignDashboard from './components/SovereignDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// أضف هذا الـ Route:
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute requiredRole="admin">
      <SovereignDashboard />
    </ProtectedRoute>
  }
/>
*/

// ============ تحديث tailwind.config.js ============
/*
أضف الألوان الجديدة إلى theme.extend.colors:

colors: {
  'sovereign-dark': '#0B0B0B',
  'sovereign-gold': '#D4AF37',
  'sovereign-light': '#F9E29B',
}
*/

// ============ تحديث index.css ============
/*
أضف هذه الأنماط:

@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');

body {
  font-family: 'Cairo', 'Segoe UI', sans-serif;
}

/* Glassmorphism Effect */
.glass-effect {
  background: rgba(11, 11, 11, 0.8);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

/* Gold Glow */
.gold-glow {
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

/* Smooth Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(212, 175, 55, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.5);
}
*/

export default {
  checkMaintenanceMode
};
