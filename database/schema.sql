-- ============================================
-- منصة رَسَن - Rasan Platform
-- Database Schema
-- ============================================

-- ============ Users Table ============
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'federation', 'owner', 'doctor', 'vendor') NOT NULL DEFAULT 'owner',
  full_name VARCHAR(255),
  phone VARCHAR(20),
  country VARCHAR(100),
  city VARCHAR(100),
  status ENUM('active', 'inactive', 'blocked', 'suspended') DEFAULT 'active',
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Federations Table ============
CREATE TABLE IF NOT EXISTS federations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  admin_user_id INT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id),
  INDEX idx_country (country),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Horses Table ============
CREATE TABLE IF NOT EXISTS horses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  federation_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(100),
  age INT,
  gender ENUM('male', 'female') NOT NULL,
  color VARCHAR(100),
  height DECIMAL(5, 2),
  weight DECIMAL(8, 2),
  registration_number VARCHAR(100) UNIQUE,
  pedigree TEXT,
  health_status ENUM('healthy', 'sick', 'injured', 'recovering') DEFAULT 'healthy',
  medical_history TEXT,
  achievements TEXT,
  image_url TEXT,
  qr_code_url TEXT,
  is_for_sale BOOLEAN DEFAULT FALSE,
  sale_price DECIMAL(15, 2),
  is_approved_by_federation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (federation_id) REFERENCES federations(id),
  INDEX idx_owner_id (owner_id),
  INDEX idx_federation_id (federation_id),
  INDEX idx_is_for_sale (is_for_sale)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Prescriptions Table ============
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doctor_id INT NOT NULL,
  horse_id INT NOT NULL,
  prescription_text TEXT NOT NULL,
  medications JSON,
  dosage TEXT,
  duration VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES users(id),
  FOREIGN KEY (horse_id) REFERENCES horses(id),
  INDEX idx_doctor_id (doctor_id),
  INDEX idx_horse_id (horse_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Marketplace Items Table ============
CREATE TABLE IF NOT EXISTS marketplace_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(15, 2) NOT NULL,
  quantity INT DEFAULT 0,
  requires_prescription BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES users(id),
  INDEX idx_vendor_id (vendor_id),
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Auctions Table ============
CREATE TABLE IF NOT EXISTS auctions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  horse_id INT NOT NULL,
  owner_id INT NOT NULL,
  starting_price DECIMAL(15, 2) NOT NULL,
  current_highest_bid DECIMAL(15, 2),
  highest_bidder_id INT,
  status ENUM('pending', 'active', 'closed', 'sold', 'cancelled') DEFAULT 'pending',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  security_deposit DECIMAL(15, 2),
  commission_percentage DECIMAL(5, 2) DEFAULT 5.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (horse_id) REFERENCES horses(id),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (highest_bidder_id) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_end_time (end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Bids Table ============
CREATE TABLE IF NOT EXISTS bids (
  id INT PRIMARY KEY AUTO_INCREMENT,
  auction_id INT NOT NULL,
  bidder_id INT NOT NULL,
  bid_amount DECIMAL(15, 2) NOT NULL,
  security_deposit DECIMAL(15, 2),
  status ENUM('active', 'cancelled', 'won', 'lost') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auction_id) REFERENCES auctions(id),
  FOREIGN KEY (bidder_id) REFERENCES users(id),
  INDEX idx_auction_id (auction_id),
  INDEX idx_bidder_id (bidder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Transactions Table ============
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  transaction_type ENUM('payment', 'refund', 'commission', 'deposit') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  payment_method ENUM('stripe', 'apple_pay', 'bank_transfer') NOT NULL,
  description TEXT,
  related_horse_id INT,
  related_auction_id INT,
  related_order_id INT,
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (related_horse_id) REFERENCES horses(id),
  FOREIGN KEY (related_auction_id) REFERENCES auctions(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Marketplace Orders Table ============
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id INT NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Order Items Table ============
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES marketplace_orders(id),
  FOREIGN KEY (item_id) REFERENCES marketplace_items(id),
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Notifications Table ============
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type ENUM('payment', 'medical', 'alert', 'info', 'warning') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Audit Log Table ============
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ Penalties Table ============
CREATE TABLE IF NOT EXISTS penalties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  federation_id INT NOT NULL,
  horse_id INT,
  penalty_type ENUM('ban', 'fine', 'suspension', 'warning') NOT NULL,
  reason TEXT NOT NULL,
  amount DECIMAL(15, 2),
  status ENUM('active', 'paid', 'appealed', 'cancelled') DEFAULT 'active',
  issued_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (federation_id) REFERENCES federations(id),
  FOREIGN KEY (horse_id) REFERENCES horses(id),
  FOREIGN KEY (issued_by) REFERENCES users(id),
  INDEX idx_owner_id (owner_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  (SELECT SUM(amount) FROM transactions WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM users WHERE role = 'owner') as total_owners,
  (SELECT COUNT(*) FROM users WHERE role = 'federation') as total_federations;

-- Revenue Report View
CREATE OR REPLACE VIEW revenue_report AS
SELECT
  DATE(created_at) as date,
  SUM(CASE WHEN transaction_type = 'payment' THEN amount ELSE 0 END) as payments,
  SUM(CASE WHEN transaction_type = 'commission' THEN amount ELSE 0 END) as commissions,
  SUM(CASE WHEN transaction_type = 'refund' THEN amount ELSE 0 END) as refunds,
  COUNT(*) as total_transactions
FROM transactions
WHERE status = 'completed'
GROUP BY DATE(created_at);
