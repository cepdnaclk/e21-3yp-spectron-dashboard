# Test Login Endpoint
# This script tests the login endpoint with different scenarios

param(
    [string]$Email = "test@spectron.com",
    [string]$Password = "test123",
    [string]$BaseUrl = "http://localhost:8081"
)

Write-Host "Testing Login Endpoint" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""

Write-Host "Backend URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Email: $Email" -ForegroundColor Cyan
Write-Host "Password: $Password" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health check
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/healthz" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Health check passed: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Login
Write-Host "2. Testing login endpoint..." -ForegroundColor Yellow
$body = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10
    
    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    Write-Host "   Token: $($response.token.Substring(0, 50))..." -ForegroundColor Cyan
    Write-Host "   User: $($response.user.email)" -ForegroundColor Cyan
    
    # Test 3: Verify token with /auth/me
    Write-Host ""
    Write-Host "3. Testing /auth/me endpoint..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $($response.token)"
            "Content-Type" = "application/json"
        }
        $me = Invoke-RestMethod -Uri "$BaseUrl/auth/me" `
            -Method GET `
            -Headers $headers `
            -TimeoutSec 10
        Write-Host "   ✅ Token verified! User: $($me.email)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Token verification failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   ❌ Login failed!" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message
    if ($errorDetails) {
        Write-Host "   Error details: $errorDetails" -ForegroundColor Yellow
    } else {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Make sure the test user exists in the database" -ForegroundColor White
    Write-Host "  2. Run: psql -U your_user -d spectron -f migrations\002_create_test_user.sql" -ForegroundColor White
    Write-Host "  3. Verify user exists: SELECT email FROM users WHERE email = 'test@spectron.com';" -ForegroundColor White
    Write-Host "  4. Check backend logs for errors" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✅ All tests passed!" -ForegroundColor Green
