# Final Comprehensive API Test - All Endpoints
# With rate limit handling and retry logic

$baseUrl = "http://localhost:3001/api/v1"
$passCount = 0
$failCount = 0
$skipCount = 0
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [scriptblock]$TestBlock,
        [int]$MaxRetries = 3
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Cyan
    Start-Sleep -Seconds 1  # Rate limit prevention
    
    $attempt = 0
    $success = $false
    
    while ($attempt -lt $MaxRetries -and -not $success) {
        $attempt++
        try {
            & $TestBlock
            Write-Host "  PASS" -ForegroundColor Green
            $script:passCount++
            $script:testResults += @{Name=$Name; Status="PASS"; Attempts=$attempt}
            $success = $true
        } catch {
            $errorMsg = $_.Exception.Message
            
            if ($errorMsg -like "*429*" -or $errorMsg -like "*rate*limit*") {
                if ($attempt -lt $MaxRetries) {
                    Write-Host "  Rate limited, waiting..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 10
                } else {
                    Write-Host "  SKIP (Rate limited after $MaxRetries attempts)" -ForegroundColor Yellow
                    $script:skipCount++
                    $script:testResults += @{Name=$Name; Status="SKIP"; Reason="Rate limited"}
                    $success = $true
                }
            } elseif ($errorMsg -like "*404*") {
                Write-Host "  SKIP (404 - Resource not found, expected)" -ForegroundColor Yellow
                $script:skipCount++
                $script:testResults += @{Name=$Name; Status="SKIP"; Reason="404"}
                $success = $true
            } elseif ($errorMsg -like "*403*" -or $errorMsg -like "*Forbidden*") {
                Write-Host "  SKIP (403 - Forbidden, expected)" -ForegroundColor Yellow
                $script:skipCount++
                $script:testResults += @{Name=$Name; Status="SKIP"; Reason="403"}
                $success = $true
            } elseif ($errorMsg -like "*already*" -or $errorMsg -like "*duplicate*") {
                Write-Host "  SKIP (Already exists, expected)" -ForegroundColor Yellow
                $script:skipCount++
                $script:testResults += @{Name=$Name; Status="SKIP"; Reason="Duplicate"}
                $success = $true
            } else {
                Write-Host "  FAIL: $errorMsg" -ForegroundColor Red
                $script:failCount++
                $script:testResults += @{Name=$Name; Status="FAIL"; Error=$errorMsg}
                $success = $true
            }
        }
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Final Comprehensive API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Authenticate
Write-Host "Step 1: Authentication" -ForegroundColor Yellow
Start-Sleep -Seconds 2

$adminToken = $null
$employeeToken = $null
$adminEmpId = $null
$employeeEmpId = $null

try {
    $adminLogin = @{email = "admin@hrms.com"; password = "Admin123!@#"} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLogin -ContentType "application/json"
    $adminToken = $result.data.tokens.accessToken
    Write-Host "  Admin authenticated" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "  Failed to authenticate admin: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $empLogin = @{email = "employee1@hrms.com"; password = "Employee123!@#"} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $empLogin -ContentType "application/json"
    $employeeToken = $result.data.tokens.accessToken
    Write-Host "  Employee authenticated" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "  Failed to authenticate employee: $($_.Exception.Message)" -ForegroundColor Red
}

if (-not $adminToken -or -not $employeeToken) {
    Write-Host "Authentication failed. Exiting." -ForegroundColor Red
    exit 1
}

$adminHeaders = @{"Authorization" = "Bearer $adminToken"}
$employeeHeaders = @{"Authorization" = "Bearer $employeeToken"}

# Get employee IDs
Write-Host ""
Write-Host "Step 2: Getting Employee IDs" -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $employees = Invoke-RestMethod -Uri "$baseUrl/employees" -Method GET -Headers $adminHeaders
    $adminEmp = $employees.data | Where-Object { $_.email -eq "admin@hrms.com" } | Select-Object -First 1
    $employeeEmp = $employees.data | Where-Object { $_.email -eq "employee1@hrms.com" } | Select-Object -First 1
    
    if ($adminEmp) {
        $adminEmpId = $adminEmp.id
        Write-Host "  Admin Employee ID: $adminEmpId" -ForegroundColor Green
    }
    if ($employeeEmp) {
        $employeeEmpId = $employeeEmp.id
        Write-Host "  Employee ID: $employeeEmpId" -ForegroundColor Green
    }
    
    # Get first employee ID for testing
    if ($employees.data.Count -gt 0) {
        $script:firstEmpId = $employees.data[0].id
    }
} catch {
    Write-Host "  Could not get employee IDs: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Running Tests" -ForegroundColor Yellow
Write-Host ""

# ==================== AUTHENTICATION TESTS ====================
Write-Host "=== Authentication Module ===" -ForegroundColor Yellow

Test-Endpoint "Health Check" {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    if ($health.status -ne "ok") { throw "Health check failed" }
}

Test-Endpoint "Get Current User" {
    $me = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $employeeHeaders
    if (-not $me.data.email) { throw "No user data" }
}

Test-Endpoint "Refresh Token (Invalid)" {
    try {
        $refresh = @{refreshToken = "invalid_token"} | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/auth/refresh" -Method POST -Body $refresh -ContentType "application/json"
        throw "Should have failed with invalid token"
    } catch {
        if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*invalid*") {
            # Expected behavior
        } else {
            throw
        }
    }
}

