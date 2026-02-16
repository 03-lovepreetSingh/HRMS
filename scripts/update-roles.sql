-- Update user roles for testing
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@hrms.com';
UPDATE users SET role = 'HR' WHERE email = 'hr@hrms.com';
UPDATE users SET role = 'MANAGER' WHERE email = 'manager@hrms.com';

-- Verify updates
SELECT email, role FROM users WHERE email IN ('admin@hrms.com', 'hr@hrms.com', 'manager@hrms.com');
