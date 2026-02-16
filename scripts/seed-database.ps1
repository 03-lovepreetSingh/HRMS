# Database Seeding Script for AI-HRMS
# This script creates initial data for testing

$baseUrl = "http://localhost:3001/api/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI-HRMS Database Seeding Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create Admin User
Write-Host "1. Creating Admin User..." -ForegroundColor Yellow
$adminData = @{
    email = "admin@hrms.com"
    password = "Admin123!@#"
    firstName = "System"
    lastName = "Administrator"
} | ConvertTo-Json

try {
    $adminResult = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $adminData -ContentType "application/json"
    Write-Host "   Admin user created: $($adminResult.data.user.email)" -ForegroundColor Green
    $adminUserId = $adminResult.data.user.id
} catch {
    Write-Host "   Admin user already exists" -ForegroundColor Yellow
    # Login to get user ID
    $loginData = @{email = "admin@hrms.com"; password = "Admin123!@#"} | ConvertTo-Json
    $loginResult = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $adminUserId = $loginResult.data.user.id
}

# Login as admin
$loginData = @{
    email = "admin@hrms.com"
    password = "Admin123!@#"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$adminToken = $login.data.tokens.accessToken
$adminHeaders = @{"Authorization" = "Bearer $adminToken"}

Write-Host "   Admin logged in successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Update Admin Role (directly in database if needed)
Write-Host "2. Note: Admin role needs to be set in database manually" -ForegroundColor Yellow
Write-Host "   Run: UPDATE users SET role = 'ADMIN' WHERE email = 'admin@hrms.com';" -ForegroundColor Gray
Write-Host ""

# Step 3: Create Departments
Write-Host "3. Creating Departments..." -ForegroundColor Yellow
$departments = @("Engineering", "Human Resources", "Finance", "Marketing", "Sales", "Operations")
$deptIds = @{}

foreach ($dept in $departments) {
    try {
        $deptData = @{name = $dept} | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$baseUrl/departments" -Method POST -Body $deptData -ContentType "application/json" -Headers $adminHeaders
        $deptIds[$dept] = $result.data.id
        Write-Host "   Created: $dept" -ForegroundColor Green
    } catch {
        Write-Host "   $dept already exists or requires ADMIN role" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 4: Create Designations
Write-Host "4. Creating Designations..." -ForegroundColor Yellow
$designations = @(
    "Software Engineer",
    "Senior Software Engineer",
    "Team Lead",
    "Engineering Manager",
    "HR Manager",
    "HR Executive",
    "Finance Manager",
    "Accountant",
    "Marketing Manager",
    "Sales Executive"
)
$desigIds = @{}

foreach ($desig in $designations) {
    try {
        $desigData = @{title = $desig} | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$baseUrl/designations" -Method POST -Body $desigData -ContentType "application/json" -Headers $adminHeaders
        $desigIds[$desig] = $result.data.id
        Write-Host "   Created: $desig" -ForegroundColor Green
    } catch {
        Write-Host "   $desig already exists or requires ADMIN role" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 5: Create Leave Types
Write-Host "5. Creating Leave Types..." -ForegroundColor Yellow
$leaveTypes = @(
    @{name = "Annual Leave"; quota = 20},
    @{name = "Sick Leave"; quota = 10},
    @{name = "Casual Leave"; quota = 5},
    @{name = "Maternity Leave"; quota = 90},
    @{name = "Paternity Leave"; quota = 15}
)

foreach ($leave in $leaveTypes) {
    try {
        $leaveData = @{
            name = $leave.name
            annualQuota = $leave.quota
        } | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$baseUrl/leave/types" -Method POST -Body $leaveData -ContentType "application/json" -Headers $adminHeaders
        Write-Host "   Created: $($leave.name) ($($leave.quota) days)" -ForegroundColor Green
    } catch {
        Write-Host "   $($leave.name) already exists or requires ADMIN role" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 6: Create Test Users
Write-Host "6. Creating Test Users..." -ForegroundColor Yellow
$testUsers = @(
    @{email = "hr@hrms.com"; password = "Hr123!@#"; firstName = "HR"; lastName = "Manager"; role = "HR"},
    @{email = "manager@hrms.com"; password = "Manager123!@#"; firstName = "Team"; lastName = "Manager"; role = "MANAGER"},
    @{email = "employee1@hrms.com"; password = "Employee123!@#"; firstName = "John"; lastName = "Doe"; role = "EMPLOYEE"},
    @{email = "employee2@hrms.com"; password = "Employee123!@#"; firstName = "Jane"; lastName = "Smith"; role = "EMPLOYEE"}
)

foreach ($user in $testUsers) {
    try {
        $userData = @{
            email = $user.email
            password = $user.password
            firstName = $user.firstName
            lastName = $user.lastName
        } | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $userData -ContentType "application/json"
        Write-Host "   Created: $($user.email) (Role: $($user.role))" -ForegroundColor Green
    } catch {
        Write-Host "   $($user.email) already exists" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Seeding Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: To enable admin features, run this SQL:" -ForegroundColor Yellow
Write-Host "UPDATE users SET role = 'ADMIN' WHERE email = 'admin@hrms.com';" -ForegroundColor White
Write-Host "UPDATE users SET role = 'HR' WHERE email = 'hr@hrms.com';" -ForegroundColor White
Write-Host "UPDATE users SET role = 'MANAGER' WHERE email = 'manager@hrms.com';" -ForegroundColor White
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "  Admin:    admin@hrms.com / Admin123!@#" -ForegroundColor Gray
Write-Host "  HR:       hr@hrms.com / Hr123!@#" -ForegroundColor Gray
Write-Host "  Manager:  manager@hrms.com / Manager123!@#" -ForegroundColor Gray
Write-Host "  Employee: employee1@hrms.com / Employee123!@#" -ForegroundColor Gray
