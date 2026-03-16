
-- Delete existing admin if exists to avoid conflict
DELETE FROM users WHERE email = 'admin@rasan.app';

-- Insert new admin with correct hashed password
INSERT INTO users (username, email, password_hash, role, status, full_name, country, city) 
VALUES ('admin', 'admin@rasan.app', '$2b$12$udH3lvVtY7wa1B04dB90wO5jZCGOEI4Rf2m8jHPKADahR04GbjUwu', 'admin', 'active', 'المدير العام', 'السعودية', 'الرياض');
