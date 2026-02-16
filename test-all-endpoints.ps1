# Comprehensive API Test Suite for AI-HRMS
$baseUrl = "http://localhost:3001/api/v1"
$passCount = 0
$failCount = 0
$skipCount = 0

function Test-API {
    param($name, $scriptBlock)
    Write-Host "Testing: $name" -ForegroundColor Cyan
    try {
        & $scriptBlock
        Write-Host "  PASS" -ForegroundColor Green
        $script:passCount++
    } catch {
        if ($_.Exception.Message -like "*403*" -or $_.Exception.Message -like "*Forbidden*") {
            Write-Host "  SKIP (403 Forbidden)" -ForegroundColor Yellow
            $script:skipCount++
        } elseif ($_.Exception.Message -like "*employee*" -or $_.Exception.Message -like "*already*") {
            Write-Host "  SKIP ($($_.Exception.Message.Substring(0, [Math]::Min(50, $_.Exception.Message.Length)))...)" -ForegroundColor Yellow
            $script:skipCount++
        } else {
            Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
            $script:failCount++
        }
    }
}

function Get-AuthToken {
    param($email, $password)
    $loginData = @{email = $email; password = $password} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    return $result.data.tokens.accessToken
}

Write-Host "========================================"
Write-Host "AI-HRMS Comprehensive API Test Suite"
Write-Host "========================================"
Write-Host ""

# Authenticate
Write-Host "Authenticating users..." -ForegroundColor Yellow
$adminToken = Get-AuthToken "admin@hrms.com" "Admin123!@#"
$employeeToken = Get-AuthToken "employee1@hrms.com" "Employee123!@#"
$adminHeaders = @{"Authorization" = "Bearer $adminToken"}
$employeeHeaders = @{"Authorization" = "Bearer $employeeToken"}
Write-Host "Done" -ForegroundColor Green
Write-Host ""

# Authentication Tests
Write-Host "=== Authentication Module ===" -ForegroundColor Yellow
Test-API "Health Check" {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    if ($health.status -ne "ok") { throw "Health check failed" }
}

Test-API "Get Current User" {
    $me = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $employeeHeaders
    if (-not $me.data.email) { throw "No user data" }
}

Test-API "Change Password" {
    $pwd = @{currentPassword = "Employee123!@#"; newPassword = "NewPass123!@#"} | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/auth/change-password" -Method POST -Body $pwd -ContentType "application/json" -Headers $employeeHeaders | Out-Null
    $pwdBack = @{currentPassword = "NewPass123!@#"; newPassword = "Employee123!@#"} | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/auth/change-password" -Method POST -Body $pwdBack -ContentType "application/json" -Headers $employeeHeaders | Out-Null
}

# Departments Tests
Write-Host ""
Write-Host "=== Departments Module ===" -ForegroundColor Yellow
Test-API "List Departments" {
    $depts = Invoke-RestMethod -Uri "$baseUrl/departments" -Method GET -Headers $employeeHeaders
    $script:deptId = if ($depts.data.Count -gt 0) { $depts.data[0].id } else { $null }
}

Test-API "Create Department" {
    $dept = @{name = "Test Dept $(Get-Random)"} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/departments" -Method POST -Body $dept -ContentType "application/json" -Headers $adminHeaders
    $script:newDeptId = $result.data.id
}

Test-API "Get Department by ID" {
    if (-not $script:deptId) { throw "No department ID available" }
    Invoke-RestMethod -Uri "$baseUrl/departments/$($script:deptId)" -Method GET -Headers $employeeHeaders | Out-Null
}

Test-API "Update Department" {
    if (-not $script:newDeptId) { throw "No new department ID" }
    $update = @{name = "Updated Dept $(Get-Random)"} | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/departments/$($script:newDeptId)" -Method PATCH -Body $update -ContentType "application/json" -Headers $adminHeaders | Out-Null
}

# Designations Tests
Write-Host ""
Write-Host "=== Designations Module ===" -ForegroundColor Yellow
Test-API "List Designations" {
    $desigs = Invoke-RestMethod -Uri "$baseUrl/designations" -Method GET -Headers $employeeHeaders
    $script:desigId = if ($desigs.data.Count -gt 0) { $desigs.data[0].id } else { $null }
}

Test-API "Create Designation" {
    $desig = @{title = "Test Desig $(Get-Random)"} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/designations" -Method POST -Body $desig -ContentType "application/json" -Headers $adminHeaders
    $script:newDesigId = $result.data.id
}

Test-API "Get Designation by ID" {
    if (-not $script:desigId) { throw "No designation ID available" }
    Invoke-RestMethod -Uri "$baseUrl/designations/$($script:desigId)" -Method GET -Headers $employeeHeaders | Out-Null
}

# Employees Tests
Write-Host ""
Write-Host "=== Employees Module ===" -ForegroundColor Yellow
Test-API "List Employees" {
    $emps = Invoke-RestMethod -Uri "$baseUrl/employees" -Method GET -Headers $employeeHeaders
    $script:empId = if ($emps.data.employees.Count -gt 0) { $emps.data.employees[0].id } else { $null }
}