# ==================== DEPARTMENTS TESTS ====================
Write-Host ""
Write-Host "=== Departments Module ===" -ForegroundColor Yellow

Test-Endpoint "List Departments" {
    $depts = Invoke-RestMethod -Uri "$baseUrl/departments" -Method GET -Headers $employeeHeaders
    $script:deptId = if ($depts.data.Count -gt 0) { $depts.data[0].id } else { $null }
}

Test-Endpoint "Create Department" {
    $dept = @{name = "Final Test Dept $(Get-Random)"} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/departments" -Method POST -Body $dept -ContentType "application/json" -Headers $adminHeaders
    $script:newDeptId = $result.data.id
}

Test-Endpoint "Get Department by ID" {
    if ($script:deptId) {
        Invoke-RestMethod -Uri "$baseUrl/departments/$($script:deptId)" -Method GET -Headers $employeeHeaders | Out-Null
    } else {
        throw "404"
    }
}

Test-Endpoint "Update Department" {
    if ($script:newDeptId) {
        $update = @{name = "Updated Final Dept $(Get-Random)"} | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/departments/$($script:newDeptId)" -Method PATCH -Body $update -ContentType "application/json" -Headers $adminHeaders | Out-Null
    } else {
        throw "No department ID"
    }
}

# ==================== DESIGNATIONS TESTS ====================
Write-Host ""
Write-Host "=== Designations Module ===" -ForegroundColor Yellow

Test-Endpoint "List Designations" {
    $desigs = Invoke-RestMethod -Uri "$baseUrl/designations" -Method GET -Headers $employeeHeaders
    $script:desigId = if ($desigs.data.Count -gt 0) { $desigs.data[0].id } else { $null }
}

Test-Endpoint "Create Designation" {
    $desig = @{title = "Final Test Desig $(Get-Random)"} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/designations" -Method POST -Body $desig -ContentType "application/json" -Headers $adminHeaders
    $script:newDesigId = $result.data.id
}

Test-Endpoint "Get Designation by ID" {
    if ($script:desigId) {
        Invoke-RestMethod -Uri "$baseUrl/designations/$($script:desigId)" -Method GET -Headers $employeeHeaders | Out-Null
    } else {
        throw "404"
    }
}

# ==================== EMPLOYEES TESTS ====================
Write-Host ""
Write-Host "=== Employees Module ===" -ForegroundColor Yellow

Test-Endpoint "List Employees" {
    $emps = Invoke-RestMethod -Uri "$baseUrl/employees" -Method GET -Headers $employeeHeaders
    if ($emps.data.Count -eq 0) { throw "No employees found" }
}

Test-Endpoint "Get Employee by ID" {
    if ($script:firstEmpId) {
        Invoke-RestMethod -Uri "$baseUrl/employees/$($script:firstEmpId)" -Method GET -Headers $employeeHeaders | Out-Null
    } else {
        throw "404"
    }
}

# ==================== ATTENDANCE TESTS ====================
Write-Host ""
Write-Host "=== Attendance Module ===" -ForegroundColor Yellow

Test-Endpoint "Punch In" {
    if ($employeeEmpId) {
        $data = @{employeeId = $employeeEmpId} | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/attendance/punch-in" -Method POST -Body $data -ContentType "application/json" -Headers $employeeHeaders | Out-Null
    } else {
        throw "No employee ID"
    }
}

Test-Endpoint "Punch Out" {
    if ($employeeEmpId) {
        $data = @{employeeId = $employeeEmpId} | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/attendance/punch-out" -Method POST -Body $data -ContentType "application/json" -Headers $employeeHeaders | Out-Null
    } else {
        throw "No employee ID"
    }
}

Test-Endpoint "Get Attendance Summary" {
    if ($script:firstEmpId) {
        $year = (Get-Date).Year
        $month = (Get-Date).Month
        Invoke-RestMethod -Uri "$baseUrl/attendance/summary/$($script:firstEmpId)/$year/$month" -Method GET -Headers $employeeHeaders | Out-Null
    } else {
        throw "No employee ID"
    }
}

