-- ============================================
-- منصة رَسَن - لوحة التحكم السيادية
-- Sovereign Dashboard Schema Extensions
-- ============================================

-- ============ System Settings Table ============
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  store_enabled BOOLEAN DEFAULT TRUE,
  auction_enabled BOOLEAN DEFAULT TRUE,
  registration_enabled BOOLEAN DEFAULT TRUE,
  commission_rate DECIMAL(5, 2) DEFAULT 5.00,
  max_auction_duration INT DEFAULT 30,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default system settings
INSERT INTO system_settings (id, maintenance_mode, store_enabled, auction_enabled, registration_enabled, commission_rate)
VALUES (1, FALSE, TRUE, TRUE, TRUE, 5.00)
ON CONFLICT DO NOTHING;

-- ============ Global Audit Log Table ============
CREATE TABLE IF NOT EXISTS global_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  target_user_id INT,
  old_values JSONB,
  new_values JSONB,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_global_audit_log_admin_id ON global_audit_log (admin_id);
CREATE INDEX idx_global_audit_log_action ON global_audit_log (action);
CREATE INDEX idx_global_audit_log_created_at ON global_audit_log (created_at DESC);
CREATE INDEX idx_global_audit_log_target_user_id ON global_audit_log (target_user_id);

-- ============ Admin Sessions Table (for Impersonation) ============
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL,
  impersonated_user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (impersonated_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions (admin_id);
CREATE INDEX idx_admin_sessions_session_token ON admin_sessions (session_token);
CREATE INDEX idx_admin_sessions_is_active ON admin_sessions (is_active);

-- ============ Dispute Resolution Table ============
CREATE TABLE IF NOT EXISTS dispute_resolutions (
  id SERIAL PRIMARY KEY,
  order_id INT,
  auction_id INT,
  dispute_type VARCHAR(100),
  reported_by INT NOT NULL,
  admin_id INT,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  resolution TEXT,
  refund_amount DECIMAL(15, 2),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES marketplace_orders(id) ON DELETE SET NULL,
  FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE SET NULL,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_dispute_resolutions_status ON dispute_resolutions (status);
CREATE INDEX idx_dispute_resolutions_admin_id ON dispute_resolutions (admin_id);
CREATE INDEX idx_dispute_resolutions_created_at ON dispute_resolutions (created_at DESC);

-- ============ Admin Permissions Matrix Table ============
CREATE TABLE IF NOT EXISTS admin_permissions_matrix (
  id SERIAL PRIMARY KEY,
  role VARCHAR(100) NOT NULL UNIQUE,
  permissions JSONB NOT NULL,
  description TEXT,
  level INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default permissions
INSERT INTO admin_permissions_matrix (role, permissions, description, level) VALUES
('super_admin', '["all"]', 'مدير نظام أعلى - سلطة مطلقة', 1),
('admin', '["users", "auctions", "products", "orders", "reports", "notifications", "federations", "system_settings", "audit_logs"]', 'مدير نظام', 2),
('federation_admin', '["users_federation", "auctions_federation", "reports_federation", "horses_federation"]', 'مدير اتحاد', 3),
('moderator', '["users_view", "auctions_view", "reports_view", "disputes_resolve"]', 'مشرف', 4)
ON CONFLICT (role) DO NOTHING;

-- ============ Live Statistics Cache Table ============
CREATE TABLE IF NOT EXISTS live_statistics_cache (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value INT DEFAULT 0,
  metric_float DECIMAL(15, 2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default metrics
INSERT INTO live_statistics_cache (metric_name, metric_value) VALUES
('total_users', 0),
('active_users', 0),
('total_horses', 0),
('active_auctions', 0),
('pending_orders', 0),
('active_federations', 0),
('total_revenue', 0),
('pending_disputes', 0)
ON CONFLICT DO NOTHING;

CREATE INDEX idx_live_statistics_cache_metric_name ON live_statistics_cache (metric_name);

-- ============ System Notifications Table ============
CREATE TABLE IF NOT EXISTS system_notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50),
  priority VARCHAR(50) DEFAULT 'normal',
  is_broadcast BOOLEAN DEFAULT FALSE,
  target_role VARCHAR(100),
  target_user_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_system_notifications_target_user_id ON system_notifications (target_user_id);
CREATE INDEX idx_system_notifications_created_at ON system_notifications (created_at DESC);
CREATE INDEX idx_system_notifications_is_read ON system_notifications (is_read);
