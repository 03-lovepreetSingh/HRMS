# Comprehensive AI-HRMS API Test Suite
$baseUrl = "http://localhost:3001/api/v1"
$testResults = @()

function Test-Endpoint {
    param($name, $scriptBlock)
    Write-Host "Testing: $name" -ForegroundColor Cyan
    try {
        & $scriptBlock
        $testResults += @{Name=$name; Status="PASS"}
        Write-Host "  PASS" -ForegroundColor Green
    } catch {
        $testResults += @{Name=$name; Status="FAIL"; Error=$_.Exception.Message}
        Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "AI-HRMS Comprehensive API Test Suite" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# Setup: Create admin user and login
Write-Host "Setup: Creating admin user..." -ForegroundColor Yellow
$adminRegister = @{
    email = "admin@hrms.test"
    password = "Admin123!@#"
    firstName = "Admin"
    lastName = "User"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $adminRegister -ContentType "application/json" | Out-Null
} catch {}

$adminLogin = @{
    email = "admin@hrms.test"
    password = "Admin123!@#"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLogin -ContentType "application/json"
$token = $login.data.tokens.accessToken
$headers = @{"Authorization" = "Bearer $token"}

Write-Host "Admin logged in successfully" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Test-Endpoint "Health Check" {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    if ($health.status -ne "ok") { throw "Health check failed" }
}

# Test 2: Get Current User
Test-Endpoint "Get Current User" {
    $me = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    if (-not $me.data.email) { throw "No user data returned" }
}

# Test 3: Create Department
Test-Endpoint "Create Department" {
    $dept = @{name = "Engineering"} | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "$baseUrl/departments" -Method POST -Body $dept -ContentType "application/json" -Headers $headers
        $script:deptId = $result.data.id
    } catch {
        if ($_.Exception.Message -notlike "*already exists*") { throw }
        $depts = Invoke-RestMethod -Uri "$baseUrl/departments" -Method GET -Headers $headers
        $script:deptId = $depts.data[0].id
    }
}

# Test 4: List Departments
Test-Endpoint "List Departments" {
    $depts = Invoke-RestMethod -Uri "$baseUrl/departments" -Method GET -Headers $headers
    if ($null -eq $depts.data) { throw "No departments returned" }
}

# Test 5: Create Designation
Test-Endpoint "Create Designation" {
    $desig = @{title = "Software Engineer"} | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "$baseUrl/designations" -Method POST -Body $desig -ContentType "application/json" -Headers $headers
        $script:desigId = $result.data.id
    } catch {
        if ($_.Exception.Message -notlike "*already exists*") { throw }
        $desigs = Invoke-RestMethod -Uri "$baseUrl/designations" -Method GET -Headers $headers
        $script:desigId = $desigs.data[0].id
    }
}

# Test 6: List Designations
Test-Endpoint "List Designations" {
    $desigs = Invoke-RestMethod -Uri "$baseUrl/designations" -Method GET -Headers $headers
    if ($null -eq $desigs.data) { throw "No designations returned" }
}

# Test 7: List Employees
Test-Endpoint "List Employees" {
    $emps = Invoke-RestMethod -Uri "$baseUrl/employees" -Method GET -Headers $headers
    if ($null -eq $emps.data) { throw "No employees data returned" }
}

# Test 8: Punch In
Test-Endpoint "Punch In (Attendance)" {
    try {
        $result = Invoke-RestMethod -Uri "$baseUrl/attendance/punch-in" -Method POST -Headers $headers
        if (-not $result.data.attendance) { throw "No attendance data returned" }
    } catch {
        if ($_.Exception.Message -notlike "*already punched in*") { throw }
    }
}

# Test 9: Create Leave Type
Test-Endpoint "Create Leave Type" {
    $leaveType = @{
        name = "Annual Leave"
        annualQuota = 20
    } | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "$baseUrl/leave/types" -Method POST -Body $leaveType -ContentType "application/json" -Headers $headers
        $script:leaveTypeId = $result.data.id
    } catch {
        if ($_.Exception.Message -notlike "*already exists*") { throw }
        $types = Invoke-RestMethod -Uri "$baseUrl/leave/types" -Method GET -Headers $headers
        $script:leaveTypeId = $types.data[0].id
    }
}

# Test 10: List Leave Types
Test-Endpoint "List Leave Types" {
    $types = Invoke-RestMethod -Uri "$baseUrl/leave/types" -Method GET -Headers $headers
    if ($null -eq $types.data) { throw "No leave types returned" }
}

# Test 11: Create Leave Request
Test-Endpoint "Create Leave Request" {
    $leaveReq = @{
        leaveTypeId = $script:leaveTypeId
        startDate = "2026-03-01"
        endDate = "2026-03-03"
        reason = "Personal"
    } | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "$baseUrl/leave/requests" -Method POST -Body $leaveReq -ContentType "application/json" -Headers $headers
        if (-not $result.data) { throw "No leave request data returned" }
    } catch {
        if ($_.Exception.Message -notlike "*overlapping*") { throw }
    }
}

# Test 12: List Leave Requests
Test-Endpoint "List Leave Requests" {
    $requests = Invoke-RestMethod -Uri "$baseUrl/leave/requests" -Method GET -Headers $headers
    if ($null -eq $requests.data) { throw "No leave requests returned" }
}

# Test 13: Change Password
Test-Endpoint "Change Password" {
    $pwdChange = @{
        currentPassword = "Admin123!@#"
        newPassword = "NewAdmin123!@#"
    } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$baseUrl/auth/change-password" -Method POST -Body $pwdChange -ContentType "application/json" -Headers $headers | Out-Null
        # Change it back
        $pwdChangeBack = @{
            currentPassword = "NewAdmin123!@#"
            newPassword = "Admin123!@#"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/auth/change-password" -Method POST -Body $pwdChangeBack -ContentType "application/json" -Headers $headers | Out-Null
    } catch {
        throw
    }
}

# Summary
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Test Summary" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
$passed = ($testResults | Where-Object {$_.Status -eq "PASS"}).Count
$failed = ($testResults | Where-Object {$_.Status -eq "FAIL"}).Count
Write-Host "Total Tests: $($testResults.Count)" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if($failed -eq 0){"Green"}else{"Red"})
Write-Host ""

if ($failed -gt 0) {
    Write-Host "Failed Tests:" -ForegroundColor Red
    $testResults | Where-Object {$_.Status -eq "FAIL"} | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host "========================================" -ForegroundColor Yellow
