# Simple script to get users from backend
# Usage: .\get-users-simple.ps1

$baseUrl = "http://localhost:8081"
$email = "test@spectron.com"
$password = "test123"

Write-Host "Getting users from backend..." -ForegroundColor Green
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Logging in..." -ForegroundColor Cyan
try {
    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Test user exists (run: psql -U your_user -d spectron -f migrations\002_create_test_user.sql)" -ForegroundColor White
    Write-Host "  2. Backend is running (run: .\start-backend.ps1)" -ForegroundColor White
    exit 1
}

Write-Host ""

# Step 2: Get users
Write-Host "Step 2: Getting users..." -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✅ Users retrieved!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Total users: $($usersResponse.count)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($usersResponse.users.Count -eq 0) {
        Write-Host "No users found in this account." -ForegroundColor Yellow
    } else {
        Write-Host "Users in account:" -ForegroundColor Cyan
        Write-Host "=================" -ForegroundColor Cyan
        $usersResponse.users | ForEach-Object {
            Write-Host ""
            Write-Host "Email:    $($_.email)" -ForegroundColor White
            Write-Host "ID:       $($_.id)" -ForegroundColor Gray
            Write-Host "Role:     $($_.role)" -ForegroundColor Gray
            if ($_.phone) {
                Write-Host "Phone:    $($_.phone)" -ForegroundColor Gray
            }
            Write-Host "Created:  $($_.created_at)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "JSON Response:" -ForegroundColor Cyan
    Write-Host "=============" -ForegroundColor Cyan
    $usersResponse | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Failed to get users: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    exit 1
}
