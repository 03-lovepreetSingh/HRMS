# AI-HRMS API Testing Script
$baseUrl = "http://localhost:3001/api/v1"
$headers = @{"Content-Type" = "application/json"}

Write-Host "========================================"
Write-Host "AI-HRMS API Testing Script"
Write-Host "========================================"
Write-Host ""

# Test 1: Health Check
Write-Host "TEST 1: Health Check"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    Write-Host "PASS - Health check successful"
    Write-Host "Status: $($content.status)"
    Write-Host ""
} catch {
    Write-Host "FAIL - Health check failed: $($_.Exception.Message)"
    Write-Host ""
}

# Test 2: Register User
Write-Host "TEST 2: User Registration"
$registerData = @{
    email = "admin@hrms.com"
    password = "Admin123!@#"
    firstName = "Admin"
    lastName = "User"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Body $registerData -Headers $headers -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    Write-Host "PASS - User registration successful"
    Write-Host "User ID: $($content.data.user.id)"
    Write-Host ""
} catch {
    $errorContent = $_.ErrorDetails.Message
    if ($errorContent -like "*already exists*" -or $errorContent -like "*duplicate*") {
        Write-Host "PASS - Registration endpoint works (user already exists)"
    } else {
        Write-Host "FAIL - Registration failed: $errorContent"
    }
    Write-Host ""
}

# Test 3: Login
Write-Host "TEST 3: User Login"
$loginData = @{
    email = "admin@hrms.com"
    password = "Admin123!@#"
} | ConvertTo-Json

$accessToken = $null
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -Headers $headers -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    $accessToken = $content.data.accessToken
    Write-Host "PASS - Login successful"
    Write-Host "Token received: Yes"
    Write-Host ""
} catch {
    Write-Host "FAIL - Login failed: $($_.ErrorDetails.Message)"
    Write-Host ""
}

# Test 4: Get Current User (Protected)
if ($accessToken) {
    Write-Host "TEST 4: Get Current User (Protected)"
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $accessToken"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/auth/me" -Headers $authHeaders -UseBasicParsing
        $content = $response.Content | ConvertFrom-Json
        Write-Host "PASS - Get current user successful"
        Write-Host "Email: $($content.data.email)"
        Write-Host "Role: $($content.data.role)"
        Write-Host ""
    } catch {
        Write-Host "FAIL - Get current user failed: $($_.Exception.Message)"
        Write-Host ""
    }

    # Test 5: List Employees
    Write-Host "TEST 5: List Employees"
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/employees" -Headers $authHeaders -UseBasicParsing
        $content = $response.Content | ConvertFrom-Json
        Write-Host "PASS - List employees successful"
        Write-Host "Total employees: $($content.data.employees.Count)"
        Write-Host ""
    } catch {
        Write-Host "FAIL - List employees failed: $($_.Exception.Message)"
        Write-Host ""
    }

    # Test 6: List Departments
    Write-Host "TEST 6: List Departments"
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/departments" -Headers $authHeaders -UseBasicParsing
        $content = $response.Content | ConvertFrom-Json
        Write-Host "PASS - List departments successful"
        Write-Host "Total departments: $($content.data.Count)"
        Write-Host ""
    } catch {
        Write-Host "FAIL - List departments failed: $($_.Exception.Message)"
        Write-Host ""
    }

    # Test 7: List Designations
    Write-Host "TEST 7: List Designations"
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/designations" -Headers $authHeaders -UseBasicParsing
        $content = $response.Content | ConvertFrom-Json
        Write-Host "PASS - List designations successful"
        Write-Host "Total designations: $($content.data.Count)"
        Write-Host ""
    } catch {
        Write-Host "FAIL - List designations failed: $($_.Exception.Message)"
        Write-Host ""
    }

    # Test 8: Create Department
    Write-Host "TEST 8: Create Department"
    $deptData = @{name = "Engineering"} | ConvertTo-Json
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/departments" -Method POST -Body $deptData -Headers $authHeaders -UseBasicParsing
        $content = $response.Content | ConvertFrom-Json
        Write-Host "PASS - Department created"
        Write-Host "Department ID: $($content.data.id)"
        Write-Host ""
    } catch {
        $errorMsg = $_.ErrorDetails.Message
        if ($errorMsg -like "*already exists*" -or $errorMsg -like "*duplicate*") {
            Write-Host "PASS - Department endpoint works (already exists)"
        } else {
            Write-Host "FAIL - Create department failed: $errorMsg"
        }
        Write-Host ""
    }

    # Test 9: Create Designation
    Write-Host "TEST 9: Create Designation"
    $desigData = @{title = "Software Engineer"} | ConvertTo-Json
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/designations" -Method POST -Body $desigData -Headers $authHeaders -UseBasicParsing
        $content = $response.Content | ConvertFrom-Json
        Write-Host "PASS - Designation created"
        Write-Host "Designation ID: $($content.data.id)"
        Write-Host ""
    } catch {
        $errorMsg = $_.ErrorDetails.Message
        if ($errorMsg -like "*already exists*") {
            Write-Host "PASS - Designation endpoint works (already exists)"
        } else {
            Write-Host "FAIL - Create designation failed: $errorMsg"
        }
        Write-Host ""
    }

    # Test 10: Punch In (Attendance)
    Write-Host "TEST 10: Punch In (Attendance)"
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/attendance/punch-in" -Method POST -Headers $authHeaders -UseBasicParsing
        $content = $response.Content | ConvertFrom-Json
        Write-Host "PASS - Punch in successful"
        Write-Host "Attendance ID: $($content.data.attendance.id)"
        Write-Host ""
    } catch {
        $errorMsg = $_.ErrorDetails.Message
        if ($errorMsg -like "*already punched in*") {
            Write-Host "PASS - Punch in endpoint works (already punched in today)"
        } else {
            Write-Host "FAIL - Punch in failed: $errorMsg"
        }
        Write-Host ""
    }

    # Test 11: List Leave Types
    Write-Host "TEST 11: List Leave Types"
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/leave/types" -Headers $authHeaders -UseBasicParsing
        $content = $response.Content | ConvertFrom-Json
        Write-Host "PASS - List leave types successful"
        Write-Host "Total leave types: $($content.data.Count)"
        Write-Host ""
    } catch {
        Write-Host "FAIL - List leave types failed: $($_.Exception.Message)"
        Write-Host ""
    }
}

Write-Host "========================================"
Write-Host "Testing Complete!"
Write-Host "========================================"
