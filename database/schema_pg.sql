-- ============================================
-- منصة رَسَن - Rasan Platform
-- PostgreSQL Database Schema
-- ============================================

-- Drop existing tables and types if they exist to allow clean re-creation
DROP TABLE IF EXISTS penalties CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS marketplace_orders CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;
DROP TABLE IF EXISTS marketplace_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS horses CASCADE;
DROP TABLE IF EXISTS federations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role_enum;
DROP TYPE IF EXISTS user_status_enum;
DROP TYPE IF EXISTS federation_status_enum;
DROP TYPE IF EXISTS horse_gender_enum;
DROP TYPE IF EXISTS horse_health_status_enum;
DROP TYPE IF EXISTS marketplace_item_status_enum;
DROP TYPE IF EXISTS auction_status_enum;
DROP TYPE IF EXISTS bid_status_enum;
DROP TYPE IF EXISTS transaction_type_enum;
DROP TYPE IF EXISTS transaction_status_enum;
DROP TYPE IF EXISTS payment_method_enum;
DROP TYPE IF EXISTS marketplace_order_status_enum;
DROP TYPE IF EXISTS notification_type_enum;
DROP TYPE IF EXISTS penalty_type_enum;
DROP TYPE IF EXISTS penalty_status_enum;

-- ============ Custom ENUM Types for PostgreSQL ============
CREATE TYPE user_role_enum AS ENUM (
  'admin', 'federation', 'owner', 'doctor', 'vendor'
);
CREATE TYPE user_status_enum AS ENUM (
  'active', 'inactive', 'blocked', 'suspended'
);
CREATE TYPE federation_status_enum AS ENUM (
  'active', 'inactive', 'suspended'
);
CREATE TYPE horse_gender_enum AS ENUM (
  'male', 'female'
);
CREATE TYPE horse_health_status_enum AS ENUM (
  'healthy', 'sick', 'injured', 'recovering'
);
CREATE TYPE marketplace_item_status_enum AS ENUM (
  'active', 'inactive', 'out_of_stock'
);
CREATE TYPE auction_status_enum AS ENUM (
  'pending', 'active', 'closed', 'sold', 'cancelled'
);
CREATE TYPE bid_status_enum AS ENUM (
  'active', 'cancelled', 'won', 'lost'
);
CREATE TYPE transaction_type_enum AS ENUM (
  'payment', 'refund', 'commission', 'deposit'
);
CREATE TYPE transaction_status_enum AS ENUM (
  'pending', 'completed', 'failed', 'cancelled'
);
CREATE TYPE payment_method_enum AS ENUM (
  'stripe', 'apple_pay', 'bank_transfer'
);
CREATE TYPE marketplace_order_status_enum AS ENUM (
  'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
);
CREATE TYPE notification_type_enum AS ENUM (
  'payment', 'medical', 'alert', 'info', 'warning'
);
CREATE TYPE penalty_type_enum AS ENUM (
  'ban', 'fine', 'suspension', 'warning'
);
CREATE TYPE penalty_status_enum AS ENUM (
  'active', 'paid', 'appealed', 'cancelled'
);

-- ============ Users Table ============
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'owner',
  full_name VARCHAR(255),
  phone VARCHAR(20),
  country VARCHAR(100),
  city VARCHAR(100),
  status user_status_enum DEFAULT 'active',
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255)
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_email ON users (email);

-- ============ Federations Table ============
CREATE TABLE IF NOT EXISTS federations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  admin_user_id INT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  status federation_status_enum DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_federations_country ON federations (country);
CREATE INDEX idx_federations_status ON federations (status);

-- ============ Horses Table ============
CREATE TABLE IF NOT EXISTS horses (
  id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL,
  federation_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(100),
  age INT,
  gender horse_gender_enum NOT NULL,
  color VARCHAR(100),
  height DECIMAL(5, 2),
  weight DECIMAL(8, 2),
  registration_number VARCHAR(100) UNIQUE,
  pedigree TEXT,
  health_status horse_health_status_enum DEFAULT 'healthy',
  medical_history TEXT,
  achievements TEXT,
  image_url TEXT,
  qr_code_url TEXT,
  is_for_sale BOOLEAN DEFAULT FALSE,
  sale_price DECIMAL(15, 2),
  is_approved_by_federation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (federation_id) REFERENCES federations(id) ON DELETE CASCADE
);

CREATE INDEX idx_horses_owner_id ON horses (owner_id);
CREATE INDEX idx_horses_federation_id ON horses (federation_id);
CREATE INDEX idx_horses_is_for_sale ON horses (is_for_sale);

-- ============ Prescriptions Table ============
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  doctor_id INT NOT NULL,
  horse_id INT NOT NULL,
  prescription_text TEXT NOT NULL,
  medications JSONB,
  dosage TEXT,
  duration VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE
);

CREATE INDEX idx_prescriptions_doctor_id ON prescriptions (doctor_id);
CREATE INDEX idx_prescriptions_horse_id ON prescriptions (horse_id);
CREATE INDEX idx_prescriptions_is_active ON prescriptions (is_active);