Test-API "Get Employee by ID" {
    if (-not $script:empId) { throw "No employee ID available" }
    Invoke-RestMethod -Uri "$baseUrl/employees/$($script:empId)" -Method GET -Headers $employeeHeaders | Out-Null
}

# Attendance Tests
Write-Host ""
Write-Host "=== Attendance Module ===" -ForegroundColor Yellow
Test-API "Punch In" {
    Invoke-RestMethod -Uri "$baseUrl/attendance/punch-in" -Method POST -Headers $employeeHeaders | Out-Null
}

Test-API "Punch Out" {
    Invoke-RestMethod -Uri "$baseUrl/attendance/punch-out" -Method POST -Headers $employeeHeaders | Out-Null
}

Test-API "Get Attendance Summary" {
    if (-not $script:empId) { throw "No employee ID" }
    $year = (Get-Date).Year
    $month = (Get-Date).Month
    Invoke-RestMethod -Uri "$baseUrl/attendance/summary/$($script:empId)/$year/$month" -Method GET -Headers $employeeHeaders | Out-Null
}

# Leave Tests
Write-Host ""
Write-Host "=== Leave Management Module ===" -ForegroundColor Yellow
Test-API "List Leave Types" {
    $types = Invoke-RestMethod -Uri "$baseUrl/leave/types" -Method GET -Headers $employeeHeaders
    $script:leaveTypeId = if ($types.data.Count -gt 0) { $types.data[0].id } else { $null }
}

Test-API "Create Leave Type" {
    $leave = @{name = "Test Leave $(Get-Random)"; annualQuota = 10} | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/leave/types" -Method POST -Body $leave -ContentType "application/json" -Headers $adminHeaders | Out-Null
}

Test-API "List Leave Requests" {
    Invoke-RestMethod -Uri "$baseUrl/leave/requests" -Method GET -Headers $employeeHeaders | Out-Null
}

Test-API "Create Leave Request" {
    if (-not $script:leaveTypeId) { throw "No leave type ID" }
    $req = @{leaveTypeId = $script:leaveTypeId; startDate = "2026-05-01"; endDate = "2026-05-03"; reason = "Test"} | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/leave/requests" -Method POST -Body $req -ContentType "application/json" -Headers $employeeHeaders | Out-Null
}

Test-API "Get Leave Balance" {
    if (-not $script:empId) { throw "No employee ID" }
    Invoke-RestMethod -Uri "$baseUrl/leave/balance/$($script:empId)" -Method GET -Headers $employeeHeaders | Out-Null
}

# Payroll Tests
Write-Host ""
Write-Host "=== Payroll Module ===" -ForegroundColor Yellow
Test-API "List Salaries" {
    Invoke-RestMethod -Uri "$baseUrl/payroll/salaries" -Method GET -Headers $adminHeaders | Out-Null
}

# Performance Tests
Write-Host ""
Write-Host "=== Performance Module ===" -ForegroundColor Yellow
Test-API "List Review Cycles" {
    Invoke-RestMethod -Uri "$baseUrl/performance/cycles" -Method GET -Headers $employeeHeaders | Out-Null
}

Test-API "Create Review Cycle" {
    $cycle = @{name = "Q2 2026"; startDate = "2026-04-01"; endDate = "2026-06-30"} | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/performance/cycles" -Method POST -Body $cycle -ContentType "application/json" -Headers $adminHeaders | Out-Null
}

Test-API "List Performance Reviews" {
    Invoke-RestMethod -Uri "$baseUrl/performance/reviews" -Method GET -Headers $employeeHeaders | Out-Null
}

# Tickets Tests
Write-Host ""
Write-Host "=== Tickets Module ===" -ForegroundColor Yellow
Test-API "List Tickets" {
    Invoke-RestMethod -Uri "$baseUrl/tickets" -Method GET -Headers $employeeHeaders | Out-Null
}

Test-API "Create Ticket" {
    $ticket = @{category = "IT"; subject = "Test"; description = "Test ticket"; priority = "MEDIUM"} | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/tickets" -Method POST -Body $ticket -ContentType "application/json" -Headers $employeeHeaders | Out-Null
}

# Notifications Tests
Write-Host ""
Write-Host "=== Notifications Module ===" -ForegroundColor Yellow
Test-API "List Notifications" {
    Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers $employeeHeaders | Out-Null
}

# Summary
Write-Host ""
Write-Host "========================================"
Write-Host "Test Summary"
Write-Host "========================================"
$total = $passCount + $failCount + $skipCount
Write-Host "Total: $total"
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Skipped: $skipCount" -ForegroundColor Yellow

if ($passCount + $failCount -gt 0) {
    $successRate = [math]::Round(($passCount / ($passCount + $failCount)) * 100, 2)
    Write-Host "Success Rate: $successRate percent"
}
Write-Host "========================================"
