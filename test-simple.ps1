# Simple API Test
$baseUrl = "http://localhost:3001/api/v1"

Write-Host "Testing AI-HRMS API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health
Write-Host "1. Health Check..."
$health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
Write-Host "   Status: $($health.status)" -ForegroundColor Green
Write-Host ""

# Test 2: Register
Write-Host "2. Register User..."
$registerBody = @{
    email = "testuser@hrms.com"
    password = "Test123!@#"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "   User created: $($register.data.user.email)" -ForegroundColor Green
} catch {
    Write-Host "   User already exists (OK)" -ForegroundColor Yellow
}
Write-Host ""

# Test 3: Login
Write-Host "3. Login..."
$loginBody = @{
    email = "testuser@hrms.com"
    password = "Test123!@#"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $login.data.tokens.accessToken
Write-Host "   Logged in successfully" -ForegroundColor Green
Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Gray
Write-Host ""

# Test 4: Get Current User
Write-Host "4. Get Current User..."
$headers = @{
    "Authorization" = "Bearer $token"
}
try {
    $me = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    Write-Host "   Email: $($me.data.email)" -ForegroundColor Green
    Write-Host "   Role: $($me.data.role)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: List Departments
Write-Host "5. List Departments..."
try {
    $depts = Invoke-RestMethod -Uri "$baseUrl/departments" -Method GET -Headers $headers
    Write-Host "   Found $($depts.data.Count) departments" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: List Employees
Write-Host "6. List Employees..."
try {
    $emps = Invoke-RestMethod -Uri "$baseUrl/employees" -Method GET -Headers $headers
    Write-Host "   Found $($emps.data.employees.Count) employees" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Testing Complete!" -ForegroundColor Cyan
