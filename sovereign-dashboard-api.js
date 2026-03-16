/**
 * ============================================
 * لوحة التحكم السيادية - API Routes
 * Sovereign Dashboard - Backend APIs
 * ============================================
 * 
 * هذا الملف يحتوي على جميع API Routes الجديدة
 * يجب إضافة هذه الأكواد إلى server.js
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'rasan_secret_key';

// ============ Middleware: Admin Authentication ============
const adminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ message: "لا توجد رسالة تفويض" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "رسالة تفويض غير صحيحة" });
    
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return res.status(403).json({ message: "ليس لديك صلاحيات إدارية" });
    }
    
    req.user = decoded;
    next();
  });
};

// ============ 1. نقطة نهاية الإحصائيات الحية (Live Statistics) ============
export const setupLiveStatisticsAPI = (app, db, io) => {
  // جلب الإحصائيات الحية
  app.get('/api/admin/live-stats', adminAuth, async (req, res) => {
    try {
      const usersResult = await db.query('SELECT COUNT(*) as total FROM users WHERE status = $1', ['active']);
      const horsesResult = await db.query('SELECT COUNT(*) as total FROM horses');
      const revenueResult = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = $1', ['completed']);
      const auctionsResult = await db.query('SELECT COUNT(*) as total FROM auctions WHERE status = $1', ['active']);
      const federationsResult = await db.query('SELECT COUNT(*) as total FROM federations WHERE status = $1', ['active']);
      const ordersResult = await db.query('SELECT COUNT(*) as total FROM marketplace_orders WHERE status = $1', ['pending']);

      const stats = {
        total_active_users: parseInt(usersResult.rows[0]?.total || 0),
        total_horses: parseInt(horsesResult.rows[0]?.total || 0),
        total_revenue: parseFloat(revenueResult.rows[0]?.total || 0),
        active_auctions: parseInt(auctionsResult.rows[0]?.total || 0),
        active_federations: parseInt(federationsResult.rows[0]?.total || 0),
        pending_orders: parseInt(ordersResult.rows[0]?.total || 0),
        timestamp: new Date().toISOString()
      };

      res.json(stats);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      res.status(500).json({ message: 'خطأ في جلب الإحصائيات' });
    }
  });

  // بث الإحصائيات الحية عبر WebSockets
  setInterval(async () => {
    try {
      const usersResult = await db.query('SELECT COUNT(*) as total FROM users WHERE status = $1', ['active']);
      const horsesResult = await db.query('SELECT COUNT(*) as total FROM horses');
      const revenueResult = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = $1', ['completed']);
      const auctionsResult = await db.query('SELECT COUNT(*) as total FROM auctions WHERE status = $1', ['active']);
      const federationsResult = await db.query('SELECT COUNT(*) as total FROM federations WHERE status = $1', ['active']);
      const ordersResult = await db.query('SELECT COUNT(*) as total FROM marketplace_orders WHERE status = $1', ['pending']);

      const stats = {
        total_active_users: parseInt(usersResult.rows[0]?.total || 0),
        total_horses: parseInt(horsesResult.rows[0]?.total || 0),
        total_revenue: parseFloat(revenueResult.rows[0]?.total || 0),
        active_auctions: parseInt(auctionsResult.rows[0]?.total || 0),
        active_federations: parseInt(federationsResult.rows[0]?.total || 0),
        pending_orders: parseInt(ordersResult.rows[0]?.total || 0),
        timestamp: new Date().toISOString()
      };

      // بث الإحصائيات لجميع المديرين المتصلين
      io.emit('liveStatsUpdate', stats);
    } catch (error) {
      console.error('خطأ في بث الإحصائيات:', error);
    }
  }, 30000); // كل 30 ثانية
};

// ============ 2. نقطة نهاية انتحال الشخصية (Impersonation) ============
export const setupImpersonationAPI = (app, db, io) => {
  app.post('/api/admin/impersonate/:userId', adminAuth, async (req, res) => {
    try {
      const userId = req.params.userId;

      // التحقق من وجود المستخدم
      const userResult = await db.query('SELECT id, email, role, full_name FROM users WHERE id = $1', [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
      }

      const targetUser = userResult.rows[0];

      // إنشاء توكن جديد للمستخدم المراد انتحال شخصيته
      const impersonationToken = jwt.sign(
        { 
          id: targetUser.id, 
          email: targetUser.email, 
          role: targetUser.role,
          impersonated_by: req.user.id,
          is_impersonation: true
        },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      // تسجيل العملية في Audit Log
      await db.query(
        'INSERT INTO global_audit_log (admin_id, action, entity_type, entity_id, target_user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.user.id, 'IMPERSONATE_USER', 'users', targetUser.id, targetUser.id, `انتحال شخصية: ${targetUser.full_name}`]
      );

      res.json({
        success: true,
        token: impersonationToken,
        message: `أنت الآن تتصفح كـ: ${targetUser.full_name}`,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
          full_name: targetUser.full_name
        }
      });
    } catch (error) {
      console.error('خطأ في انتحال الشخصية:', error);
      res.status(500).json({ message: 'خطأ في انتحال الشخصية' });
    }
  });
};

// ============ 3. نقطة نهاية تغيير الصلاحيات مع Force Logout ============
export const setupPermissionsAPI = (app, db, io) => {
  app.post('/api/admin/user/:userId/change-role', adminAuth, async (req, res) => {
    try {
      const { role, reason } = req.body;
      const userId = req.params.userId;

      const validRoles = ['admin', 'federation', 'owner', 'doctor', 'vendor', 'moderator'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'دور غير صحيح' });
      }

      // جلب بيانات المستخدم الحالية
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const oldUser = userResult.rows[0];

      // تحديث الدور
      await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);

      // تسجيل في Audit Log
      await db.query(
        'INSERT INTO global_audit_log (admin_id, action, entity_type, entity_id, target_user_id, old_values, new_values, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          req.user.id,
          'CHANGE_ROLE',
          'users',
          userId,
          userId,
          JSON.stringify({ role: oldUser.role }),
          JSON.stringify({ role: role }),
          reason || 'تغيير الدور'
        ]
      );

      // إرسال إشعار فوري للمستخدم عبر WebSockets
      io.emit('userRoleChanged', {
        userId: userId,
        newRole: role,
        message: `تم تغيير دورك إلى: ${role}`
      });

      res.json({
        success: true,
        message: `تم تغيير دور المستخدم إلى: ${role}`
      });
    } catch (error) {
      console.error('خطأ في تغيير الدور:', error);
      res.status(500).json({ message: 'خطأ في تغيير الدور' });
    }
  });

  // حظر المستخدم مع Force Logout
  app.post('/api/admin/user/:userId/block', adminAuth, async (req, res) => {
    try {
      const { reason } = req.body;
      const userId = req.params.userId;

      // جلب بيانات المستخدم
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];

      // تحديث حالة المستخدم
      await db.query('UPDATE users SET status = $1 WHERE id = $2', ['blocked', userId]);

      // تسجيل في Audit Log
      await db.query(
        'INSERT INTO global_audit_log (admin_id, action, entity_type, entity_id, target_user_id, old_values, new_values, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          req.user.id,
          'BLOCK_USER',
          'users',
          userId,
          userId,
          JSON.stringify({ status: user.status }),
          JSON.stringify({ status: 'blocked' }),
          reason || 'حظر المستخدم'
        ]
      );

      // إرسال أمر Force Logout عبر WebSockets
      io.emit('forceLogout', {
        userId: userId,
        message: `حسابك محظور حالياً. السبب: ${reason || 'لم يتم تحديد سبب'}`
      });

      res.json({
        success: true,
        message: `تم حظر المستخدم بنجاح`
      });
    } catch (error) {
      console.error('خطأ في حظر المستخدم:', error);
      res.status(500).json({ message: 'خطأ في حظر المستخدم' });
    }
  });

  // فك حظر المستخدم
  app.post('/api/admin/user/:userId/unblock', adminAuth, async (req, res) => {
    try {
      const userId = req.params.userId;

      // جلب بيانات المستخدم
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];

      // تحديث حالة المستخدم
      await db.query('UPDATE users SET status = $1 WHERE id = $2', ['active', userId]);

      // تسجيل في Audit Log
      await db.query(
        'INSERT INTO global_audit_log (admin_id, action, entity_type, entity_id, target_user_id, old_values, new_values) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          req.user.id,
          'UNBLOCK_USER',
          'users',
          userId,
          userId,
          JSON.stringify({ status: user.status }),
          JSON.stringify({ status: 'active' })
        ]
      );

      // إرسال إشعار للمستخدم
      io.emit('userUnblocked', {
        userId: userId,
        message: 'تم فك حظر حسابك. يمكنك الآن تسجيل الدخول'
      });

      res.json({
        success: true,
        message: `تم فك حظر المستخدم بنجاح`
      });
    } catch (error) {
      console.error('خطأ في فك حظر المستخدم:', error);
      res.status(500).json({ message: 'خطأ في فك حظر المستخدم' });
    }
  });
};

// ============ 4. نقطة نهاية إدارة إعدادات النظام (System Settings) ============
export const setupSystemSettingsAPI = (app, db, io) => {
  // جلب إعدادات النظام
  app.get('/api/admin/system-settings', adminAuth, async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM system_settings WHERE id = 1');
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'لم يتم العثور على إعدادات النظام' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('خطأ في جلب إعدادات النظام:', error);
      res.status(500).json({ message: 'خطأ في جلب إعدادات النظام' });
    }
  });

  // تحديث إعدادات النظام
  app.put('/api/admin/system-settings', adminAuth, async (req, res) => {
    try {
      const {
        maintenance_mode,
        store_enabled,
        auction_enabled,
        registration_enabled,
        commission_rate
      } = req.body;

      // جلب الإعدادات القديمة
      const oldResult = await db.query('SELECT * FROM system_settings WHERE id = 1');
      const oldSettings = oldResult.rows[0];

      // تحديث الإعدادات
      await db.query(
        `UPDATE system_settings SET 
          maintenance_mode = COALESCE($1, maintenance_mode),
          store_enabled = COALESCE($2, store_enabled),
          auction_enabled = COALESCE($3, auction_enabled),
          registration_enabled = COALESCE($4, registration_enabled),
          commission_rate = COALESCE($5, commission_rate),
          updated_at = NOW(),
          updated_by = $6
        WHERE id = 1`,
        [
          maintenance_mode,
          store_enabled,
          auction_enabled,
          registration_enabled,
          commission_rate,
          req.user.id
        ]
      );

      // تسجيل في Audit Log
      await db.query(
        'INSERT INTO global_audit_log (admin_id, action, entity_type, old_values, new_values) VALUES ($1, $2, $3, $4, $5)',
        [
          req.user.id,
          'UPDATE_SYSTEM_SETTINGS',
          'system_settings',
          JSON.stringify(oldSettings),
          JSON.stringify(req.body)
        ]
      );

      // بث التحديثات الحية لجميع المتصلين
      io.emit('systemSettingsChanged', {
        maintenance_mode,
        store_enabled,
        auction_enabled,
        registration_enabled,
        commission_rate,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'تم تحديث إعدادات النظام بنجاح'
      });
    } catch (error) {
      console.error('خطأ في تحديث إعدادات النظام:', error);
      res.status(500).json({ message: 'خطأ في تحديث إعدادات النystem' });
    }
  });
};

// ============ 5. نقطة نهاية سجل العمليات السيادي (Global Audit Log) ============
export const setupAuditLogAPI = (app, db) => {
  // جلب سجل العمليات
  app.get('/api/admin/audit-logs', adminAuth, async (req, res) => {
    try {
      const { limit = 100, offset = 0, action, user_id } = req.query;

      let query = 'SELECT * FROM global_audit_log WHERE 1=1';
      const params = [];

      if (action) {
        query += ' AND action = $' + (params.length + 1);
        params.push(action);
      }

      if (user_id) {
        query += ' AND admin_id = $' + (params.length + 1);
        params.push(user_id);
      }

      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit);
      params.push(offset);

      const result = await db.query(query, params);
      
      // جلب العدد الكلي
      let countQuery = 'SELECT COUNT(*) as total FROM global_audit_log WHERE 1=1';
      const countParams = [];

      if (action) {
        countQuery += ' AND action = $' + (countParams.length + 1);
        countParams.push(action);
      }

      if (user_id) {
        countQuery += ' AND admin_id = $' + (countParams.length + 1);
        countParams.push(user_id);
      }

      const countResult = await db.query(countQuery, countParams);

      res.json({
        logs: result.rows,
        total: parseInt(countResult.rows[0]?.total || 0),
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('خطأ في جلب سجل العمليات:', error);
      res.status(500).json({ message: 'خطأ في جلب سجل العمليات' });
    }
  });

  // حذف سجل عملية (للأرشفة فقط، لا يتم الحذف الفعلي)
  app.post('/api/admin/audit-logs/:logId/archive', adminAuth, async (req, res) => {
    try {
      const logId = req.params.logId;

      await db.query(
        'UPDATE global_audit_log SET status = $1 WHERE id = $2',
        ['archived', logId]
      );

      res.json({ success: true, message: 'تم أرشفة السجل' });
    } catch (error) {
      console.error('خطأ في أرشفة السجل:', error);
      res.status(500).json({ message: 'خطأ في أرشفة السجل' });
    }
  });
};

// ============ 6. نقطة نهاية إدارة المتجر الديناميكية (Dynamic Marketplace) ============
export const setupMarketplaceManagementAPI = (app, db, io) => {
  // إضافة منتج جديد
  app.post('/api/admin/marketplace/products', adminAuth, async (req, res) => {
    try {
      const { name, description, price, quantity, category, image_url, requires_prescription } = req.body;

      const result = await db.query(
        `INSERT INTO marketplace_items 
        (vendor_id, name, description, price, quantity, category, image_url, requires_prescription, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [req.user.id, name, description, price, quantity, category, image_url, requires_prescription || false, 'active']
      );

      const newProduct = result.rows[0];

      // تسجيل في Audit Log
      await db.query(
        'INSERT INTO global_audit_log (admin_id, action, entity_type, entity_id, new_values) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, 'ADD_PRODUCT', 'marketplace_items', newProduct.id, JSON.stringify(newProduct)]
      );

      // بث المنتج الجديد لجميع المستخدمين
      io.emit('newProductAdded', {
        product: newProduct,
        message: `تم إضافة منتج جديد: ${name}`
      });

      res.status(201).json({
        success: true,
        product: newProduct,
        message: 'تم إضافة المنتج بنجاح'
      });
    } catch (error) {
      console.error('خطأ في إضافة المنتج:', error);
      res.status(500).json({ message: 'خطأ في إضافة المنتج' });
    }
  });

  // تحديث منتج
  app.put('/api/admin/marketplace/products/:productId', adminAuth, async (req, res) => {
    try {
      const { name, description, price, quantity, category, image_url, status } = req.body;
      const productId = req.params.productId;

      // جلب المنتج القديم
      const oldResult = await db.query('SELECT * FROM marketplace_items WHERE id = $1', [productId]);
      const oldProduct = oldResult.rows[0];

      // تحديث المنتج
      await db.query(
        `UPDATE marketplace_items SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          quantity = COALESCE($4, quantity),
          category = COALESCE($5, category),
          image_url = COALESCE($6, image_url),
          status = COALESCE($7, status)
        WHERE id = $8`,
        [name, description, price, quantity, category, image_url, status, productId]
      );

      // تسجيل في Audit Log
      await db.query(
        'INSERT INTO global_audit_log (admin_id, action, entity_type, entity_id, old_values, new_values) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.user.id, 'UPDATE_PRODUCT', 'marketplace_items', productId, JSON.stringify(oldProduct), JSON.stringify(req.body)]
      );

      // بث التحديث
      io.emit('productUpdated', {
        productId: productId,
        updates: req.body,
        message: `تم تحديث المنتج: ${name || oldProduct.name}`
      });

      res.json({
        success: true,
        message: 'تم تحديث المنتج بنجاح'
      });
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      res.status(500).json({ message: 'خطأ في تحديث المنتج' });
    }
  });

  // حذف منتج
  app.delete('/api/admin/marketplace/products/:productId', adminAuth, async (req, res) => {
    try {
      const productId = req.params.productId;

      // جلب المنتج قبل الحذف
      const result = await db.query('SELECT * FROM marketplace_items WHERE id = $1', [productId]);
      const product = result.rows[0];

      // حذف المنتج
      await db.query('DELETE FROM marketplace_items WHERE id = $1', [productId]);

      // تسجيل في Audit Log
      await db.query(
        'INSERT INTO global_audit_log (admin_id, action, entity_type, entity_id, old_values) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, 'DELETE_PRODUCT', 'marketplace_items', productId, JSON.stringify(product)]
      );

      // بث الحذف
      io.emit('productDeleted', {
        productId: productId,
        message: `تم حذف المنتج: ${product.name}`
      });

      res.json({
        success: true,
        message: 'تم حذف المنتج بنجاح'
      });
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error);
      res.status(500).json({ message: 'خطأ في حذف المنتج' });
    }
  });
};

// ============ 7. نقطة نهاية إدارة النزاعات (Dispute Resolution) ============
export const setupDisputeResolutionAPI = (app, db, io) => {
  // جلب النزاعات المعلقة
  app.get('/api/admin/disputes', adminAuth, async (req, res) => {
    try {
      const { status = 'pending', limit = 50, offset = 0 } = req.query;

      const result = await db.query(
        `SELECT * FROM dispute_resolutions 
        WHERE status = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3`,
        [status, limit, offset]
      );

      res.json({
        disputes: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('خطأ في جلب النزاعات:', error);
      res.status(500).json({ message: 'خطأ في جلب النزاعات' });
    }
  });

  // حل نزاع (إرجاع مبلغ أو تأكيد العملية)
  app.post('/api/admin/disputes/:disputeId/resolve', adminAuth, async (req, res) => {
    try {
      const { resolution, refund_amount } = req.body;
      const disputeId = req.params.disputeId;

      // جلب النزاع
      const disputeResult = await db.query('SELECT * FROM dispute_resolutions WHERE id = $1', [disputeId]);
      const dispute = disputeResult.rows[0];

      // تحديث النزاع
      await db.query(
        `UPDATE dispute_resolutions SET 
          status = $1,
          resolution = $2,
          refund_amount = $3,
          admin_id = $4,
          resolved_at = NOW()
        WHERE id = $5`,
        ['resolved', resolution, refund_amount || 0, req.user.id, disputeId]
      );

      // تسجيل في Audit Log
      await db.query(
        'INSERT INTO global_audit_log (admin_id, action, entity_type, entity_id, new_values) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, 'RESOLVE_DISPUTE', 'dispute_resolutions', disputeId, JSON.stringify({ resolution, refund_amount })]
      );

      // بث التحديث
      io.emit('disputeResolved', {
        disputeId: disputeId,
        resolution: resolution,
        refund_amount: refund_amount || 0
      });

      res.json({
        success: true,
        message: 'تم حل النزاع بنجاح'
      });
    } catch (error) {
      console.error('خطأ في حل النزاع:', error);
      res.status(500).json({ message: 'خطأ في حل النزاع' });
    }
  });
};

// ============ Export all setup functions ============
export const setupSovereignDashboardAPIs = (app, db, io) => {
  setupLiveStatisticsAPI(app, db, io);
  setupImpersonationAPI(app, db, io);
  setupPermissionsAPI(app, db, io);
  setupSystemSettingsAPI(app, db, io);
  setupAuditLogAPI(app, db);
  setupMarketplaceManagementAPI(app, db, io);
  setupDisputeResolutionAPI(app, db, io);
};
