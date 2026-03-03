# Test Get Users Endpoint
# This script tests the /users endpoint

param(
    [string]$BaseUrl = "http://localhost:8081",
    [string]$Email = "test@spectron.com",
    [string]$Password = "test123"
)

Write-Host "Testing Get Users Endpoint" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host ""

# Step 1: Login to get token
Write-Host "1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -TimeoutSec 10
    
    $token = $loginResponse.token
    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 50))..." -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Test user exists in database" -ForegroundColor White
    Write-Host "  2. Backend is running" -ForegroundColor White
    exit 1
}

Write-Host ""

# Step 2: Get users
Write-Host "2. Getting users list..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $usersResponse = Invoke-RestMethod -Uri "$BaseUrl/users" `
        -Method GET `
        -Headers $headers `
        -TimeoutSec 10
    
    Write-Host "   ✅ Users retrieved successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Total users: $($usersResponse.count)" -ForegroundColor Cyan
    Write-Host ""
    
    if ($usersResponse.users.Count -eq 0) {
        Write-Host "   No users found in this account." -ForegroundColor Yellow
    } else {
        Write-Host "Users:" -ForegroundColor Cyan
        $usersResponse.users | ForEach-Object {
            Write-Host "  - Email: $($_.email)" -ForegroundColor White
            Write-Host "    ID: $($_.id)" -ForegroundColor Gray
            Write-Host "    Role: $($_.role)" -ForegroundColor Gray
            if ($_.phone) {
                Write-Host "    Phone: $($_.phone)" -ForegroundColor Gray
            }
            Write-Host "    Created: $($_.created_at)" -ForegroundColor Gray
            Write-Host ""
        }
    }
    
    # Pretty print JSON
    Write-Host "Full JSON response:" -ForegroundColor Cyan
    $usersResponse | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "   ❌ Failed to get users!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host ""
Write-Host "✅ Test completed!" -ForegroundColor Green