-- ============ Marketplace Items Table ============
CREATE TABLE IF NOT EXISTS marketplace_items (
  id SERIAL PRIMARY KEY,
  vendor_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(15, 2) NOT NULL,
  quantity INT DEFAULT 0,
  requires_prescription BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  status marketplace_item_status_enum DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_marketplace_items_vendor_id ON marketplace_items (vendor_id);
CREATE INDEX idx_marketplace_items_category ON marketplace_items (category);
CREATE INDEX idx_marketplace_items_status ON marketplace_items (status);

-- ============ Auctions Table ============
CREATE TABLE IF NOT EXISTS auctions (
  id SERIAL PRIMARY KEY,
  horse_id INT NOT NULL,
  owner_id INT NOT NULL,
  starting_price DECIMAL(15, 2) NOT NULL,
  current_highest_bid DECIMAL(15, 2),
  highest_bidder_id INT,
  status auction_status_enum DEFAULT 'pending',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  security_deposit DECIMAL(15, 2),
  commission_percentage DECIMAL(5, 2) DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (highest_bidder_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_auctions_status ON auctions (status);
CREATE INDEX idx_auctions_end_time ON auctions (end_time);

-- ============ Bids Table ============
CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  auction_id INT NOT NULL,
  bidder_id INT NOT NULL,
  bid_amount DECIMAL(15, 2) NOT NULL,
  security_deposit DECIMAL(15, 2),
  status bid_status_enum DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_bids_auction_id ON bids (auction_id);
CREATE INDEX idx_bids_bidder_id ON bids (bidder_id);

-- ============ Transactions Table ============
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  transaction_type transaction_type_enum NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status transaction_status_enum DEFAULT 'pending',
  payment_method payment_method_enum NOT NULL,
  description TEXT,
  related_horse_id INT,
  related_auction_id INT,
  related_order_id INT,
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_horse_id) REFERENCES horses(id) ON DELETE SET NULL,
  FOREIGN KEY (related_auction_id) REFERENCES auctions(id) ON DELETE SET NULL
);

CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_transactions_status ON transactions (status);
CREATE INDEX idx_transactions_created_at ON transactions (created_at);

-- ============ Marketplace Orders Table ============
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id INT NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  status marketplace_order_status_enum DEFAULT 'pending',
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_marketplace_orders_buyer_id ON marketplace_orders (buyer_id);
CREATE INDEX idx_marketplace_orders_status ON marketplace_orders (status);

-- ============ Order Items Table ============
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES marketplace_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

-- ============ Notifications Table ============
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type notification_type_enum DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);

-- ============ Audit Log Table ============
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);

-- ============ Penalties Table ============
CREATE TABLE IF NOT EXISTS penalties (
  id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL,
  federation_id INT NOT NULL,
  horse_id INT,
  penalty_type penalty_type_enum NOT NULL,
  reason TEXT NOT NULL,
  amount DECIMAL(15, 2),
  status penalty_status_enum DEFAULT 'active',
  issued_by INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (federation_id) REFERENCES federations(id) ON DELETE CASCADE,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE SET NULL,
  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_penalties_owner_id ON penalties (owner_id);
CREATE INDEX idx_penalties_status ON penalties (status);

-- ============ Indexes for Performance ============
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_horses_owner_federation ON horses(owner_id, federation_id);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_auctions_status_end_time ON auctions(status, end_time);

-- ============ Views ============

-- Admin Dashboard View
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM horses) as total_horses,
  (SELECT COUNT(*) FROM auctions WHERE status = 'active') as active_auctions,
  (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM users WHERE role = 'owner') as total_owners,
  (SELECT COUNT(*) FROM users WHERE role = 'federation') as total_federations;

-- Revenue Report View
CREATE OR REPLACE VIEW revenue_report AS
SELECT
  DATE(created_at) as date,
  COALESCE(SUM(CASE WHEN transaction_type = 'payment' THEN amount ELSE 0 END), 0) as payments,
  COALESCE(SUM(CASE WHEN transaction_type = 'commission' THEN amount ELSE 0 END), 0) as commissions,
  COALESCE(SUM(CASE WHEN transaction_type = 'refund' THEN amount ELSE 0 END), 0) as refunds,
  COUNT(*) as total_transactions
FROM transactions
WHERE status = 'completed'
GROUP BY DATE(created_at);

-- Trigger to update `updated_at` column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_federations_updated_at BEFORE UPDATE ON federations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_horses_updated_at BEFORE UPDATE ON horses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_items_updated_at BEFORE UPDATE ON marketplace_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_orders_updated_at BEFORE UPDATE ON marketplace_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ Performance Optimization Indexes ============
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_horses_federation_approved ON horses (federation_id, is_approved_by_federation);
CREATE INDEX IF NOT EXISTS idx_auctions_horse_status ON auctions (horse_id, status);
CREATE INDEX IF NOT EXISTS idx_bids_auction_amount ON bids (auction_id, bid_amount DESC);
CREATE INDEX IF NOT EXISTS idx_users_country_role ON users (country, role);