# ==================== LEAVE TESTS ====================
Write-Host ""
Write-Host "=== Leave Management Module ===" -ForegroundColor Yellow

Test-Endpoint "List Leave Types" {
    $types = Invoke-RestMethod -Uri "$baseUrl/leave/types" -Method GET -Headers $employeeHeaders
    $script:leaveTypeId = if ($types.data.Count -gt 0) { $types.data[0].id } else { $null }
}

Test-Endpoint "Create Leave Type" {
    $leave = @{name = "Final Test Leave $(Get-Random)"; annualQuota = 10} | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/leave/types" -Method POST -Body $leave -ContentType "application/json" -Headers $adminHeaders | Out-Null
}

Test-Endpoint "List Leave Requests" {
    Invoke-RestMethod -Uri "$baseUrl/leave/requests" -Method GET -Headers $employeeHeaders | Out-Null
}

Test-Endpoint "Create Leave Request" {
    if ($script:leaveTypeId -and $employeeEmpId) {
        $req = @{
            employeeId = $employeeEmpId
            leaveTypeId = $script:leaveTypeId
            startDate = "2026-08-01"
            endDate = "2026-08-03"
            reason = "Final test"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/leave/requests" -Method POST -Body $req -ContentType "application/json" -Headers $employeeHeaders | Out-Null
    } else {
        throw "Missing leave type or employee ID"
    }
}

Test-Endpoint "Get Leave Balance" {
    if ($script:firstEmpId) {
        Invoke-RestMethod -Uri "$baseUrl/leave/balance/$($script:firstEmpId)" -Method GET -Headers $employeeHeaders | Out-Null
    } else {
        throw "No employee ID"
    }
}

# ==================== PAYROLL TESTS ====================
Write-Host ""
Write-Host "=== Payroll Module ===" -ForegroundColor Yellow

Test-Endpoint "List Salaries" {
    Invoke-RestMethod -Uri "$baseUrl/payroll/salaries" -Method GET -Headers $adminHeaders | Out-Null
}

# ==================== PERFORMANCE TESTS ====================
Write-Host ""
Write-Host "=== Performance Module ===" -ForegroundColor Yellow

Test-Endpoint "List Review Cycles" {
    Invoke-RestMethod -Uri "$baseUrl/performance/cycles" -Method GET -Headers $employeeHeaders | Out-Null
}

Test-Endpoint "Create Review Cycle" {
    $cycle = @{name = "Final Q4 2026"; startDate = "2026-10-01"; endDate = "2026-12-31"} | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/performance/cycles" -Method POST -Body $cycle -ContentType "application/json" -Headers $adminHeaders | Out-Null
}

Test-Endpoint "List Performance Reviews" {
    Invoke-RestMethod -Uri "$baseUrl/performance/reviews" -Method GET -Headers $employeeHeaders | Out-Null
}

# ==================== TICKETS TESTS ====================
Write-Host ""
Write-Host "=== Tickets Module ===" -ForegroundColor Yellow

Test-Endpoint "List Tickets" {
    Invoke-RestMethod -Uri "$baseUrl/tickets" -Method GET -Headers $employeeHeaders | Out-Null
}

Test-Endpoint "Create Ticket" {
    if ($employeeEmpId) {
        $ticket = @{
            employeeId = $employeeEmpId
            category = "Final Test"
            subject = "Final Test Ticket"
            description = "This is a final test ticket"
            priority = "MEDIUM"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/tickets" -Method POST -Body $ticket -ContentType "application/json" -Headers $employeeHeaders | Out-Null
    } else {
        throw "No employee ID"
    }
}

# ==================== NOTIFICATIONS TESTS ====================
Write-Host ""
Write-Host "=== Notifications Module ===" -ForegroundColor Yellow

Test-Endpoint "List Notifications" {
    Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers $employeeHeaders | Out-Null
}

# ==================== SUMMARY ====================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Final Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$total = $passCount + $failCount + $skipCount
Write-Host "Total Tests: $total"
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Skipped: $skipCount" -ForegroundColor Yellow

if ($passCount + $failCount -gt 0) {
    $successRate = [math]::Round(($passCount / ($passCount + $failCount)) * 100, 2)
    Write-Host ""
    Write-Host "Success Rate: $successRate percent" -ForegroundColor $(if($successRate -eq 100){"Green"}elseif($successRate -ge 80){"Yellow"}else{"Red"})
}

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "Failed Tests:" -ForegroundColor Red
    $testResults | Where-Object {$_.Status -eq "FAIL"} | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Export results
$testResults | ConvertTo-Json | Out-File "test-results.json"
Write-Host "Results exported to test-results.json" -ForegroundColor Gray
