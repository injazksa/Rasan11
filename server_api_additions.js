/**
 * إضافات نقاط API الجديدة للـ Backend
 * يجب إضافة هذه الأكواد إلى ملف server.js
 * 
 * ملاحظة: هذا الملف يحتوي على الأكواد التي يجب إضافتها إلى server.js
 * للتأكد من توافق الـ Frontend والـ Backend
 */

// ============ جلب قائمة المستخدمين (إضافة جديدة) ============

app.get('/api/admin/users', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { role, status, country, search } = req.query;
  
  try {
    let query = 'SELECT id, username, email, role, full_name, phone, country, status, created_at, last_login FROM users WHERE 1=1';
    const params = [];

    // تصفية حسب الدور
    if (role) {
      query += ' AND role = $' + (params.length + 1);
      params.push(role);
    }

    // تصفية حسب الحالة
    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    // تصفية حسب الدولة
    if (country) {
      query += ' AND country = $' + (params.length + 1);
      params.push(country);
    }

    // البحث حسب الاسم أو البريد
    if (search) {
      query += ' AND (full_name ILIKE $' + (params.length + 1) + ' OR email ILIKE $' + (params.length + 2) + ')';
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'خطأ في جلب المستخدمين.' });
  }
});

// ============ جلب بيانات مستخدم واحد ============

app.get('/api/admin/user/:userId', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  try {
    const result = await db.query(
      'SELECT id, username, email, role, full_name, phone, country, city, status, profile_image_url, bio, created_at, last_login FROM users WHERE id = $1',
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'خطأ في جلب بيانات المستخدم.' });
  }
});

// ============ حذف الإشعار ============

app.delete('/api/notifications/:notificationId', checkCountryIsolation, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [req.params.notificationId, req.user.id]
    );
    res.json({ message: 'تم حذف الإشعار' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف الإشعار.' });
  }
});

// ============ Socket.io - Real-time Notifications ============
// تأكد من أن هذا الكود موجود في server.js

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

// ============ دالة إرسال إشعار حقيقي ============
// تأكد من أن هذه الدالة موجودة في server.js

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

// ============ تحديث نقطة النهاية approve-user ============
// تأكد من أن هذا الكود محدث في server.js

app.post('/api/admin/approve-user', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { userId, userEmail, userName, userRole, country } = req.body;
  
  try {
    // التحقق من البيانات المطلوبة
    if (!userId || !userEmail || !userName) {
      return res.status(400).json({ message: 'بيانات غير كاملة' });
    }

    // تحديث حالة المستخدم
    await db.query('UPDATE users SET status = $1 WHERE id = $2', ['active', userId]);
    
    // إرسال بريد الترحيب
    await sendRoyalAccreditationEmail(userEmail, userName, userRole, country);
    
    // إرسال إشعار حقيقي للمستخدم
    await sendRealTimeNotification(userId, {
      title: 'تم اعتماد حسابك',
      message: `تم اعتماد حسابك بنجاح من قبل مدير النظام. مرحباً بك في منظومة رَسَن!`,
      type: 'success'
    });

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'approve_user', 'users', userId]
    );

    res.json({ message: `تم اعتماد المستخدم ${userName} وإرسال رسالة الترحيب الملكية.` });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'خطأ في اعتماد المستخدم.' });
  }
});

// ============ تحديث نقطة النهاية reject-user ============

app.post('/api/admin/reject-user', checkCountryIsolation, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  
  const { userId, reason } = req.body;
  
  try {
    // التحقق من البيانات المطلوبة
    if (!userId || !reason) {
      return res.status(400).json({ message: 'بيانات غير كاملة' });
    }

    const userResult = await db.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // تحديث حالة المستخدم إلى محظور
    await db.query('UPDATE users SET status = $1 WHERE id = $2', ['blocked', userId]);

    // إرسال بريد الرفض
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
          <p style="color: #666;">السبب: ${reason}</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            إذا كان لديك استفسارات، يرجى التواصل معنا عبر البريد الإلكتروني.
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);

    // إرسال إشعار حقيقي للمستخدم
    await sendRealTimeNotification(userId, {
      title: 'تم رفض طلبك',
      message: `للأسف، تم رفض طلب انضمامك. السبب: ${reason}`,
      type: 'alert'
    });

    // إضافة سجل تدقيق
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'reject_user', 'users', userId, JSON.stringify({ reason })]
    );

    res.json({ message: `تم رفض طلب المستخدم ${user.full_name}` });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ message: 'خطأ في رفض المستخدم.' });
  }
});
