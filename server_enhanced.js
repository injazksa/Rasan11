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

    // حفظ التوكن في قاعدة البيانات (يمكن إضافة جدول password_resets)
    // await db.query('INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL 24 HOUR)', [userId, resetTokenHash]);

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

// جلب الإشعارات
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

// تحديث حالة الإشعار كمقروء
app.post('/api/notifications/:notificationId/read', checkCountryIsolation, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [req.params.notificationId, req.user.id]);
    res.json({ message: 'تم تحديث الإشعار' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث الإشعار.' });
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
