# Test Registration Endpoint with Detailed Error Info
# This script tests registration and shows detailed error messages

param(
    [string]$BaseUrl = "http://localhost:8081",
    [string]$Email = "test2@spectron.com",
    [string]$Password = "test123",
    [string]$Phone = "+1234567890",
    [string]$Name = "Test User 2"
)

Write-Host "Testing Registration Endpoint" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

Write-Host "Backend URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Email: $Email" -ForegroundColor Cyan
Write-Host "Password: $Password" -ForegroundColor Cyan
Write-Host ""

# Test registration
Write-Host "Attempting registration..." -ForegroundColor Yellow
$body = @{
    email = $Email
    password = $Password
    phone = $Phone
    name = $Name
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Token: $($response.token.Substring(0, 50))..." -ForegroundColor Cyan
    Write-Host "User ID: $($response.user.id)" -ForegroundColor Cyan
    Write-Host "Email: $($response.user.email)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Registration failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Type: $($_.Exception.GetType().Name)" -ForegroundColor Yellow
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.ErrorDetails) {
        Write-Host ""
        Write-Host "Error Details:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    
    if ($_.Response) {
        Write-Host ""
        Write-Host "Response Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "1. Check if database is running" -ForegroundColor White
    Write-Host "2. Verify database connection in backend logs" -ForegroundColor White
    Write-Host "3. Check if tables exist: SELECT * FROM users LIMIT 1;" -ForegroundColor White
    Write-Host "4. Check backend console for detailed error messages" -ForegroundColor White
    exit 1
}
