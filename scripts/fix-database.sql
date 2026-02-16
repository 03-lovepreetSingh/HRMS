-- AI-HRMS Database Fix Script
-- Run this script to fix the main issues found during testing

-- 1. Update user roles
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@hrms.com';
UPDATE users SET role = 'HR' WHERE email = 'hr@hrms.com';
UPDATE users SET role = 'MANAGER' WHERE email = 'manager@hrms.com';

-- 2. Create employee records for all users
INSERT INTO employees (user_id, created_at)
SELECT id, created_at FROM users
WHERE id NOT IN (SELECT user_id FROM employees);

-- 3. Verify the fixes
SELECT 'User Roles:' as info;
SELECT email, role FROM users ORDER BY role, email;

SELECT '' as separator;
SELECT 'Employee Records:' as info;
SELECT u.email, e.id as employee_id, e.created_at
FROM users u
JOIN employees e ON u.id = e.user_id
ORDER BY u.email;

SELECT '' as separator;
SELECT 'Summary:' as info;
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM employees) as total_employees,
    (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') as admin_users,
    (SELECT COUNT(*) FROM users WHERE role = 'HR') as hr_users,
    (SELECT COUNT(*) FROM users WHERE role = 'MANAGER') as manager_users,
    (SELECT COUNT(*) FROM users WHERE role = 'EMPLOYEE') as employee_users;
