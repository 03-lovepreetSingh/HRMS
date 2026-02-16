# AI-HRMS API Integration Test
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI-HRMS API Integration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:3001/api/v1"
$token = $null

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
    Write-Host "  PASS - API is running" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "  FAIL - API is not accessible" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Login
Write-Host "Test 2: Login" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@hrms.com"
        password = "Admin123!@#"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($response.success) {
        $token = $response.data.tokens.accessToken
        Write-Host "  PASS - Login successful" -ForegroundColor Green
        Write-Host "  User: $($response.data.user.email)" -ForegroundColor Gray
        Write-Host "  Role: $($response.data.user.role)" -ForegroundColor Gray
    } else {
        Write-Host "  FAIL - Login failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  FAIL - Login error" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Get Current User
Write-Host "Test 3: Get Current User" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$API_URL/auth/me" -Method Get -Headers $headers
    
    if ($response.success) {
        Write-Host "  PASS - Got current user" -ForegroundColor Green
        Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
    } else {
        Write-Host "  FAIL - Failed to get user" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL - Error getting user" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Employees
Write-Host "Test 4: Get Employees" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$API_URL/employees" -Method Get -Headers $headers
    
    if ($response.success) {
        $count = $response.data.Count
        Write-Host "  PASS - Got $count employees" -ForegroundColor Green
    } else {
        Write-Host "  FAIL - Failed to get employees" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL - Error getting employees" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get Departments
Write-Host "Test 5: Get Departments" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$API_URL/departments" -Method Get -Headers $headers
    
    if ($response.success) {
        $count = $response.data.Count
        Write-Host "  PASS - Got $count departments" -ForegroundColor Green
    } else {
        Write-Host "  FAIL - Failed to get departments" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL - Error getting departments" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get Leave Types
Write-Host "Test 6: Get Leave Types" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$API_URL/leave/types" -Method Get -Headers $headers
    
    if ($response.success) {
        $count = $response.data.Count
        Write-Host "  PASS - Got $count leave types" -ForegroundColor Green
    } else {
        Write-Host "  FAIL - Failed to get leave types" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL - Error getting leave types" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get Tickets
Write-Host "Test 7: Get Tickets" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$API_URL/tickets" -Method Get -Headers $headers
    
    if ($response.success) {
        $count = $response.data.Count
        Write-Host "  PASS - Got $count tickets" -ForegroundColor Green
    } else {
        Write-Host "  FAIL - Failed to get tickets" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL - Error getting tickets" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Integration Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Login with: admin@hrms.com / Admin123!@#" -ForegroundColor White
Write-Host "3. Test all pages in the dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Or open test-frontend-api.html in your browser for interactive testing" -ForegroundColor White
