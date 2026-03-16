// ============ إضافات API للمزادات والمنتجات والتقارير ============
// أضف هذه المسارات إلى server-enhanced.js

// ============ Auctions Management Routes ============

app.get('/api/admin/auctions', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { status } = req.query;
  
  try {
    let query = `
      SELECT a.id, a.status, a.starting_price, a.current_highest_bid, a.end_time,
             h.name as horse_name, h.image_url as horse_image,
             u.full_name as highest_bidder_name
      FROM auctions a
      LEFT JOIN horses h ON a.horse_id = h.id
      LEFT JOIN users u ON a.highest_bidder_id = u.id
      WHERE 1=1
    `;
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

app.post('/api/admin/auctions', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { horse_id, starting_price, end_time, status } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO auctions (horse_id, owner_id, starting_price, end_time, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [horse_id, req.user.id, starting_price, end_time, status || 'pending']
    );

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'create_auction', 'auctions', result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إنشاء المزاد.' });
  }
});

app.put('/api/admin/auctions/:auctionId', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { starting_price, end_time, status } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE auctions 
       SET starting_price = COALESCE($1, starting_price),
           end_time = COALESCE($2, end_time),
           status = COALESCE($3, status)
       WHERE id = $4
       RETURNING *`,
      [starting_price, end_time, status, req.params.auctionId]
    );

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update_auction', 'auctions', req.params.auctionId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث المزاد.' });
  }
});

app.delete('/api/admin/auctions/:auctionId', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    await db.query('DELETE FROM auctions WHERE id = $1', [req.params.auctionId]);

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'delete_auction', 'auctions', req.params.auctionId]
    );

    res.json({ message: 'تم حذف المزاد بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف المزاد.' });
  }
});

// ============ Products Management Routes ============

app.get('/api/admin/products', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { status, category } = req.query;
  
  try {
    let query = `
      SELECT id, name, description, category, price, quantity, status, created_at
      FROM marketplace_items
      WHERE 1=1
    `;
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

app.post('/api/admin/products', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ message: "Access Denied" });
  }
  
  const { name, description, category, price, quantity, status } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO marketplace_items (vendor_id, name, description, category, price, quantity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, name, description, category, price, quantity || 0, status || 'active']
    );

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'create_product', 'marketplace_items', result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إنشاء المنتج.' });
  }
});

app.put('/api/admin/products/:productId', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ message: "Access Denied" });
  }
  
  const { name, description, category, price, quantity, status } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE marketplace_items 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           price = COALESCE($4, price),
           quantity = COALESCE($5, quantity),
           status = COALESCE($6, status)
       WHERE id = $7
       RETURNING *`,
      [name, description, category, price, quantity, status, req.params.productId]
    );

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update_product', 'marketplace_items', req.params.productId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث المنتج.' });
  }
});

app.delete('/api/admin/products/:productId', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ message: "Access Denied" });
  }
  
  try {
    await db.query('DELETE FROM marketplace_items WHERE id = $1', [req.params.productId]);

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'delete_product', 'marketplace_items', req.params.productId]
    );

    res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف المنتج.' });
  }
});

// ============ Financial Reports Routes ============

app.get('/api/admin/reports/revenue', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { startDate, endDate } = req.query;
  
  try {
    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN transaction_type = 'payment' THEN amount ELSE 0 END), 0) as payments,
        COALESCE(SUM(CASE WHEN transaction_type = 'commission' THEN amount ELSE 0 END), 0) as commissions,
        COALESCE(SUM(CASE WHEN transaction_type = 'refund' THEN amount ELSE 0 END), 0) as refunds
      FROM transactions
      WHERE status = 'completed'
    `;
    const params = [];

    if (startDate) {
      query += ' AND created_at >= $' + (params.length + 1);
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND created_at <= $' + (params.length + 1);
      params.push(endDate);
    }

    query += ' GROUP BY DATE(created_at) ORDER BY date DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب التقارير المالية.' });
  }
});

app.get('/api/admin/reports/summary', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    const totalRevenue = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = $1 AND transaction_type = $2',
      ['completed', 'payment']
    );

    const totalCommissions = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = $1 AND transaction_type = $2',
      ['completed', 'commission']
    );

    const totalRefunds = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = $1 AND transaction_type = $2',
      ['completed', 'refund']
    );

    const totalTransactions = await db.query(
      'SELECT COUNT(*) as total FROM transactions WHERE status = $1',
      ['completed']
    );

    const pendingOrders = await db.query(
      'SELECT COUNT(*) as total FROM marketplace_orders WHERE status = $1',
      ['pending']
    );

    res.json({
      total_revenue: parseFloat(totalRevenue.rows[0]?.total || 0),
      total_commissions: parseFloat(totalCommissions.rows[0]?.total || 0),
      total_refunds: parseFloat(totalRefunds.rows[0]?.total || 0),
      total_transactions: parseInt(totalTransactions.rows[0]?.total || 0),
      pending_orders: parseInt(pendingOrders.rows[0]?.total || 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب ملخص التقارير.' });
  }
});

app.get('/api/admin/reports/users', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    const result = await db.query(`
      SELECT 
        role,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_count,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_count
      FROM users
      GROUP BY role
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب تقارير المستخدمين.' });
  }
});

app.get('/api/admin/reports/audit-logs', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { limit = 100 } = req.query;
  
  try {
    const result = await db.query(`
      SELECT 
        al.id, al.user_id, al.action, al.entity_type, al.entity_id,
        al.created_at, u.full_name, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب سجلات التدقيق.' });
  }
});

// ============ Orders Management Routes ============

app.get('/api/admin/orders', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { status } = req.query;
  
  try {
    let query = `
      SELECT mo.id, mo.order_number, mo.total_amount, mo.status, mo.created_at,
             u.full_name, u.email, u.phone
      FROM marketplace_orders mo
      LEFT JOIN users u ON mo.buyer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND mo.status = $' + (params.length + 1);
      params.push(status);
    }

    query += ' ORDER BY mo.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الطلبات.' });
  }
});

app.put('/api/admin/orders/:orderId/status', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { status } = req.body;
  
  try {
    const result = await db.query(
      'UPDATE marketplace_orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.orderId]
    );

    // إرسال إشعار للمشتري
    const order = result.rows[0];
    await sendRealTimeNotification(order.buyer_id, {
      title: 'تحديث حالة الطلب',
      message: `تم تحديث حالة طلبك رقم ${order.order_number} إلى ${status}`,
      type: 'info'
    });

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update_order_status', 'marketplace_orders', req.params.orderId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث حالة الطلب.' });
  }
});

// ============ Federation Management Routes ============

app.get('/api/admin/federations', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    const result = await db.query(
      'SELECT id, name, country, status, email, phone, created_at FROM federations ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الاتحادات.' });
  }
});

app.post('/api/admin/federations/:federationId/permissions', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { permissions } = req.body;
  
  try {
    // تحديث صلاحيات الاتحاد
    await db.query(
      'UPDATE federations SET permissions = $1 WHERE id = $2',
      [JSON.stringify(permissions), req.params.federationId]
    );

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update_federation_permissions', 'federations', req.params.federationId, JSON.stringify(permissions)]
    );

    res.json({ message: 'تم تحديث صلاحيات الاتحاد بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث الصلاحيات.' });
  }
});
